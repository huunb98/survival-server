import mongoose from 'mongoose';
import { IPlatform } from '../heplers/CatalogType';
import { IUserDocument } from './user';

interface IDevice {
  deviceId: string;
  appVersion: number;
  deviceModel: string;
  os: string;
  platform: IPlatform;
  user: IUserDocument;
  createdAt: Date;
}
export interface IDeviceDocument extends IDevice, mongoose.Document {}

var deviceSchema = new mongoose.Schema({
  deviceId: String,
  appVersion: Number,
  deviceModel: String,
  os: String,
  platform: {
    type: Number,
    of: IPlatform,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

deviceSchema.index(
  {
    DeviceId: 1,
    Platform: 1,
  },
  {
    unique: true,
    sparse: true,
    background: true,
  }
);

deviceSchema.index(
  {
    User: 1,
  },
  {
    background: true,
  }
);

export const DeviceModel = mongoose.model<IDeviceDocument>('Device', deviceSchema);
