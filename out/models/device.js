"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const catalogType_1 = require("../helpers/catalogType");
var deviceSchema = new mongoose_1.default.Schema({
    deviceId: String,
    appVersion: Number,
    deviceModel: String,
    os: String,
    platform: {
        type: Number,
        of: catalogType_1.IPlatform,
    },
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
deviceSchema.index({
    DeviceId: 1,
    Platform: 1,
}, {
    unique: true,
    sparse: true,
    background: true,
});
deviceSchema.index({
    User: 1,
}, {
    background: true,
});
exports.DeviceModel = mongoose_1.default.model('Device', deviceSchema);
//# sourceMappingURL=device.js.map