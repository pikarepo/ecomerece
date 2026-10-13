import { createClient } from 'redis';

export const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on('error', (err) => {
  console.error('Redis Error:', err);
});

void (async () => {
  await redis.connect();
})().catch((err) => {
  console.error('Redis connection failed:', err);
  process.exit(1);
});
