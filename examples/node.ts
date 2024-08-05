import { createServer } from "http"
import { bind } from "@moveyourdigital/router/node"
import { Router } from "@moveyourdigital/router"
import { auth, logger, notFound, throwable } from "@moveyourdigital/router"

const router = new Router()
  .add(/.*/, logger(), throwable(), notFound())
  .add(/^POST/, () => new Response())
  .add(/^GET \/private\s/, auth({ secret: 'test' }), () => new Response())
  .add(/^GET \/(.*\n)+user-agent: (?<agent>.*)/i, (req, ctx) => {
    return Response.json(`Hello ${ctx.params?.get('agent')}`, {
      status: 201
    })
  })

bind(createServer, router).listen(3001)
