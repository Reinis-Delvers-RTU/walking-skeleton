import { Hono } from '@hono/hono';
import { cors } from '@hono/hono/cors';
import { logger } from '@hono/hono/logger';
import postgres from 'postgres';
import { Redis } from 'ioredis';
import { redisCacheMiddleware } from './cache-middleware.js';

const sql = postgres();
const app = new Hono();
const redis = new Redis(6379, 'redis');

app.get('/redis-test', async (c) => {
    let count = await redis.get('test');
    if (!count) {
        count = '0';
    }
    else {
        count = Number(count);
    }

    count++;

    await redis.set('test', count);
    return c.json({ count });
});

app.use('/*', cors());
app.use('/*', logger());

app.get('/', (c) => c.json({message: 'Hello world!'}));
app.get("/todos", async (c) => {
    const todos = await sql`SELECT * FROM todos`;
    return c.json(todos);
});

app.get("/hello/*", redisCacheMiddleware,);

app.get("/hello/:name", async (c) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return c.json({ message: `Hello ${c.req.param("name")}!` });
});

export default app;
export { redis };