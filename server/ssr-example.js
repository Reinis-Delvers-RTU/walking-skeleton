export const ssrHandler = async (c) => {
  let x = Math.random();

  return c.html(`
        <html>
            <body>
                <h1>TESTS ${x}</h1>
                
            </body>
        </html>
        `);
};
