"use strict";
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
const colyseus_1 = require("colyseus");
/**
 * Check elo and atk valid for metadata of room pvp
 *
 * Room created after 20s, battle point range max +/- 1200
 * Atk range +/- 50%
 * @param elo
 * @param atk
 * @param room
 * @returns
 */
function MatchSuccess(elo, atk, room) {
    console.log(' user mathmarker', elo, atk, room.metadata);
    let checkElo = CheckElo(elo, room.metadata);
    let checkAtk = CheckAttack(atk, room.metadata);
    console.log(checkElo, checkAtk);
    if (checkElo && checkAtk)
        return true;
    else
        return false;
}
function CheckElo(elo, metadata) {
    if (elo >= metadata.minElo && elo <= metadata.maxElo)
        return true;
    else
        return false;
}
function CheckAttack(atk, metadata) {
    if (atk >= metadata.minAtk && atk <= metadata.maxAtk)
        return true;
    else
        return false;
}
function MatchingPVP(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(req.body);
            //let roomName = req.body.room;
            const roomList = yield colyseus_1.matchMaker.query({ name: 'pvp', locked: false });
            let name = 'pvp';
            let action = 2;
            for (let index = 0; index < roomList.length; index++) {
                const room = roomList[index];
                const results = MatchSuccess(req.body.Elo, req.body.Atk, room);
                if (results) {
                    name = room.roomId;
                    action = 1;
                    break;
                }
            }
            return res.send({
                type: action,
                roomName: name,
                status: 1,
            });
        }
        catch (error) {
            return res.status(500).send('Server error!');
        }
    });
}
exports.default = MatchingPVP;
//# sourceMappingURL=Matching.js.map