import { ILeaderBoard } from '../models/leaderboard';
import schedule from 'node-schedule';
import { leaderboardManager } from './leaderboardManager';
import RedisUtil from '../helpers/redisUtils';

export class LeaderBoardResetManager {
  leaderBoard: ILeaderBoard;
  job: schedule.job;

  constructor(leaderBoard: ILeaderBoard) {
    this.leaderBoard = leaderBoard;
  }

  checkReset() {
    if (this.leaderBoard.NextSeason <= new Date()) {
      this.NewSeason();
    } else {
      this.scheduleCheckNextReset();
    }
  }

  scheduleCheckNextReset() {
    if (this.job) this.job.cancel(false);
    // console.log("scheduleCheckNextReset " + this.leaderBoard.NextReset)
    this.job = schedule.scheduleJob(this.leaderBoard.NextSeason, () => {
      console.log('Check Reset Leaderboard');
      this.checkReset();
    });
  }

  async NewSeason() {
    let seasonTime = await this.getSeasonTime(this.leaderBoard.Name + '_season_time');
    this.leaderBoard.SeasonTime = seasonTime;
    let seasonTimeInMiliSeasons = seasonTime * 86400 * 1000;

    this.leaderBoard.Season++;
    this.leaderBoard.SeasonTime = seasonTime;
    this.leaderBoard.EndSeason = new Date(this.leaderBoard.EndSeason.getTime() + seasonTimeInMiliSeasons);
    this.leaderBoard.NextSeason = new Date(this.leaderBoard.NextSeason.getTime() + seasonTimeInMiliSeasons);

    leaderboardManager.UpdateLeaderBoardCfg(this.leaderBoard.Name, this.leaderBoard.Season, this.leaderBoard.SeasonTime, this.leaderBoard.EndSeason, this.leaderBoard.EndSeason);

    leaderboardManager.SetLeaderBoard(this.leaderBoard.Name + '_season', this.leaderBoard.Season);
    leaderboardManager.SetLeaderBoard(this.leaderBoard.Name + '_end_season', this.leaderBoard.EndSeason.toLocaleString());
    leaderboardManager.SetLeaderBoard(this.leaderBoard.Name + '_next_season', this.leaderBoard.NextSeason.toLocaleString());

    this.DeleteOldLeaderboard('Leaderboard:' + this.leaderBoard.Name + (this.leaderBoard.Season - 5));
    this.checkReset();
  }

  private DeleteOldLeaderboard(Name: string) {
    RedisUtil.redisClient.DEL(Name, (err, rs) => {});
    RedisUtil.redisClient.DEL(Name + 'Details', (err, rs) => {
      console.log('delete ', Name);
    });
  }

  /**
   * Số ngày mặc định là 14 nếu trả về lỗi hoặc null
   * @param key
   * @returns
   */
  private getSeasonTime(key: string) {
    return new Promise<number>((resolve, reject) => {
      RedisUtil.HGET('LEADERBOARD', key, (err, rs) => {
        if (rs) resolve(Number(rs));
        else resolve(14);
      });
    });
  }
}
