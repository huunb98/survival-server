"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailSystemModel = void 0;
const mongoose = require("mongoose");
const catalogType_1 = require("../helpers/catalogType");
var mailSystemSchema = new mongoose.Schema({
    mail: {
        type: Map,
        of: {
            title: String,
            content: String,
        },
    },
    sender: String,
    gifts: {
        type: Map,
        of: Object,
    },
    platform: {
        type: Number,
        default: catalogType_1.IPlatform.All,
    },
    countryCode: [String],
    isDeleted: {
        type: Boolean,
        default: false,
    },
    startDate: Date,
    endDate: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});
exports.MailSystemModel = mongoose.model('MailSystem', mailSystemSchema);
//# sourceMappingURL=mailSystem.js.map