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
const redisUtils_1 = __importDefault(require("../helpers/redisUtils"));
const mailconfig_1 = require("./mailconfig");
class MailManager {
    constructor() {
        this.systemId = [];
        this.updateId = [];
        this.defaultLanguage = language_1.LANGUAGE.English;
        this.systemMails = new Map();
        this.rewardMails = new Map();
        this.updateMails = new Map();
        this.updateMailById = new Map();
    }
    /**
     * Reload all mail catching
     */
    getMailConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let endDay = new Date();
                endDay.setHours(23, 59, 59, 999);
                let rewards = yield mailReward_1.MailRewardModel.find({ isDeleted: false }).exec();
                let systems = yield mailSystem_1.MailSystemModel.find({ isDeleted: false, startDate: { $lt: endDay }, endDate: { $gt: new Date() } }).exec();
                let updates = yield mailUpdate_1.MailUpdateModel.find({ isDeleted: false, startDate: { $lt: endDay }, endDate: { $gt: new Date() } }).exec();
                rewards.forEach((index) => this.rewardMails.set(index.type.toString(), index));
                systems.forEach((index) => {
                    this.systemMails.set(index.id, index);
                    this.systemId.push(index.id);
                });
                updates.forEach((index) => {
                    this.updateMails.set(index.platform.toString(), index);
                    this.updateMailById.set(index.id, index);
                    this.updateId.push(index.id);
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
    reloadConfig() {
        console.log(`Reload mail at ${new Date()}`);
        this.getMailConfig();
    }
    getMail(id, isUpdate, language) {
        console.log(id, isUpdate, language);
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
            let mailUser = yield usermaillist_1.UserMailListModel.findById(mailId).exec();
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
                                let pvpInfo = mailUser.content.split('|');
                                mailDetails.content = mails.content.replace('{0}', pvpInfo[0]).replace('{1}', pvpInfo[1]);
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
            }
            else
                callback('Mail not found', null);
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
            let mailMap = this.updateMails.get(mailId);
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
            redisUtils_1.default.SETKEY(mailconfig_1.MAIL_USER + mailId, userId, (err, rs) => {
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
}
exports.mailManager = new MailManager();
//# sourceMappingURL=mailManager.js.map