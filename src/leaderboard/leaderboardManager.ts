import RedisUtil from '../utils/redisUtils';
import { RequestMsg, RespsoneMsg } from '../io/IOInterface';
import { ILeaderBoard } from '../models/leaderboard';
import { UserInfo } from '../user/userInfo';
import { InitLeaderboard } from './initLeaderboard';
import { LeaderBoardResetManager } from './leaderboardResetManager';
import { IUserRank, PvPDataDetails, TopBPResponse, TypeReward } from './../helpers/catalogType';
import { mailManager } from '../mails/mailManager';
import { pvpHelper } from '../pvp/PvPHelper';

class LeaderboardManager {
  leaderBoardMap = new Map<string, ILeaderBoard>();
  private mapTopRanking = new Map<string, any>();

  readonly keyLeaderboard = 'JACKALSURVIVAL:LEADERBOARD';
  readonly keyGame = 'JACKALSURVIVAL:';

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
  /**
   * Lấy thông tin mode chơi pvp
   * Kiểm tra xem user đã chơi mùa trước hay chưa và trả thưởng
   * @param user
   * @param msg
   * @param fn
   */

  async GetSimpeLeaderBoard(userInfo: UserInfo, msg: RequestMsg, fn: (res: RespsoneMsg) => void) {
    let leaderboardMode = msg.Body.LeaderBoardName;

    if (leaderboardMode != undefined && leaderboardMode != '') {
      let season = this.leaderBoardMap.get(leaderboardMode).Season;
      let leaderBoardName = this.keyGame + leaderboardMode + season;

      this.CheckRewardNewSeason(userInfo, leaderboardMode, season);

      let userScore = await leaderboardManager.GetUserRank(leaderBoardName, userInfo.UserId, 'DESC');
      let topUser = await leaderboardManager.GetLeaderBoardWithHashDESC(leaderBoardName, 0, 19, false);

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

  /**
   * Trả thưởng mùa mới bằng mail thông qua xếp hạng rank
   */

  private async CheckRewardNewSeason(userInfo: UserInfo, leaderboardMode: string, season: number) {
    if (userInfo.User.lastPVP && userInfo.User.lastPVP < season) {
      let leaderBoardName = this.keyGame + leaderboardMode + userInfo.User.lastPVP;
      const checkReward = await this.IsMember(leaderBoardName + 'Rewards', userInfo.UserId);
      if (!checkReward) {
        let lastUserScore = await leaderboardManager.GetUserRank(leaderBoardName, userInfo.UserId, 'DESC');
        //  console.log(lastUserScore);
        if (lastUserScore && lastUserScore.RankNumber !== -1) {
          let mailRewards = mailManager.rewardMails.get(TypeReward.PVP.toString());
          let endDate = new Date(Date.now() + mailRewards.expiryDate * 86400000);
          let gifts = pvpHelper.GetRewardSeason(lastUserScore.RankNumber);
          mailManager.sendRewardToUser(userInfo.UserId, TypeReward.PVP, gifts, lastUserScore, season, endDate, (error, response) => {
            if (response) RedisUtil.redisClient.SADD(leaderBoardName + 'Rewards', userInfo.UserId);
          });
        }
      }

      userInfo.User.lastPVP = season;
      userInfo.User.save();
    } else if (!userInfo.User.lastPVP) {
      userInfo.User.lastPVP = season;
      userInfo.User.save();
    }
  }

  IsMember(key: string, value: string) {
    return new Promise<boolean>((resolve, reject) => {
      RedisUtil.redisClient.SISMEMBER(key, value, (err, rs) => {
        if (err) return reject(err);
        rs === 1 ? resolve(true) : resolve(false);
      });
    });
  }

  async GetLeaderBoardWithHashDESC(LeaderBoardName: string, from: number, to: number, realtime: boolean) {
    return new Promise<any>((resolve, reject) => {
      if (
        realtime ||
        !this.mapTopRanking.has(LeaderBoardName) ||
        (this.mapTopRanking.has(LeaderBoardName) && Date.now() - this.mapTopRanking.get(LeaderBoardName).TimeLoad > 30000)
      ) {
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
                  let topUser = lsUserId.map((item, index) => {
                    let rs: TopBPResponse = {
                      RankNumber: index + from + 1,
                      UserId: item,
                      Score: Math.floor(Number(lsScore[index])),
                      PlayerData: JSON.parse(lsDetails[index]),
                    };
                    return rs;
                  });
                  this.mapTopRanking.set(LeaderBoardName, {
                    TimeLoad: Date.now(),
                    TopUser: topUser,
                  });
                  resolve(topUser);
                }
              });
            else resolve([]);
          } else {
            console.log(err);
            reject(err);
          }
        });
      } else {
        resolve(this.mapTopRanking.get(LeaderBoardName).TopUser);
      }
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

  async UpdateBattlePoint(userWin: PvPDataDetails, userLose: PvPDataDetails, winElo: number, loseElo: number) {
    const season = this.leaderBoardMap.get('PVP').Season;
    const leaderboardName = this.keyGame + 'PVP' + season;

    const transaction = RedisUtil.redisClient.multi();
    transaction.ZADD(leaderboardName, winElo, userWin.UserId, loseElo, userLose.UserId);
    transaction.HMSET(leaderboardName + 'Details', userWin.UserId, JSON.stringify(userWin), userLose.UserId, JSON.stringify(userLose));

    transaction.exec((error, results) => {
      if (error) console.log(error);
    });
  }

  async SetBattlePoint(user: PvPDataDetails, bp: number) {
    const season = this.leaderBoardMap.get('PVP').Season;
    const leaderboardName = this.keyGame + 'PVP' + season;
    const transaction = RedisUtil.redisClient.multi();
    transaction.ZADD(leaderboardName, bp, user.UserId);
    transaction.HMSET(leaderboardName + 'Details', user.UserId, JSON.stringify(user));
    transaction.exec((error, results) => {
      if (error) console.log(error);
    });
  }
}

export const leaderboardManager = new LeaderboardManager();
