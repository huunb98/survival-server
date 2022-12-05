import { Socket } from 'socket.io';
import { IPlatform } from '../heplers/CatalogType';
import { IDeviceDocument } from '../models/device';
import { IUserDocument } from '../models/user';
import { Subject } from 'rxjs';

export class UserInfo {
  User: IUserDocument;
  Device: IDeviceDocument;

  UserId: string;
  Platform: IPlatform;
  AppVersion: number;
  CountryCode: string;
  DisplayName: string;
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
