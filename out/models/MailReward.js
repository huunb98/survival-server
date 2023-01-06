"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailRewardModel = void 0;
const mongoose = require("mongoose");
var mailRewardSchema = new mongoose.Schema({
    mail: {
        type: Map,
        of: {
            title: String,
            content: String,
        },
    },
    type: Number,
    sender: String,
    gifts: {
        type: Map,
        of: Object,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    expiryDate: Number,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});
exports.MailRewardModel = mongoose.model('MailReward', mailRewardSchema);
//# sourceMappingURL=MailReward.js.map