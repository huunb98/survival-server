import mongoose = require('mongoose');
import { IMail, TypeReward } from '../heplers/CatalogType';

export interface IMailReward {
  mail: Map<string, IMail>;
  sender: string;
  type: TypeReward;
  gifts: Map<string, number>;
  isDeleted: boolean;
  expiryDate: number;
  createdAt: Date;
  updatedAt: Date;
}
export interface IMailRewardDocument extends IMailReward, mongoose.Document {}

var mailRewardSchema = new mongoose.Schema({
  mail: {
    type: Map,
    of: {
      title: String,
      content: String,
    },
  },
  type: Number,
  sender: String,
  gifts: {
    type: Map,
    of: Object,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  expiryDate: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
export const MailRewardModel = mongoose.model<IMailRewardDocument>('MailReward', mailRewardSchema);
