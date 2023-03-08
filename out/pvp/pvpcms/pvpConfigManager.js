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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PVPConfigManger = void 0;
const initLeaderboard_1 = require("../../leaderboard/initLeaderboard");
const leaderboardManager_1 = require("../../leaderboard/leaderboardManager");
const PvPConfig_1 = require("../data/PvPConfig");
class PVPConfigManger {
    GetPVPConfig() {
        let timePlay = PvPConfig_1.PVPTimerConfig.TimePlay;
        let pvpLeaderboard = leaderboardManager_1.leaderboardManager.leaderBoardMap.get('PVP');
        return {
            TimePlay: timePlay,
            Leaderboard: pvpLeaderboard,
        };
    }
    UpdatePVPConfig(pvpLeaderboard, timePlay) {
        return __awaiter(this, void 0, void 0, function* () {
            if (timePlay)
                PvPConfig_1.PVPTimerConfig.TimePlay = timePlay;
            let leaderboard = leaderboardManager_1.leaderboardManager.leaderBoardMap.get('PVP');
            if (pvpLeaderboard) {
                leaderboard.Season = +pvpLeaderboard.Season;
                leaderboard.SeasonTime = +pvpLeaderboard.SeasonTime;
                leaderboard.EndSeason = new Date(pvpLeaderboard.EndSeason);
                leaderboard.NextSeason = new Date(pvpLeaderboard.NextSeason);
                /**
                 * Reset schedule leaderboard
                 */
                yield (0, initLeaderboard_1.SetLeaderBoard)('PVP', leaderboard);
                leaderboardManager_1.leaderboardManager.initLeaderboard();
            }
            return {
                TimePlay: PvPConfig_1.PVPTimerConfig.TimePlay,
                Leaderboard: leaderboard,
            };
        });
    }
}
exports.PVPConfigManger = PVPConfigManger;
//# sourceMappingURL=pvpConfigManager.js.map