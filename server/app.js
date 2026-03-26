import { Hono } from '@hono/hono';
import { cors } from '@hono/hono/cors';
import { logger } from '@hono/hono/logger';
import { Redis } from 'ioredis';
import postgres from 'postgres';
import { redisCacheMiddleware } from './cache-middleware.js';
import { redisProducer } from './redis-queue.js';
import { ssrHandler } from './ssr-example.js';
import { serveStatic } from '@hono/hono/deno';
import { registerHybridRoutes } from './hybrid-rendering.js';
import { registerApiRoutes } from './api.js';

const app = new Hono();
registerHybridRoutes(app);
registerApiRoutes(app);
const sql = postgres();
const redis = new Redis(6379, 'redis');

const REPLICA_ID = crypto.randomUUID();

app.get('/redis-test', async (c) => {
  let count = await redis.get('test');
  if (!count) {
    count = 0;
  } else {
    count = Number(count);
  }

  count++;

  await redis.set('test', count);
  return c.json({ count });
});

app.use('/*', cors());
app.use('/*', logger());
app.use('/*', async (c, next) => {
  c.res.headers.set('X-Replica-Id', REPLICA_ID);
  await next();
});

app.get('/', (c) => c.json({ message: 'Hello world!' }));



app.get('/todos', async (c) => {
  const todos = await sql`SELECT * FROM todos`;
  return c.json(todos);
});

app.get('/ssr', ssrHandler);

//app.get('/hello/*', redisCacheMiddleware);

app.get('/hello/:name', async (c) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return c.json({ message: `Hello ${c.req.param('name')}!` });
});

app.post('/users/:name', async (c) => {
  const name = c.req.param('name');
  console.log('IELIEK RINDAA');
  await redisProducer.lpush('users', JSON.stringify({ name }));
  c.status(202);
  console.log('accepted');
  return c.body('Accepted');
});

app.get('/ssr', ssrHandler);

app.use('/public/*', serveStatic({ root: '.' }));

app.get('/items', async (c) => {
  const items = [
    { name: 'Apple' },
    { name: 'Banana' },
    { name: 'Cherry' },
    { name: 'Date' },
    { name: 'Elderberry' },
  ];
  return c.json(items);
});

export default app;
export { redis };
