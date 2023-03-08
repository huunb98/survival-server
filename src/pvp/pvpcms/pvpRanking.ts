import { PvPDataDetails } from '../../helpers/catalogType';
import RedisUtil from '../../helpers/redisUtils';
import { leaderboardManager } from '../../leaderboard/leaderboardManager';
import { UserModel } from '../../models/user';
import { userService } from '../../user/userService';

export class PVPRanking {
  readonly keyPVP = 'JACKALSURVIVAL:PVP';
  async getTopPVP(realtime: boolean) {
    let leaderBoardName = this.keyPVP + leaderboardManager.leaderBoardMap.get('PVP').Season;
    let topUser = await leaderboardManager.GetLeaderBoardWithHashDESC(leaderBoardName, 0, 19, realtime);
    return topUser;
  }

  async setBattlePoint(userId: string, bp: number, callback: Function) {
    // console.log(userId, bp);
    userService.GetBasicInfo(userId, (error, response) => {
      if (error) return callback(error, null);

      let user: PvPDataDetails = {
        UserId: userId,
        DisplayName: response.displayName,
        AvatarUrl: response.avatar,
      };
      leaderboardManager.SetBattlePoint(user, bp);

      callback(null, 'success');
    });
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
