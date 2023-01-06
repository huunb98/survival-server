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
exports.MongoDBDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const server_1 = require("../../config/environment/server");
class MongoDBDatabase {
    constructor() {
        this.uri = `mongodb://${server_1.environment.mongo.host}:${server_1.environment.mongo.port}`;
    }
    connectAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                dbName: server_1.environment.mongo.dbName,
                user: server_1.environment.mongo.username,
                pass: server_1.environment.mongo.username,
                keepAlive: true,
            };
            mongoose_1.default.connection.on('error', (err) => {
                console.log('MongoDB error Database.ts: ' + err);
            });
            try {
                yield mongoose_1.default.connect(this.uri, options);
                console.log('MongoDb connected ');
            }
            catch (e) {
                console.log('MongoDb error : ' + e);
            }
        });
    }
}
exports.MongoDBDatabase = MongoDBDatabase;
//# sourceMappingURL=mongodb.js.map