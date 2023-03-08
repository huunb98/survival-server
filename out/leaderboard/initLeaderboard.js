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
exports.SetLeaderBoard = exports.InitLeaderboard = void 0;
const dateHelper_1 = require("../helpers/dateHelper");
const redisUtils_1 = __importDefault(require("../helpers/redisUtils"));
const leaderboard_1 = require("../models/leaderboard");
function InitLeaderboard(Name) {
    return __awaiter(this, void 0, void 0, function* () {
        let lsKeyCfg = yield GetMultiLeaderBoardConfig('JACKALSURVIVAL:LEADERBOARD', [`${Name}_season`, `${Name}_season_time`, `${Name}_end_season`, `${Name}_next_season`]);
        let leaderboard = new leaderboard_1.ILeaderBoard();
        leaderboard.Name = Name;
        if (CheckArrayNull(lsKeyCfg)) {
            console.log('Init leaderboard', Name);
            leaderboard.Season = 1;
            leaderboard.SeasonTime = 14;
            leaderboard.EndSeason = dateHelper_1.dateHelper.NextMonday();
            leaderboard.NextSeason = dateHelper_1.dateHelper.NextMonday();
            SetLeaderBoard(Name, leaderboard);
        }
        else {
            leaderboard.Season = Number(lsKeyCfg[0]);
            leaderboard.SeasonTime = Number(lsKeyCfg[1]);
            leaderboard.EndSeason = new Date(lsKeyCfg[2]);
            leaderboard.NextSeason = new Date(lsKeyCfg[3]);
        }
        return Promise.resolve(leaderboard);
    });
}
exports.InitLeaderboard = InitLeaderboard;
function SetLeaderBoard(Name, leaderboard) {
    return __awaiter(this, void 0, void 0, function* () {
        yield redisUtils_1.default.SetMultiLeaderBoard('JACKALSURVIVAL:LEADERBOARD', [`${Name}_season`, `${Name}_season_time`, `${Name}_end_season`, `${Name}_next_season`], [leaderboard.Season, leaderboard.SeasonTime, leaderboard.EndSeason.toLocaleString(), leaderboard.NextSeason.toLocaleString()]);
    });
}
exports.SetLeaderBoard = SetLeaderBoard;
function GetMultiLeaderBoardConfig(key, name) {
    let promise = new Promise((resolve, reject) => {
        redisUtils_1.default.redisClient.HMGET(key, name, function (err, result) {
            resolve(result);
        });
    });
    return promise;
}
function CheckArrayNull(arr) {
    return arr.some((index) => index === null);
}
//# sourceMappingURL=initLeaderboard.js.map