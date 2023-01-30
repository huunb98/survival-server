import { IMail, IPlatform, MailRewardResult, MailSystemResult, MailType, MailUpdateResult, TypeReward } from '../helpers/catalogType';
import { LANGUAGE, LANGUAGE_TRANSLATE } from '../helpers/language';
import Translate from '../helpers/translate';
import { MailUpdateModel } from '../models/mailUpdate';
import { MailRewardModel } from '../models/mailReward';
import { MailSystemModel } from '../models/mailSystem';
import { mailManager } from './mailManager';

export default class MailCMS {
  async createMailSystem(
    title: string,
    content: string,
    sender: string,
    gifts: Map<string, number>,
    platform: IPlatform,
    countryCode: string[],
    startDate: Date,
    endDate: Date,
    callback: Function
  ) {
    let mail = await this.translateMail(title, content);

    let mailDocument = new MailSystemModel();

    mailDocument.mail = mail;
    mailDocument.sender = sender;
    if (gifts) mailDocument.gifts = gifts;
    if (countryCode) mailDocument.countryCode = countryCode;
    mailDocument.platform = platform;
    mailDocument.startDate = startDate;
    mailDocument.endDate = endDate;

    mailDocument
      .save()
      .then((_) => {
        mailManager.reloadConfig();
        callback(null, 'Add Mail System Succeed');
      })
      .catch((error) => {
        console.log(error);
        callback('Add Mail System Error', null);
      });
  }

  async createMailUpdate(
    title: string,
    content: string,
    gifts: Map<string, number>,
    version: number,
    minVersion: number,
    platform: IPlatform,
    startDate: Date,
    endDate: Date,
    callback: Function
  ) {
    let mail = await this.translateMail(title, content);
    let mailDocument = new MailUpdateModel();

    mailDocument.mail = mail;
    mailDocument.gifts = gifts;
    mailDocument.version = version;
    mailDocument.minVersion = minVersion;
    mailDocument.platform = platform;

    mailDocument.startDate = startDate;
    mailDocument.endDate = endDate;

    mailDocument
      .save()
      .then((_) => {
        mailManager.reloadConfig();
        callback(null, 'Add Mail Update Succeed');
      })
      .catch((error) => {
        console.log(error);
        callback('Add Mail Update Error', null);
      });
  }

  async createMailReward(title: string, content: string, sender: string, type: TypeReward, gifts: Map<string, number>, expiryDate: number, callback: Function) {
    let mail = await this.translateMail(title, content);
    let mailDocument = new MailRewardModel();

    mailDocument.mail = mail;
    mailDocument.sender = sender;
    mailDocument.type = type;
    mailDocument.gifts = gifts;
    mailDocument.expiryDate = expiryDate;

    mailDocument
      .save()
      .then((_) => {
        mailManager.reloadConfig();
        callback(null, 'Add Mail Reward Succeed');
      })
      .catch((error) => {
        console.log(error);
        callback('Add Mail Reward Error', null);
      });
  }

  updateMailSystem(
    mailId: string,
    language: LANGUAGE,
    title: string,
    content: string,
    sender: string,
    gifts: Map<string, number>,
    platform: IPlatform,
    countryCode: string[],
    startDate: Date,
    endDate: Date,
    isDeleted: boolean,
    callback: Function
  ) {
    MailSystemModel.findById(mailId)
      .then((mail) => {
        if (mail) {
          let updateContent: IMail = {
            title: title,
            content: content,
          };

          mail.sender = sender;
          mail.mail.set(language, updateContent);
          if (countryCode) mail.countryCode = countryCode;
          mail.platform = platform;
          if (gifts) mail.gifts = gifts;
          mail.isDeleted = isDeleted;
          mail.startDate = startDate;
          mail.endDate = endDate;
          mail.updatedAt = new Date();

          mail
            .save()
            .then(() => {
              mailManager.reloadConfig();
              callback(null, 'Update Success');
            })
            .catch((err) => callback('Database error', null));
        } else callback('Mail not found', null);
      })
      .catch((err) => callback('Database error', null));
  }

  updateMailNotifyUpdate(
    mailId: string,
    language: string,
    title: string,
    content: string,
    gifts: Map<string, number>,
    version: number,
    minVersion: number,
    platform: IPlatform,
    startDate: Date,
    endDate: Date,
    isDeleted: boolean,
    callback: Function
  ) {
    MailUpdateModel.findById(mailId)
      .then((mail) => {
        if (mail) {
          let updateContent: IMail = {
            title: title,
            content: content,
          };

          mail.mail.set(language, updateContent);
          mail.platform = platform;
          if (gifts) mail.gifts = gifts;
          mail.version = version;
          mail.minVersion = minVersion;
          mail.isDeleted = isDeleted;
          mail.startDate = startDate;
          mail.endDate = endDate;
          mail.updatedAt = new Date();

          mail
            .save()
            .then(() => {
              mailManager.reloadConfig();
              callback(null, 'Update Success');
            })
            .catch((err) => callback('Database error', null));
        } else callback('Mail not found', null);
      })
      .catch((err) => callback('Database error', null));
  }

