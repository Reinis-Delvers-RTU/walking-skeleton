export function registerApiRoutes(app) {

    app.get('/api', (c) => c.json({ message: 'Hello world' }));

}
