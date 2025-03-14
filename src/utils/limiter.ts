import { redisClient, connectRedis } from '../config/database/redis';

export async function rateLimiter(ip: string, key: string, limit: number, windowMin: number = 1): Promise<boolean> {
  try {

    if (!ip) {
      console.error('! IP address is undefined in rateLimiter');
      throw new Error('IP address is undefined');
    }

    if (!redisClient) {
      await connectRedis();
    }

    const rateLimitKey = `rate_limit:${ip}:${key}`;
    const currentCount = await redisClient.get(rateLimitKey);
    const count = currentCount ? parseInt(currentCount, 10) : 0;

    if (count >= limit) {
      return false;
    }

    const windowMs = windowMin * 60 * 1000;
    await redisClient.setEx(rateLimitKey, Math.ceil(windowMs / 1000), (count + 1).toString());
    return true;
  } catch (error) {
    console.error('! Error in rateLimiter:', error);
    throw error;
  }
}