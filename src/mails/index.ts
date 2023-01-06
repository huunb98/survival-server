import { IPVersion } from 'net';
import { userMail } from './userMail';
import { IPlatform, MailStatus } from '../helpers/catalogType';
import { CmdId } from '../helpers/Cmd';
import { COUNTRY_LANGUAGE, LANGUAGE } from '../helpers/language';
import redisUtils from '../helpers/redisUtils';
import { RequestMsg, RespsoneMsg } from '../io/IOInterface';
import { IMailSystemDocument } from '../models/mailSystem';
import { UserInfo } from '../user/userInfo';
import { MAIL_USER } from './mailconfig';
import { GiftResponse, MailCachingStatus, MailSystems, MailUpdates, UserMailList } from './mailIO';
import { mailManager } from './mailManager';

class MailController {
  async processMsg(userInfo: UserInfo, msg: RequestMsg, callback) {
    switch (msg.Name) {
      case CmdId.GetMailList:
        this.getMailList(userInfo, callback);
        break;
      case CmdId.GetMailDetail:
        this.getMailDetail(userInfo, msg, callback);
        break;
      case CmdId.MarkAsRead:
        this.readMail(userInfo, msg, callback);
        break;
      case CmdId.MarkAsCollect:
        this.claimMail(userInfo, msg, callback);
        break;
      case CmdId.DeleteMail:
        this.deleteMail(userInfo, msg, callback);
        break;
      case CmdId.MarkAllAsRead:
        this.readAllMail(userInfo, msg, callback);
        break;
      case CmdId.MarkAllAsCollect:
        this.claimAllMail(userInfo, msg, callback);
        break;
      case CmdId.DeleteAllMail:
        this.deleteAllMail(userInfo, msg, callback);
        break;
    }
  }
  /**
   *
   * @param userInfo
   * @param {UserMailList[]} callback
   */
  async getMailList(userInfo: UserInfo, callback: (res: RespsoneMsg) => void) {
    let listStatus: MailCachingStatus[] = await userMail.getCatchingStatus(userInfo.UserId);

    //  console.log(listStatus);

    let lsValidMail: MailSystems[] = this.checkMailValid(listStatus, userInfo.CountryCode, userInfo.Platform);

    let mailUpdate = await this.checkMailUpdate(userInfo.UserId, userInfo.Platform, userInfo.AppVersion, userInfo.CreatedAt);
    /** Lấy mail của user trong bảng user mail */
    let mailListPrivate = await userMail.loadMailPrivate(userInfo.UserId);

    let contryCode = LANGUAGE[userInfo.CountryCode] || 'US';

    let userMailList: UserMailList[] = userMail.getMailOverview(COUNTRY_LANGUAGE[contryCode], lsValidMail, false);

    if (mailUpdate) userMailList = userMailList.concat(userMail.getMailOverview(COUNTRY_LANGUAGE[contryCode], [mailUpdate], true));
    if (mailListPrivate) userMailList = userMailList.concat(await userMail.getPrivateMail(COUNTRY_LANGUAGE[contryCode], mailListPrivate));

    console.log(userMailList.length);
    callback({
      Status: 1,
      Body: {
        data: userMailList,
      },
    });
  }

  /**
   * Kiểm tra trạng thái mail update của user và trả thưởng
   * @param userId
   * @param platform
   * @param appVersion
   * @param createdAt
   * @returns
   */

  private checkMailUpdate(userId: string, platform: IPlatform, appVersion: number, createdAt: Date): Promise<MailUpdates | null> {
    try {
      const mailUpdate = mailManager.updateMails.get(IPlatform.All.toString()) || mailManager.updateMails.get(platform.toString());
      if (!mailUpdate) return Promise.resolve(null);

      const gifts = mailUpdate.gifts;

      if (createdAt > new Date(mailUpdate.createdAt)) return Promise.resolve(null);

      if (appVersion === mailUpdate.version) {
        if (gifts) {
          redisUtils.SISMEMBER(MAIL_USER + mailUpdate.id, userId, (err, results) => {
            if (!err) mailManager.sendRewardAppVersion(userId, mailUpdate.id, gifts, mailUpdate.endDate);
          });
        }
        return Promise.resolve(null);
      } else if (appVersion >= mailUpdate.minVersion && appVersion < mailUpdate.version) {
        redisUtils.HGET(MAIL_USER + mailUpdate.id, userId, (error, status) => {
          if (status) {
            if (status === MailStatus.DELETED) return Promise.resolve(null);
            else
              return Promise.resolve({
                data: mailUpdate,
                status: MailStatus.NEW,
              });
          }
        });
      } else return Promise.resolve(null);
    } catch (error) {
      console.log(error);
      return Promise.resolve(null);
    }
  }

  private checkMailValid(listStatus: MailCachingStatus[], countryCode: string, platform: IPlatform) {
    let lsSystemMails: MailSystems[] = [];

    let systemMails = Array.from(mailManager.systemMails.values());

    for (let index = 0; index < systemMails.length; index++) {
      if (listStatus[index].status !== MailStatus.DELETED) {
        if (this.validMail(systemMails[index], countryCode, platform)) {
          lsSystemMails.push({
            data: systemMails[index],
            status: listStatus[index].status,
          });
        }
      }
    }

    return lsSystemMails;
  }

