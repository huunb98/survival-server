import { Socket } from 'socket.io';
import { IPlatform } from '../helpers/CatalogType';
import { IDeviceDocument } from '../models/device';
import { IUserDocument, UserModel } from '../models/user';
import { Subject } from 'rxjs';

export class UserInfo {
  User: IUserDocument;
  Device: IDeviceDocument;

  UserId: string;
  Platform: IPlatform;
  AppVersion: number;
  CountryCode: string;
  DisplayName: string;
  CreatedAt: Date;
  socket: Socket;
  IsAdmin: boolean;
  isLogined = new Subject<boolean>();

  constructor(socket: Socket) {
    this.socket = socket;
  }

  async OnLoginSuccess() {
    this.isLogined.next(true);
  }

  Dispose() {
    if (!this.isLogined.closed) {
      this.isLogined.complete();
      this.isLogined.unsubscribe();
    }
  }
}
