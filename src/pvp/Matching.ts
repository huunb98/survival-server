import { matchMaker } from 'colyseus';

export default async function MatchingPVP(req, res) {
  try {
    // console.log(req.body);
    //let roomName = req.body.room;
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
}
