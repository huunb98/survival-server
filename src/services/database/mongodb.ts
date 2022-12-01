import mongoose = require('mongoose');
import { environment } from '../../config/environment/server';

export class MongoDBDatabase {
  private uri: string = `mongodb://${environment.mongo.host}:${environment.mongo.port}`;

  connectMongoDb(callback: Function) {
    mongoose.connect(
      this.uri,
      {
        dbName: environment.mongo.dbName,
        user: environment.mongo.username,
        pass: environment.mongo.username,
      },
      (error) => {
        if (error === null) callback('');
        else console.log(error);
      }
    );
  }
}
