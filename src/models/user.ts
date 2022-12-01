import mongoose from 'mongoose';

export interface IUser {
  userId: string;
  userName: string;
  deviceId: string;
  lastPVP: number;
  countryCode: string;
  createdAt: Date;
  lastLogin: Date;
}

export interface IUserDocument extends IUser, mongoose.Document {}

let userSchema = new mongoose.Schema(
  {
    userId: String,
    userName: String,
    deviceId: String,
    lastPVP: Number,
    countryCode: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

userSchema.index({ userId: 1 }, { unique: true, background: true, sparse: true });
userSchema.index({ deviceId: 1 }, { background: true, sparse: true });

export const UserModel = mongoose.model<IUserDocument>('User', userSchema);
