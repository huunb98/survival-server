"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.mailManager = void 0;
const language_1 = require("../helpers/language");
const mailReward_1 = require("../models/mailReward");
const mailSystem_1 = require("../models/mailSystem");
const mailUpdate_1 = require("../models/mailUpdate");
const schedule = __importStar(require("node-schedule"));
const usermaillist_1 = require("../models/usermaillist");
const catalogType_1 = require("../helpers/catalogType");
const redisUtils_1 = __importDefault(require("../utils/redisUtils"));
const mailconfig_1 = require("./mailconfig");
class MailManager {
    constructor() {
        this.defaultLanguage = language_1.LANGUAGE.English;
        this.initCache();
        this.scheduleReloadMail();
    }
    /**
     * Reload all mail caching
     */
    getMailConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let endDay = new Date();
                endDay.setHours(23, 59, 59, 999);
                this.initCache();
                let rewards = yield mailReward_1.MailRewardModel.find({ isDeleted: false }).exec();
                let systems = yield mailSystem_1.MailSystemModel.find({ isDeleted: false, startDate: { $lt: endDay }, endDate: { $gt: new Date() } }).exec();
                let updates = yield mailUpdate_1.MailUpdateModel.find({ isDeleted: false, startDate: { $lt: endDay }, endDate: { $gt: new Date() } }).exec();
                rewards.forEach((index) => this.rewardMails.set(index.type.toString(), index));
                systems.forEach((index) => {
                    this.systemMails.set(index.id, index);
                    this.systemId.push(index.id);
                    /**
                     * Set mail expiry
                     */
                    redisUtils_1.default.EXPIREAT(mailconfig_1.MAIL_USER + index.id, Math.floor(new Date(index.endDate).getTime() / 1000));
                });
                updates.forEach((index) => {
                    this.updateMails.set(index.platform.toString(), index);
                    this.updateMailById.set(index.id, index);
                    this.updateId.push(index.id);
                    redisUtils_1.default.EXPIREAT(mailconfig_1.MAIL_USER + index.id, Math.floor(new Date(index.endDate).getTime() / 1000));
                });
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    scheduleReloadMail() {
        schedule.scheduleJob('0 0 * * *', () => {
            console.log('Running job! ', 'Reload mail');
            this.reloadConfig();
        });
    }
    /**
     * Only call on it or clear state
     */
    initCache() {
        this.systemMails = new Map();
        this.rewardMails = new Map();
        this.updateMails = new Map();
        this.updateMailById = new Map();
        this.systemId = [];
        this.updateId = [];
    }
    reloadConfig() {
        console.log(`Reload mail at ${new Date()}`);
        this.getMailConfig();
    }
    getMail(id, isUpdate, language) {
        let mailMap = isUpdate ? this.updateMailById.get(id) : this.systemMails.get(id);
        if (mailMap) {
            let mailContent = mailMap.mail.get(language) || mailMap.mail.get(this.defaultLanguage);
            if (mailContent)
                return mailContent;
            else
                return null;
        }
        else
            return null;
    }
    getMailRewardFromType(type, language) {
        let mailMap = this.rewardMails.get(type.toString());
        if (mailMap) {
            let mailContent = mailMap.mail.get(language) || mailMap.mail.get(this.defaultLanguage);
            if (mailContent)
                return mailContent;
            else
                return null;
        }
        else
            return null;
    }
    getMailRewardDetail(mailId, language, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            usermaillist_1.UserMailListModel.findById(mailId)
                .then((mailUser) => {
                if (mailUser) {
                    let gifts = [];
                    if (mailUser.gifts) {
                        gifts = Array.from(mailUser.gifts, function (item) {
                            return { key: item[0], value: +item[1] };
                        });
                    }
                    let timeEnd = new Date(mailUser.validTo).getTime();
                    let mailDetails = {
                        sender: 'Jackal Squad Team',
                        status: mailUser.status,
                        title: '',
                        content: '',
                        timeEnd: timeEnd,
                        gifts: gifts,
                        type: catalogType_1.MailType.Reward,
                    };
                    let mailRewards = this.rewardMails.get(mailUser.type.toString());
                    switch (mailUser.type) {
                        case catalogType_1.TypeReward.AdminPush:
                            mailDetails.title = mailUser.title || '';
                            mailDetails.content = mailUser.content || '';
                            callback(null, mailDetails);
                            break;
                        case catalogType_1.TypeReward.PVP:
                            if (mailRewards) {
                                mailDetails.sender = mailRewards.sender;
                                let mails = mailRewards.mail.get(language) || mailRewards.mail.get(this.defaultLanguage);
                                if (mails) {
                                    mailDetails.title = mails.title;
                                    let pvpInfo = JSON.parse(mailUser.content);
                                    mailDetails.content = mails.content.replace('{0}', pvpInfo.Season).replace('{1}', pvpInfo.Rank);
                                }
                                callback(null, mailDetails);
                            }
                            else
                                callback('Mail not found', null);
                            break;
                        case catalogType_1.TypeReward.UpdateVersion:
                            if (mailRewards) {
                                mailDetails.sender = mailRewards.sender;
                                let mails = mailRewards.mail.get(language) || mailRewards.mail.get(this.defaultLanguage);
                                if (mails) {
                                    mailDetails.title = mails.title;
                                    let version = this.updateMailById.get(mailUser.mailId) ? this.updateMailById.get(mailUser.mailId).version.toString() : '';
                                    mailDetails.content = mails.content.replace('{}', version);
                                }
                                callback(null, mailDetails);
                            }
                            else
                                callback('Mail not found', null);
                            break;
                        default:
                            if (mailRewards) {
                                if (mailRewards) {
                                    mailDetails.sender = mailRewards.sender;
                                    let mails = mailRewards.mail.get(language) || mailRewards.mail.get(this.defaultLanguage);
                                    if (mails) {
                                        mailDetails.title = mails.title;
                                        mailDetails.content = mails.content;
                                    }
                                    callback(null, mailDetails);
                                }
                                else
                                    callback('Mail not found', null);
                            }
                    }
                    if (mailUser.status === catalogType_1.MailStatus.NEW) {
                        mailUser.status = catalogType_1.MailStatus.READ;
                        mailUser.save().catch(console.error);
                    }
                }
                else
                    callback('Mail not found', null);
            })
                .catch((error) => {
                callback('Database error', null);
                console.log('Get user mail list error', error);
            });
        });
    }
    getMailSystemDetail(mailId, language, status, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            let mailMap = this.systemMails.get(mailId);
            let mail = mailMap.mail.get(language) || mailMap.mail.get(this.defaultLanguage);
            let gifts = [];
            if (mailMap.gifts) {
                gifts = Array.from(mailMap.gifts, function (item) {
                    return { key: item[0], value: +item[1] };
                });
            }
            if (mail) {
                let mailDetails = {
                    sender: mailMap.sender,
                    status: status,
                    title: mail.title,
                    content: mail.content,
                    timeEnd: new Date(mailMap.endDate).getTime(),
                    gifts: gifts,
                    type: catalogType_1.MailType.System,
                };
                callback(null, mailDetails);
            }
            else
                callback('Mail Not Found', null);
        });
    }
    getMailUpdateDetail(mailId, language, status, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            let mailMap = this.updateMailById.get(mailId);
            let mail = mailMap.mail.get(language) || mailMap.mail.get(this.defaultLanguage);
            let gifts = [];
            if (mail) {
                let mailDetails = {
                    sender: 'System Team',
                    status: status,
                    title: mail.title,
                    content: mail.content,
                    timeEnd: new Date(mailMap.endDate).getTime(),
                    gifts: gifts,
                    type: catalogType_1.MailType.System,
                };
                callback(null, mailDetails);
            }
            else
                callback('Mail Not Found', null);
        });
    }
    sendRewardAppVersion(userId, mailId, gifts, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            let newUserMail = new usermaillist_1.UserMailListModel();
            newUserMail.userId = userId;
            newUserMail.mailId = mailId;
            newUserMail.type = catalogType_1.TypeReward.UpdateVersion;
            newUserMail.gifts = gifts;
            newUserMail.validTo = endDate;
            redisUtils_1.default.SETKEY(mailconfig_1.MAIL_USER + mailId + 'Reward', userId, (err, rs) => {
                if (err)
                    console.log(err);
            });
            newUserMail
                .save()
                .then()
                .catch((ex) => {
                console.log('------saveUserMails--------' + ex.name);
            });
        });
    }
    sendRewardToUser(userId, typeReward, title, content, gifts, userRank, season, endDate, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            let userMail = new usermaillist_1.UserMailListModel();
            userMail.userId = userId;
            userMail.type = typeReward;
            userMail.validTo = endDate;
            if (title)
                userMail.title = title;
            if (content)
                userMail.content = content;
            if (userRank) {
                userMail.content = JSON.stringify({
                    Season: season,
                    Rank: userRank.RankNumber,
                });
            }
            if (gifts)
                userMail.gifts = gifts;
            userMail
                .save()
                .then((_) => callback(null, true))
                .catch((ex) => {
                console.log('------saveUserMails--------' + ex.name);
                callback(true, null);
            });
        });
    }
}
exports.mailManager = new MailManager();
//# sourceMappingURL=mailManager.js.map