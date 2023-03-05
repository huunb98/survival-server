import mongoose from 'mongoose';
import RedisClient from '../helpers/redisUtils';
function CreatePVPLeaderBoard() {
  const leaderboardName = 'JACKALSURVIVAL:PVP7';
  for (let i = 0; i < 20; i++) {
    let user = {
      DisplayName: 'Player#' + makeid(),
      AvatarUrl: randomIntFromInterval(0, 7),
      UserId: makeid(),
    };
    let elo = Math.ceil(5000 * Math.random());
    const transaction = RedisClient.redisClient.multi();
    transaction.ZADD(leaderboardName, elo, user.UserId);
    transaction.HMSET(leaderboardName + 'Details', user.UserId, JSON.stringify(user));
    transaction.exec();
  }

  console.log('create pvp leaderboard done');
}

CreatePVPLeaderBoard();

function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function makeid() {
  var length = 6;
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (var i = 0; i < length; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}
