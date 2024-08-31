import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.connected = true;
    this.client = createClient()
      .on('error', (err) => {
        console.log(`Redis client not connected to the server: ${err}`);
        this.connected = false;
      });
    this.client.on('connect', () => {
      this.connected = true;
    });
  }

  isAlive() {
    return this.connected;
  }

  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, value) => {
        if (err) {
          reject(err);
        } else {
          resolve(value);
        }
      });
    });
  }

  async set(key, value, time) {
    return new Promise((resolve, reject) => {
      this.client.setex(key, time, value, (err, value) => {
        if (err) {
          reject(err);
        } else {
          resolve(value);
        }
      });
    });
  }

  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, value) => {
        if (err) {
          reject(err);
        } else {
          resolve(value);
        }
      });
    });
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
