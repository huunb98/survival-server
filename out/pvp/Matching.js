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
function MatchingPVP(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(req.body);
            //let roomName = req.body.room;
            let clientVersion = req.body.Version;
            if (clientVersion == undefined)
                clientVersion = 0;
            const roomList = yield colyseus_1.matchMaker.query({ name: 'pvp', locked: false });
            let name = 'pvp';
            let action = 2;
            for (let index = 0; index < roomList.length; index++) {
                const room = roomList[index];
                const results = true;
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