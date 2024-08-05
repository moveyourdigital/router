import assert from 'node:assert'
import { describe, test } from 'node:test'
import { Router } from './router'
import { notFound } from './middlewares'

describe('router', () => {
  const router = new Router()
    .add(/.*/, notFound())
    .add(/^POST/, () => new Response('Foo', {
      status: 201
    }))
    .add(/^GET \/\s/, () => {
      return Response.json('Hello root!', {
        status: 200
      })
    })
    .add(/^GET \/world\s/, () => {
      return Response.json('Hello world!', {
        status: 200
      })
    })

  test('returns 200', async () => {
    const response = await router.handle(new Request('http://foo.bar/world'))

    assert.equal(response.status, 200)
    assert.equal(await response.json(), 'Hello world!')
  })

  test('returns 404', async () => {
    const response = await router.handle(new Request('http://foo.bar/non-existing'))

    assert.equal(response.status, 404)
    assert.equal(await response.text(), 'Not found')
  })

  test('returns 201', async () => {
    const response = await router.handle(new Request('http://foo.bar/', {
      method: 'POST'
    }))

    assert.equal(response.status, 201)
    assert.equal(await response.text(), 'Foo')
  })
})
