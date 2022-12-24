export enum LeaderboardType {
  PVP,
}

/**
 * SeasonTime là thời gian của một mùa tính đơn vị là ngày
 */
export class ILeaderBoard {
  Name: string;
  Type: LeaderboardType;
  Season: number;
  SeasonTime: number;
  EndSeason: Date;
  NextSeason: Date;
}
