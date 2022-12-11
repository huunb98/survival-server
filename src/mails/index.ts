import { IPVersion } from 'net';
import { userMail } from '../controllers/userMail';
import { IPlatform, MailStatus } from '../helpers/CatalogType';
import { CmdId } from '../helpers/Cmd';
import { COUNTRY_LANGUAGE, LANGUAGE } from '../helpers/language';
import redisUtils from '../helpers/redisUtils';
import { RequestMsg, RespsoneMsg } from '../io/IOInterface';
import { IMailSystemDocument } from '../models/mailSystem';
import { UserInfo } from '../user/userInfo';
import { MAIL_USER } from './mailconfig';
import { MailCachingStatus, MailSystems, MailUpdates, UserMailList } from './mailIO';
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
        break;
      case CmdId.DeleteMail:
        break;
      case CmdId.MarkAllAsRead:
        break;
      case CmdId.DeleteAllMail:
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
    let lsValidMail: MailSystems[] = this.checkMailValid(listStatus, userInfo.CountryCode, userInfo.Platform);

    let mailUpdate = await this.checkMailUpdate(userInfo.UserId, userInfo.Platform, userInfo.AppVersion, userInfo.CreatedAt);
    /** Lấy mail của user trong bảng user mail */
    let mailListPrivate = await userMail.loadMailPrivate(userInfo.UserId);

    let contryCode = LANGUAGE[userInfo.CountryCode] || 'US';

    let userMailList: UserMailList[] = userMail.getMailOverview(COUNTRY_LANGUAGE[contryCode], lsValidMail, false);

    if (mailUpdate) userMailList = userMailList.concat(userMail.getMailOverview(COUNTRY_LANGUAGE[contryCode], [mailUpdate], true));
    if (mailListPrivate) userMailList = userMailList.concat(await userMail.getPrivateMail(COUNTRY_LANGUAGE[contryCode], mailListPrivate));

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
      const gifts = mailUpdate.gifts;
      if (!mailUpdate) return Promise.resolve(null);

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

    mailManager.systemMails.forEach((value, index) => {
      if (listStatus[index].status !== MailStatus.DELETED) {
        if (this.validMail(value, countryCode, platform)) {
          lsSystemMails.push({
            data: mailManager.systemMails[index],
            status: listStatus[index].status,
          });
        }
      }
    });
    return lsSystemMails;
  }

  private validMail(mail: IMailSystemDocument, countryCode: string, platform: IPlatform) {
    if (mail.countryCode.length && !mail.countryCode.includes(countryCode)) return false;

    return mail.platform === platform || mail.platform === IPlatform.All;
  }

  async getMailDetail(userInfo: UserInfo, msg: RequestMsg, callback: (res: RespsoneMsg) => void) {
    let contryCode = LANGUAGE[userInfo.CountryCode] || 'US';
    userMail.getMailDetails(userInfo.UserId, msg.Body.MailId, msg.Body.Type, COUNTRY_LANGUAGE[contryCode], (err, result) => {
      if (err) {
        callback({
          Status: 0,
          Error: err,
        });
      } else {
        callback({
          Status: 1,
          Body: {
            data: result,
          },
        });
      }
    });
  }

  async readMail(userInfo: UserInfo, msg: RequestMsg, callback: (res: RespsoneMsg) => void) {}

  async claimMail(userInfo: UserInfo, msg: RequestMsg, callback: (res: RespsoneMsg) => void) {}

  async deleteMail(userInfo: UserInfo, msg: RequestMsg, callback: (res: RespsoneMsg) => void) {}

  async claimAllMail(userInfo: UserInfo, msg: RequestMsg, callback: (res: RespsoneMsg) => void) {}

  async deleteAllMail(userInfo: UserInfo, msg: RequestMsg, callback: (res: RespsoneMsg) => void) {}
}
export const mailController = new MailController();
