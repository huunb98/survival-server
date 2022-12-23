import { Room, Client } from 'colyseus';

import { Schema, type } from '@colyseus/schema';
import { from, Observable, Subscription, timer } from 'rxjs';
import { PlayerInfo } from './PlayerInfo';
import { PVPGameState, PVPTimerConfig, PVP_MatchMarker, WinType } from './PvPConfig';

export class PVPRoom extends Room<PVPState> {
  mapPlayers: Map<string, PlayerInfo>;

  lsPlayer: string[] = [];
  gameResult = {};

  timmer1second: Observable<number> = timer(0, 1000);
  listDispose: Subscription;
  gameState = PVPGameState.Waiting;
  matchingStep: number = 0;

  PlayTime: number = 0; //thời gian chơi game
  PrepareTime: number = PVPTimerConfig.PrepareTime;
  TimeDisposeRoom: number = PVPTimerConfig.PrepareTime;

  constructor() {
    super();

    this.mapPlayers = new Map<string, PlayerInfo>();

    //this.WaitingTime = SurvivalConfig.WaitingTime;
    this.listDispose = new Subscription();
  }

  onCreate(options: any) {
    this.setSeatReservationTime(300);
    this.PlayTime = PVPTimerConfig.TimePlay;

    this.maxClients = 2;
    let state = new PVPState();
    this.setState(state);

    this.gameState = PVPGameState.Waiting;
    this.listDispose = new Subscription();

    let subscribe = this.timmer1second.subscribe((secondsLapse) => {
      if (this.gameState === PVPGameState.Waiting) {
        if (secondsLapse % PVP_MatchMarker.ReloadMakingTime == 0 && secondsLapse <= 20) {
          this.matchingStep++;

          this.setMetadata({
            Version: options.Version,
            minElo: options.Elo - PVP_MatchMarker.MMAtackRange * this.matchingStep,
            maxElo: options.Elo + PVP_MatchMarker.MMAtackRange * this.matchingStep,
            elo: options.Elo,
            minAtk: options.Atk * (1 - PVP_MatchMarker.AtkRange),
            maxAtk: options.Atk * (1 + PVP_MatchMarker.AtkRange),
          });
        }
        //thêm dk 30s không tìm được người chơi thì đóng room;
        this.TimeDisposeRoom--;
        if (this.TimeDisposeRoom < 0) {
          subscribe.unsubscribe();
          this.disconnect();
        }
      } else if (this.gameState === PVPGameState.Preparing) {
        this.PrepareTime--;
        if (this.PrepareTime <= 0) {
          let Score = this.CheckPlayerDisconectResult();
          this.endGame(Score.PlayerWin, Score.PlayerLose, Score.isDraw, WinType.DISCONNECT);
        }
      } else if (this.gameState === PVPGameState.Playing) {
        this.PlayTime--;
        this.sendGameScores();

        if (this.PlayTime <= 0) {
          let Score = this.GetGameResult();
          this.endGame(Score.PlayerWin, Score.PlayerLose, Score.isDraw, WinType.SCORE);
        }
      } else if (this.gameState == PVPGameState.Finish) {
        subscribe.unsubscribe();
      }
    });

    this.onMessage('READY_PVP', (client, message) => {
      if (this.gameState === PVPGameState.Waiting) {
        this.mapPlayers.set(
          client.id,
          new PlayerInfo({
            SessionId: client.id,
            DisplayName: message.DisplayName,
            Atk: message.Atk,
            Elo: message.Elo,
            Score: 0,
            MaxHP: 1000,
            CurHP: 1000,
            TimeFinish: -1,
            Level: message.Level,
            AvatarUrl: message.AvatarUrl,
            UserId: message.UserId,
            Status: message.Status,
            TankId: message.TankId,
            DisconnectTime: 0,
          })
        );
        this.lsPlayer.push(client.id);

        if (this.mapPlayers.size >= 2) {
          //

          this.broadcast('ENERMY_READY_PVP', this.mapPlayers.get(client.id), {
            except: client,
          });

          client.send('ENERMY_READY_PVP', this.getOtherPlayer(client.id));

          this.gamePrepare();
        }
      }

      client.send('READY_PVP', this.mapPlayers.get(client.id));
    });

    this.onMessage('SEND_GAME_SCORE', (client, message) => {
      //console.log('SEND_GAME_SCORE', message)
      if (this.gameState == PVPGameState.Playing) {
        this.mapPlayers.get(client.id).Score = message.Score;
        this.mapPlayers.get(client.id).MaxHP = message.MaxHP;
        this.mapPlayers.get(client.id).CurHP = message.CurHP;
      }
    });

    this.onMessage('GAME_START', (client, message) => {
      this.mapPlayers.get(client.id).Status = 2;

      if (this.checkGameCanStart() && this.gameState != PVPGameState.Playing) {
        this.gameState = PVPGameState.Playing;

        this.broadcast('GAME_START', {
          Time: 180,
          Players: [...this.mapPlayers.keys()],
        });
      }
    });

    this.onMessage('PLAYER_DIE', (client, message) => {
      if (this.gameState == PVPGameState.Playing) {
        // if (this.gameState != SurvivalGameState.Finish) {
        let playerdie = this.mapPlayers.get(client.id);
        playerdie.CurHP = 0;
        //SendScore cuối game
        this.sendGameScores();

        if (this.mapPlayers.get(client.id)) {
          this.broadcast('PLAYER_DIE', {
            SessionId: playerdie.SessionId,
            UserId: playerdie.UserId,
            DisplayName: playerdie.DisplayName,
          });
          this.endGame(this.getOtherPlayer(client.id), playerdie, false, WinType.DIE);
        }
      }
    });
  }

