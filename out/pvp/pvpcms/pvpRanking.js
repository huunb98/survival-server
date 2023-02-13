"use strict";
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
exports.PVPRanking = void 0;
const redisUtils_1 = __importDefault(require("../../helpers/redisUtils"));
const leaderboardManager_1 = require("../../leaderboard/leaderboardManager");
const userService_1 = require("../../user/userService");
class PVPRanking {
    constructor() {
        this.keyPVP = 'JACKALSURVIVAL:PVP';
    }
    getTopPVP() {
        return __awaiter(this, void 0, void 0, function* () {
            let leaderBoardName = this.keyPVP + leaderboardManager_1.leaderboardManager.leaderBoardMap.get('PVP').Season;
            let topUser = yield leaderboardManager_1.leaderboardManager.GetLeaderBoardWithHashDESC(leaderBoardName, 0, 19);
            return topUser;
        });
    }
    setBattlePoint(userId, bp, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(userId, bp);
            userService_1.userService.GetBasicInfo(userId, (error, response) => {
                if (error)
                    return callback(error, null);
                let user = {
                    UserId: userId,
                    DisplayName: response.displayName,
                    AvatarUrl: response.avatar,
                };
                leaderboardManager_1.leaderboardManager.SetBattlePoint(user, bp);
                callback(null, 'success');
            });
        });
    }
    deleteUserLoadboard(userId, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            let pvpLeaderboardName = this.keyPVP + leaderboardManager_1.leaderboardManager.leaderBoardMap.get('PVP').Season;
            let transaction = redisUtils_1.default.redisClient.multi();
            transaction.ZREM(pvpLeaderboardName, userId);
            transaction.HDEL(pvpLeaderboardName + 'Details', userId);
            transaction.exec((error, rs) => {
                if (error)
                    callback('Redis error', null);
                else
                    callback(null, 'Delete PVP rank Success');
            });
        });
    }
}
exports.PVPRanking = PVPRanking;
//# sourceMappingURL=pvpRanking.js.map