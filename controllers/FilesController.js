import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class FilesController {
  static async postUpload(req, res) {
    const token = req.header('X-token');
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      const userId = await redisClient.get(`auth_${token}`);

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const usersCollection = await dbClient.usersCollection();
      const user = await usersCollection.findOne({ _id: ObjectId(userId) });

      if (!user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const {
        name, type, parentId = 0, isPublic = false, data,
      } = req.body;

      // Validation checks
      if (!name) {
        res.status(400).json({ error: 'Missing name' });
        return;
      }
      if (!['folder', 'file', 'image'].includes(type)) {
        res.status(400).json({ error: 'Missing type' });
        return;
      }
      if (type !== 'folder' && !data) {
        res.status(400).json({ error: 'Missing data' });
        return;
      }
      if (parentId !== 0) {
        const parentFile = await dbClient.usersCollection().findOne({ _id: parentId });
        if (!parentFile) {
          res.status(400).json({ error: 'Parent not found' });
          return;
        }
        if (parentFile.type !== 'folder') {
          res.status(400).json({ error: 'Parent is not a folder' });
          return;
        }
      }
      const newFile = {
        userId,
        name,
        type,
        isPublic,
        parentId,
      };

      if (type === 'folder') {
        // Insert folder directly
        const result = await dbClient.usersCollection().insertOne(newFile);
        newFile._id = result.insertedId;
        res.status(201).json(newFile);
        return;
      }
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      const localPath = path.join(folderPath, uuidv4());

      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      // Write the file data to disk
      try {
        const decodedData = Buffer.from(data, 'base64');
        fs.writeFileSync(localPath, decodedData);
      } catch (error) {
        res.status(500).json({ error: 'Error saving the file' });
        return;
      }
      // Add localPath to newFile document
      newFile.localPath = localPath;

      // Insert file into DB
      const result = await dbClient.usersCollection().insertOne(newFile);
      newFile._id = result.insertedId;

      res.status(201).json(newFile);
      return;
    } catch (err) {
      console.error('Error retrieving user information:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
export default FilesController;
module.exports = FilesController;
