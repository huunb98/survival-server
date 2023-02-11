import RedisUtil from '../../helpers/redisUtils';
import { leaderboardManager } from '../../leaderboard/leaderboardManager';

export class PVPRanking {
  readonly keyPVP = 'JACKALSURVIVAL:PVP';
  async getTopPVP() {
    let leaderBoardName = this.keyPVP + leaderboardManager.leaderBoardMap.get('PVP').Season;
    let topUser = await leaderboardManager.GetLeaderBoardWithHashDESC(leaderBoardName, 0, 19);
    return topUser;
  }

  async deleteUserLoadboard(userId: string, callback: Function) {
    let pvpLeaderboardName = this.keyPVP + leaderboardManager.leaderBoardMap.get('PVP').Season;
    let transaction = RedisUtil.redisClient.multi();

    transaction.ZREM(pvpLeaderboardName, userId);
    transaction.HDEL(pvpLeaderboardName + 'Details', userId);

    transaction.exec((error, rs) => {
      if (error) callback('Redis error', null);
      else callback(null, 'Delete PVP rank Success');
    });
  }
}
