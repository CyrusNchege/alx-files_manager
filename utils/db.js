import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const DB_HOST = process.env.DB_HOST || 'localhost';
    const DB_PORT = process.env.DB_PORT || 27017;
    const DB_USER = process.env.DB_USER || 'myUserAdmin';
    const DB_PASS = process.env.DB_PASS || 'admin';
    const DB_NAME = process.env.DB_NAME || 'files_manager';
    const uri = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
    this.client = new MongoClient(uri);

    this.client.connect((err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Connection to database established');
      }
    });

    this.db = this.client.db(DB_NAME);
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    return this.db.collection('users').countDocuments();
  }

  async nbFiles() {
    return this.db.collection('files').countDocuments();
  }
}

const dbClient = new DBClient();
export default dbClient;
