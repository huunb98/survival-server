"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PVPConfigManger = void 0;
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
        return {
            TimePlay: PvPConfig_1.PVPTimerConfig.TimePlay,
            Leaderboard: leaderboard,
        };
    }
}
exports.PVPConfigManger = PVPConfigManger;
//# sourceMappingURL=pvpConfigManager.js.map