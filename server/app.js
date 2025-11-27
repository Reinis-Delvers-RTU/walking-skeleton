import { Hono } from '@hono/hono';
import { cors } from '@hono/hono/cors';
import { logger } from '@hono/hono/logger';
import postgres from 'postgres';
import { cache } from '@hono/hono/cache';

const sql = postgres();
const app = new Hono();

app.use('/*', cors());
app.use('/*', logger());

app.get('/', (c) => c.json({message: 'Hello world!'}));
app.get("/todos", async (c) => {
    const todos = await sql`SELECT * FROM todos`;
    return c.json(todos);
})

app.get("/cache-demo", cache({
    cacheName: "demo-cache",
    wait: true,
}))

app.get("/cache-demo", async (c) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return c.json({message: "Cache demo"});
});

app.get("/hello/*", cache({
    cacheName: "hello-cache",
    wait: true,
}))

app.get("/hello/:name", async (c) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return c.json({message: `Hello ${c.req.param("name")}`});
});

app.post("/hello", async (c) => {
    await caches.delete("hello-cache");
    return c.json({message: "Hello Cache cleared"});
});

export default app;