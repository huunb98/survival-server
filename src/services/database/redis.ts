import * as redis from 'redis';

import { environment } from '../../config/environment/server';

export const redisClient = redis.createClient({
  host: environment.redis.host,
  port: environment.redis.port,
  password: environment.redis.pass,
});

redisClient.on('error', function (err) {
  console.log('redis went wrong ' + err);
});
