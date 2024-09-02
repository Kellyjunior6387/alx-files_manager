import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UserController {
  static async postNew(request, response) {
    const email = request.body ? request.body.email : null;
    const password = request.body ? request.body.password : null;

    if (!email) {
      response.status(400).json({ error: 'Missing email' });
      return;
    }

    if (!password) {
      response.status(400).json({ error: 'Missing password' });
      return;
    }
    try {
      const existingUser = await dbClient.usersCollection().findOne({ email });
      if (existingUser) {
        response.status(400).json({ error: 'Already exists' });
        return;
      }
      const hashedPassword = sha1(password);
      const insertion = await dbClient.usersCollection().insertOne({
        email, password: hashedPassword,
      });

      const newUser = {
        email,
        id: insertion.insertedId,
      };

      response.status(201).json(newUser);
    } catch (err) {
      console.log(err);
      response.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // A function to obtain a user based on the authentication token
  static async getMe(request, response) {
    const token = request.header('X-Token');

    if (!token) {
      response.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      const userId = await redisClient.get(`auth_${token}`);

      if (!userId) {
        response.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const usersCollection = await dbClient.usersCollection();
      const user = await usersCollection.findOne({ _id: ObjectId(userId) });

      if (!user) {
        response.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const userResponse = {
        id: user._id,
        email: user.email,
      };

      response.status(200).json(userResponse);
    } catch (err) {
      console.error('Error retrieving user information:', err);
      response.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default UserController;
