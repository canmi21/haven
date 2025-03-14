const { createClient } = require('redis');

export const redisClient = createClient({
  url: process.env.REDIS_URI || 'redis://localhost',
});

redisClient.on('error', (err) => {
  console.error(`! Redis connection error: ${err}`);
  process.exit(1);
});

export async function connectRedis() {
  console.log(`> Redis`);
  console.log(`+ Host: ${process.env.REDIS_URI}`);
  console.log(`+ Port: ${process.env.REDIS_PORT}`);

  const password = process.env.REDIS_PASSWD;
  if (password && password.length < 10) {
    console.warn(`! Please ensure your password is strong enough.`);
    console.warn(`> Try using "openssl rand -base64 64" to generate a secure password.\n`);
    process.exit(1);
  }

  console.log(`+ Password: ${password ? `${password.slice(0, 3)}${'*'.repeat(password.length - 3)}` : 'Not provided.'}`);

  let redisHost = process.env.REDIS_URI || 'localhost';
  let redisPort = process.env.REDIS_PORT || '6379';

  redisHost = redisHost.replace(/^redis:\/\//, '');

  const redisURL = password
    ? `redis://:${encodeURIComponent(password)}@${redisHost}:${redisPort}`
    : `redis://${redisHost}:${redisPort}`;

  const client = createClient({ url: redisURL });

  client.on('error', (err) => {
    console.error(`! Redis connection error: ${err}`);
    process.exit(1);
  });

  try {
    console.log(`# Connecting to Redis.`);
    await client.connect();
    console.log(`+ Redis connection established.\n`);
  } catch (error) {
    console.error(`! Failed to connect to Redis.\n`);
    console.error(`- ${error}`);
    process.exit(1);
  }

  return client;
}
