import mongoose = require('mongoose');
import { UserRoleCms } from '../helpers/catalogType';

export interface IUserCms {
  userName: string;
  email: string;
  password: string;
  isActive: boolean;
  role: UserRoleCms;
  createdAt: Date;
  updatedAt: Date;
}
export interface IUserCmsDocument extends IUserCms, mongoose.Document {}

const userCmsSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: Number,
      of: UserRoleCms,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

userCmsSchema.index({ email: 1 }, { unique: true, background: true });

export const UserCmsModel = mongoose.model<IUserCmsDocument>('UserCms', userCmsSchema);
