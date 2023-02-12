import { PVP_BonusBP } from './data/BonusBP';
import { PVPAttackLevel } from './data/PVPAttackLevel';
import { PVPRewardEndGame, PVPRewardSeason } from './data/RankingReward';

class PvPHelper {
  GetLevelByAttack(atk1: number, atk2: number): number {
    let attack = (atk1 + atk2) / 2;
    let level = 1;
    for (let i = 0; i < PVPAttackLevel.length; i++) {
      if (attack >= PVPAttackLevel[i].attack[0] && attack < PVPAttackLevel[i].attack[1]) {
        level = this.randomIntFromInterval(PVPAttackLevel[i].level[0], PVPAttackLevel[i].level[1]);
        break;
      }
    }
    return level;
  }

  GetBPBonus(yourElo: number, opponentElo: number, actual: boolean, isDraw: boolean) {
    if (isDraw) return PVP_BonusBP.Draw;
    let yourRank = this.GetUserRankByBP(yourElo);
    let OppRank = this.GetUserRankByBP(opponentElo);

    let bonusRank = 0;

    if (yourRank > OppRank) {
      if (actual) bonusRank = -1 * Math.floor(yourRank - OppRank);
      else bonusRank = -1 * Math.floor(yourRank - OppRank);
    } else if (yourRank < OppRank) {
      if (actual) bonusRank = 2 * (OppRank - yourRank);
      else bonusRank = Math.floor(OppRank - yourRank);
    }

    let bonusPoint = 0;
    if (actual) bonusPoint = PVP_BonusBP.Win + bonusRank;
    else bonusPoint = PVP_BonusBP.Lose + bonusRank;

    return bonusPoint;
  }

  GetRewardByBP(bp: number) {
    for (let index = 0; index < PVPRewardEndGame.length; index++) {
      const element = PVPRewardEndGame[index];
      console.log(bp, element);
      if (bp < element.MinBP) {
        console.log('rewards:', index, element.MinBP, element.Rewards);
        return element.Rewards;
      }
    }
  }

  GetRewardSeason(rank: number) {
    let gifts = new Map();
    for (let i = PVPRewardSeason.length - 1; i >= 0; i--) {
      if (rank >= PVPRewardSeason[i].MinRank && rank <= PVPRewardSeason[i].MaxRank) {
        gifts = new Map(Object.entries(PVPRewardSeason[i].Gifts));
        break;
      }
    }
    return gifts;
  }

  private randomIntFromInterval(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  private GetUserRankByBP(bp: number) {
    for (let index = 0; index < PVPRewardEndGame.length; index++) {
      const element = PVPRewardEndGame[index];
      if (bp < element.MinBP) {
        return index;
      }
    }
  }
}

export const pvpHelper = new PvPHelper();
