# RegexRouter

Unlike traditional routers that only match the path and method, RegexRouter allows to match any part of the HTTP request message, which includes headers, method, path, URL and query parameters, enabling customized and dynamic routing logic.

**Notice:** currently available in beta; avoid using in production.

## Key Features
- **Match Any Part of the Request**: Goes beyond the basics of path and method matching: routes can be regex-based on headers, query strings, cookies, and more.

- **Flexible**: Provides and allows extension with middlewares and uses standard Web API syntax.

- **Easy to Use**: Plugin to any environment. It support's node.js, browser, edge, workers, etc.

- **High Performance**: Being small and straighforward, it is optimized for speed and efficiency to handle high traffic loads without compromising on routing capabilities.

## Getting Started
### Installation
Install RegexRouter via npm:
```
npm install @moveyourdigital/router
```

### Basic Usage

```ts
import { createServer } from "http"
import { bind } from "../src/node/node-router"
import { Router } from "../src/router"
import { auth, logger, notFound, throwable } from "../src/middlewares"

const router = new Router()
  .add(/.*/, logger(), throwable(), notFound())
  .add(/^POST/, () => new Response())
  .add(/^GET \/private\s/, auth({ secret: 'test' }), () => new Response())
  .add(/^GET \/\s/, () => {
    return Response.json('Hello world!', {
      status: 201
    })
  })

bind(createServer, router).listen(3001) // bind for Node JS createServer
```

### Development
To watch for changes in `src` directory.
```bash
npm start
```
To bundle for production
```bash
npm run build
```
Unit tests are located in
```bash
npm t
```

### Contributions
This project is open to contributions. Feel free to discuss in Issues any implementation details first.
