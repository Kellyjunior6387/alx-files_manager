import redisClient from '../utils/redis';
import dbClient from '../utils/db';

export default class AppController {
  static getStatus(_, response) {
    response.status(200).json({
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    });
  }

  static getStats(_, response) {
    Promise.all([dbClient.nbFiles(), dbClient.nbUsers()])
      .then(([users, files]) => {
        response.status(200).json({
          users,
          files,
        });
      });
  }
}
