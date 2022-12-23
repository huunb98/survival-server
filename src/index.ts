const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const cors = require('cors');
const app = express();
import { authenticate } from './auth/authenticate';
import { CmdId } from './helpers/Cmd';
import MailRouter from './routers/mailRouter';
import init = require('./services/init');
import { UserInfo } from './user/userInfo';
import socketIO = require('socket.io');
import { RequestMsg } from './io/IOInterface';
import { mailController } from './mails';
import { Server, matchMaker, RoomListingData } from 'colyseus';
import { PVPRoom } from './pvp/PVPRoom';
import { monitor } from '@colyseus/monitor';

app.use(cors());
app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: '5mb',
  })
);
require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.use('/mail', MailRouter);

app.post('/api/match', async (req: any, res) => {
  try {
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

const server = http.createServer(app);

let io = socketIO(server, {
  transports: ['websocket'],
});

server.listen(PORT, () => {
  console.log(`Server listening on port`, PORT);
});

init.Init().then(() => {
  io.on('connection', (socket) => {
    console.info(`Client connected id = ${socket.id}`);
    let clientIp = socket.request.connection.remoteAddress;

    let userInfo = new UserInfo(socket);
    console.log(clientIp);

    socket.on('msg', function (msg, fn) {
      if (msg.Name === CmdId.MOBILE_LOGIN_REQUEST) {
        if ((<any>socket).logined) return;
        (<any>socket).logined = true;
        authenticate.Login(socket, msg, clientIp, userInfo, fn);
        return;
      }

      if (userInfo.UserId) {
        processMsg(msg, fn);
      } else {
        userInfo.isLogined.subscribe((_) => {
          if (_) processMsg(msg, fn);
        });
      }
    });

    async function processMsg(msg, fn) {}

    socket.on('mail', function (msg: RequestMsg, callback) {
      console.log(msg);

      if (userInfo.UserId) {
        mailController.processMsg(userInfo, msg, callback);
      }
    });

    socket.on('disconnect', () => {
      socket.disconnect();
      console.log(`Client gone [id=${socket.id}]`);
      userInfo = null;
    });
  });
});

server.define('pvp', PVPRoom);

app.use(
  '/colyseus',
  monitor({
    columns: [
      'roomId',
      'name',
      'clients',
      { metadata: 'spectators' }, // display 'spectators' from metadata
      'locked',
      'elapsedTime',
    ],
  })
);

server.on('error', function (e) {
  // do your thing
  console.log('http on error:' + e);
});

process.on('unhandledRejection', (error) => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection', error);
});
process.on('uncaughtException', function (err) {
  if (err.name === 'EADDRINUSE') console.log('-------------' + err.name);
  else console.log('uncaughtException: ' + err);
  //process.exit(1);
});
