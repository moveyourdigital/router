/*
Copyright (c) 2024 Move Your Digital, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/**
 * 
 */
export type Context = Readonly<{
  params?: Readonly<Map<string, string>>
  url: Readonly<URL>
  http?: Readonly<{
    version: string
  }>
  user?: {
    id: string
    name: string
    email?: string
  }
}>

/**
 * 
 */
export type Handler<
  T extends Request = Request,
> = (request: T, context: Context, next?: BoundHandler<T>) => Response | Promise<Response>

/**
 * 
 */
export type BoundHandler<T extends Request = Request> = (next?: BoundHandler<T>) => Response | Promise<Response>

/**
 * 
 */
export class Router<T extends Request = Request> {
  /**
   * 
   */
  routes: Map<RegExp, (Router<T> | Handler<T>)[]> = new Map()

  /**
   * 
   * @param handlers 
   */
  add(pattern: string | RegExp, ...handlers: Handler<T>[]): this
  add(pattern: string | RegExp, ...handlers: (Router<T> | Handler<T>)[]): this {
    this.routes.set(
      typeof pattern === "string" ? new RegExp(pattern, "i") : pattern,
      handlers,
    )

    return this
  }

  /**
   * 
   * @param request 
   */
  handle(request: T, context: Context = {
    url: new URL(request.url)
  }, next?: BoundHandler<T>): Response | Promise<Response> {
    const chain: BoundHandler<T>[] = next ? [next] : []
    const headers: string[] = []

    request.headers.forEach((value, key) => headers.push(`${key}: ${value}`))

    const message = `${request.method} ${context.url?.pathname}${context.http ? ` HTTP/${context.http.version}` : ''}\n${headers.join('\n')}`

    for (const [key, handlers] of this.routes) {
      const result = message.match(key)

      if (!result) {
        continue
      }

      const bindings = [request, {
        ...context,
        params: Object.freeze(
          new Map(Object.entries(result.groups || {})),
        )
      }]

      chain.push(...handlers
        .map(fn => (fn instanceof Router 
          ? fn.handle.bind(fn, ...bindings) 
          : fn.bind(this, ...bindings)) as BoundHandler<T>
        )
      )
    }

    return chain.reduceRight((next, current) => () => current(next))()
  }
}