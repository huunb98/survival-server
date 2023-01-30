import { leaderboardManager } from '../leaderboard/leaderboardManager';
import { mailManager } from '../mails/mailManager';
import { MongoDBDatabase } from './database/mongodb';

export = {
  Init: async function () {
    await new MongoDBDatabase().connectAsync();

    mailManager.reloadConfig();
    leaderboardManager.initLeaderboard();
  },
};
