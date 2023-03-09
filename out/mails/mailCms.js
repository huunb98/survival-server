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
const catalogType_1 = require("../helpers/catalogType");
const language_1 = require("../helpers/language");
const translate_1 = __importDefault(require("../utils/translate"));
const mailUpdate_1 = require("../models/mailUpdate");
const mailReward_1 = require("../models/mailReward");
const mailSystem_1 = require("../models/mailSystem");
const mailManager_1 = require("./mailManager");
class MailCMS {
    createMailSystem(title, content, sender, gifts, platform, countryCode, startDate, endDate, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            let mail = yield this.translateMail(title, content);
            let mailDocument = new mailSystem_1.MailSystemModel();
            mailDocument.mail = mail;
            mailDocument.sender = sender;
            if (gifts)
                mailDocument.gifts = gifts;
            if (countryCode)
                mailDocument.countryCode = countryCode;
            mailDocument.platform = platform;
            mailDocument.startDate = startDate;
            mailDocument.endDate = endDate;
            mailDocument
                .save()
                .then((_) => {
                mailManager_1.mailManager.reloadConfig();
                callback(null, 'Add Mail System Succeed');
            })
                .catch((error) => {
                console.log(error);
                callback('Add Mail System Error', null);
            });
        });
    }
    createMailUpdate(title, content, gifts, version, minVersion, platform, startDate, endDate, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            let mail = yield this.translateMail(title, content);
            let mailDocument = new mailUpdate_1.MailUpdateModel();
            mailDocument.mail = mail;
            mailDocument.gifts = gifts;
            mailDocument.version = version;
            mailDocument.minVersion = minVersion;
            mailDocument.platform = platform;
            mailDocument.startDate = startDate;
            mailDocument.endDate = endDate;
            mailDocument
                .save()
                .then((_) => {
                mailManager_1.mailManager.reloadConfig();
                callback(null, 'Add Mail Update Succeed');
            })
                .catch((error) => {
                console.log(error);
                callback('Add Mail Update Error', null);
            });
        });
    }
    createMailReward(title, content, sender, type, gifts, expiryDate, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            let mail = yield this.translateMail(title, content);
            let mailDocument = new mailReward_1.MailRewardModel();
            mailDocument.mail = mail;
            mailDocument.sender = sender;
            mailDocument.type = type;
            mailDocument.gifts = gifts;
            mailDocument.expiryDate = expiryDate;
            mailDocument
                .save()
                .then((_) => {
                mailManager_1.mailManager.reloadConfig();
                callback(null, 'Add Mail Reward Succeed');
            })
                .catch((error) => {
                console.log(error);
                callback('Add Mail Reward Error', null);
            });
        });
    }
    updateMailSystem(mailId, language, title, content, sender, gifts, platform, countryCode, startDate, endDate, isDeleted, callback) {
        mailSystem_1.MailSystemModel.findById(mailId)
            .then((mail) => {
            if (mail) {
                let updateContent = {
                    title: title,
                    content: content,
                };
                mail.sender = sender;
                mail.mail.set(language, updateContent);
                if (countryCode)
                    mail.countryCode = countryCode;
                mail.platform = platform;
                if (gifts)
                    mail.gifts = gifts;
                mail.isDeleted = isDeleted;
                mail.startDate = startDate;
                mail.endDate = endDate;
                mail.updatedAt = new Date();
                mail
                    .save()
                    .then(() => {
                    mailManager_1.mailManager.reloadConfig();
                    callback(null, 'Update Success');
                })
                    .catch((err) => callback('Database error', null));
            }
            else
                callback('Mail not found', null);
        })
            .catch((err) => callback('Database error', null));
    }
    updateMailNotifyUpdate(mailId, language, title, content, gifts, version, minVersion, platform, startDate, endDate, isDeleted, callback) {
        mailUpdate_1.MailUpdateModel.findById(mailId)
            .then((mail) => {
            if (mail) {
                let updateContent = {
                    title: title,
                    content: content,
                };
                mail.mail.set(language, updateContent);
                mail.platform = platform;
                if (gifts)
                    mail.gifts = gifts;
                mail.version = version;
                mail.minVersion = minVersion;
                mail.isDeleted = isDeleted;
                mail.startDate = startDate;
                mail.endDate = endDate;
                mail.updatedAt = new Date();
                mail
                    .save()
                    .then(() => {
                    mailManager_1.mailManager.reloadConfig();
                    callback(null, 'Update Success');
                })
                    .catch((err) => callback('Database error', null));
            }
            else
                callback('Mail not found', null);
        })
            .catch((err) => callback('Database error', null));
    }
    updateMailReward(mailId, language, title, content, sender, type, gifts, expiryDate, isDeleted, callback) {
        mailReward_1.MailRewardModel.findById(mailId)
            .then((mail) => {
            if (mail) {
                let updateContent = {
                    title: title,
                    content: content,
                };
                mail.sender = sender;
                mail.type = type;
                mail.expiryDate = expiryDate;
                mail.mail.set(language, updateContent);
                if (gifts)
                    mail.gifts = gifts;
                mail.isDeleted = isDeleted;
                mail.updatedAt = new Date();
                mail
                    .save()
                    .then(() => {
                    mailManager_1.mailManager.reloadConfig();
                    callback(null, 'Update Success');
                })
                    .catch((err) => callback('Database error', null));
            }
            else
                callback('Mail not found', null);
        })
            .catch((err) => callback('Database error', null));
    }
    getMailSystem(language, skip, limit, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let mailSystem = yield mailSystem_1.MailSystemModel.find({}).sort({ _id: -1 }).skip(skip).limit(limit).exec();
                let results = [];
                for (const mail of mailSystem) {
                    let result = new catalogType_1.MailSystemResult();
                    result.id = mail.id;
                    result.title = mail.mail.get(language).title;
                    result.platform = mail.platform;
                    result.country = mail.countryCode;
                    result.startDate = mail.startDate;
                    result.endDate = mail.endDate;
                    result.isDeleted = mail.isDeleted;
                    results.push(result);
                }
                callback(null, results);
            }
            catch (error) {
                console.log(error);
                callback('Get mail system error', null);
            }
        });
    }
    getMailUpdate(language, skip, limit, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let mailSystem = yield mailUpdate_1.MailUpdateModel.find({}).sort({ _id: -1 }).skip(skip).limit(limit).exec();
                let results = [];
                for (const mail of mailSystem) {
                    let result = new catalogType_1.MailUpdateResult();
                    result.id = mail.id;
                    result.title = mail.mail.get(language).title;
                    result.version = mail.version;
                    result.minVersion = mail.minVersion;
                    result.platform = mail.platform;
                    result.startDate = mail.startDate;
                    result.endDate = mail.endDate;
                    result.isDeleted = mail.isDeleted;
                    results.push(result);
                }
                callback(null, results);
            }
            catch (error) {
                console.log(error);
                callback('Get mail update error', null);
            }
        });
    }
    getMailReward(language, skip, limit, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let mailSystem = yield mailReward_1.MailRewardModel.find({}).sort({ _id: -1 }).skip(skip).limit(limit).exec();
                let results = [];
                for (const mail of mailSystem) {
                    let result = new catalogType_1.MailRewardResult();
                    result.id = mail.id;
                    result.title = mail.mail.get(language).title;
                    result.expiryDate = mail.expiryDate;
                    result.type = mail.type;
                    result.isDeleted = mail.isDeleted;
                    result.createdAt = mail.createdAt;
                    result.updatedAt = mail.updatedAt;
                    results.push(result);
                }
                callback(null, results);
            }
            catch (error) {
                console.log(error);
                callback('Get mail update error', null);
            }
        });
    }
    getMailDetails(mailId, type, callback) {
        switch (type) {
            case catalogType_1.MailType.System:
                mailSystem_1.MailSystemModel.findById(mailId)
                    .then((data) => {
                    callback(null, data);
                })
                    .catch((err) => callback(err, null));
                break;
            case catalogType_1.MailType.Update:
                mailUpdate_1.MailUpdateModel.findById(mailId)
                    .then((data) => {
                    callback(null, data);
                })
                    .catch((err) => callback(err, null));
                break;
            case catalogType_1.MailType.Reward:
                mailReward_1.MailRewardModel.findById(mailId)
                    .then((data) => {
                    callback(null, data);
                })
                    .catch((err) => callback(err, null));
                break;
            default:
                console.log('Error get mail detail', type);
                callback('Invalid mail type', null);
        }
    }
    reloadConfig() {
        mailManager_1.mailManager.reloadConfig();
    }
    translateMail(title, content) {
        var e_1, _a;
        return __awaiter(this, void 0, void 0, function* () {
            let mail = new Map();
            mail.set(language_1.LANGUAGE.English, {
                title: title,
                content: content,
            });
            try {
                for (var LANGUAGE_TRANSLATE_1 = __asyncValues(language_1.LANGUAGE_TRANSLATE), LANGUAGE_TRANSLATE_1_1; LANGUAGE_TRANSLATE_1_1 = yield LANGUAGE_TRANSLATE_1.next(), !LANGUAGE_TRANSLATE_1_1.done;) {
                    const index = LANGUAGE_TRANSLATE_1_1.value;
                    mail.set(index.language, {
                        title: yield translate_1.default.autoTranslate(title, index['ISO-639-1 Code']),
                        content: yield translate_1.default.autoTranslate(content, index['ISO-639-1 Code']),
                    });
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (LANGUAGE_TRANSLATE_1_1 && !LANGUAGE_TRANSLATE_1_1.done && (_a = LANGUAGE_TRANSLATE_1.return)) yield _a.call(LANGUAGE_TRANSLATE_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return Promise.resolve(mail);
        });
    }
}
exports.default = MailCMS;
//# sourceMappingURL=mailCms.js.map