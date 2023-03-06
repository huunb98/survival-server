import { ModeCfg } from '../modeCfg';

require('dotenv').config();

const environmentDevelop = {
  server: {
    port: +process.env.PORT || 3000,
    colyseus: +process.env.COLYSEUS_PORT || 4000,
  },
  redis: {
    host: process.env.REDIS_DEVELOP_HOST,
    port: +process.env.REDIS_DEVELOP_PORT,
    pass: process.env.REDIS_DEVELOP_PASS,
  },
  mongo: {
    host: process.env.MONGO_HOST,
    port: process.env.MONGO_PORT,
    username: process.env.MONGO_USERNAME,
    password: process.env.MONGO_PASSWORD,
    dbName: process.env.MONGO_DB,
  },
};

const environmentProduct = {
  server: {
    port: +process.env.PORT || 3000,
    colyseus: +process.env.COLYSEUS_PORT || 4000,
  },
  redis: {
    host: process.env.REDIS_PRODUCT_HOST,
    port: +process.env.REDIS_PRODUCT_PORT,
    pass: process.env.REDIS_PRODUCT_PASS,
  },
  mongo: {
    host: process.env.MONGO_HOST,
    port: process.env.MONGO_PORT,
    username: process.env.MONGO_USERNAME,
    password: process.env.MONGO_PASSWORD,
    dbName: process.env.MONGO_DB,
  },
};

var environment = process.env.MODE === ModeCfg.Product ? environmentProduct : environmentDevelop;

export { environment };
