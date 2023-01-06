const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const cors = require('cors');
const app = express();
import { authenticate } from './auth/authenticate';
import { CmdId } from './helpers/cmd';
import MailRouter from './routers/mailRouter';
import init = require('./services/init');
import { UserInfo } from './user/userInfo';
import socketIO = require('socket.io');
import { RequestMsg } from './io/IOInterface';
import { mailController } from './mails';
import { Server, matchMaker, RoomListingData } from 'colyseus';
import { PVPRoom } from './pvp/PvPRoom';
import { monitor } from '@colyseus/monitor';
import { environment } from './config/environment/server';
import { leaderboardManager } from './leaderboard/leaderboardManager';
import { userService } from './user/userService';

app.use(cors());
app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: '5mb',
  })
);
require('dotenv').config();

app.use('/mail', MailRouter);

app.post('/api/match', async (req: any, res) => {
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

const server = http.createServer(app);

let io = socketIO(server, {
  transports: ['websocket'],
});

let gameServer = new Server({
  pingInterval: 1500,
  pingMaxRetries: 5,
});

gameServer.define('pvp', PVPRoom);
gameServer.listen(environment.server.colyseus);

server.listen(environment.server.port, () => {
  console.log(`Server http, socket listening on port`, environment.server.port);
});
console.log(`Server colyseus on ws://localhost:${environment.server.colyseus}`);

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

    async function processMsg(msg, fn) {
      switch (msg.Name) {
        case CmdId.SET_NAME:
          userService.SetName(userInfo, msg, fn);
          break;
        case CmdId.GET_TOPSCORE_PVP:
          leaderboardManager.GetSimpeLeaderBoard(userInfo, msg, fn);
          break;
        case CmdId.GET_PVP_INFO:
          leaderboardManager.GetPvPInfo(userInfo, msg, fn);
          break;
      }
    }

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
