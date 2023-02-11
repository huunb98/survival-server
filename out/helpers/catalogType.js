"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoleCms = exports.MailUpdateResult = exports.MailRewardResult = exports.MailSystemResult = exports.MailType = exports.UserRole = exports.TypeReward = exports.MailStatus = exports.IPlatform = void 0;
var IPlatform;
(function (IPlatform) {
    IPlatform[IPlatform["Android"] = 0] = "Android";
    IPlatform[IPlatform["IOS"] = 1] = "IOS";
    IPlatform[IPlatform["All"] = 2] = "All";
})(IPlatform = exports.IPlatform || (exports.IPlatform = {}));
var MailStatus;
(function (MailStatus) {
    MailStatus[MailStatus["NEW"] = 0] = "NEW";
    MailStatus[MailStatus["READ"] = 1] = "READ";
    MailStatus[MailStatus["COLLECTED"] = 2] = "COLLECTED";
    MailStatus[MailStatus["DELETED"] = 3] = "DELETED";
})(MailStatus = exports.MailStatus || (exports.MailStatus = {}));
var TypeReward;
(function (TypeReward) {
    TypeReward[TypeReward["PVP"] = 1] = "PVP";
    TypeReward[TypeReward["UpdateVersion"] = 2] = "UpdateVersion";
    TypeReward[TypeReward["AdminPush"] = 3] = "AdminPush";
})(TypeReward = exports.TypeReward || (exports.TypeReward = {}));
var UserRole;
(function (UserRole) {
    UserRole[UserRole["Member"] = 0] = "Member";
    UserRole[UserRole["Tester"] = 1] = "Tester";
    UserRole[UserRole["Admin"] = 2] = "Admin";
})(UserRole = exports.UserRole || (exports.UserRole = {}));
var MailType;
(function (MailType) {
    MailType[MailType["System"] = 0] = "System";
    MailType[MailType["Update"] = 1] = "Update";
    MailType[MailType["Reward"] = 2] = "Reward";
})(MailType = exports.MailType || (exports.MailType = {}));
class MailSystemResult {
}
exports.MailSystemResult = MailSystemResult;
class MailRewardResult {
}
exports.MailRewardResult = MailRewardResult;
class MailUpdateResult {
}
exports.MailUpdateResult = MailUpdateResult;
/**
 * CMS
 */
var UserRoleCms;
(function (UserRoleCms) {
    UserRoleCms[UserRoleCms["NotExist"] = 0] = "NotExist";
    UserRoleCms[UserRoleCms["Member"] = 1] = "Member";
    UserRoleCms[UserRoleCms["Admin"] = 2] = "Admin";
    UserRoleCms[UserRoleCms["Root"] = 3] = "Root";
})(UserRoleCms = exports.UserRoleCms || (exports.UserRoleCms = {}));
//# sourceMappingURL=catalogType.js.map