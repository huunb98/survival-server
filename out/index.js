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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const cors = require('cors');
const app = express();
const authenticate_1 = require("./auth/authenticate");
const Cmd_1 = require("./helpers/Cmd");
const init = require("./services/init");
const userInfo_1 = require("./user/userInfo");
const socketIO = require("socket.io");
const mails_1 = require("./mails");
const colyseus_1 = require("colyseus");
const PvPRoom_1 = require("./pvp/PvPRoom");
const monitor_1 = require("@colyseus/monitor");
const server_1 = require("./config/environment/server");
const leaderboardManager_1 = require("./leaderboard/leaderboardManager");
const userService_1 = require("./user/userService");
const apiRouter_1 = __importDefault(require("./apiRouter"));
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '5mb',
}));
require('dotenv').config();
app.use('/api', apiRouter_1.default);
const server = http.createServer(app);
let io = socketIO(server, {
    transports: ['websocket'],
});
let gameServer = new colyseus_1.Server({
    pingInterval: 1500,
    pingMaxRetries: 5,
});
gameServer.define('pvp', PvPRoom_1.PVPRoom);
gameServer.listen(server_1.environment.server.colyseus);
server.listen(server_1.environment.server.port, () => {
    console.log(`Server http, socket listening on port`, server_1.environment.server.port);
});
console.log(`Server colyseus on ws://localhost:${server_1.environment.server.colyseus}`);
init.Init().then(() => {
    io.on('connection', (socket) => {
        console.info(`Client connected id = ${socket.id}`);
        let clientIp = socket.request.connection.remoteAddress;
        let userInfo = new userInfo_1.UserInfo(socket);
        console.log(clientIp);
        socket.on('msg', function (msg, fn) {
            if (msg.Name === Cmd_1.CmdId.MOBILE_LOGIN_REQUEST) {
                if (socket.logined)
                    return;
                socket.logined = true;
                authenticate_1.authenticate.Login(socket, msg, clientIp, userInfo, fn);
                return;
            }
            if (userInfo.UserId) {
                processMsg(msg, fn);
            }
            else {
                userInfo.isLogined.subscribe((_) => {
                    if (_)
                        processMsg(msg, fn);
                });
            }
        });
        function processMsg(msg, fn) {
            return __awaiter(this, void 0, void 0, function* () {
                switch (msg.Name) {
                    case Cmd_1.CmdId.SET_AVATAR:
                        userService_1.userService.SetAvatar(userInfo, msg, fn);
                        break;
                    case Cmd_1.CmdId.SET_NAME:
                        userService_1.userService.SetName(userInfo, msg, fn);
                        break;
                    case Cmd_1.CmdId.GET_TOPSCORE_PVP:
                        leaderboardManager_1.leaderboardManager.GetSimpeLeaderBoard(userInfo, msg, fn);
                        break;
                }
            });
        }
        socket.on('mail', function (msg, callback) {
            if (userInfo.UserId) {
                mails_1.mailController.processMsg(userInfo, msg, callback);
            }
        });
        socket.on('disconnect', () => {
            socket.disconnect();
            console.log(`Client gone [id=${socket.id}]`);
            userInfo = null;
        });
    });
});
app.use('/colyseus', (0, monitor_1.monitor)({
    columns: [
        'roomId',
        'name',
        'clients',
        { metadata: 'spectators' },
        'locked',
        'elapsedTime',
    ],
}));
server.on('error', function (e) {
    // do your thing
    console.log('http on error:' + e);
});
process.on('unhandledRejection', (error) => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error);
});
process.on('uncaughtException', function (err) {
    if (err.name === 'EADDRINUSE')
        console.log('-------------' + err.name);
    else
        console.log('uncaughtException: ' + err);
    //process.exit(1);
});
//# sourceMappingURL=index.js.map