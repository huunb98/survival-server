"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserCmsModel = void 0;
const mongoose = require("mongoose");
const catalogType_1 = require("../helpers/catalogType");
const userCmsSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    role: {
        type: Number,
        of: catalogType_1.UserRoleCms,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, { versionKey: false });
userCmsSchema.index({ email: 1 }, { unique: true, background: true });
exports.UserCmsModel = mongoose.model('UserCms', userCmsSchema);
//# sourceMappingURL=usercms.js.map