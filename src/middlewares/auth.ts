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
 * 
 */
class AuthError extends Error {
  constructor(message: string, public status: number) {
    super(message)
  }
}

/**
 * Authentication middleware
 *
 * @since 0.1.0
 */
export function auth({
  secret,
  authenticate,
  header = 'authorization',
}: {
  secret?: string | Buffer,
  authenticate?: (request: Request, context: Context) => boolean
  header?: string
} = {}): Handler {
  return async (request: Request, context: Context, next?: BoundHandler) => {
    if (authenticate && authenticate(request, context)) {
      return next ? await next() : Response.error()
    }

    if (secret && !request.headers.has(header)) {
      throw new AuthError('Forbidden', 403)
    }

    const [, token] = [
      ...(request.headers.get(header)?.match(/^\s*([\d\w_-]+)\s*$/) || []),
    ]

    if (token != secret) {
      throw new AuthError('Unauthorized', 401)
    }

    return next ? await next() : Response.error()
  }
}
