import { IMailUserDocument, UserMailListModel } from '../models/usermaillist';
import RedisUtils from '../helpers/redisUtils';
import { MAIL_USER } from '../mails/mailconfig';
import { MailCachingStatus, MailSystems, MailUpdates, UserMailList } from '../mails/mailIO';
import { mailManager } from '../mails/mailManager';
import { MailType, TypeReward } from '../helpers/CatalogType';
import { LANGUAGE } from '../helpers/language';
class UserMail {
  async loadMailPrivate(userId: string) {
    try {
      let mailPrivate = await UserMailListModel.find({ userId: userId, validTo: { $gt: new Date() } }, { status: 1, validTo: 1, mailId: 1, type: 1, title: 1 }).exec();
      return Promise.resolve(mailPrivate);
    } catch (err) {
      console.log('-----loadMail-----' + err);
      return Promise.resolve(null);
    }
  }

  getCatchingStatus(userId: string) {
    return new Promise<any>((resolve, reject) => {
      RedisUtils.GETMULTIHASHFIELD(MAIL_USER, userId, mailManager.systemId, (error: any, userStatus: MailCachingStatus[]) => {
        if (userStatus) {
          resolve(userStatus);
        } else {
          resolve([]);
          console.log(error);
        }
      });
    });
  }

  getMailOverview(language: string, lsMailSystem: MailSystems[] | MailUpdates[], isUpdate: boolean): UserMailList[] {
    let mailListSys: UserMailList[] = [];
    for (let i = 0; i < lsMailSystem.length; i++) {
      let mailContent = mailManager.getMail(lsMailSystem[i].data.id, isUpdate, language);
      if (mailContent && new Date(lsMailSystem[i].data.startDate) < new Date() && new Date(lsMailSystem[i].data.endDate) > new Date()) {
        mailListSys.push({
          mailId: lsMailSystem[i].data.id,
          status: lsMailSystem[i].status,
          timeEnd: Math.floor(new Date(lsMailSystem[i].data.endDate).getTime() / 1000),
          title: mailContent.title,
          type: isUpdate ? MailType.Update : MailType.System,
        });
      }
    }
    return mailListSys;
  }

  async getPrivateMail(language: string, lsMail: IMailUserDocument[]): Promise<UserMailList[]> {
    let mailListPrivate: UserMailList[] = [];
    for await (const mail of lsMail) {
      const timeEnd = new Date(mail.validTo).getTime();

      switch (mail.type) {
        case TypeReward.AdminPush:
          let title = mail.title;
          mailListPrivate.push({
            mailId: mail._id,
            status: mail.status,
            timeEnd: timeEnd,
            title: title ? title : '',
            type: MailType.Reward,
          });
          break;
        default:
          let mailContent = mailManager.getMailRewardFromType(mail.type, language);
          if (mailContent) {
            mailListPrivate.push({
              mailId: mail._id,
              status: mail.status,
              timeEnd: timeEnd,
              title: mailContent.title,
              type: MailType.Reward,
            });
          }
      }
    }
    return mailListPrivate;
  }

  changeStatusMailSystem(userId: string, mailId: string, status: number) {
    RedisUtils.HSET(MAIL_USER + mailId, userId, status, (err, result) => {
      if (err) console.log(err);
    });
  }

  getMailDetails(userId: string, mailId: string, type: MailType, language: string, callback: Function) {}

  markMailAsReward() {}

  markAllMailAsReward() {}

  markMailAsCollected() {}

  markAllMailAsCollected() {}

  deleteMail() {}

  deleteAllMail() {}
}

export const userMail = new UserMail();
