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
exports.userCmsController = void 0;
const jwtAuthen_1 = require("../auth/jwt/jwtAuthen");
const catalogType_1 = require("../helpers/catalogType");
const usercms_1 = require("../models/usercms");
class UserCmsController {
    createUser(userName, email, password, role, adminId, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            let userRole = yield this.getPermission(adminId);
            if (userRole < role)
                return callback('Not permission', null);
            let newUser = new usercms_1.UserCmsModel();
            newUser.userName = userName;
            newUser.email = email;
            newUser.password = password;
            newUser.role = role;
            newUser
                .save()
                .then((result) => {
                callback(null, result);
            })
                .catch((error) => {
                callback(error, null);
            });
        });
    }
    login(email, password, callback) {
        usercms_1.UserCmsModel.findOne({ email: email, password: password })
            .then((user) => {
            if (user) {
                let userJWT = {
                    user: user.id,
                };
                let accessToken = jwtAuthen_1.jwtAuthenticate.generateAccessToken(userJWT);
                let loginRes = {
                    userName: user.userName,
                    accessToken: accessToken,
                };
                callback(null, loginRes);
            }
            else {
                callback('Email not found or password is invalid', null);
            }
        })
            .catch((error) => {
            callback('Database error', null);
        });
    }
    getPermission(id) {
        return new Promise((resolve, reject) => usercms_1.UserCmsModel.findOne({ _id: id }, { role: 1, _id: 0 })
            .then((user) => {
            if (user)
                resolve(user.role);
            else
                resolve(catalogType_1.UserRoleCms.NotExist);
        })
            .catch((error) => {
            console.log(error);
            reject(catalogType_1.UserRoleCms.NotExist);
        }));
    }
}
exports.userCmsController = new UserCmsController();
//# sourceMappingURL=userCmsController.js.map