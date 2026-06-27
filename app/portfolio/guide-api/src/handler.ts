import { randomUUID, timingSafeEqual } from 'node:crypto'
import { answerWithBedrock } from './bedrock.js'
import { localAnsweredCitation, normalizeCitations } from './citations.js'
import type { GuideChatRequest, GuideChatResponse, HttpRequest, HttpResponse } from './contract.js'
import { expectedOriginSecret } from './origin-secret.js'
import { headerValue, parseChatRequest } from './validation.js'

type ApiGatewayV2Event = {
  requestContext?: { http?: { method?: string; path?: string } }
  rawPath?: string
  headers?: Record<string, string | undefined>
  body?: string | null
}

export async function handler(event: ApiGatewayV2Event): Promise<HttpResponse> {
  return handleRequest({
    method: event.requestContext?.http?.method ?? 'GET',
    path: event.rawPath ?? event.requestContext?.http?.path ?? '/',
    headers: event.headers,
    body: event.body,
  })
}

const jsonHeaders = { 'content-type': 'application/json; charset=utf-8' }

export async function handleRequest(request: HttpRequest): Promise<HttpResponse> {
  const started = Date.now()
  let status = 'unknown'
  let citationCount = 0

  try {
    if (!(await isAllowedByOriginSecret(request))) {
      status = 'forbidden'
      return json(403, { status: 'error', answer: 'Forbidden.', citations: [] })
    }

    if (request.method === 'GET' && request.path === '/api/health') {
      status = 'ok'
      return json(200, { ok: true, service: 'hiraya-guide-api' })
    }

    if (request.path === '/api/guide/chat' && request.method !== 'POST') {
      status = 'method_not_allowed'
      return json(405, { status: 'error', answer: 'Use POST for Hiraya Guide chat.', citations: [] })
    }

    if (request.method === 'POST' && request.path === '/api/guide/chat') {
      const parsed = parseChatRequest(request)
      if (!parsed.ok) {
        status = 'validation_error'
        return json(400, { status: 'error', answer: parsed.message, citations: [] })
      }

      const response = await answerGuideQuestion(parsed.value)
      status = response.status
      citationCount = response.citations.length
      return json(response.status === 'error' ? 502 : 200, response)
    }

    status = 'not_found'
    return json(404, { status: 'error', answer: 'Not found.', citations: [] })
  } catch {
    status = 'error'
    return json(502, {
      status: 'error',
      answer: 'Hiraya Guide hit an unexpected service error. Please try again later.',
      citations: [],
    })
  } finally {
    console.info(JSON.stringify({ route: request.path, status, citationCount, latencyMs: Date.now() - started }))
  }
}

async function answerGuideQuestion(request: GuideChatRequest): Promise<GuideChatResponse> {
  await Promise.resolve()

  if (process.env.GUIDE_API_FORCE_ERROR === 'true') {
    return {
      status: 'error',
      answer: 'Hiraya Guide hit an unexpected service error. Please try again later.',
      sessionId: request.sessionId,
      citations: [],
    }
  }

  if (process.env.GUIDE_API_NOT_READY === 'true' || /not[-_ ]?ready|ingestion|preparing/i.test(request.message)) {
    return {
      status: 'not_ready',
      answer: 'Hiraya Guide is still preparing curated project knowledge. Please try again after ingestion completes.',
      sessionId: request.sessionId ?? newSessionId(),
      citations: [],
    }
  }

  if (process.env.BEDROCK_KNOWLEDGE_BASE_ID && process.env.BEDROCK_MODEL_ARN) {
    return answerWithBedrock(request)
  }

  if (/weather|recipe|sports|unsupported|off[-_ ]?topic/i.test(request.message)) {
    return {
      status: 'refused',
      answer: 'I could not find enough curated Hiraya project evidence to answer that. Try asking about architecture, CI/CD, security gates, team roles, or documented decisions.',
      sessionId: request.sessionId ?? newSessionId(),
      citations: [],
    }
  }

  const citations = normalizeCitations([localAnsweredCitation(), { title: 'Project Brief', source: 'docs/portfolio/PROJECT_BRIEF.md', rawChunk: 'not returned' }])

  return {
    status: citations.length > 0 ? 'answered' : 'refused',
    answer: 'Local Hiraya Guide contract response: this answer represents curated project knowledge and includes normalized citations for frontend wiring.',
    sessionId: request.sessionId ?? newSessionId(),
    citations,
  }
}

async function isAllowedByOriginSecret(request: HttpRequest): Promise<boolean> {
  const expectedSecret = await expectedOriginSecret()
  if (!expectedSecret) return true
  return secretsMatch(headerValue(request.headers, 'x-hiraya-origin-secret'), expectedSecret)
}

function secretsMatch(actual: string | undefined, expected: string): boolean {
  if (!actual) return false
  const actualBytes = Buffer.from(actual)
  const expectedBytes = Buffer.from(expected)
  return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes)
}

function json(statusCode: number, payload: unknown): HttpResponse {
  return { statusCode, headers: jsonHeaders, body: JSON.stringify(payload) }
}

function newSessionId(): string {
  return `local-guide-session-${randomUUID()}`
}
