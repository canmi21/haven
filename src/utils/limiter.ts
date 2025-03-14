import { redisClient, connectRedis } from '../config/database/redis';

export async function rateLimiter(ip: string, path: string, limit: number, windowMin: number = 1): Promise<boolean> {
  try {
    if (!ip) {
      console.error('! IP address is undefined in rateLimiter');
      throw new Error('IP address is undefined');
    }

    if (!redisClient) {
      await connectRedis();
    }

    const rateLimitKey = `rate_limit:${ip}:${path}`;
    const logKey = `rate_limit_log:${ip}:${path}`;
    const currentCount = await redisClient.get(rateLimitKey);
    const count = currentCount ? parseInt(currentCount, 10) : 0;

    if (count >= limit) {
      const logged = await redisClient.get(logKey);
      if (!logged) {
        console.log(`! Rate limit exceeded for IP: ${ip} on path: ${path}`);
        const windowMs = windowMin * 60 * 1000;
        await redisClient.setEx(logKey, Math.ceil(windowMs / 1000), '1');
      }
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