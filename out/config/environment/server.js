"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.environment = void 0;
require('dotenv').config();
exports.environment = {
    server: {
        port: +process.env.PORT || 3000,
        colyseus: +process.env.COLYSEUS_PORT || 4000,
    },
    redis: {
        host: process.env.REDIS_HOST,
        port: +process.env.REDIS_PORT,
    },
    mongo: {
        host: process.env.MONGO_HOST,
        port: process.env.MONGO_PORT,
        username: process.env.MONGO_USERNAME,
        password: process.env.MONGO_PASSWORD,
        dbName: process.env.MONGO_DB,
    },
};
//# sourceMappingURL=server.js.map