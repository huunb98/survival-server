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
const redis_1 = require("../services/database/redis");
module.exports = {
    redisClient: redis_1.redisClient,
    SETKEY: function (key, userID, callback) {
        redis_1.redisClient.SADD(key, userID, (err, rs) => {
            if (rs) {
                callback('', rs);
            }
            else {
                callback(err, '');
            }
        });
    },
    HSET: function (key, member, value, callback) {
        redis_1.redisClient.HSET(key, member, value, (err, rs) => {
            if (rs)
                callback('', rs);
            else
                callback(err, '');
        });
    },
    HGET: function (key, member, callback) {
        redis_1.redisClient.HGET(key, member, (err, rs) => {
            if (rs)
                callback('', rs);
            else
                callback(err, '');
        });
    },
    HDEL: function (key, member, callback) {
        redis_1.redisClient.HDEL(key, member, (err, rs) => {
            if (rs)
                callback('', rs);
            else
                callback(err, '');
        });
    },
    GETMULTIHASHFIELD: function (key, member, mailId, callback) {
        let transactions = redis_1.redisClient.multi();
        mailId.forEach((id) => {
            transactions.HGET(key + id, member);
        });
        transactions.exec((err, rs) => {
            if (rs) {
                let statusMails = new Array();
                for (let i = 0; i < rs.length; i++) {
                    if (rs[i]) {
                        statusMails.push({
                            mailId: mailId[i],
                            status: Number(rs[i]),
                        });
                    }
                    else {
                        statusMails.push({
                            mailId: mailId[i],
                            status: 0, // status new mails
                        });
                    }
                }
                callback('', statusMails);
            }
            else {
                callback(err, '');
            }
        });
    },
    GETMULTIHASHFIELD2: function (key, member, mailId, callback) {
        let transactions = redis_1.redisClient.multi();
        mailId.forEach((id) => {
            transactions.HGET(key + id, member);
        });
        transactions.exec((err, rs) => {
            if (rs) {
                let statusMails = new Array();
                for (let i = 0; i < rs.length; i++) {
                    if (rs[i]) {
                        statusMails.push({
                            mailId: mailId[i].MailId,
                            status: Number(rs[i]),
                            type: mailId[i].Type,
                        });
                    }
                    else {
                        statusMails.push({
                            mailId: mailId[i].MailId,
                            status: 0,
                            type: mailId[i].Type,
                        });
                    }
                }
                callback('', statusMails);
            }
            else {
                callback(err, '');
            }
        });
    },
    EXPIREAT: function (key, time) {
        redis_1.redisClient.EXPIREAT(key, time, (err, rs) => {
            if (err)
                console.log(err);
        });
    },
    SISMEMBER: function (key, value, callback) {
        redis_1.redisClient.SISMEMBER(key, value, (err, rs) => {
            if (rs)
                callback('', rs);
            else
                callback(err, '');
        });
    },
    DEL: function (listKey) {
        listKey.forEach((key) => {
            redis_1.redisClient.DEL(key, (err, rs) => {
                if (err)
                    console.log(err);
            });
        });
    },
    SetMultiLeaderBoard(key, lsKey, lsValue) {
        return __awaiter(this, void 0, void 0, function* () {
            let transaction = redis_1.redisClient.multi();
            for (let i = 0; i < lsKey.length; i++) {
                transaction.HSET(key, lsKey[i], lsValue[i]);
            }
            yield transaction.exec();
        });
    },
};
//# sourceMappingURL=redisUtils.js.map