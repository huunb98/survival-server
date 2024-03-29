import { MailBase } from '../mails/mailIO';
import { redisClient } from '../services/database/redis';

export = {
  redisClient: redisClient,

  SETKEY: function (key: string, userID: string, callback: any) {
    redisClient.SADD(key, userID, (err, rs) => {
      if (rs) {
        callback('', rs);
      } else {
        callback(err, '');
      }
    });
  },

  HSET: function (key: string, member: string, value: any, callback: any) {
    redisClient.HSET(key, member, value, (err, rs) => {
      if (rs) callback('', rs);
      else callback(err, '');
    });
  },

  HGET: function (key: string, member: string, callback: any) {
    redisClient.HGET(key, member, (err, rs) => {
      if (rs) callback('', rs);
      else callback(err, '');
    });
  },

  HDEL: function (key: string, member: string, callback: any) {
    redisClient.HDEL(key, member, (err, rs) => {
      if (rs) callback('', rs);
      else callback(err, '');
    });
  },

  GETMULTIHASHFIELD: function (key: string, member: string, mailId: string[], callback: any) {
    let transactions = redisClient.multi();
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
          } else {
            statusMails.push({
              mailId: mailId[i],
              status: 0, // status new mails
            });
          }
        }
        callback('', statusMails);
      } else {
        callback(err, '');
      }
    });
  },

  GETMULTIHASHFIELD2: function (key: string, member: string, mailId: MailBase[], callback: any) {
    let transactions = redisClient.multi();
    mailId.forEach((id) => {
      transactions.HGET(key + id.MailId, member);
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
          } else {
            statusMails.push({
              mailId: mailId[i].MailId,
              status: 0, // status new mails
              type: mailId[i].Type,
            });
          }
        }
        callback('', statusMails);
      } else {
        callback(err, '');
      }
    });
  },

  EXPIREAT: function (key: string, time: number) {
    redisClient.EXPIREAT(key, time, (err, rs) => {
      if (err) console.log(err);
    });
  },

  SISMEMBER: function (key: string, value: string, callback: any) {
    redisClient.SISMEMBER(key, value, (err, rs) => {
      if (rs) callback('', rs);
      else callback(err, '');
    });
  },

  DEL: function (listKey: string[]) {
    listKey.forEach((key) => {
      redisClient.DEL(key, (err, rs) => {
        if (err) console.log(err);
      });
    });
  },

  async SetMultiLeaderBoard(key: string, lsKey: string[], lsValue: any[]) {
    let transaction = redisClient.multi();
    for (let i = 0; i < lsKey.length; i++) {
      transaction.HSET(key, lsKey[i], lsValue[i]);
    }
    await transaction.exec();
  },
};