  private validMail(mail: IMailSystemDocument, countryCode: string, platform: IPlatform) {
    if (mail.countryCode.length && !mail.countryCode.includes(countryCode)) return false;

    return mail.platform === platform || mail.platform === IPlatform.All;
  }

  getMailDetail(userInfo: UserInfo, msg: RequestMsg, callback: (res: RespsoneMsg) => void) {
    let countryCode = LANGUAGE[userInfo.CountryCode] || 'US';
    userMail.getMailDetails(userInfo.UserId, msg.Body.MailId, msg.Body.Type, COUNTRY_LANGUAGE[countryCode], (err, result) => {
      if (err) {
        callback({
          Status: 0,
          Error: err,
        });
      } else {
        callback({
          Status: 1,
          Body: result,
        });
      }
    });
  }

  readMail(userInfo: UserInfo, msg: RequestMsg, callback: (res: RespsoneMsg) => void) {
    userMail.markMailAsRead(userInfo.UserId, msg.Body.MailId, msg.Body.Type, (response) => {
      callback({
        Status: 1,
        Body: response,
      });
    });
  }

  async readAllMail(userInfo: UserInfo, msg: RequestMsg, callback: (res: RespsoneMsg) => void) {
    let lsMailStatus: MailCachingStatus[] = await userMail.getCatchingStatus(userInfo.UserId);
    let mailUpdate = await this.checkMailUpdate(userInfo.UserId, userInfo.Platform, userInfo.AppVersion, userInfo.CreatedAt);

    lsMailStatus.forEach((mail) => {
      if (mail.status === MailStatus.NEW) {
        let startDate = mailManager.systemMails.get(mail.mailId)?.startDate;

        if (startDate && new Date(startDate) < new Date()) userMail.changeStatusMailSystem(userInfo.UserId, mail.mailId, MailStatus.READ);
      }
    });
    if (mailUpdate && mailUpdate.status === MailStatus.NEW) {
      userMail.changeStatusMailSystem(userInfo.UserId, mailUpdate.data.id, MailStatus.READ);
    }
    userMail.markAllMailAsRead(userInfo.UserId);

    callback({
      Status: 1,
      Body: {},
    });
  }

  async claimMail(userInfo: UserInfo, msg: RequestMsg, callback: (res: RespsoneMsg) => void) {
    userMail.markMailAsCollected(userInfo.UserId, msg.Body.MailId, msg.Body.Type, (response) => {
      callback({
        Status: 1,
        Body: response,
      });
    });
  }

  async deleteMail(userInfo: UserInfo, msg: RequestMsg, callback: (res: RespsoneMsg) => void) {
    userMail.deleteMail(userInfo.UserId, msg.Body.MailId, msg.Body.Type, (response) => {
      callback({
        Status: 1,
        Body: response,
      });
    });
  }

  async claimAllMail(userInfo: UserInfo, msg: RequestMsg, callback: (res: RespsoneMsg) => void) {
    let listGiftSystem: GiftResponse[] = [];

    let listStatus: MailCachingStatus[] = await userMail.getCatchingStatus(userInfo.UserId);
    listStatus.forEach((index) => {
      if (index.status !== MailStatus.DELETED && index.status !== MailStatus.COLLECTED) {
        let mailSystemActive = mailManager.systemMails.get(index.mailId);
        let giftSys = mailSystemActive.gifts;
        let startDate = mailSystemActive.startDate;
        let endDate = mailSystemActive.endDate;

        if (giftSys && startDate && endDate) {
          if (new Date(startDate) < new Date() && new Date(endDate) > new Date()) {
            let keyGift = [...giftSys.keys()];
            keyGift.forEach((key) => {
              listGiftSystem.push({
                key: key,
                value: giftSys?.get(key),
              });
            });
            userMail.changeStatusMailSystem(userInfo.UserId, index.mailId, MailStatus.COLLECTED);
          }
        }
      }
    });

    userMail.markAllMailAsCollected(userInfo.UserId, (gifts) => {
      gifts.push(...listGiftSystem);
      callback({
        Status: 1,
        Body: gifts,
      });
    });
  }

  async deleteAllMail(userInfo: UserInfo, msg: RequestMsg, callback: (res: RespsoneMsg) => void) {
    mailManager.systemId.forEach((mailId) => {
      let startDate = mailManager.systemMails.get(mailId).startDate;
      if (startDate && new Date(startDate) < new Date()) {
        userMail.changeStatusMailSystem(userInfo.UserId, mailId, MailStatus.DELETED);
      }
    });

    mailManager.updateId.forEach((mailId) => {
      let startDate = mailManager.updateMails.get(mailId).startDate;
      if (startDate && new Date(startDate) < new Date()) {
        userMail.changeStatusMailSystem(userInfo.UserId, mailId, MailStatus.DELETED);
      }
    });
    userMail.deleteAllMail(userInfo.UserId);

    callback({
      Status: 1,
      Body: {},
    });
  }
}
export const mailController = new MailController();
