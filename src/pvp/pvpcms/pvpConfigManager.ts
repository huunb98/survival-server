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
  }
}
