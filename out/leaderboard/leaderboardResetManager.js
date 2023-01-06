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
exports.LeaderBoardResetManager = void 0;
const node_schedule_1 = __importDefault(require("node-schedule"));
const leaderboardManager_1 = require("./leaderboardManager");
const redisUtils_1 = __importDefault(require("../helpers/redisUtils"));
class LeaderBoardResetManager {
    constructor(leaderBoard) {
        this.leaderBoard = leaderBoard;
    }
    checkReset() {
        if (this.leaderBoard.NextSeason <= new Date()) {
            this.NewSeason();
        }
        else {
            this.scheduleCheckNextReset();
        }
    }
    scheduleCheckNextReset() {
        if (this.job)
            this.job.cancel(false);
        // console.log("scheduleCheckNextReset " + this.leaderBoard.NextReset)
        this.job = node_schedule_1.default.scheduleJob(this.leaderBoard.NextSeason, () => {
            console.log('Check Reset Leaderboard');
            this.checkReset();
        });
    }
    NewSeason() {
        return __awaiter(this, void 0, void 0, function* () {
            let seasonTime = yield this.getSeasonTime(this.leaderBoard.Name + '_season_time');
            this.leaderBoard.SeasonTime = seasonTime;
            let seasonTimeInMiliSeasons = seasonTime * 86400 * 1000;
            this.leaderBoard.Season++;
            this.leaderBoard.SeasonTime = seasonTime;
            this.leaderBoard.EndSeason = new Date(this.leaderBoard.EndSeason.getTime() + seasonTimeInMiliSeasons);
            this.leaderBoard.NextSeason = new Date(this.leaderBoard.NextSeason.getTime() + seasonTimeInMiliSeasons);
            leaderboardManager_1.leaderboardManager.UpdateLeaderBoardCfg(this.leaderBoard.Name, this.leaderBoard.Season, this.leaderBoard.SeasonTime, this.leaderBoard.EndSeason, this.leaderBoard.EndSeason);
            leaderboardManager_1.leaderboardManager.SetLeaderBoard(this.leaderBoard.Name + '_season', this.leaderBoard.Season);
            leaderboardManager_1.leaderboardManager.SetLeaderBoard(this.leaderBoard.Name + '_end_season', this.leaderBoard.EndSeason.toLocaleString());
            leaderboardManager_1.leaderboardManager.SetLeaderBoard(this.leaderBoard.Name + '_next_season', this.leaderBoard.NextSeason.toLocaleString());
            this.DeleteOldLeaderboard('Leaderboard:' + this.leaderBoard.Name + (this.leaderBoard.Season - 5));
            this.checkReset();
        });
    }
    DeleteOldLeaderboard(Name) {
        redisUtils_1.default.redisClient.DEL(Name, (err, rs) => { });
        redisUtils_1.default.redisClient.DEL(Name + 'Details', (err, rs) => {
            console.log('delete ', Name);
        });
    }
    /**
     * Số ngày mặc định là 14 nếu trả về lỗi hoặc null
     * @param key
     * @returns
     */
    getSeasonTime(key) {
        return new Promise((resolve, reject) => {
            redisUtils_1.default.HGET('LEADERBOARD', key, (err, rs) => {
                if (rs)
                    resolve(Number(rs));
                else
                    resolve(14);
            });
        });
    }
}
exports.LeaderBoardResetManager = LeaderBoardResetManager;
//# sourceMappingURL=leaderboardResetManager.js.map