import { v4 as uuidv4 } from 'uuid';
import basicAuth from 'basic-auth';
import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(req, response) {
    const credentials = basicAuth(req);
    if (!credentials || !credentials.name || !credentials.pass) {
      response.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const email = credentials.name;
    const password = sha1(credentials.pass);

    try {
      const usersCollection = await dbClient.usersCollection();
      const user = await usersCollection.findOne({ email, password });

      if (!user) {
        response.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const token = uuidv4();
      const key = `auth_${token}`;
      await redisClient.set(key, user._id.toString(), 86400); // Store for 24 hours (86400 seconds)

      response.status(200).json({ token });
    } catch (err) {
      console.error('Error during authentication:', err);
      response.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getDisconnect(req, res) {
    const token = req.header('X-token');
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const key = `auth_${token}`;
    const userId = redisClient.get(key);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await redisClient.del(key);
    res.status(204).send();
  }
}
export default AuthController;
module.exports = AuthController;
