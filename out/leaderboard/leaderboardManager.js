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
const redisUtils_1 = __importDefault(require("../utils/redisUtils"));
const initLeaderboard_1 = require("./initLeaderboard");
const leaderboardResetManager_1 = require("./leaderboardResetManager");
const catalogType_1 = require("./../helpers/catalogType");
const mailManager_1 = require("../mails/mailManager");
const PvPHelper_1 = require("../pvp/PvPHelper");
class LeaderboardManager {
    constructor() {
        this.leaderBoardMap = new Map();
        this.mapTopRanking = new Map();
        this.keyLeaderboard = 'JACKALSURVIVAL:LEADERBOARD';
        this.keyGame = 'JACKALSURVIVAL:';
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
    /**
     * Lấy thông tin mode chơi pvp
     * Kiểm tra xem user đã chơi mùa trước hay chưa và trả thưởng
     * @param user
     * @param msg
     * @param fn
     */
    GetSimpeLeaderBoard(userInfo, msg, fn) {
        return __awaiter(this, void 0, void 0, function* () {
            let leaderboardMode = msg.Body.LeaderBoardName;
            if (leaderboardMode != undefined && leaderboardMode != '') {
                let season = this.leaderBoardMap.get(leaderboardMode).Season;
                let leaderBoardName = this.keyGame + leaderboardMode + season;
                this.CheckRewardNewSeason(userInfo, leaderboardMode, season);
                let userScore = yield exports.leaderboardManager.GetUserRank(leaderBoardName, userInfo.UserId, 'DESC');
                let topUser = yield exports.leaderboardManager.GetLeaderBoardWithHashDESC(leaderBoardName, 0, 19, false);
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
    /**
     * Trả thưởng mùa mới bằng mail thông qua xếp hạng rank
     */
    CheckRewardNewSeason(userInfo, leaderboardMode, season) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userInfo.User.lastPVP && userInfo.User.lastPVP < season) {
                let leaderBoardName = this.keyGame + leaderboardMode + userInfo.User.lastPVP;
                const checkReward = yield this.IsMember(leaderBoardName + 'Rewards', userInfo.UserId);
                if (!checkReward) {
                    let lastUserScore = yield exports.leaderboardManager.GetUserRank(leaderBoardName, userInfo.UserId, 'DESC');
                    //  console.log(lastUserScore);
                    if (lastUserScore && lastUserScore.RankNumber !== -1) {
                        let mailRewards = mailManager_1.mailManager.rewardMails.get(catalogType_1.TypeReward.PVP.toString());
                        let endDate = new Date(Date.now() + mailRewards.expiryDate * 86400000);
                        let gifts = PvPHelper_1.pvpHelper.GetRewardSeason(lastUserScore.RankNumber);
                        mailManager_1.mailManager.sendRewardToUser(userInfo.UserId, catalogType_1.TypeReward.PVP, gifts, lastUserScore, season, endDate, (error, response) => {
                            if (response)
                                redisUtils_1.default.redisClient.SADD(leaderBoardName + 'Rewards', userInfo.UserId);
                        });
                    }
                }
                userInfo.User.lastPVP = season;
                userInfo.User.save();
            }
            else if (!userInfo.User.lastPVP) {
                userInfo.User.lastPVP = season;
                userInfo.User.save();
            }
        });
    }
    IsMember(key, value) {
        return new Promise((resolve, reject) => {
            redisUtils_1.default.redisClient.SISMEMBER(key, value, (err, rs) => {
                if (err)
                    return reject(err);
                rs === 1 ? resolve(true) : resolve(false);
            });
        });
    }
    GetLeaderBoardWithHashDESC(LeaderBoardName, from, to, realtime) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (realtime ||
                    !this.mapTopRanking.has(LeaderBoardName) ||
                    (this.mapTopRanking.has(LeaderBoardName) && Date.now() - this.mapTopRanking.get(LeaderBoardName).TimeLoad > 30000)) {
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
                                        let topUser = lsUserId.map((item, index) => {
                                            let rs = {
                                                RankNumber: index + from + 1,
                                                UserId: item,
                                                Score: Math.floor(Number(lsScore[index])),
                                                PlayerData: JSON.parse(lsDetails[index]),
                                            };
                                            return rs;
                                        });
                                        this.mapTopRanking.set(LeaderBoardName, {
                                            TimeLoad: Date.now(),
                                            TopUser: topUser,
                                        });
                                        resolve(topUser);
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
                }
                else {
                    resolve(this.mapTopRanking.get(LeaderBoardName).TopUser);
                }
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
    UpdateBattlePoint(userWin, userLose, winElo, loseElo) {
        return __awaiter(this, void 0, void 0, function* () {
            const season = this.leaderBoardMap.get('PVP').Season;
            const leaderboardName = this.keyGame + 'PVP' + season;
            const transaction = redisUtils_1.default.redisClient.multi();
            transaction.ZADD(leaderboardName, winElo, userWin.UserId, loseElo, userLose.UserId);
            transaction.HMSET(leaderboardName + 'Details', userWin.UserId, JSON.stringify(userWin), userLose.UserId, JSON.stringify(userLose));
            transaction.exec((error, results) => {
                if (error)
                    console.log(error);
            });
        });
    }
    SetBattlePoint(user, bp) {
        return __awaiter(this, void 0, void 0, function* () {
            const season = this.leaderBoardMap.get('PVP').Season;
            const leaderboardName = this.keyGame + 'PVP' + season;
            const transaction = redisUtils_1.default.redisClient.multi();
            transaction.ZADD(leaderboardName, bp, user.UserId);
            transaction.HMSET(leaderboardName + 'Details', user.UserId, JSON.stringify(user));
            transaction.exec((error, results) => {
                if (error)
                    console.log(error);
            });
        });
    }
}
exports.leaderboardManager = new LeaderboardManager();
//# sourceMappingURL=leaderboardManager.js.map