  onDispose() {
    console.log('onDispose');
    this.listDispose.unsubscribe();
  }

  onJoin(client: Client, options: any) {
    console.log('onJoin', client.id, options);
  }

  async onLeave(client: Client, consented: boolean) {
    console.log('leave', client.id, 'consented:', consented);

    try {
      if (consented || this.gameState == PVPGameState.Waiting) {
        throw new Error('consented leave');
      }

      let reClient = await this.allowReconnection(client, 15);
      if (reClient.id) console.log('reconnect', client.id, reClient.id, client.id == reClient.id);

      if (this.mapPlayers.get(client.id)) {
        if (this.gameState == PVPGameState.Playing) {
          client.send('GAME_START', {
            Time: this.PlayTime,
            Players: [...this.mapPlayers.keys()],
          });
        } else if (this.gameState == PVPGameState.Finish) {
          this.broadcast('END_GAME', this.gameResult);
        } else {
          if (this.mapPlayers.get(client.id).Status != 2)
            client.send('NEED_GAME_START', {
              NeedSendStart: 1,
            });
        }
      }
    } catch (e) {
      console.log('onLeaved', client.id, this.gameState);
      this.broadcast('PLAYER_LEFT', {
        SessionID: client.id,
        GameState: this.gameState,
      });
      if (this.gameState === PVPGameState.Playing) {
        this.endGame(this.getOtherPlayer(client.id), this.mapPlayers.get(client.id), false, WinType.DISCONNECT);
      } else if (this.gameState === PVPGameState.Preparing || this.gameState === PVPGameState.Waiting) {
        this.mapPlayers.delete(client.id);
        this.gameState = PVPGameState.Waiting;
        this.disconnect();
      }
    }
  }

  gamePrepare() {
    this.lock();

    this.gameState = PVPGameState.Preparing;

    /**
     * Kích user thừa
     */

    this.clients.forEach((cli) => {
      if (!this.mapPlayers.has(cli.id)) {
        cli.leave(1003);
      }
    });

    let level = 1;

    this.broadcast('PREPARE_PVP', {
      Level: level,
      Time: 180,
      Mode: 1,
    });
  }

  checkGameCanStart() {
    let startCount = 0;
    this.mapPlayers.forEach((element) => {
      console.log(element.Status);

      if (element.Status == 2) startCount++;
    });

    if (startCount >= 2) return true;
    else return false;
  }

  CheckPlayerDisconectResult() {
    let player1 = this.mapPlayers.get(this.lsPlayer[0]);
    let player2 = this.mapPlayers.get(this.lsPlayer[1]);

    if (player1.Status == 2) {
      //player 1 win
      return {
        isDraw: false,
        PlayerWin: player1,
        PlayerLose: player2,
      };
    } else {
      // player 1 lose
      return {
        isDraw: false,
        PlayerWin: player2,
        PlayerLose: player1,
      };
    }
  }

  sendGameScores() {
    this.broadcast('GAME_SCORE_UPDATE', {
      Time: this.PlayTime,
      GameScores: Object.fromEntries(this.mapPlayers),
    });
  }

  getOtherPlayer(clientId: string) {
    if (this.lsPlayer[0] == clientId) return this.mapPlayers.get(this.lsPlayer[1]);
    else return this.mapPlayers.get(this.lsPlayer[0]);
  }

  GetGameResult() {
    let player1 = this.mapPlayers.get(this.lsPlayer[0]);
    let player2 = this.mapPlayers.get(this.lsPlayer[1]);

    if (player1.Score == player2.Score) {
      //Hòa
      return {
        isDraw: true,
        PlayerWin: player2,
        PlayerLose: player1,
      };
    } else if (player1.Score > player2.Score) {
      //player 1 win
      return {
        isDraw: false,
        PlayerWin: player1,
        PlayerLose: player2,
      };
    } else {
      // player 1 lose
      return {
        isDraw: false,
        PlayerWin: player2,
        PlayerLose: player1,
      };
    }
  }

  endGame(PlayerWin: PlayerInfo, PlayerLose: PlayerInfo, isDraw: boolean, winType: WinType) {
    console.log(PlayerWin, PlayerLose, winType);
  }
}

class PVPState extends Schema {
  @type('number')
  Time: number = 0;
}
