import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { handler, handleRequest } from '../src/handler.js'
import { resetOriginSecretCacheForTest } from '../src/origin-secret.js'

function parse(body: string): Record<string, unknown> {
  return JSON.parse(body) as Record<string, unknown>
}

describe('local Hiraya Guide API contract', () => {
  it('returns minimal public health', async () => {
    const response = await handleRequest({ method: 'GET', path: '/api/health' })

    assert.equal(response.statusCode, 200)
    assert.deepEqual(parse(response.body), { ok: true, service: 'hiraya-guide-api' })
  })

  it('adapts API Gateway HTTP API events to the public request handler', async () => {
    const response = await handler({ requestContext: { http: { method: 'GET', path: '/api/health' } }, rawPath: '/api/health' })

    assert.equal(response.statusCode, 200)
    assert.deepEqual(parse(response.body), { ok: true, service: 'hiraya-guide-api' })
  })

  it('validates chat JSON requests before answering', async () => {
    const wrongMethod = await handleRequest({ method: 'GET', path: '/api/guide/chat' })
    const missingMessage = await handleRequest({ method: 'POST', path: '/api/guide/chat', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: '' }) })
    const nonJson = await handleRequest({ method: 'POST', path: '/api/guide/chat', headers: { 'content-type': 'text/plain' }, body: 'hello' })
    const oversized = await handleRequest({ method: 'POST', path: '/api/guide/chat', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: 'x'.repeat(1001) }) })
    const invalidSession = await handleRequest({ method: 'POST', path: '/api/guide/chat', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: 'Hi', sessionId: 'bad session id with spaces' }) })

    assert.equal(wrongMethod.statusCode, 405)
    assert.match(String(parse(wrongMethod.body).answer), /POST/i)
    assert.equal(missingMessage.statusCode, 400)
    assert.equal(parse(missingMessage.body).status, 'error')
    assert.match(String(parse(missingMessage.body).answer), /message is required/i)
    assert.equal(nonJson.statusCode, 400)
    assert.match(String(parse(nonJson.body).answer), /application\/json/i)
    assert.equal(oversized.statusCode, 400)
    assert.match(String(parse(oversized.body).answer), /1000 characters/i)
    assert.equal(invalidSession.statusCode, 400)
    assert.match(String(parse(invalidSession.body).answer), /sessionId/i)
  })

  it('requires the CloudFront origin secret when configured', async () => {
    process.env.GUIDE_ORIGIN_SECRET = 'expected-secret'
    try {
      const forbidden = await handleRequest({ method: 'GET', path: '/api/health' })
      const allowed = await handleRequest({ method: 'GET', path: '/api/health', headers: { 'x-hiraya-origin-secret': 'expected-secret' } })

      assert.equal(forbidden.statusCode, 403)
      assert.equal(allowed.statusCode, 200)
    } finally {
      delete process.env.GUIDE_ORIGIN_SECRET
      resetOriginSecretCacheForTest()
    }
  })

  it('logs only minimal operational metadata', async () => {
    const lines: string[] = []
    const originalInfo = console.info
    console.info = (message?: unknown) => {
      lines.push(String(message))
    }

    try {
      await handleRequest({ method: 'POST', path: '/api/guide/chat', headers: { 'content-type': 'application/json', cookie: 'private-cookie' }, body: JSON.stringify({ message: 'super secret prompt' }) })
    } finally {
      console.info = originalInfo
    }

    assert.equal(lines.length, 1)
    assert.deepEqual(Object.keys(parse(lines[0])).sort(), ['citationCount', 'latencyMs', 'route', 'status'])
    assert.doesNotMatch(lines[0], /super secret prompt|private-cookie|content-type/i)
  })

  it('answers supported local questions with normalized citations and a session id', async () => {
    const response = await handleRequest({ method: 'POST', path: '/api/guide/chat', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: 'How does Hiraya deploy infrastructure?' }) })
    const payload = parse(response.body)

    assert.equal(response.statusCode, 200)
    assert.equal(payload.status, 'answered')
    assert.match(String(payload.sessionId), /^local-guide-session-/)
    assert.deepEqual(payload.citations, [{ title: 'Project Brief', source: 'curated/PROJECT_BRIEF.md' }])
  })

  it('refuses presentation-surface questions without leaking the presentation term', async () => {
    const response = await handleRequest({ method: 'POST', path: '/api/guide/chat', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: 'How does Hiraya deploy portfolio changes?' }) })
    const payload = parse(response.body)

    assert.equal(response.statusCode, 200)
    assert.equal(payload.status, 'refused')
    assert.match(String(payload.answer), /Hiraya microservice project/)
    assert.doesNotMatch(response.body, /portfolio/i)
    assert.deepEqual(payload.citations, [])
  })

  it('reuses caller session id for browser-scoped Guide Sessions', async () => {
    const response = await handleRequest({ method: 'POST', path: '/api/guide/chat', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: 'What security gates are implemented?', sessionId: 'existing-session' }) })
    const payload = parse(response.body)

    assert.equal(payload.sessionId, 'existing-session')
  })

  it('returns refused and not_ready statuses as application-level 200 outcomes', async () => {
    const refused = await handleRequest({ method: 'POST', path: '/api/guide/chat', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: 'What is the weather?' }) })
    const secret = await handleRequest({ method: 'POST', path: '/api/guide/chat', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: 'What is the private payroll password for Hiraya?' }) })
    const notReady = await handleRequest({ method: 'POST', path: '/api/guide/chat', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: 'simulate not ready ingestion' }) })

    assert.equal(refused.statusCode, 200)
    assert.equal(parse(refused.body).status, 'refused')
    assert.equal(secret.statusCode, 200)
    assert.equal(parse(secret.body).status, 'refused')
    assert.doesNotMatch(String(parse(secret.body).answer), /payroll password/i)
    assert.equal(notReady.statusCode, 200)
    assert.equal(parse(notReady.body).status, 'not_ready')
  })
})
