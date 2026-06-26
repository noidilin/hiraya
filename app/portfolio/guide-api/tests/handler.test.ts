import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { handleRequest } from '../src/handler.js'

function parse(body: string): Record<string, unknown> {
  return JSON.parse(body) as Record<string, unknown>
}

describe('local Hiraya Guide API contract', () => {
  it('returns minimal public health', async () => {
    const response = await handleRequest({ method: 'GET', path: '/api/health' })

    assert.equal(response.statusCode, 200)
    assert.deepEqual(parse(response.body), { ok: true, service: 'hiraya-guide-api' })
  })

  it('validates chat JSON requests before answering', async () => {
    const response = await handleRequest({ method: 'POST', path: '/api/guide/chat', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: '' }) })
    const payload = parse(response.body)

    assert.equal(response.statusCode, 400)
    assert.equal(payload.status, 'error')
    assert.match(String(payload.answer), /message is required/i)
  })

  it('answers supported local questions with normalized citations and a session id', async () => {
    const response = await handleRequest({ method: 'POST', path: '/api/guide/chat', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: 'How does Hiraya deploy infrastructure?' }) })
    const payload = parse(response.body)

    assert.equal(response.statusCode, 200)
    assert.equal(payload.status, 'answered')
    assert.match(String(payload.sessionId), /^local-guide-session-/)
    assert.deepEqual(payload.citations, [{ title: 'Project Brief', source: 'docs/portfolio/PROJECT_BRIEF.md' }])
  })

  it('reuses caller session id for browser-scoped Guide Sessions', async () => {
    const response = await handleRequest({ method: 'POST', path: '/api/guide/chat', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: 'What security gates are implemented?', sessionId: 'existing-session' }) })
    const payload = parse(response.body)

    assert.equal(payload.sessionId, 'existing-session')
  })

  it('returns refused and not_ready statuses as application-level 200 outcomes', async () => {
    const refused = await handleRequest({ method: 'POST', path: '/api/guide/chat', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: 'What is the weather?' }) })
    const notReady = await handleRequest({ method: 'POST', path: '/api/guide/chat', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: 'simulate not ready ingestion' }) })

    assert.equal(refused.statusCode, 200)
    assert.equal(parse(refused.body).status, 'refused')
    assert.equal(notReady.statusCode, 200)
    assert.equal(parse(notReady.body).status, 'not_ready')
  })
})
