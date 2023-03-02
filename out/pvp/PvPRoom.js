"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PVPRoom = void 0;
const colyseus_1 = require("colyseus");
const schema_1 = require("@colyseus/schema");
const rxjs_1 = require("rxjs");
const PlayerInfo_1 = require("./PlayerInfo");
const PvPConfig_1 = require("./data/PvPConfig");
const leaderboardManager_1 = require("../leaderboard/leaderboardManager");
const PvPHelper_1 = require("./PvPHelper");
const RankingReward_1 = require("./data/RankingReward");
class PVPRoom extends colyseus_1.Room {
    constructor() {
        super();
        this.lsPlayer = [];
        this.gameResult = {};
        this.timmer1second = (0, rxjs_1.timer)(0, 1000);
        this.gameState = PvPConfig_1.PVPGameState.Waiting;
        this.matchingStep = 0;
        this.PlayTime = 0; //thời gian chơi game
        this.PrepareTime = PvPConfig_1.PVPTimerConfig.PrepareTime;
        this.TimeDisposeRoom = PvPConfig_1.PVPTimerConfig.PrepareTime;
        this.mapPlayers = new Map();
        //this.WaitingTime = SurvivalConfig.WaitingTime;
        this.listDispose = new rxjs_1.Subscription();
    }
    onCreate(options) {
        // console.log('on create room');
        //   this.setSeatReservationTime(300);
        this.PlayTime = PvPConfig_1.PVPTimerConfig.TimePlay;
        this.maxClients = 2;
        let state = new PVPState();
        this.setState(state);
        this.gameState = PvPConfig_1.PVPGameState.Waiting;
        this.listDispose = new rxjs_1.Subscription();
        let subscribe = this.timmer1second.subscribe((secondsLapse) => {
            if (this.gameState === PvPConfig_1.PVPGameState.Waiting) {
                if (secondsLapse % PvPConfig_1.PVP_MatchMarker.ReloadMakingTime == 0 && secondsLapse <= 20) {
                    this.matchingStep++;
                    this.setMetadata({
                        minElo: options.Elo - PvPConfig_1.PVP_MatchMarker.MMAtackRange * this.matchingStep,
                        maxElo: options.Elo + PvPConfig_1.PVP_MatchMarker.MMAtackRange * this.matchingStep,
                        elo: options.Elo,
                        minAtk: options.Atk * (1 - PvPConfig_1.PVP_MatchMarker.AtkRange),
                        maxAtk: options.Atk * (1 + PvPConfig_1.PVP_MatchMarker.AtkRange),
                    });
                }
                //thêm dk 30s không tìm được người chơi thì đóng room;
                this.TimeDisposeRoom--;
                if (this.TimeDisposeRoom < 0) {
                    subscribe.unsubscribe();
                    this.disconnect();
                }
            }
            else if (this.gameState === PvPConfig_1.PVPGameState.Preparing) {
                this.PrepareTime--;
                if (this.PrepareTime <= 0) {
                    let Score = this.CheckPlayerDisconectResult();
                    this.endGame(Score.PlayerWin, Score.PlayerLose, Score.isDraw, PvPConfig_1.WinType.DISCONNECT);
                }
            }
            else if (this.gameState === PvPConfig_1.PVPGameState.Playing) {
                this.PlayTime--;
                this.sendGameScores();
                if (this.PlayTime <= 0) {
                    let Score = this.GetGameResult();
                    this.endGame(Score.PlayerWin, Score.PlayerLose, Score.isDraw, PvPConfig_1.WinType.SCORE);
                }
            }
            else if (this.gameState == PvPConfig_1.PVPGameState.Finish) {
                subscribe.unsubscribe();
            }
        });
        this.onMessage('READY_PVP', (client, message) => {
            if (this.gameState === PvPConfig_1.PVPGameState.Waiting) {
                this.mapPlayers.set(client.id, new PlayerInfo_1.PlayerInfo({
                    SessionId: client.id,
                    DisplayName: message.DisplayName,
                    Atk: message.Atk,
                    Elo: message.Elo,
                    Score: 0,
                    MaxHP: 1000,
                    CurHP: 1000,
                    AvatarUrl: message.AvatarUrl,
                    UserId: message.UserId,
                    Status: message.Status,
                    TankId: message.TankId,
                    DisconnectTime: 0,
                }));
                this.lsPlayer.push(client.id);
                if (this.mapPlayers.size >= 2) {
                    this.broadcast('ENERMY_READY_PVP', this.mapPlayers.get(client.id), {
                        except: client,
                    });
                    client.send('ENERMY_READY_PVP', this.getOtherPlayer(client.id));
                    this.gamePrepare();
                }
            }
            //   client.send('READY_PVP', this.mapPlayers.get(client.id));
        });
        this.onMessage('SEND_GAME_SCORE', (client, message) => {
            if (this.gameState == PvPConfig_1.PVPGameState.Playing) {
                this.mapPlayers.get(client.id).Score = message.Score;
                this.mapPlayers.get(client.id).MaxHP = message.MaxHP;
                this.mapPlayers.get(client.id).CurHP = message.CurHP;
            }
        });
        this.onMessage('GAME_START', (client, message) => {
            this.mapPlayers.get(client.id).Status = 2;
            if (this.checkGameCanStart() && this.gameState != PvPConfig_1.PVPGameState.Playing) {
                // if (this.gameState != PVPGameState.Playing) {
                this.gameState = PvPConfig_1.PVPGameState.Playing;
                this.broadcast('GAME_START', {
                    Time: PvPConfig_1.PVPTimerConfig.TimePlay,
                    Players: [...this.mapPlayers.keys()],
                });
            }
        });
        this.onMessage('PLAYER_DIE', (client, message) => {
            if (this.gameState == PvPConfig_1.PVPGameState.Playing) {
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
                    this.endGame(this.getOtherPlayer(client.id), playerdie, false, PvPConfig_1.WinType.DIE);
                }
            }
        });
    }
    onDispose() {
        console.log('onDispose');
        this.listDispose.unsubscribe();
    }
    onJoin(client, options) {
        console.log('onJoin', client.id, options);
    }
    onLeave(client, consented) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('leave', client.id, 'consented:', consented);
            try {
                if (consented || this.gameState == PvPConfig_1.PVPGameState.Waiting) {
                    throw new Error('consented leave');
                }
                let reClient = yield this.allowReconnection(client, 15);
                if (reClient.id)
                    console.log('reconnect', client.id, reClient.id, client.id == reClient.id);
                if (this.mapPlayers.get(client.id)) {
                    if (this.gameState == PvPConfig_1.PVPGameState.Playing) {
                        client.send('GAME_START', {
                            Time: this.PlayTime,
                            Players: [...this.mapPlayers.keys()],
                        });
                    }
                    else if (this.gameState == PvPConfig_1.PVPGameState.Finish) {
                        this.broadcast('END_GAME', this.gameResult);
                    }
                }
            }
            catch (e) {
                console.log('onLeaved', client.id, this.gameState);
                this.broadcast('PLAYER_LEFT', {
                    SessionID: client.id,
                    GameState: this.gameState,
                });
                if (this.gameState === PvPConfig_1.PVPGameState.Playing) {
                    this.endGame(this.getOtherPlayer(client.id), this.mapPlayers.get(client.id), false, PvPConfig_1.WinType.DISCONNECT);
                }
                else if (this.gameState === PvPConfig_1.PVPGameState.Preparing || this.gameState === PvPConfig_1.PVPGameState.Waiting) {
                    this.mapPlayers.delete(client.id);
                    this.gameState = PvPConfig_1.PVPGameState.Waiting;
                    this.disconnect();
                }
            }
        });
    }
    gamePrepare() {
        this.lock();
        this.gameState = PvPConfig_1.PVPGameState.Preparing;
        /**
         * Kích user thừa
         */
        this.clients.forEach((cli) => {
            if (!this.mapPlayers.has(cli.id)) {
                cli.leave(1003);
            }
        });
        let level = PvPHelper_1.pvpHelper.GetLevelByAttack(this.mapPlayers.get(this.lsPlayer[0]).Atk, this.mapPlayers.get(this.lsPlayer[1]).Atk);
        this.broadcast('PREPARE_PVP', {
            Level: level,
            Time: PvPConfig_1.PVPTimerConfig.TimePlay,
        });
    }
    checkGameCanStart() {
        let startCount = 0;
        this.mapPlayers.forEach((element) => {
            //   console.log(element.Status);
            if (element.Status == 2)
                startCount++;
        });
        if (startCount >= 2)
            return true;
        else
            return false;
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
        }
        else {
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
    getOtherPlayer(clientId) {
        if (this.lsPlayer[0] == clientId)
            return this.mapPlayers.get(this.lsPlayer[1]);
        else
            return this.mapPlayers.get(this.lsPlayer[0]);
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
        }
        else if (player1.Score > player2.Score) {
            //player 1 win
            return {
                isDraw: false,
                PlayerWin: player1,
                PlayerLose: player2,
            };
        }
        else {
            // player 1 lose
            return {
                isDraw: false,
                PlayerWin: player2,
                PlayerLose: player1,
            };
        }
    }
    endGame(PlayerWin, PlayerLose, isDraw, winType) {
        this.gameState = PvPConfig_1.PVPGameState.Finish;
        let winELO = PlayerWin.Elo + PvPHelper_1.pvpHelper.GetBPBonus(PlayerWin.Elo, PlayerLose.Elo, true, isDraw);
        let loseELO = PlayerLose.Elo + PvPHelper_1.pvpHelper.GetBPBonus(PlayerLose.Elo, PlayerWin.Elo, false, isDraw);
        if (loseELO < 0)
            loseELO = 0;
        let winPlayer = {
            DisplayName: PlayerWin.DisplayName,
            SessionId: PlayerWin.SessionId,
            AvatarUrl: PlayerWin.AvatarUrl,
            UserId: PlayerWin.UserId,
            Score: PlayerWin.Score,
            eloPre: PlayerWin.Elo,
            eloCur: winELO,
            Rewards: PvPHelper_1.pvpHelper.GetRewardByBP(winELO),
        };
        let losePlayer = {
            DisplayName: PlayerLose.DisplayName,
            SessionId: PlayerLose.SessionId,
            AvatarUrl: PlayerLose.AvatarUrl,
            UserId: PlayerLose.UserId,
            Score: PlayerLose.Score,
            eloPre: PlayerLose.Elo,
            eloCur: loseELO,
            Rewards: {},
        };
        if (isDraw) {
            winPlayer.Rewards = RankingReward_1.PVPDrawRewards;
            losePlayer.Rewards = RankingReward_1.PVPDrawRewards;
        }
        this.gameResult = {
            IsDraw: isDraw,
            WinnerData: winPlayer,
            LoserData: losePlayer,
            WinType: winType,
        };
        this.broadcast('END_GAME', {
            IsDraw: isDraw,
            WinnerData: winPlayer,
            LoserData: losePlayer,
            WinType: winType,
        });
        this.SaveDataEndGame(winPlayer, losePlayer);
        setTimeout(() => {
            try {
                this.disconnect();
            }
            catch (error) {
                console.log(error);
            }
        }, 20000);
    }
    SaveDataEndGame(PlayerWin, PlayerLose) {
        const userWin = {
            UserId: PlayerWin.UserId,
            DisplayName: PlayerWin.DisplayName,
            AvatarUrl: PlayerWin.AvatarUrl,
        };
        const userLose = {
            UserId: PlayerLose.UserId,
            DisplayName: PlayerLose.DisplayName,
            AvatarUrl: PlayerLose.AvatarUrl,
        };
        leaderboardManager_1.leaderboardManager.UpdateBattlePoint(userWin, userLose, PlayerWin.eloCur, PlayerLose.eloCur);
    }
}
exports.PVPRoom = PVPRoom;
class PVPState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.Time = 0;
    }
}
__decorate([
    (0, schema_1.type)('number')
], PVPState.prototype, "Time", void 0);
//# sourceMappingURL=PvPRoom.js.map