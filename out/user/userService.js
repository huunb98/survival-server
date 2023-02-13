"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const user_1 = require("../models/user");
class UserService {
    SetAvatar(userInfo, msg, fn) {
        let _avatar = msg.Body.Avatar;
        if (_avatar == null || _avatar == undefined) {
            fn({
                Status: 0,
                Error: 'Invalid parameter',
            });
            return;
        }
        user_1.UserModel.updateOne({ _id: userInfo.UserId }, { $set: { avatar: _avatar } })
            .then((_) => {
            fn({
                Status: 1,
            });
        })
            .catch((error) => {
            console.log(error);
            fn({
                Status: 0,
                Error: 'Database error',
            });
        });
    }
    SetName(userInfo, msg, fn) {
        let displayName = msg.Body.DisplayName;
        if (!displayName) {
            fn({
                Status: 0,
                Error: 'Invalid parameter',
            });
            return;
        }
        user_1.UserModel.updateOne({ _id: userInfo.UserId }, { $set: { displayName: displayName } })
            .then((sucess) => {
            fn({
                Status: 1,
            });
        })
            .catch((error) => {
            console.log(error);
            fn({
                Status: 0,
                Error: 'Database error',
            });
        });
    }
    GetBasicInfo(userId, callback) {
        user_1.UserModel.findById(userId, { avatar: 1, displayName: 1, _id: 0 })
            .then((user) => {
            if (user) {
                callback(null, {
                    avatar: user.avatar,
                    displayName: user.displayName,
                });
            }
            else {
                callback('user not found', null);
            }
        })
            .catch((error) => {
            console.log(error);
            callback('server is error', null);
        });
    }
}
exports.userService = new UserService();
//# sourceMappingURL=userService.js.map