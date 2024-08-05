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

import { Readable } from 'stream';
import { Router } from './router';
import type { createServer } from 'http'
import type { TLSSocket } from 'tls'
import { ReadableStream as NodeReadableStream } from 'stream/web';
import { List } from 'funtastic';

/**
 * 
 * @param serve 
 * @param router 
 * @param param2 
 * @returns 
 */
export function bind(serve: typeof createServer, router: Router, {
  base,
}: {
  base?: string | URL
} = {}) {
  return serve(async function (incoming, outgoing) {
    const controller = new AbortController()

    incoming.once('aborted', () => controller.abort())

    const proto = incoming.headers['x-forwarded-proto']
      || incoming.headers.forwarded?.match(/proto=(http|https)/)?.at(1)
      || (incoming.socket as TLSSocket).encrypted ? 'https' : 'http'

    const [host, port = proto === 'https' ? 443 : 80] = incoming.headers.host?.split(':') || [
      incoming.socket.localAddress,
      incoming.socket.localPort,
    ]

    const url = new URL(incoming.url || '/', base || `${proto}://${host}${port ? `:${port}` : ''}`)
    
    const request = new Request(url, {
      body: incoming.method === 'GET' || incoming.method === 'HEAD' ? null : Readable.toWeb(incoming) as ReadableStream<Uint8Array>,
      headers: new Headers(List.toPairs(incoming.rawHeaders)),
      signal: controller.signal,
      referrer: incoming.headers.referer,
    })

    const response = await router.handle(request, {
      url,
      http: { version: incoming.httpVersion }
    })
    const body = response.body

    outgoing.statusCode = response.status ? response.status : 500
    response.headers.forEach((value, key) => outgoing.setHeader(key, value))

    if (body) {
      Readable
        .fromWeb(body as NodeReadableStream<Uint8Array>)
        .pipe(outgoing)
    } else {
      outgoing.end()
    }
  })
}
