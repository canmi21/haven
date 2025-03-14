import { redisClient } from '../config/database/redis';

export const rateLimiter = async (key: string, limit: number, windowMs: number) => {
  const currentTimestamp = Date.now();
  const windowKey = `${key}:${Math.floor(currentTimestamp / windowMs)}`;

  const requestCount = await redisClient.get(windowKey);
  const count = requestCount ? parseInt(requestCount) : 0;

  if (count >= limit) {
    throw new Error('Rate limit exceeded');
  }

  await redisClient.multi()
    .incr(windowKey)
    .expire(windowKey, windowMs / 1000)
    .exec();

  return true;
};
