import { MongoDBDatabase } from './database/mongodb';

export = {
  Init: async function () {
    await new MongoDBDatabase().connectAsync();
  },
};
