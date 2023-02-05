import RedisUtil from '../helpers/redisUtils';
import { RequestMsg, RespsoneMsg } from '../io/IOInterface';
import { ILeaderBoard } from '../models/leaderboard';
import { UserInfo } from '../user/userInfo';
import { InitLeaderboard } from './initLeaderboard';
import { LeaderBoardResetManager } from './leaderboardResetManager';
import { IUserRank, TopBPResponse } from './../helpers/catalogType';

class LeaderboardManager {
  private leaderBoardMap = new Map<string, ILeaderBoard>();

  readonly keyLeaderboard = 'LEADERBOARD:';

  async initLeaderboard() {
    let pvp = await InitLeaderboard('PVP');
    this.leaderBoardMap.set('PVP', pvp);

    new LeaderBoardResetManager(pvp).checkReset();
  }

  SetLeaderBoard(name: string, value) {
    RedisUtil.HSET(this.keyLeaderboard, name, value, (_) => {});
  }

  UpdateLeaderBoardCfg(name: string, season: number, seasonTime: number, endSeason: Date, nextSeason: Date) {
    this.leaderBoardMap.get(name).Season = season;
    this.leaderBoardMap.get(name).SeasonTime = seasonTime;

    this.leaderBoardMap.get(name).EndSeason = endSeason;
    this.leaderBoardMap.get(name).NextSeason = nextSeason;
    console.log(this.leaderBoardMap);
  }

  async GetPvPInfo(user: UserInfo, msg: RequestMsg, fn: (response: RespsoneMsg) => void) {
    let season = this.leaderBoardMap.get('PVP').Season;
    let leaderboardName = 'LEADERBOARD:' + 'PVP' + season;
    if (user.User.lastPVP && user.User.lastPVP < season) {
      let lastUserScore = await this.GetUserRank(leaderboardName, user.UserId, 'DESC');
      /**
       * Trả thưởng qua mail thông qua xếp hạng rank
       */
      console.log(lastUserScore);
    } else {
      user.User.lastPVP = season;
      user.User.save();
    }

    fn({
      Status: 1,
      Body: {
        Season: season,
        EndTime: new Date(this.leaderBoardMap.get('PVP').EndSeason).getTime(),
      },
    });
  }

  /**
   * Lấy thông tin mode chơi pvp
   * Kiểm tra xem user đã chơi mùa trước hay chưa và trả thưởng
   * @param user
   * @param msg
   * @param fn
   */

  async GetSimpeLeaderBoard(userInfo: UserInfo, msg: RequestMsg, fn: (res: RespsoneMsg) => void) {
    let topUser = [];
    let leaderboardMode = msg.Body.LeaderBoardName;

    if (leaderboardMode != undefined && leaderboardMode != '') {
      let season = this.leaderBoardMap.get(leaderboardMode).Season;

      if (userInfo.User.lastPVP && userInfo.User.lastPVP < season) {
        let lastUserLeaderBoardName = this.keyLeaderboard + leaderboardMode + userInfo.User.lastPVP;
        let lastUserScore = await leaderboardManager.GetUserRank(lastUserLeaderBoardName, userInfo.UserId, 'DESC');

        /**
         * Trả thưởng qua mail thông qua xếp hạng rank
         */
        console.log(lastUserScore);

        userInfo.User.lastPVP = season;
        userInfo.User.save();
      } else if (!userInfo.User.lastPVP) {
        userInfo.User.lastPVP = season;
        userInfo.User.save();
      }

      let leaderBoardName = this.keyLeaderboard + leaderboardMode + season;

      let userScore = await leaderboardManager.GetUserRank(leaderBoardName, userInfo.UserId, 'DESC');
      // if (!this.mapBXH.has(LeaderBoardName) || (this.mapBXH.has(LeaderBoardName) && (Date.now() - this.mapBXH.get(LeaderBoardName).TimeLoad) > 30000)) {
      //     console.log('add Top to cache', LeaderBoardName);
      topUser = await leaderboardManager.GetLeaderBoardWithHashDESC(leaderBoardName, 0, 19);

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
    } else {
      fn({
        Status: 0,
        Error: 'LeaderBoardName not found',
      });
    }
  }

  private async GetLeaderBoardWithHashDESC(LeaderBoardName: string, from: number, to: number) {
    return new Promise<any>((resolve, reject) => {
      RedisUtil.redisClient.ZREVRANGE(LeaderBoardName, from, to, 'WITHSCORES', (err, lsMember) => {
        if (!err) {
          let lsUserId = new Array();
          let lsScore = new Array();
          for (let i = 0; i < lsMember.length; i++) {
            if (i % 2 === 0) lsUserId.push(lsMember[i]);
            else lsScore.push(lsMember[i]);
          }
          if (lsUserId.length > 0)
            RedisUtil.redisClient.HMGET(LeaderBoardName + 'Details', lsUserId, (errDt, lsDetails) => {
              if (errDt) reject(errDt);
              else {
                resolve(
                  lsUserId.map((item, index) => {
                    let rs: TopBPResponse = {
                      RankNumber: index + from + 1,
                      UserId: item,
                      Score: Math.floor(Number(lsScore[index])),
                      PlayerData: JSON.parse(lsDetails[index]),
                    };
                    return rs;
                  })
                );
              }
            });
          else resolve([]);
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
  }

  private async GetUserRank(LeaderBoardName: string, rocketID: string, type: string) {
    return new Promise<any>((resolve, reject) => {
      let transaction = RedisUtil.redisClient.multi();
      transaction.zscore(LeaderBoardName, rocketID);
      if (type == 'DESC') transaction.zrevrank(LeaderBoardName, rocketID);
      else transaction.zrank(LeaderBoardName, rocketID);
      transaction.exec((err: any, replies: any) => {
        if (err) {
          resolve(null);
        } else {
          let scoreAndRankData: IUserRank = {
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
  }
}

export const leaderboardManager = new LeaderboardManager();
