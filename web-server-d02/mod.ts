
async function handleRequest(request: Request) {
    const { pathname } = new URL(request.url);
  
    // This is how the proxy works:
    // 1. A request comes in for a specific asset.
    // 2. We construct a URL to that asset.
    // 3. We fetch the asset and respond to the request.
  
    // Check if the request is for style.css.
    if (pathname.startsWith("/index.html")) {
      //  Construct a new URL to style.css by using the URL
      //  of the script (mod.ts) as base (import.meta.url).
      const style = new URL("index.html", import.meta.url);
      // Fetch the asset and return the fetched response
      // to the client.
      return fetch(style);
    }
    if (pathname.startsWith("/assets/index.html")) {
      //  Construct a new URL to style.css by using the URL
      //  of the script (mod.ts) as base (import.meta.url).
      const style = new URL("assets/index.html", import.meta.url);
      // Fetch the asset and return the fetched response
      // to the client.
      return fetch(style);
    }
  
    return new Response(
      `<html>
        <head>
          <link rel="stylesheet" href="style.css" />
        </head>
        <body>
          <h1>Example</h1>
        </body>
      </html>`,
      {
        headers: {
          "content-type": "text/html; charset=utf-8",
        },
      },
    );
  }
addEventListener("fetch",(e : FetchEvent) => {
    e.respondWith(handleRequest(e.request))
})