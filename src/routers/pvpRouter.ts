import { Router, Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import { PVPConfigManger } from '../pvp/pvpcms/pvpConfigManager';
import { PVPRanking } from '../pvp/pvpcms/pvpRanking';

var PvPRouter = Router();

PvPRouter.route('/leaderboard')
  .get(async function (req: Request, res: Response) {
    let topPVP = await new PVPRanking().getTopPVP();
    res.send(topPVP);
  })
  .delete(check('userId').exists({ checkFalsy: true, checkNull: true }), function (req: Request, res: Response) {
    let error = validationResult(req);
    let errorList = error.array();

    if (errorList.length) return res.status(400).send(errorList);

    new PVPRanking().deleteUserLoadboard(req.body.userId, (error, response) => {
      if (error) return res.status(500).send('Server not reponse');
      res.send(response);
    });
  });

PvPRouter.route('/config')
  .get(function (req: Request, res: Response) {
    let config = new PVPConfigManger().GetPVPConfig();
    res.send(config);
  })
  .patch((req, res) => {
    let results = new PVPConfigManger().UpdatePVPConfig(null, req.body.timePlay);
    res.send(results);
  });

export default PvPRouter;
