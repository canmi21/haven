import { redisClient, connectRedis } from '../config/database/redis';

export async function rateLimiter(ip: string, key: string, limit: number, windowMs: number): Promise<boolean> {
  try {
    if (!redisClient) {
      await connectRedis();
    }

    const rateLimitKey = `rate_limit:${ip}:${key}`;

    const currentCount = await redisClient.get(rateLimitKey);
    const count = currentCount ? parseInt(currentCount, 10) : 0;

    if (count >= limit) {
      return false;
    }

    await redisClient.setEx(rateLimitKey, windowMs / 1000, (count + 1).toString());
    return true;
  } catch (error) {
    console.error('! Redis error in rateLimiter:', error);
    throw error;
  }
}