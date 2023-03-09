import { dateHelper } from '../helpers/dateHelper';
import redisUtil from '../utils/redisUtils';
import { ILeaderBoard } from '../models/leaderboard';

async function InitLeaderboard(Name: string): Promise<ILeaderBoard> {
  let lsKeyCfg = await GetMultiLeaderBoardConfig('JACKALSURVIVAL:LEADERBOARD', [`${Name}_season`, `${Name}_season_time`, `${Name}_end_season`, `${Name}_next_season`]);
  let leaderboard = new ILeaderBoard();
  leaderboard.Name = Name;

  if (CheckArrayNull(lsKeyCfg)) {
    console.log('Init leaderboard', Name);
    leaderboard.Season = 1;
    leaderboard.SeasonTime = 14;
    leaderboard.EndSeason = dateHelper.NextMonday();
    leaderboard.NextSeason = dateHelper.NextMonday();
    SetLeaderBoard(Name, leaderboard);
  } else {
    leaderboard.Season = Number(lsKeyCfg[0]);
    leaderboard.SeasonTime = Number(lsKeyCfg[1]);
    leaderboard.EndSeason = new Date(lsKeyCfg[2]);
    leaderboard.NextSeason = new Date(lsKeyCfg[3]);
  }
  return Promise.resolve(leaderboard);
}

async function SetLeaderBoard(Name: string, leaderboard: ILeaderBoard) {
  await redisUtil.SetMultiLeaderBoard(
    'JACKALSURVIVAL:LEADERBOARD',
    [`${Name}_season`, `${Name}_season_time`, `${Name}_end_season`, `${Name}_next_season`],
    [leaderboard.Season, leaderboard.SeasonTime, leaderboard.EndSeason.toLocaleString(), leaderboard.NextSeason.toLocaleString()]
  );
}

function GetMultiLeaderBoardConfig(key: string, name: any[]): Promise<any> {
  let promise = new Promise<any>((resolve, reject) => {
    redisUtil.redisClient.HMGET(key, name, function (err, result) {
      resolve(result);
    });
  });
  return promise;
}

function CheckArrayNull(arr: any[]) {
  return arr.some((index: any) => index === null);
}

export { InitLeaderboard, SetLeaderBoard };
