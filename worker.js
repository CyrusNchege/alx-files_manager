import Bull from 'bull';
import { ObjectId } from 'mongodb';
import thumbnail from 'image-thumbnail';
import dbClient from './utils/db';

const fileQueue = new Bull('fileQueue');

fileQueue.process(async (job) => {
  const { fileId, userId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }

  if (!userId) {
    throw new Error('Missing userId');
  }

  const userObjectId = ObjectId(userId);

  const file = await dbClient.filesCollection.findOne({
    _id: ObjectId(fileId),
    userId: userObjectId,
  });

  if (!file) {
    throw new Error('File not found');
  }

  const imageSizes = [500, 250, 100];

  await Promise.all(
    imageSizes.map(async (size) => {
      const thumbnailOptions = { width: size };
      const thumbnailBuffer = await thumbnail(file.localPath, thumbnailOptions);
      const thumbnailPath = `${file.localPath}_${size}`;

      await new Promise((resolve, reject) => {
        fs.writeFile(thumbnailPath, thumbnailBuffer, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    }),
  );
});
