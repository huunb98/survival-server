export class PlayerInfo {
  constructor(init?: Partial<PlayerInfo>) {
    Object.assign(this, init);
  }

  SessionId: string;

  Atk: number;
  Score: number;
  CurHP: number;
  MaxHP: number;
  Elo: number;

  TimeFinish: number;
  Level: number;
  TankId: string;

  UserId: string;
  DisplayName: string;
  AvatarUrl: string;

  Status: number;
  DisconnectTime: number; // mốc thời gian User Disconnect
}
