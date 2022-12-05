import mongoose from 'mongoose';

export interface IUser {
  displayName: string;
  deviceId: string;
  lastPVP: number;
  countryCode: string;
  lastIp: string;
  timZone: string;
  createdAt: Date;
  lastLogin: Date;
  role: number;
}

export interface IUserDocument extends IUser, mongoose.Document {}

let userSchema = new mongoose.Schema(
  {
    displayName: String,
    deviceId: String,
    lastPVP: Number,
    countryCode: String,
    lastLogin: Date,
    lastIp: String,
    timZone: String,
    role: Number,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

userSchema.index({ deviceId: 1 }, { background: true, sparse: true });
userSchema.index({ lastLogin: -1 }, { background: true, sparse: true });

export const UserModel = mongoose.model<IUserDocument>('User', userSchema);
