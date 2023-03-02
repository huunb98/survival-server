export enum PVPGameState {
  Waiting = 0,
  Preparing = 1,
  Playing = 2,
  Finish = 3,
}

export var PVPTimerConfig = {
  MaxPlayerIngame: 2,
  TimePlay: 180,
  PrepareTime: 30,
};

export var PVP_MatchMarker = {
  ReloadMakingTime: 5,
  MMAtackRange: 200,
  AtkRange: 0.5,
};

export enum WinType {
  DIE = 0,
  SCORE = 1,
  DISCONNECT = 2,
}
