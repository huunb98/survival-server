import { LANGUAGE } from '../helpers/language';
import { IMailRewardDocument, MailRewardModel } from '../models/mailReward';
import { IMailSystemDocument, MailSystemModel } from '../models/mailSystem';
import { INofityDocument, MailUpdateModel } from '../models/mailUpdate';
import * as schedule from 'node-schedule';
import { IMailUser, UserMailListModel } from '../models/usermaillist';
import { IMail, IUserRank, MailStatus, MailType, TypeReward } from '../helpers/catalogType';
import redisUtils from '../utils/redisUtils';
import { MAIL_USER } from './mailconfig';
import { GetMailDetailResponse, GiftResponse } from './mailIO';
import { runInThisContext } from 'vm';

class MailManager {
  systemMails: Map<string, IMailSystemDocument>;
  rewardMails: Map<string, IMailRewardDocument>;
  updateMails: Map<string, INofityDocument>;
  updateMailById: Map<string, INofityDocument>;

  systemId: string[];

  updateId: string[];

  defaultLanguage: string = LANGUAGE.English;

  constructor() {
    this.initCache();
    this.scheduleReloadMail();
  }

  /**
   * Reload all mail caching
   */

  private async getMailConfig() {
    try {
      let endDay = new Date();
      endDay.setHours(23, 59, 59, 999);

      this.initCache();

      let rewards = await MailRewardModel.find({ isDeleted: false }).exec();
      let systems = await MailSystemModel.find({ isDeleted: false, startDate: { $lt: endDay }, endDate: { $gt: new Date() } }).exec();
      let updates = await MailUpdateModel.find({ isDeleted: false, startDate: { $lt: endDay }, endDate: { $gt: new Date() } }).exec();

      rewards.forEach((index) => this.rewardMails.set(index.type.toString(), index));
      systems.forEach((index) => {
        this.systemMails.set(index.id, index);
        this.systemId.push(index.id);

        /**
         * Set mail expiry
         */
        redisUtils.EXPIREAT(MAIL_USER + index.id, Math.floor(new Date(index.endDate).getTime() / 1000));
      });
      updates.forEach((index) => {
        this.updateMails.set(index.platform.toString(), index);
        this.updateMailById.set(index.id, index);
        this.updateId.push(index.id);

        redisUtils.EXPIREAT(MAIL_USER + index.id, Math.floor(new Date(index.endDate).getTime() / 1000));
      });
    } catch (error) {
      console.log(error);
    }
  }

  private scheduleReloadMail() {
    schedule.scheduleJob('0 0 * * *', () => {
      console.log('Running job! ', 'Reload mail');
      this.reloadConfig();
    });
  }

  /**
   * Only call on it or clear state
   */

  private initCache() {
    this.systemMails = new Map();
    this.rewardMails = new Map();
    this.updateMails = new Map();
    this.updateMailById = new Map();
    this.systemId = [];
    this.updateId = [];
  }

  reloadConfig() {
    console.log(`Reload mail at ${new Date()}`);
    this.getMailConfig();
  }

  getMail(id: string, isUpdate: boolean, language: string): IMail | null {
    let mailMap = isUpdate ? this.updateMailById.get(id) : this.systemMails.get(id);
    if (mailMap) {
      let mailContent = mailMap.mail.get(language) || mailMap.mail.get(this.defaultLanguage);
      if (mailContent) return mailContent;
      else return null;
    } else return null;
  }
  getMailRewardFromType(type: TypeReward, language: string): IMail | null {
    let mailMap = this.rewardMails.get(type.toString());
    if (mailMap) {
      let mailContent = mailMap.mail.get(language) || mailMap.mail.get(this.defaultLanguage);
      if (mailContent) return mailContent;
      else return null;
    } else return null;
  }

