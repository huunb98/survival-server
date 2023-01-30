import mongoose = require('mongoose');
import { IPlatform, IMail } from '../helpers/catalogType';

export interface INotify {
  mail: Map<string, IMail>;
  gifts: Map<string, number>;
  version: number;
  minVersion: number;
  platform: IPlatform;
  isDeleted: boolean;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface INofityDocument extends INotify, mongoose.Document {}

const notifyDocument = new mongoose.Schema(
  {
    mail: {
      type: Map,
      of: {
        title: String,
        content: String,
      },
    },
    gifts: {
      type: Map,
      of: Object,
    },
    version: Number,
    minVersion: Number,
    platform: {
      type: Number,
      of: IPlatform,
    },
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
  },
  {
    versionKey: false,
  }
);

export const MailUpdateModel = mongoose.model<INofityDocument>('MailUpdate', notifyDocument);
