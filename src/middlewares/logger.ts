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

import { BoundHandler, Context, Handler } from "../router"

/**
 * Logger middleware
 *
 * @since 0.1.0
 */
export function logger({
  format = "%h %l %u [%t] \"%r\" %>s %b %D",
  console = global.console,
}: {
  format?: string
  console?: Console
} = {}): Handler {
  return async function (request: Request, context: Context, next?: BoundHandler) {
    const start = new Date()
    const response = next ? await next() : Response.error()

    console.info(
      format
        .replace(/%h|%l|%u|%t|%r|%>s|%b|%D/g, function (value) {
          switch (value) {
            case '%h': return context.url.host
            case '%l': return '-' // The identd protocol can reveal user information that might be considered sensitive. As such, many web servers will simply log a - in place of this value.
            case '%u': return context.user?.id || '-'
            case '%t': return start.toISOString()
            case '%r': return `${request.method} ${context.url.href} HTTP/${context.http?.version || '1.1'}`
            case '%>s': return `${response.status || 500}`
            case '%b': return response.headers.get('content-length') || '-'
            case '%D': return `${new Date().getTime() - start.getTime()}ms`
            default: return ''
          }
        })
    )

    return response
  }
}
