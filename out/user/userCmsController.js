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
const bcrypt_1 = require("../helpers/bcrypt");
const usercms_1 = require("../models/usercms");
class UserCmsController {
    createUser(userName, email, password, role, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            let newUser = new usercms_1.UserCmsModel();
            newUser.userName = userName;
            newUser.email = email;
            newUser.password = yield new bcrypt_1.BcryptHelper().encode(password);
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
        usercms_1.UserCmsModel.findOne({ email: email })
            .then((user) => __awaiter(this, void 0, void 0, function* () {
            if (user) {
                let validPassword = yield new bcrypt_1.BcryptHelper().compareHash(password, user.password);
                if (!validPassword)
                    return callback('Email not found or password is invalid', null);
                let userJWT = {
                    user: user.id,
                    role: user.role,
                };
                let accessToken = jwtAuthen_1.jwtAuthenticate.generateAccessToken(userJWT);
                let loginRes = {
                    userName: user.userName,
                    accessToken: accessToken,
                    role: user.role,
                };
                callback(null, loginRes);
            }
            else {
                callback('Email not found or password is invalid', null);
            }
        }))
            .catch((error) => {
            callback('Database error', null);
        });
    }
}
exports.userCmsController = new UserCmsController();
//# sourceMappingURL=userCmsController.js.map