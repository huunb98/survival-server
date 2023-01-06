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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMail = void 0;
const usermaillist_1 = require("../models/usermaillist");
const redisUtils_1 = __importDefault(require("../helpers/redisUtils"));
const mailconfig_1 = require("./mailconfig");
const mailManager_1 = require("./mailManager");
const CatalogType_1 = require("../helpers/CatalogType");
class UserMail {
    loadMailPrivate(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let mailPrivate = yield usermaillist_1.UserMailListModel.find({ userId: userId, validTo: { $gt: new Date() } }, { status: 1, validTo: 1, mailId: 1, type: 1, title: 1 }).exec();
                return Promise.resolve(mailPrivate);
            }
            catch (err) {
                console.log('-----loadMail-----' + err);
                return Promise.resolve(null);
            }
        });
    }
    getCatchingStatus(userId) {
        return new Promise((resolve, reject) => {
            redisUtils_1.default.GETMULTIHASHFIELD(mailconfig_1.MAIL_USER, userId, mailManager_1.mailManager.systemId, (error, userStatus) => {
                if (userStatus) {
                    resolve(userStatus);
                }
                else {
                    resolve([]);
                    console.log(error);
                }
            });
        });
    }
    getMailOverview(language, lsMailSystem, isUpdate) {
        let mailListSys = [];
        for (let i = 0; i < lsMailSystem.length; i++) {
            let mailContent = mailManager_1.mailManager.getMail(lsMailSystem[i].data.id, isUpdate, language);
            if (mailContent && new Date(lsMailSystem[i].data.startDate) < new Date() && new Date(lsMailSystem[i].data.endDate) > new Date()) {
                mailListSys.push({
                    mailId: lsMailSystem[i].data.id,
                    status: lsMailSystem[i].status,
                    timeEnd: Math.floor(new Date(lsMailSystem[i].data.endDate).getTime()),
                    title: mailContent.title,
                    type: isUpdate ? CatalogType_1.MailType.Update : CatalogType_1.MailType.System,
                });
            }
        }
        return mailListSys;
    }
    getPrivateMail(language, lsMail) {
        var lsMail_1, lsMail_1_1;
        var e_1, _a;
        return __awaiter(this, void 0, void 0, function* () {
            let mailListPrivate = [];
            try {
                for (lsMail_1 = __asyncValues(lsMail); lsMail_1_1 = yield lsMail_1.next(), !lsMail_1_1.done;) {
                    const mail = lsMail_1_1.value;
                    const timeEnd = new Date(mail.validTo).getTime();
                    switch (mail.type) {
                        case CatalogType_1.TypeReward.AdminPush:
                            let title = mail.title;
                            mailListPrivate.push({
                                mailId: mail._id,
                                status: mail.status,
                                timeEnd: timeEnd,
                                title: title ? title : '',
                                type: CatalogType_1.MailType.Reward,
                            });
                            break;
                        default:
                            let mailContent = mailManager_1.mailManager.getMailRewardFromType(mail.type, language);
                            if (mailContent) {
                                mailListPrivate.push({
                                    mailId: mail._id,
                                    status: mail.status,
                                    timeEnd: timeEnd,
                                    title: mailContent.title,
                                    type: CatalogType_1.MailType.Reward,
                                });
                            }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (lsMail_1_1 && !lsMail_1_1.done && (_a = lsMail_1.return)) yield _a.call(lsMail_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return mailListPrivate;
        });
    }
    changeStatusMailSystem(userId, mailId, status) {
        redisUtils_1.default.HSET(mailconfig_1.MAIL_USER + mailId, userId, status, (err, result) => {
            if (err)
                console.log(err);
        });
    }
    getMailDetails(userId, mailId, type, language, callback) {
        console.log(userId, mailId, type, language);
        switch (type) {
            case CatalogType_1.MailType.System:
                redisUtils_1.default.HGET(mailconfig_1.MAIL_USER + mailId, userId, (error, status) => {
                    if (status) {
                        mailManager_1.mailManager.getMailSystemDetail(mailId, language, Number(status), callback);
                    }
                    else {
                        mailManager_1.mailManager.getMailSystemDetail(mailId, language, CatalogType_1.MailStatus.READ, callback);
                        this.changeStatusMailSystem(userId, mailId, CatalogType_1.MailStatus.READ);
                    }
                });
                break;
            case CatalogType_1.MailType.Reward:
                mailManager_1.mailManager.getMailRewardDetail(mailId, language, callback);
                break;
            case CatalogType_1.MailType.Update:
                redisUtils_1.default.HGET(mailconfig_1.MAIL_USER + mailId, userId, (error, status) => {
                    if (status) {
                        mailManager_1.mailManager.getMailUpdateDetail(mailId, language, Number(status), callback);
                    }
                    else {
                        mailManager_1.mailManager.getMailUpdateDetail(mailId, language, CatalogType_1.MailStatus.READ, callback);
                        this.changeStatusMailSystem(userId, mailId, CatalogType_1.MailStatus.READ);
                    }
                });
                this.markMailAsRead(userId, mailId, CatalogType_1.MailType.Update, () => { });
                break;
        }
    }
    getStatusMailCaching(userId, mailId) {
        return new Promise((resolve, reject) => {
            redisUtils_1.default.HGET(mailconfig_1.MAIL_USER + mailId, userId, (getErr, status) => {
                if (status) {
                    resolve(Number(status));
                }
                else
                    resolve(CatalogType_1.MailStatus.READ);
            });
        });
    }
    markMailAsRead(userId, mailId, type, callback) {
        if (type === CatalogType_1.MailType.Reward) {
            usermaillist_1.UserMailListModel.updateMany({ _id: mailId, status: CatalogType_1.MailStatus.NEW }, { $set: { status: CatalogType_1.MailStatus.READ } })
                .then()
                .catch((ex) => {
                console.log('---------------------------------save markMailAsRead ----------------------------------' + ex.name);
            });
        }
        else
            this.changeStatusMailSystem(userId, mailId, CatalogType_1.MailStatus.READ);
        callback({});
    }
    markAllMailAsRead(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            usermaillist_1.UserMailListModel.updateMany({ userId: userId, status: CatalogType_1.MailStatus.NEW }, { $set: { status: CatalogType_1.MailStatus.READ } }).catch((error) => console.log('--- mark all mail as read ---', error));
        });
    }
    markMailAsCollected(userId, mailId, type, callback) {
        if (type === CatalogType_1.MailType.Reward) {
            usermaillist_1.UserMailListModel.updateMany({ userId: userId, status: CatalogType_1.MailStatus.NEW }, { $set: { status: CatalogType_1.MailStatus.READ } })
                .findOne({ _id: mailId }, { gifts: 1, status: 1 })
                .then((data) => {
                if (data) {
                    let gift = [];
                    if (data.status != CatalogType_1.MailStatus.COLLECTED) {
                        usermaillist_1.UserMailListModel.updateOne({ _id: data._id }, { $set: { status: CatalogType_1.MailStatus.COLLECTED } }).catch((err) => console.log(err));
                        if (data.gifts) {
                            gift = Array.from(data.gifts, function (item) {
                                return { key: item[0], value: item[1] };
                            });
                        }
                        callback(gift);
                    }
                    else
                        callback([]);
                }
                else
                    callback([]);
            })
                .catch((ex) => {
                console.log('---------------------------------save markMailAsCollected ----------------------------------' + ex.name);
            });
        }
        else {
            redisUtils_1.default.HGET(mailconfig_1.MAIL_USER + mailId, userId, (err, rs) => {
                if (Number(rs) === CatalogType_1.MailStatus.DELETED || Number(rs) === CatalogType_1.MailStatus.COLLECTED)
                    return callback([]);
                let mailGifts = mailManager_1.mailManager.systemMails.get(mailId);
                let gifts = mailGifts === null || mailGifts === void 0 ? void 0 : mailGifts.gifts;
                let endDate = mailGifts === null || mailGifts === void 0 ? void 0 : mailGifts.endDate;
                if (gifts && endDate) {
                    if (new Date(endDate) > new Date()) {
                        this.changeStatusMailSystem(userId, mailId, CatalogType_1.MailStatus.COLLECTED);
                        let gift = Array.from(gifts, function (item) {
                            return { key: item[0], value: +item[1] };
                        });
                        callback(gift);
                    }
                    else
                        callback([]);
                }
                else
                    callback([]);
            });
        }
    }
    markAllMailAsCollected(userId, callback) {
        usermaillist_1.UserMailListModel.find({ userId: userId, validTo: { $gt: new Date() } }, { gifts: 1, status: 1 })
            .then((data) => __awaiter(this, void 0, void 0, function* () {
            if (data) {
                let gifts = [];
                data.forEach((index) => {
                    if (index.status != CatalogType_1.MailStatus.COLLECTED && index.gifts) {
                        let keyGift = [...index.gifts.keys()];
                        keyGift.forEach((key) => {
                            gifts.push({
                                key: key,
                                value: index.gifts.get(key),
                            });
                        });
                    }
                });
                usermaillist_1.UserMailListModel.updateMany({ userId: userId, validTo: { $gt: new Date() } }, { $set: { status: CatalogType_1.MailStatus.COLLECTED } })
                    .then()
                    .catch((err) => console.log(err));
                callback(gifts);
            }
            else {
                callback([]);
            }
        }))
            .catch((ex) => {
            console.log('------ mark all mail as collected ' + ex.name);
        });
    }
    deleteMail(userId, mailId, type, callback) {
        if (type !== CatalogType_1.MailType.Reward)
            this.changeStatusMailSystem(userId, mailId, CatalogType_1.MailStatus.DELETED);
        else
            usermaillist_1.UserMailListModel.deleteMany({ _id: mailId }).catch((error) => console.log(error));
        callback({});
    }
    deleteAllMail(userId) {
        usermaillist_1.UserMailListModel.deleteMany({ userId: userId }).catch((ex) => {
            console.log('------deleteAllMail-------' + ex.name);
        });
    }
}
exports.userMail = new UserMail();
//# sourceMappingURL=userMail.js.map