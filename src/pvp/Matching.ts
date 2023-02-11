import { Router } from 'express';
import { matchMaker } from 'colyseus';

var MatchRouter = Router();

MatchRouter.use('', async (req, res) => {
  try {
    console.log(req.body);
    //let roomName = req.body.room;
    let clientVersion = req.body.Version;
    if (clientVersion == undefined) clientVersion = 0;
    const roomList = await matchMaker.query({ name: 'pvp', locked: false });

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
  } catch (error) {
    return res.status(500).send('Server error!');
  }
});

export default MatchRouter;
