"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMailListModel = void 0;
const mongoose = require("mongoose");
const catalogType_1 = require("../helpers/catalogType");
const usermailList = new mongoose.Schema({
    userId: String,
    mailId: String,
    status: {
        type: Number,
        of: catalogType_1.MailStatus,
        default: catalogType_1.MailStatus.NEW,
    },
    type: {
        type: Number,
        of: catalogType_1.TypeReward,
    },
    title: String,
    content: String,
    gifts: {
        type: Map,
        of: Object,
    },
    validTo: Date,
});
usermailList.index({ userId: 1 });
usermailList.index({ mailId: 1 });
exports.UserMailListModel = mongoose.model('UserMailList', usermailList);
//# sourceMappingURL=usermaillist.js.map