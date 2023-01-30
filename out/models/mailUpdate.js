"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailUpdateModel = void 0;
const mongoose = require("mongoose");
const catalogType_1 = require("../helpers/catalogType");
const notifyDocument = new mongoose.Schema({
    mail: {
        type: Map,
        of: {
            title: String,
            content: String,
        },
    },
    gifts: {
        type: Map,
        of: Object,
    },
    version: Number,
    minVersion: Number,
    platform: {
        type: Number,
        of: catalogType_1.IPlatform,
    },
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
}, {
    versionKey: false,
});
exports.MailUpdateModel = mongoose.model('MailUpdate', notifyDocument);
//# sourceMappingURL=mailUpdate.js.map