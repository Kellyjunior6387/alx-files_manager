import sha1 from 'sha1';
import dbClient from '../utils/db';

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
}

export default UserController;
