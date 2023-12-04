import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import RedisClient from '../utils/redis';

class UsersController {
  static async postNew(request, response) {
    const userEmail = request.body.email;
    if (!userEmail) {
      return response.status(400).send({ error: 'Missing email' });
    }
    const userPassword = request.body.password;
    if (!userPassword) {
      return response.status(400).send({ error: 'Missing password' });
    }
    const passeordExists = await dbClient.usersCollection.findOne({
      email: userEmail,
    });
    if (passeordExists) {
      return response.status(400).send({ error: 'Already exist' });
    }
    const hashedPassword = sha1(userPassword);
    const user = await dbClient.usersCollection.insertOne({
      email: userEmail,
      password: hashedPassword,
    });
    return response.status(201).send({ id: user.insertedId, email: userEmail });
  }

  static async getMe(request, response) {
    const token = request.header('X-Token');
    if (!token) {
      return response.status(401).send({ error: 'Unauthorized' });
    }
    const redisToken = await RedisClient.get(`auth_${token}`);
    if (!redisToken) {
      return response.status(401).send({ error: 'Unauthorized' });
    }
    const user = await dbClient.usersCollection.findOne({ _id: ObjectId(redisToken) });
    if (!user) {
      return response.status(401).send({ error: 'Unauthorized' });
    }
    return response.status(200).send({ id: user._id, email: user.email });
  }
}

export default UsersController;
