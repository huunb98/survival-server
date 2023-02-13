import { SetLeaderBoard } from '../../leaderboard/initLeaderboard';
import { leaderboardManager } from '../../leaderboard/leaderboardManager';
import { ILeaderBoard } from '../../models/leaderboard';
import { PVPTimerConfig } from '../data/PvPConfig';

export class PVPConfigManger {
  GetPVPConfig() {
    let timePlay = PVPTimerConfig.TimePlay;
    let pvpLeaderboard = leaderboardManager.leaderBoardMap.get('PVP');
    return {
      TimePlay: timePlay,
      Leaderboard: pvpLeaderboard,
    };
  }

  UpdatePVPConfig(pvpLeaderboard: ILeaderBoard, timePlay: number) {
    if (timePlay) PVPTimerConfig.TimePlay = timePlay;
    let leaderboard = leaderboardManager.leaderBoardMap.get('PVP');
    if (pvpLeaderboard) {
      leaderboard.Season = +pvpLeaderboard.Season;
      leaderboard.SeasonTime = +pvpLeaderboard.SeasonTime;
      leaderboard.EndSeason = new Date(pvpLeaderboard.EndSeason);
      leaderboard.NextSeason = new Date(pvpLeaderboard.NextSeason);

      /**
       * Reset schedule leaderboard
       */

      leaderboardManager.initLeaderboard();
      SetLeaderBoard('PVP', leaderboard);
    }

    return {
      TimePlay: PVPTimerConfig.TimePlay,
      Leaderboard: leaderboard,
    };
  }
}
