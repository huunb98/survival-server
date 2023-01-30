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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailController = void 0;
const userMail_1 = require("./userMail");
const catalogType_1 = require("../helpers/catalogType");
const Cmd_1 = require("../helpers/Cmd");
const language_1 = require("../helpers/language");
const redisUtils_1 = __importDefault(require("../helpers/redisUtils"));
const mailconfig_1 = require("./mailconfig");
const mailManager_1 = require("./mailManager");
class MailController {
    processMsg(userInfo, msg, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (msg.Name) {
                case Cmd_1.CmdId.GetMailList:
                    this.getMailList(userInfo, callback);
                    break;
                case Cmd_1.CmdId.GetMailDetail:
                    this.getMailDetail(userInfo, msg, callback);
                    break;
                case Cmd_1.CmdId.MarkAsRead:
                    this.readMail(userInfo, msg, callback);
                    break;
                case Cmd_1.CmdId.MarkAsCollect:
                    this.claimMail(userInfo, msg, callback);
                    break;
                case Cmd_1.CmdId.DeleteMail:
                    this.deleteMail(userInfo, msg, callback);
                    break;
                case Cmd_1.CmdId.MarkAllAsRead:
                    this.readAllMail(userInfo, msg, callback);
                    break;
                case Cmd_1.CmdId.MarkAllAsCollect:
                    this.claimAllMail(userInfo, msg, callback);
                    break;
                case Cmd_1.CmdId.DeleteAllMail:
                    this.deleteAllMail(userInfo, msg, callback);
                    break;
            }
        });
    }
    /**
     *
     * @param userInfo
     * @param {UserMailList[]} callback
     */
    getMailList(userInfo, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            let listStatus = yield userMail_1.userMail.getCatchingStatus(userInfo.UserId);
            //  console.log(listStatus);
            let lsValidMail = this.checkMailValid(listStatus, userInfo.CountryCode, userInfo.Platform);
            let mailUpdate = yield this.checkMailUpdate(userInfo.UserId, userInfo.Platform, userInfo.AppVersion, userInfo.CreatedAt);
            /** Lấy mail của user trong bảng user mail */
            let mailListPrivate = yield userMail_1.userMail.loadMailPrivate(userInfo.UserId);
            let contryCode = language_1.LANGUAGE[userInfo.CountryCode] || 'US';
            let userMailList = userMail_1.userMail.getMailOverview(language_1.COUNTRY_LANGUAGE[contryCode], lsValidMail, false);
            if (mailUpdate)
                userMailList = userMailList.concat(userMail_1.userMail.getMailOverview(language_1.COUNTRY_LANGUAGE[contryCode], [mailUpdate], true));
            if (mailListPrivate)
                userMailList = userMailList.concat(yield userMail_1.userMail.getPrivateMail(language_1.COUNTRY_LANGUAGE[contryCode], mailListPrivate));
            console.log(userMailList.length);
            callback({
                Status: 1,
                Body: {
                    data: userMailList,
                },
            });
        });
    }
    /**
     * Kiểm tra trạng thái mail update của user và trả thưởng
     * @param userId
     * @param platform
     * @param appVersion
     * @param createdAt
     * @returns
     */
    checkMailUpdate(userId, platform, appVersion, createdAt) {
        try {
            const mailUpdate = mailManager_1.mailManager.updateMails.get(catalogType_1.IPlatform.All.toString()) || mailManager_1.mailManager.updateMails.get(platform.toString());
            if (!mailUpdate)
                return Promise.resolve(null);
            const gifts = mailUpdate.gifts;
            if (createdAt > new Date(mailUpdate.createdAt))
                return Promise.resolve(null);
            if (appVersion === mailUpdate.version) {
                if (gifts) {
                    redisUtils_1.default.SISMEMBER(mailconfig_1.MAIL_USER + mailUpdate.id, userId, (err, results) => {
                        if (!err)
                            mailManager_1.mailManager.sendRewardAppVersion(userId, mailUpdate.id, gifts, mailUpdate.endDate);
                    });
                }
                return Promise.resolve(null);
            }
            else if (appVersion >= mailUpdate.minVersion && appVersion < mailUpdate.version) {
                return new Promise((resolve, reject) => {
                    redisUtils_1.default.HGET(mailconfig_1.MAIL_USER + mailUpdate.id, userId, (error, status) => {
                        if (status && status === catalogType_1.MailStatus.DELETED)
                            return resolve(null);
                        resolve({
                            data: mailUpdate,
                            status: catalogType_1.MailStatus.NEW,
                        });
                    });
                });
            }
            else
                return Promise.resolve(null);
        }
        catch (error) {
            console.log(error);
            return Promise.resolve(null);
        }
    }
    checkMailValid(listStatus, countryCode, platform) {
        let lsSystemMails = [];
        let systemMails = Array.from(mailManager_1.mailManager.systemMails.values());
        for (let index = 0; index < systemMails.length; index++) {
            if (listStatus[index].status !== catalogType_1.MailStatus.DELETED) {
                if (this.validMail(systemMails[index], countryCode, platform)) {
                    lsSystemMails.push({
                        data: systemMails[index],
                        status: listStatus[index].status,
                    });
                }
            }
        }
        return lsSystemMails;
    }
    validMail(mail, countryCode, platform) {
        if (mail.countryCode.length && !mail.countryCode.includes(countryCode))
            return false;
        return mail.platform === platform || mail.platform === catalogType_1.IPlatform.All;
    }
    getMailDetail(userInfo, msg, callback) {
        let countryCode = language_1.LANGUAGE[userInfo.CountryCode] || 'US';
        userMail_1.userMail.getMailDetails(userInfo.UserId, msg.Body.MailId, msg.Body.Type, language_1.COUNTRY_LANGUAGE[countryCode], (err, result) => {
            if (err) {
                callback({
                    Status: 0,
                    Error: err,
                });
            }
            else {
                callback({
                    Status: 1,
                    Body: result,
                });
            }
        });
    }
    readMail(userInfo, msg, callback) {
        userMail_1.userMail.markMailAsRead(userInfo.UserId, msg.Body.MailId, msg.Body.Type, (response) => {
            callback({
                Status: 1,
                Body: response,
            });
        });
    }
    readAllMail(userInfo, msg, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            let lsMailStatus = yield userMail_1.userMail.getCatchingStatus(userInfo.UserId);
            let mailUpdate = yield this.checkMailUpdate(userInfo.UserId, userInfo.Platform, userInfo.AppVersion, userInfo.CreatedAt);
            lsMailStatus.forEach((mail) => {
                var _a;
                if (mail.status === catalogType_1.MailStatus.NEW) {
                    let startDate = (_a = mailManager_1.mailManager.systemMails.get(mail.mailId)) === null || _a === void 0 ? void 0 : _a.startDate;
                    if (startDate && new Date(startDate) < new Date())
                        userMail_1.userMail.changeStatusMailSystem(userInfo.UserId, mail.mailId, catalogType_1.MailStatus.READ);
                }
            });
            if (mailUpdate && mailUpdate.status === catalogType_1.MailStatus.NEW) {
                userMail_1.userMail.changeStatusMailSystem(userInfo.UserId, mailUpdate.data.id, catalogType_1.MailStatus.READ);
            }
            userMail_1.userMail.markAllMailAsRead(userInfo.UserId);
            callback({
                Status: 1,
                Body: {},
            });
        });
    }
    claimMail(userInfo, msg, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            userMail_1.userMail.markMailAsCollected(userInfo.UserId, msg.Body.MailId, msg.Body.Type, (response) => {
                callback({
                    Status: 1,
                    Body: response,
                });
            });
        });
    }
    deleteMail(userInfo, msg, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            userMail_1.userMail.deleteMail(userInfo.UserId, msg.Body.MailId, msg.Body.Type, (response) => {
                callback({
                    Status: 1,
                    Body: response,
                });
            });
        });
    }
    claimAllMail(userInfo, msg, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            let listGiftSystem = [];
            let listStatus = yield userMail_1.userMail.getCatchingStatus(userInfo.UserId);
            listStatus.forEach((index) => {
                if (index.status !== catalogType_1.MailStatus.DELETED && index.status !== catalogType_1.MailStatus.COLLECTED) {
                    let mailSystemActive = mailManager_1.mailManager.systemMails.get(index.mailId);
                    let giftSys = mailSystemActive.gifts;
                    let startDate = mailSystemActive.startDate;
                    let endDate = mailSystemActive.endDate;
                    if (giftSys && startDate && endDate) {
                        if (new Date(startDate) < new Date() && new Date(endDate) > new Date()) {
                            let keyGift = [...giftSys.keys()];
                            keyGift.forEach((key) => {
                                listGiftSystem.push({
                                    key: key,
                                    value: giftSys === null || giftSys === void 0 ? void 0 : giftSys.get(key),
                                });
                            });
                            userMail_1.userMail.changeStatusMailSystem(userInfo.UserId, index.mailId, catalogType_1.MailStatus.COLLECTED);
                        }
                    }
                }
            });
            userMail_1.userMail.markAllMailAsCollected(userInfo.UserId, (gifts) => {
                gifts.push(...listGiftSystem);
                callback({
                    Status: 1,
                    Body: gifts,
                });
            });
        });
    }
    deleteAllMail(userInfo, msg, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            mailManager_1.mailManager.systemId.forEach((mailId) => {
                let startDate = mailManager_1.mailManager.systemMails.get(mailId).startDate;
                if (startDate && new Date(startDate) < new Date()) {
                    userMail_1.userMail.changeStatusMailSystem(userInfo.UserId, mailId, catalogType_1.MailStatus.DELETED);
                }
            });
            mailManager_1.mailManager.updateId.forEach((mailId) => {
                let startDate = mailManager_1.mailManager.updateMails.get(mailId).startDate;
                if (startDate && new Date(startDate) < new Date()) {
                    userMail_1.userMail.changeStatusMailSystem(userInfo.UserId, mailId, catalogType_1.MailStatus.DELETED);
                }
            });
            userMail_1.userMail.deleteAllMail(userInfo.UserId);
            callback({
                Status: 1,
                Body: {},
            });
        });
    }
}
exports.mailController = new MailController();
//# sourceMappingURL=index.js.map