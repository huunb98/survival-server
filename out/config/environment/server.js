"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.environment = void 0;
const modeCfg_1 = require("../modeCfg");
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
        host: process.env.MONGO_DEVELOP_HOST,
        port: process.env.MONGO_DEVELOP_PORT,
        username: process.env.MONGO_DEVELOP_USER,
        password: process.env.MONGO_DEVELOP_PASS,
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
        host: process.env.MONGO_PRODUCT_HOST,
        port: process.env.MONGO_PRODUCT_POSS,
        username: process.env.MONGO_PRODUCT_USER,
        password: process.env.MONGO_PRODUCT_PASS,
        dbName: process.env.MONGO_DB,
    },
};
var environment = process.env.MODE === modeCfg_1.ModeCfg.Product ? environmentProduct : environmentDevelop;
exports.environment = environment;
//# sourceMappingURL=server.js.map