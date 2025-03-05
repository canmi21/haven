import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

async function testMongoConnection() {
  const uri = process.env.MONGO_URI;
  const user = process.env.MONGO_USER;
  const password = process.env.MONGO_PASSWD;

  if (!uri || !user || !password) {
    console.error('[Mongo] Missing required environment variables.');
    process.exit(1);
  }

  console.log('[Mongo] Try to connect MongoDB...');

  try {
    const connectionPromise = mongoose.connect(uri, {
      user: user,
      pass: password,
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('[Mongo] Connection timed out after 10 seconds.')), 10000)
    );

    await Promise.race([connectionPromise, timeoutPromise]);
    console.log('[Mongo] Connected successfully.\n');
  } catch (error) {
    console.error('[Mongo] Connection failed:', error.message, '\n');
    process.exit(1);
  }
}

// 运行测试
testMongoConnection();
