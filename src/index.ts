const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const cors = require('cors');
const app = express();
import MailRouter from './routers/mailRouter';
import { MongoDBDatabase } from './services/database/mongodb';

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

new MongoDBDatabase().connectMongoDb((_) => {
  console.log('Mongodb Connected');
});

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

io.sockets.on('connection', (socket) => {
  console.info(`Client connected id = ${socket.id}`);

  socket.on('disconnect', () => {
    socket.disconnect();
    console.log(`Client gone [id=${socket.id}]`);
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
