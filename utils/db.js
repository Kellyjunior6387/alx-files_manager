const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files-manager';
    const uri = `mongodb://${host}:${port}`;
    this.client = new MongoClient(uri);
    this.connected = false;
    this.client.connect()
      .then(() => {
        this.database = this.client.db(database);
        this.connected = true;
      })
      .catch((err) => {
        console.error('Failed to connect to MongoDB:', err);
      });
  }

  async isAlive() {
    return this.connected;
  }

  async nbUsers() {
    if (!this.connected) throw new Error('MongoClient is not connected');
    return this.database.collection('users').countDocuments();
  }

  async nbFiles() {
    if (!this.connected) throw new Error('MongoClient is not connected');
    return this.database.collection('files').countDocuments();
  }
}
const dbClient = new DBClient();
module.exports = dbClient;
