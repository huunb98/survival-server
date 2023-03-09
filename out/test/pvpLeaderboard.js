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
const redisUtils_1 = __importDefault(require("../utils/redisUtils"));
function getSeason() {
    return new Promise((resolve, reject) => {
        redisUtils_1.default.redisClient.HGET('JACKALSURVIVAL:LEADERBOARD', 'PVP_season', (error, rs) => {
            if (error)
                reject(-1);
            else
                resolve(+rs);
        });
    });
}
function CreatePVPLeaderBoard() {
    return __awaiter(this, void 0, void 0, function* () {
        const currentSeason = yield getSeason();
        console.log(currentSeason);
        const leaderboardName = 'JACKALSURVIVAL:PVP' + currentSeason;
        for (let i = 0; i < 20; i++) {
            let user = {
                DisplayName: 'Player#' + makeid(),
                AvatarUrl: randomIntFromInterval(0, 7),
                UserId: makeid(),
            };
            let elo = Math.ceil(5000 * Math.random());
            const transaction = redisUtils_1.default.redisClient.multi();
            transaction.ZADD(leaderboardName, elo, user.UserId);
            transaction.HMSET(leaderboardName + 'Details', user.UserId, JSON.stringify(user));
            transaction.exec();
        }
        console.log('create pvp leaderboard done');
    });
}
CreatePVPLeaderBoard();
function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
function makeid() {
    var length = 6;
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}
//# sourceMappingURL=pvpLeaderboard.js.map