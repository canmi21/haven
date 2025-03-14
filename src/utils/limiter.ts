import { redisClient } from '../config/database/redis';

export async function rateLimiter(key: string, limit: number, windowMs: number) {
  try {
    console.log('> Connecting to Redis...');
    await redisClient.connect();
    console.log('> Redis connected successfully.');

    const currentCount = await redisClient.get(key);

    if (currentCount && parseInt(currentCount, 10) >= limit) {
      throw new Error('Rate limit exceeded');
    }

    await redisClient.setEx(key, windowMs / 1000, (parseInt(currentCount || '0', 10) + 1).toString());
    console.log('> Rate limit checked and updated.');
  } catch (error) {
    console.error('! Redis error:', error);
    throw error;
  } finally {
    // Ensure the Redis client stays open
    // Avoid closing the client here if it is used elsewhere in the app
  }
}