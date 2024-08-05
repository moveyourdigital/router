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
 * Throw catcher middleware
 *
 * @since 0.1.0
 */
export function throwable(): Handler {
  return async function (request: Request, _context: Context, next?: BoundHandler) {
    try {
      return next ? await next() : Response.error()
    } catch (err) {
      if (err instanceof Response) {
        return err
      }

      const json = request.headers.get('accept')?.match('application/json')
      const status = typeof err === 'object' && 'status' in err && typeof err.status === 'number' ? err.status : 500

      return json ? Response.json(err, { status }) : new Response(err, { status })
    }
  }
}