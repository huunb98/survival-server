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
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const pvpConfigManager_1 = require("../pvp/pvpcms/pvpConfigManager");
const pvpRanking_1 = require("../pvp/pvpcms/pvpRanking");
var PvPRouter = (0, express_1.Router)();
PvPRouter.route('/leaderboard')
    .get(function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let topPVP = yield new pvpRanking_1.PVPRanking().getTopPVP();
        res.send(topPVP);
    });
})
    .post((0, express_validator_1.check)('userId').exists({ checkFalsy: true, checkNull: true }), (0, express_validator_1.check)('score').isInt(), function (req, res) {
    let error = (0, express_validator_1.validationResult)(req);
    let errorList = error.array();
    if (errorList.length)
        return res.status(400).send(errorList);
    new pvpRanking_1.PVPRanking().setBattlePoint(req.body.userId, req.body.score, (error, response) => {
        if (error)
            res.status(400).send(error);
        else
            res.send(response);
    });
})
    .delete((0, express_validator_1.check)('userId').exists({ checkFalsy: true, checkNull: true }), function (req, res) {
    let error = (0, express_validator_1.validationResult)(req);
    let errorList = error.array();
    if (errorList.length)
        return res.status(400).send(errorList);
    new pvpRanking_1.PVPRanking().deleteUserLoadboard(req.body.userId, (error, response) => {
        if (error)
            return res.status(500).send('Server not reponse');
        res.send(response);
    });
});
PvPRouter.route('/config')
    .get(function (req, res) {
    let config = new pvpConfigManager_1.PVPConfigManger().GetPVPConfig();
    res.send(config);
})
    .patch((req, res) => {
    //  console.log(req.body);
    let results = new pvpConfigManager_1.PVPConfigManger().UpdatePVPConfig(req.body.leaderboard, req.body.timePlay);
    res.send(results);
});
exports.default = PvPRouter;
//# sourceMappingURL=pvpRouter.js.map