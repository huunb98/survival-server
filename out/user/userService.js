"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const user_1 = require("../models/user");
class UserService {
    SetName(userInfo, msg, fn) {
        console.log(msg);
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
}
exports.userService = new UserService();
//# sourceMappingURL=userService.js.map