"use strict";
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
            leaderboardManager_1.leaderboardManager.initLeaderboard();
            (0, initLeaderboard_1.SetLeaderBoard)('PVP', leaderboard);
        }
        return {
            TimePlay: PvPConfig_1.PVPTimerConfig.TimePlay,
            Leaderboard: leaderboard,
        };
    }
}
exports.PVPConfigManger = PVPConfigManger;
//# sourceMappingURL=pvpConfigManager.js.map