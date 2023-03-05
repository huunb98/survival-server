import mongoose, { ConnectOptions } from 'mongoose';
import { environment } from '../../config/environment/server';

export class MongoDBDatabase {
  private uri: string = `mongodb://${environment.mongo.host}:${environment.mongo.port}`;

  async connectAsync() {
    const options: ConnectOptions = {
      dbName: environment.mongo.dbName,
      user: environment.mongo.username,
      pass: environment.mongo.password,
      keepAlive: true,
    };

    mongoose.connection.on('error', (err) => {
      console.log('MongoDB error Database.ts: ' + err);
    });

    try {
      await mongoose.connect(this.uri, options);
      console.log('MongoDb connected ');
    } catch (e) {
      console.log('MongoDb error : ' + e);
    }
  }
}
