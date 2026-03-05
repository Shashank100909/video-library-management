import { createClient } from 'redis';

export const redisClient = createClient({
  url: 'redis://localhost:6379',
});

redisClient.connect().then(() => {
  console.log('Redis connected');
}).catch(console.error);