  updateMailReward(
    mailId: string,
    language: string,
    title: string,
    content: string,
    sender: string,
    type: TypeReward,
    gifts: Map<string, number>,
    expiryDate: number,
    isDeleted: boolean,
    callback: Function
  ) {
    MailRewardModel.findById(mailId)
      .then((mail) => {
        if (mail) {
          let updateContent: IMail = {
            title: title,
            content: content,
          };

          mail.sender = sender;
          mail.type = type;
          mail.expiryDate = expiryDate;
          mail.mail.set(language, updateContent);
          if (gifts) mail.gifts = gifts;
          mail.isDeleted = isDeleted;
          mail.updatedAt = new Date();

          mail
            .save()
            .then(() => {
              mailManager.reloadConfig();
              callback(null, 'Update Success');
            })
            .catch((err) => callback('Database error', null));
        } else callback('Mail not found', null);
      })
      .catch((err) => callback('Database error', null));
  }

  async getMailSystem(language, skip, limit, callback: Function) {
    try {
      let mailSystem = await MailSystemModel.find({}).sort({ _id: -1 }).skip(skip).limit(limit).exec();

      let results: MailSystemResult[] = [];
      for (const mail of mailSystem) {
        let result = new MailSystemResult();
        result.id = mail.id;
        result.title = mail.mail.get(language).title;
        result.platform = mail.platform;
        result.country = mail.countryCode;
        result.startDate = mail.startDate;
        result.endDate = mail.endDate;
        result.isDeleted = mail.isDeleted;

        results.push(result);
      }
      callback(null, results);
    } catch (error) {
      console.log(error);
      callback('Get mail system error', null);
    }
  }

  async getMailUpdate(language, skip, limit, callback: Function) {
    try {
      let mailSystem = await MailUpdateModel.find({}).sort({ _id: -1 }).skip(skip).limit(limit).exec();

      let results: MailUpdateResult[] = [];
      for (const mail of mailSystem) {
        let result = new MailUpdateResult();
        result.id = mail.id;
        result.title = mail.mail.get(language).title;
        result.version = mail.version;
        result.minVersion = mail.minVersion;
        result.platform = mail.platform;
        result.startDate = mail.startDate;
        result.endDate = mail.endDate;
        result.isDeleted = mail.isDeleted;

        results.push(result);
      }
      callback(null, results);
    } catch (error) {
      console.log(error);
      callback('Get mail update error', null);
    }
  }

  async getMailReward(language: string, skip: number, limit: number, callback: Function) {
    try {
      let mailSystem = await MailRewardModel.find({}).sort({ _id: -1 }).skip(skip).limit(limit).exec();

      let results: MailRewardResult[] = [];
      for (const mail of mailSystem) {
        let result = new MailRewardResult();
        result.id = mail.id;
        result.title = mail.mail.get(language).title;
        result.expiryDate = mail.expiryDate;
        result.type = mail.type;
        result.isDeleted = mail.isDeleted;
        result.createdAt = mail.createdAt;
        result.updatedAt = mail.updatedAt;

        results.push(result);
      }
      callback(null, results);
    } catch (error) {
      console.log(error);
      callback('Get mail update error', null);
    }
  }

  getMailDetails(mailId, type: MailType, callback: Function) {
    switch (type) {
      case MailType.System:
        MailSystemModel.findById(mailId)
          .then((data) => {
            callback(null, data);
          })
          .catch((err) => callback(err, null));
        break;
      case MailType.Update:
        MailUpdateModel.findById(mailId)
          .then((data) => {
            callback(null, data);
          })
          .catch((err) => callback(err, null));
        break;
      case MailType.Reward:
        MailRewardModel.findById(mailId)
          .then((data) => {
            callback(null, data);
          })
          .catch((err) => callback(err, null));
        break;
      default:
        console.log('Error get mail detail', type);
        callback('Invalid mail type', null);
    }
  }

  reloadConfig() {
    mailManager.reloadConfig();
  }

  private async translateMail(title: string, content: string): Promise<Map<string, IMail>> {
    let mail = new Map<string, IMail>();

    mail.set(LANGUAGE.English, {
      title: title,
      content: content,
    });

    for await (const index of LANGUAGE_TRANSLATE) {
      mail.set(index.language, {
        title: await Translate.autoTranslate(title, index['ISO-639-1 Code']),
        content: await Translate.autoTranslate(content, index['ISO-639-1 Code']),
      });
    }

    return Promise.resolve(mail);
  }
}
