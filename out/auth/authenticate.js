"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const device_1 = require("../models/device");
const user_1 = require("../models/user");
const ipLocation_1 = require("../utils/ipLocation");
class Authenticate {
    Login(socket, msg, ipAdress, userInfo, fn) {
        let appVersion = msg.Body.AppVersion;
        let deviceId = msg.Body.DeviceId;
        let platform = msg.Body.Platform;
        let oS = msg.Body.OS;
        let _deviceModel = msg.Body.DeviceModel;
        userInfo.Platform = platform;
        userInfo.AppVersion = appVersion;
        device_1.DeviceModel.findOne({
            deviceId: deviceId,
            platform: platform,
        })
            .populate('user')
            .then((device) => {
            if (device) {
                OnFoundDevice(device);
            }
            else {
                CreateNewUser();
            }
        })
            .catch((err) => {
            console.log(err);
        });
        let OnFoundDevice = function (device) {
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
        let CreateNewUser = function () {
            return __awaiter(this, void 0, void 0, function* () {
                const user = new user_1.UserModel({
                    deviceId: deviceId,
                    displayName: 'PLayer#' + makeid(),
                    lastLogin: Date.now(),
                });
                user.save().then((newUser) => {
                    const newDevice = new device_1.DeviceModel({
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
            });
        };
    }
}
function OnLoginSuccess(user, device, ipAdress, userInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        let UserId = user._id.toString();
        userInfo.Device = device;
        userInfo.DisplayName = user.displayName;
        // userInfo.AvatarUrl = user.AvatarUrl;
        userInfo.CountryCode = user.countryCode;
        userInfo.UserId = UserId;
        userInfo.Platform = device.platform;
        userInfo.User = user;
        userInfo.CreatedAt = new Date(user.createdAt);
        yield userInfo.OnLoginSuccess();
        ipLocation_1.ipLocation.SaveLocation(user._id, ipAdress, device.deviceId, userInfo);
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
    });
}
function makeid() {
    var length = 6;
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}
exports.authenticate = new Authenticate();
//# sourceMappingURL=authenticate.js.map