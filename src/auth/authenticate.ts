import { Socket } from 'socket.io';
import { LoginResponse, RequestMsg } from '../io/IOInterface';
import { DeviceModel, IDeviceDocument } from '../models/device';
import { IUserDocument, UserModel } from '../models/user';
import { UserInfo } from '../user/userInfo';
import { ipLocation } from '../utils/ipLocation';

class Authenticate {
  Login(socket: Socket, msg: RequestMsg, ipAdress: string, userInfo: UserInfo, fn: (res: LoginResponse) => void) {
    let appVersion = msg.Body.AppVersion;
    let deviceId = msg.Body.DeviceId;
    let platform = msg.Body.Platform;
    let oS = msg.Body.OS;

    let _deviceModel = msg.Body.DeviceModel;

    userInfo.Platform = platform;
    userInfo.AppVersion = appVersion;

    DeviceModel.findOne({
      deviceId: deviceId,
      platform: platform,
    })
      .populate('user')
      .then((device) => {
        if (device) {
          OnFoundDevice(device);
        } else {
          CreateNewUser();
        }
      })
      .catch((err) => {
        console.log(err);
      });

    let OnFoundDevice = function (device: IDeviceDocument) {
      if (device.user == null) {
        console.log('----ERROR BI XOA USER -------------- Device ID: ' + device.deviceId + '  DeviceModel: ' + device.deviceModel);
        fn({
          Status: 0,
          Error: {
            Error: 1002,
            ErrorMessage: 'Banned',
          },
        });
        return;
      }
      OnLoginSuccess(device.user, device, ipAdress, userInfo).then((response) => {
        fn(response);
      });
    };

    let CreateNewUser = async function () {
      const user = new UserModel({
        deviceId: deviceId,
        displayName: 'PLayer#' + makeid(),
        lastLogin: Date.now(),
      });

      user.save().then((newUser) => {
        const newDevice = new DeviceModel({
          deviceId: deviceId,
          appVersion: appVersion,
          deviceModel: _deviceModel,
          os: oS,
          platform: platform,
          user: newUser._id,
        });

        newDevice.save().catch((err) => {
          console.error('Save Device Error: ' + err);
        });

        OnLoginSuccess(newUser, newDevice, ipAdress, userInfo).then((response) => {
          fn(response);
        });
      });

      return;
    };
  }
}

async function OnLoginSuccess(user: IUserDocument, device: IDeviceDocument, ipAdress: string, userInfo: UserInfo): Promise<LoginResponse> {
  let UserId = user._id.toString();
  userInfo.Device = device;
  userInfo.DisplayName = user.displayName;
  // userInfo.AvatarUrl = user.AvatarUrl;
  userInfo.CountryCode = user.countryCode;
  userInfo.UserId = UserId;
  userInfo.Platform = device.platform;
  userInfo.User = user;
  userInfo.CreatedAt = new Date(user.createdAt);
  await userInfo.OnLoginSuccess();

  ipLocation.SaveLocation(user._id, ipAdress, device.deviceId, userInfo);

  return {
    Status: 1,
    Body: {
      Avatar: user.avatar || 0,
      UserId: UserId,
      CountryCode: user.countryCode,
      DisplayName: user.displayName,
      CurrentTime: new Date().toLocaleString(),
      CreatedAt: user.createdAt.toLocaleString(),
      UserRole: 0,
    },
  };
}

function makeid() {
  var length = 6;
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (var i = 0; i < length; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

export const authenticate = new Authenticate();
