"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
let userSchema = new mongoose_1.default.Schema({
    displayName: String,
    deviceId: String,
    lastPVP: Number,
    countryCode: String,
    lastLogin: Date,
    lastIp: String,
    timZone: String,
    role: Number,
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    versionKey: false,
});
userSchema.index({ deviceId: 1 }, { background: true, sparse: true });
userSchema.index({ lastLogin: -1 }, { background: true, sparse: true });
exports.UserModel = mongoose_1.default.model('User', userSchema);
//# sourceMappingURL=user.js.map