"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pvpHelper = void 0;
const BonusBP_1 = require("./data/BonusBP");
const PVPAttackLevel_1 = require("./data/PVPAttackLevel");
const RankingReward_1 = require("./data/RankingReward");
class PvPHelper {
    GetLevelByAttack(atk1, atk2) {
        let attack = (atk1 + atk2) / 2;
        let level = 1;
        for (let i = 0; i < PVPAttackLevel_1.PVPAttackLevel.length; i++) {
            if (attack >= PVPAttackLevel_1.PVPAttackLevel[i].attack[0] && attack < PVPAttackLevel_1.PVPAttackLevel[i].attack[1]) {
                level = this.randomIntFromInterval(PVPAttackLevel_1.PVPAttackLevel[i].level[0], PVPAttackLevel_1.PVPAttackLevel[i].level[1]);
                break;
            }
        }
        return level;
    }
    GetBPBonus(yourElo, opponentElo, actual, isDraw) {
        if (isDraw)
            return BonusBP_1.PVP_BonusBP.Draw;
        let yourRank = this.GetUserRankByBP(yourElo);
        let OppRank = this.GetUserRankByBP(opponentElo);
        let bonusRank = 0;
        if (yourRank > OppRank) {
            if (actual)
                bonusRank = -1 * Math.floor(yourRank - OppRank);
            else
                bonusRank = -1 * Math.floor(yourRank - OppRank);
        }
        else if (yourRank < OppRank) {
            if (actual)
                bonusRank = 2 * (OppRank - yourRank);
            else
                bonusRank = Math.floor(OppRank - yourRank);
        }
        let bonusPoint = 0;
        if (actual)
            bonusPoint = BonusBP_1.PVP_BonusBP.Win + bonusRank;
        else
            bonusPoint = BonusBP_1.PVP_BonusBP.Lose + bonusRank;
        return bonusPoint;
    }
    GetRewardByBP(bp) {
        for (let index = 0; index < RankingReward_1.PVPRewardEndGame.length; index++) {
            const element = RankingReward_1.PVPRewardEndGame[index];
            // console.log(bp, element);
            if (bp < element.MinBP) {
                //  console.log('rewards:', index, element.MinBP, element.Rewards);
                return element.Rewards;
            }
        }
    }
    GetRewardSeason(rank) {
        let gifts = new Map();
        for (let i = RankingReward_1.PVPRewardSeason.length - 1; i >= 0; i--) {
            if (rank >= RankingReward_1.PVPRewardSeason[i].MinRank && rank <= RankingReward_1.PVPRewardSeason[i].MaxRank) {
                gifts = new Map(Object.entries(RankingReward_1.PVPRewardSeason[i].Gifts));
                break;
            }
        }
        return gifts;
    }
    randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    GetUserRankByBP(bp) {
        for (let index = 0; index < RankingReward_1.PVPRewardEndGame.length; index++) {
            const element = RankingReward_1.PVPRewardEndGame[index];
            if (bp < element.MinBP) {
                return index;
            }
        }
    }
}
exports.pvpHelper = new PvPHelper();
//# sourceMappingURL=PvPHelper.js.map