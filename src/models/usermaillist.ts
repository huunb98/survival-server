import mongoose = require('mongoose');
import { TypeReward, MailStatus } from '../helpers/catalogType';

export interface IMailUser {
  userId: string;
  mailId: string;
  status: MailStatus;
  type: TypeReward;
  title: string;
  content: string;
  gifts: Map<string, number>;
  validTo: Date;
}

export interface IMailUserDocument extends IMailUser, mongoose.Document {}

const usermailList = new mongoose.Schema({
  userId: String,
  mailId: String,
  status: {
    type: Number,
    of: MailStatus,
    default: MailStatus.NEW,
  },
  type: {
    type: Number,
    of: TypeReward,
  },
  title: String,
  content: String,
  gifts: {
    type: Map,
    of: Object,
  },
  validTo: Date,
});

usermailList.index({ userId: 1 });
usermailList.index({ mailId: 1 });

export const UserMailListModel = mongoose.model<IMailUserDocument>('UserMailList', usermailList);