  async getMailRewardDetail(mailId: string, language: string, callback: Function) {
    UserMailListModel.findById(mailId)
      .then((mailUser) => {
        if (mailUser) {
          let gifts: GiftResponse[] = [];
          if (mailUser.gifts) {
            gifts = Array.from(mailUser.gifts, function (item) {
              return { key: item[0], value: +item[1] };
            });
          }
          let timeEnd = new Date(mailUser.validTo).getTime();
          let mailDetails: GetMailDetailResponse = {
            sender: 'Jackal Squad Team',
            status: mailUser.status,
            title: '',
            content: '',
            timeEnd: timeEnd,
            gifts: gifts,
            type: MailType.Reward,
          };

          let mailRewards = this.rewardMails.get(mailUser.type.toString());
          switch (mailUser.type) {
            case TypeReward.AdminPush:
              mailDetails.title = mailUser.title || '';
              mailDetails.content = mailUser.content || '';
              callback(null, mailDetails);
              break;
            case TypeReward.PVP:
              if (mailRewards) {
                mailDetails.sender = mailRewards.sender;
                let mails = mailRewards.mail.get(language) || mailRewards.mail.get(this.defaultLanguage);
                if (mails) {
                  mailDetails.title = mails.title;

                  let pvpInfo = JSON.parse(mailUser.content);
                  mailDetails.content = mails.content.replace('{0}', pvpInfo.Season).replace('{1}', pvpInfo.Rank);
                }
                callback(null, mailDetails);
              } else callback('Mail not found', null);
              break;
            case TypeReward.UpdateVersion:
              if (mailRewards) {
                mailDetails.sender = mailRewards.sender;
                let mails = mailRewards.mail.get(language) || mailRewards.mail.get(this.defaultLanguage);
                if (mails) {
                  mailDetails.title = mails.title;
                  let version = this.updateMailById.get(mailUser.mailId) ? this.updateMailById.get(mailUser.mailId).version.toString() : '';
                  mailDetails.content = mails.content.replace('{}', version);
                }
                callback(null, mailDetails);
              } else callback('Mail not found', null);
              break;
            default:
              if (mailRewards) {
                if (mailRewards) {
                  mailDetails.sender = mailRewards.sender;
                  let mails = mailRewards.mail.get(language) || mailRewards.mail.get(this.defaultLanguage);

                  if (mails) {
                    mailDetails.title = mails.title;
                    mailDetails.content = mails.content;
                  }
                  callback(null, mailDetails);
                } else callback('Mail not found', null);
              }
          }

          if (mailUser.status === MailStatus.NEW) {
            mailUser.status = MailStatus.READ;

            mailUser.save().catch(console.error);
          }
        } else callback('Mail not found', null);
      })
      .catch((error) => {
        callback('Database error', null);
        console.log('Get user mail list error', error);
      });
  }

  async getMailSystemDetail(mailId: string, language: string, status: MailStatus, callback: Function) {
    let mailMap = this.systemMails.get(mailId);
    let mail = mailMap.mail.get(language) || mailMap.mail.get(this.defaultLanguage);
    let gifts: GiftResponse[] = [];
    if (mailMap.gifts) {
      gifts = Array.from(mailMap.gifts, function (item) {
        return { key: item[0], value: +item[1] };
      });
    }
    if (mail) {
      let mailDetails: GetMailDetailResponse = {
        sender: mailMap.sender,
        status: status,
        title: mail.title,
        content: mail.content,
        timeEnd: new Date(mailMap.endDate).getTime(),
        gifts: gifts,
        type: MailType.System,
      };
      callback(null, mailDetails);
    } else callback('Mail Not Found', null);
  }

  async getMailUpdateDetail(mailId: string, language: string, status: MailStatus, callback: Function) {
    let mailMap = this.updateMailById.get(mailId);
    let mail = mailMap.mail.get(language) || mailMap.mail.get(this.defaultLanguage);
    let gifts: GiftResponse[] = [];
    if (mail) {
      let mailDetails: GetMailDetailResponse = {
        sender: 'System Team',
        status: status,
        title: mail.title,
        content: mail.content,
        timeEnd: new Date(mailMap.endDate).getTime(),
        gifts: gifts,
        type: MailType.System,
      };
      callback(null, mailDetails);
    } else callback('Mail Not Found', null);
  }

  async sendRewardAppVersion(userId: string, mailId: string, gifts: Map<string, number>, endDate: Date) {
    let newUserMail = new UserMailListModel();
    newUserMail.userId = userId;
    newUserMail.mailId = mailId;
    newUserMail.type = TypeReward.UpdateVersion;
    newUserMail.gifts = gifts;
    newUserMail.validTo = endDate;

    redisUtils.SETKEY(MAIL_USER + mailId + 'Reward', userId, (err, rs) => {
      if (err) console.log(err);
    });
    newUserMail
      .save()
      .then()
      .catch((ex) => {
        console.log('------saveUserMails--------' + ex.name);
      });
  }

  async sendRewardToUser(userId: string, typeReward: TypeReward, gifts, userRank: IUserRank, season: number, endDate: Date, callback: Function) {
    let userMail = new UserMailListModel();
    userMail.userId = userId;
    userMail.type = typeReward;
    userMail.validTo = endDate;
    if (userRank) {
      userMail.content = JSON.stringify({
        Season: season,
        Rank: userRank.RankNumber,
      });
    }
    if (gifts) userMail.gifts = gifts;

    userMail
      .save()
      .then((_) => callback(null, true))
      .catch((ex) => {
        console.log('------saveUserMails--------' + ex.name);
        callback(true, null);
      });
  }
}

export const mailManager = new MailManager();
