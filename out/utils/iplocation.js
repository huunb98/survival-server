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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ipLocation = void 0;
const user_1 = require("../models/user");
const geoip = __importStar(require("geoip-lite"));
class IPLocation {
    SaveLocation(userId, ipAdress, deviceId, userInfo) {
        if (userInfo.User.timZone) {
            user_1.UserModel.updateOne({
                _id: userId,
            }, {
                lastIp: ipAdress,
                lastLogin: new Date(),
            })
                .then(function (rowsUpdated) {
                //  console.log(rowsUpdated);
            })
                .catch((error) => console.log(error));
        }
        else {
            var geo = geoip.lookup(ipAdress);
            if (!geo) {
                geo = geoip.lookup('66.249.79.183');
            }
            let timezone = geo.timezone;
            let country = geo.country;
            user_1.UserModel.updateOne({
                _id: userId,
            }, {
                countryCode: country,
                lastIp: ipAdress,
                lastLogin: new Date(),
                timeZone: timezone,
                deviceId: deviceId,
            })
                .then(function (rowsUpdated) {
                //    console.log(rowsUpdated);
            })
                .catch((error) => console.log(error));
            userInfo.CountryCode = country;
        }
    }
}
exports.ipLocation = new IPLocation();
//# sourceMappingURL=iplocation.js.map