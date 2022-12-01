import mongoose = require('mongoose');
import { IPlatform, IMail } from '../heplers/catalogType';

export interface IMailSystem {
  mail: Map<string, IMail>;
  sender: string;
  gifts: Map<string, number>;
  platform: IPlatform;
  countryCode: string[];
  isDeleted: boolean;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMailSystemDocument extends IMailSystem, mongoose.Document {}

var mailSystemSchema = new mongoose.Schema({
  mail: {
    type: Map,
    of: {
      title: String,
      content: String,
    },
  },
  sender: String,
  gifts: {
    type: Map,
    of: Object,
  },
  platform: {
    type: Number,
    default: IPlatform.All,
  },
  countryCode: [String],
  isDeleted: {
    type: Boolean,
    default: false,
  },
  startDate: Date,
  endDate: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const MailSystemModel = mongoose.model<IMailSystemDocument>('MailSystem', mailSystemSchema);
