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
exports.leaderboardManager = void 0;
const redisUtils_1 = __importDefault(require("../helpers/redisUtils"));
const initLeaderboard_1 = require("./initLeaderboard");
const leaderboardResetManager_1 = require("./leaderboardResetManager");
class LeaderboardManager {
    constructor() {
        this.leaderBoardMap = new Map();
        this.keyLeaderboard = 'LEADERBOARD:';
    }
    initLeaderboard() {
        return __awaiter(this, void 0, void 0, function* () {
            let pvp = yield (0, initLeaderboard_1.InitLeaderboard)('PVP');
            this.leaderBoardMap.set('PVP', pvp);
            new leaderboardResetManager_1.LeaderBoardResetManager(pvp).checkReset();
        });
    }
    SetLeaderBoard(name, value) {
        redisUtils_1.default.HSET(this.keyLeaderboard, name, value, (_) => { });
    }
    UpdateLeaderBoardCfg(name, season, seasonTime, endSeason, nextSeason) {
        this.leaderBoardMap.get(name).Season = season;
        this.leaderBoardMap.get(name).SeasonTime = seasonTime;
        this.leaderBoardMap.get(name).EndSeason = endSeason;
        this.leaderBoardMap.get(name).NextSeason = nextSeason;
        console.log(this.leaderBoardMap);
    }
    GetPvPInfo(user, msg, fn) {
        return __awaiter(this, void 0, void 0, function* () {
            let season = this.leaderBoardMap.get('PVP').Season;
            let leaderboardName = 'LEADERBOARD:' + 'PVP' + season;
            if (user.User.lastPVP && user.User.lastPVP < season) {
                let lastUserScore = yield this.GetUserRank(leaderboardName, user.UserId, 'DESC');
                /**
                 * Trả thưởng qua mail thông qua xếp hạng rank
                 */
                console.log(lastUserScore);
            }
            else {
                user.User.lastPVP = season;
                user.User.save();
            }
            fn({
                Status: 1,
                Body: {
                    Season: season,
                    EndTime: new Date(this.leaderBoardMap.get('PVP').EndSeason).getTime(),
                },
            });
        });
    }
    /**
     * Lấy thông tin mode chơi pvp
     * Kiểm tra xem user đã chơi mùa trước hay chưa và trả thưởng
     * @param user
     * @param msg
     * @param fn
     */
    GetSimpeLeaderBoard(userInfo, msg, fn) {
        return __awaiter(this, void 0, void 0, function* () {
            let topUser = [];
            let leaderboardMode = msg.Body.LeaderBoardName;
            if (leaderboardMode != undefined && leaderboardMode != '') {
                let season = this.leaderBoardMap.get(leaderboardMode).Season;
                if (userInfo.User.lastPVP && userInfo.User.lastPVP < season) {
                    let lastUserLeaderBoardName = this.keyLeaderboard + leaderboardMode + userInfo.User.lastPVP;
                    let lastUserScore = yield exports.leaderboardManager.GetUserRank(lastUserLeaderBoardName, userInfo.UserId, 'DESC');
                    /**
                     * Trả thưởng qua mail thông qua xếp hạng rank
                     */
                    console.log(lastUserScore);
                    userInfo.User.lastPVP = season;
                    userInfo.User.save();
                }
                else if (!userInfo.User.lastPVP) {
                    userInfo.User.lastPVP = season;
                    userInfo.User.save();
                }
                let leaderBoardName = this.keyLeaderboard + leaderboardMode + season;
                let userScore = yield exports.leaderboardManager.GetUserRank(leaderBoardName, userInfo.UserId, 'DESC');
                // if (!this.mapBXH.has(LeaderBoardName) || (this.mapBXH.has(LeaderBoardName) && (Date.now() - this.mapBXH.get(LeaderBoardName).TimeLoad) > 30000)) {
                //     console.log('add Top to cache', LeaderBoardName);
                topUser = yield exports.leaderboardManager.GetLeaderBoardWithHashDESC(leaderBoardName, 0, 19);
                fn({
                    Status: 1,
                    Body: {
                        Season: season,
                        EndTime: new Date(this.leaderBoardMap.get('PVP').EndSeason).getTime(),
                        CurrentTime: Date.now(),
                        TopUser: topUser,
                        YourScore: userScore,
                    },
                });
            }
            else {
                fn({
                    Status: 0,
                    Error: 'LeaderBoardName not found',
                });
            }
        });
    }
    GetLeaderBoardWithHashDESC(LeaderBoardName, from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                redisUtils_1.default.redisClient.ZREVRANGE(LeaderBoardName, from, to, 'WITHSCORES', (err, lsMember) => {
                    if (!err) {
                        let lsUserId = new Array();
                        let lsScore = new Array();
                        for (let i = 0; i < lsMember.length; i++) {
                            if (i % 2 === 0)
                                lsUserId.push(lsMember[i]);
                            else
                                lsScore.push(lsMember[i]);
                        }
                        if (lsUserId.length > 0)
                            redisUtils_1.default.redisClient.HMGET(LeaderBoardName + 'Details', lsUserId, (errDt, lsDetails) => {
                                if (errDt)
                                    reject(errDt);
                                else {
                                    resolve(lsUserId.map((item, index) => {
                                        let rs = {
                                            RankNumber: index + from + 1,
                                            UserId: item,
                                            Score: Math.floor(Number(lsScore[index])),
                                            PlayerData: JSON.parse(lsDetails[index]),
                                        };
                                        return rs;
                                    }));
                                }
                            });
                        else
                            resolve([]);
                    }
                    else {
                        console.log(err);
                        reject(err);
                    }
                });
            });
        });
    }
    GetUserRank(LeaderBoardName, rocketID, type) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let transaction = redisUtils_1.default.redisClient.multi();
                transaction.zscore(LeaderBoardName, rocketID);
                if (type == 'DESC')
                    transaction.zrevrank(LeaderBoardName, rocketID);
                else
                    transaction.zrank(LeaderBoardName, rocketID);
                transaction.exec((err, replies) => {
                    if (err) {
                        resolve(null);
                    }
                    else {
                        let scoreAndRankData = {
                            Score: 100,
                            RankNumber: -1,
                        };
                        if (replies) {
                            if (replies[0] != null) {
                                scoreAndRankData.Score = Math.floor(Number(replies[0]));
                            }
                            if (replies[1] != null) {
                                scoreAndRankData.RankNumber = replies[1] + 1;
                            }
                            resolve(scoreAndRankData);
                        }
                    }
                });
            });
        });
    }
}
exports.leaderboardManager = new LeaderboardManager();
//# sourceMappingURL=leaderboardManager.js.map