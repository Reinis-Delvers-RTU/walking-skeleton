const getInitialItems = async () => {
    const items = [];
    for (let i = 0; i < 10; i++) {
        items.push({ name: `Item ${i}` });
        await new Promise((resolve) => setTimeout(resolve, 20));
    }
    return items;
};

const getRemainingItems = async () => {
    const items = [];
    for (let i = 0; i < 90; i++) {
        items.push({ name: `Item ${i}` });
        await new Promise((resolve) => setTimeout(resolve, 20));
    }
    return items;
};

export function registerHybridRoutes(app) {
    app.get('/items/remaining', async (c) => {
        const items = await getRemainingItems();
        return c.json(items);
    });

    app.get('/hybrid-example', async(c) => {
        const items = await getInitialItems();
        return c.html( `
            <html>
                <head>
                    <script>

                        document.addEventListener('DOMContentLoaded', () => {
                            const observer = new IntersectionObserver((entries, obs) => {
                                if(entries[0].isIntersecting) {
                                    import("/public/loadRemaining.js").then((module) => {
                                        module.loadRemaining();
                                    })
                                    obs.disconnect();
                                }
                            });

                            observer.observe(document.getElementById("last"));

                        });
                    </script>
                </head>
                <body>
                    <ul id="list"> ${items.map(item => `<li>${item.name}</li>`)}
                        <li id="last">Loading..</li>
                    </ul>
                </body>
            </html>
        `);
    });
}