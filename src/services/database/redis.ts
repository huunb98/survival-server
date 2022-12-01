import * as redis from 'redis';

import { environment } from '../../config/environment/server';

export const clientRedis = redis.createClient({
  host: environment.redis.host,
  port: environment.redis.port,
});
