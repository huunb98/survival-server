import { matchMaker } from 'colyseus';
import { RoomListingData } from 'colyseus';

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
function MatchSuccess(elo: number, atk: number, room: RoomListingData<any>): boolean {
  console.log(' user mathmarker', elo, atk, room.metadata);

  let checkElo = CheckElo(elo, room.metadata);
  let checkAtk = CheckAttack(atk, room.metadata);
  console.log(checkElo, checkAtk);
  if (checkElo && checkAtk) return true;
  else return false;
}

function CheckElo(elo: number, metadata: any) {
  if (elo >= metadata.minElo && elo <= metadata.maxElo) return true;
  else return false;
}

function CheckAttack(atk: number, metadata: any) {
  if (atk >= metadata.minAtk && atk <= metadata.maxAtk) return true;
  else return false;
}

export default async function MatchingPVP(req, res) {
  try {
    console.log(req.body);
    //let roomName = req.body.room;
    const roomList = await matchMaker.query({ name: 'pvp', locked: false });

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
  } catch (error) {
    return res.status(500).send('Server error!');
  }
}
