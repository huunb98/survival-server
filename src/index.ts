const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const cors = require('cors');
const app = express();
import { authenticate } from './auth/authenticate';
import { CmdId } from './heplers/Cmd';
import MailRouter from './routers/mailRouter';
import { MongoDBDatabase } from './services/database/mongodb';
import init = require('./services/init');
import { UserInfo } from './user/userInfo';

// app.use(cors());
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

const server = http.createServer(app);

const io = require('socket.io')(server, {
  allowEIO3: true,
  cors: {
    origin: '',
    methods: ['GET', 'POST'],
    credentials: true,
  },
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

    socket.on('disconnect', () => {
      socket.disconnect();
      console.log(`Client gone [id=${socket.id}]`);
      userInfo = null;
    });
  });
});

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
