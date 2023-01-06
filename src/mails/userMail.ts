import { IMailUserDocument, UserMailListModel } from '../models/usermaillist';
import RedisUtils from '../helpers/redisUtils';
import { MAIL_USER } from './mailconfig';
import { GiftResponse, MailCachingStatus, MailSystems, MailUpdates, UserMailList } from './mailIO';
import { mailManager } from './mailManager';
import { MailStatus, MailType, TypeReward } from '../helpers/catalogType';
import { LANGUAGE } from '../helpers/language';
import { mailController } from '.';
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
    return new Promise<MailCachingStatus[]>((resolve, reject) => {
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
          timeEnd: Math.floor(new Date(lsMailSystem[i].data.endDate).getTime()),
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

  getMailDetails(userId: string, mailId: string, type: MailType, language: string, callback: Function) {
    console.log(userId, mailId, type, language);
    switch (type) {
      case MailType.System:
        RedisUtils.HGET(MAIL_USER + mailId, userId, (error, status) => {
          if (status) {
            mailManager.getMailSystemDetail(mailId, language, Number(status), callback);
          } else {
            mailManager.getMailSystemDetail(mailId, language, MailStatus.READ, callback);
            this.changeStatusMailSystem(userId, mailId, MailStatus.READ);
          }
        });
        break;
      case MailType.Reward:
        mailManager.getMailRewardDetail(mailId, language, callback);
        break;
      case MailType.Update:
        RedisUtils.HGET(MAIL_USER + mailId, userId, (error, status) => {
          if (status) {
            mailManager.getMailUpdateDetail(mailId, language, Number(status), callback);
          } else {
            mailManager.getMailUpdateDetail(mailId, language, MailStatus.READ, callback);
            this.changeStatusMailSystem(userId, mailId, MailStatus.READ);
          }
        });
        this.markMailAsRead(userId, mailId, MailType.Update, () => {});
        break;
    }
  }

  getStatusMailCaching(userId: string, mailId: string) {
    return new Promise<MailStatus>((resolve, reject) => {
      RedisUtils.HGET(MAIL_USER + mailId, userId, (getErr, status) => {
        if (status) {
          resolve(Number(status));
        } else resolve(MailStatus.READ);
      });
    });
  }

  markMailAsRead(userId: string, mailId: string, type: MailType, callback: Function) {
    if (type === MailType.Reward) {
      UserMailListModel.updateMany({ _id: mailId, status: MailStatus.NEW }, { $set: { status: MailStatus.READ } })
        .then()
        .catch((ex) => {
          console.log('---------------------------------save markMailAsRead ----------------------------------' + ex.name);
        });
    } else this.changeStatusMailSystem(userId, mailId, MailStatus.READ);

    callback({});
  }

  async markAllMailAsRead(userId: string) {
    UserMailListModel.updateMany({ userId: userId, status: MailStatus.NEW }, { $set: { status: MailStatus.READ } }).catch((error) =>
      console.log('--- mark all mail as read ---', error)
    );
  }

  markMailAsCollected(userId: string, mailId: string, type: MailType, callback: Function) {
    if (type === MailType.Reward) {
      UserMailListModel.updateMany({ userId: userId, status: MailStatus.NEW }, { $set: { status: MailStatus.READ } })
        .findOne({ _id: mailId }, { gifts: 1, status: 1 })
        .then((data) => {
          if (data) {
            let gift: GiftResponse[] = [];
            if (data.status != MailStatus.COLLECTED) {
              UserMailListModel.updateOne({ _id: data._id }, { $set: { status: MailStatus.COLLECTED } }).catch((err) => console.log(err));
              if (data.gifts) {
                gift = Array.from(data.gifts, function (item) {
                  return { key: item[0], value: item[1] };
                });
              }
              callback(gift);
            } else callback([]);
          } else callback([]);
        })
        .catch((ex) => {
          console.log('---------------------------------save markMailAsCollected ----------------------------------' + ex.name);
        });
    } else {
      RedisUtils.HGET(MAIL_USER + mailId, userId, (err, rs) => {
        if (Number(rs) === MailStatus.DELETED || Number(rs) === MailStatus.COLLECTED) return callback([]);

        let mailGifts = mailManager.systemMails.get(mailId);
        let gifts = mailGifts?.gifts;
        let endDate = mailGifts?.endDate;
        if (gifts && endDate) {
          if (new Date(endDate) > new Date()) {
            this.changeStatusMailSystem(userId, mailId, MailStatus.COLLECTED);
            let gift: GiftResponse[] = Array.from(gifts, function (item) {
              return { key: item[0], value: +item[1] };
            });
            callback(gift);
          } else callback([]);
        } else callback([]);
      });
    }
  }

  markAllMailAsCollected(userId: string, callback: Function) {
    UserMailListModel.find({ userId: userId, validTo: { $gt: new Date() } }, { gifts: 1, status: 1 })
      .then(async (data) => {
        if (data) {
          let gifts: GiftResponse[] = [];
          data.forEach((index) => {
            if (index.status != MailStatus.COLLECTED && index.gifts) {
              let keyGift = [...index.gifts.keys()];
              keyGift.forEach((key) => {
                gifts.push({
                  key: key,
                  value: index.gifts.get(key),
                });
              });
            }
          });
          UserMailListModel.updateMany({ userId: userId, validTo: { $gt: new Date() } }, { $set: { status: MailStatus.COLLECTED } })
            .then()
            .catch((err) => console.log(err));
          callback(gifts);
        } else {
          callback([]);
        }
      })
      .catch((ex) => {
        console.log('------ mark all mail as collected ' + ex.name);
      });
  }

  deleteMail(userId: string, mailId: string, type: MailType, callback: Function) {
    if (type !== MailType.Reward) this.changeStatusMailSystem(userId, mailId, MailStatus.DELETED);
    else UserMailListModel.deleteMany({ _id: mailId }).catch((error) => console.log(error));
    callback({});
  }

  deleteAllMail(userId: string) {
    UserMailListModel.deleteMany({ userId: userId }).catch((ex) => {
      console.log('------deleteAllMail-------' + ex.name);
    });
  }
}

export const userMail = new UserMail();
