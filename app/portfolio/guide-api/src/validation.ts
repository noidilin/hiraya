import type { GuideChatRequest, HttpRequest } from './contract.js'

const maxMessageLength = 1_000
const maxSessionIdLength = 256

export function parseChatRequest(request: HttpRequest): { ok: true; value: GuideChatRequest } | { ok: false; message: string } {
  const contentType = headerValue(request.headers, 'content-type')
  if (!contentType?.toLowerCase().includes('application/json')) {
    return { ok: false, message: 'Chat requests must use application/json.' }
  }

  let payload: unknown
  try {
    payload = JSON.parse(request.body ?? '')
  } catch {
    return { ok: false, message: 'Chat request body must be valid JSON.' }
  }

  if (!payload || typeof payload !== 'object') {
    return { ok: false, message: 'Chat request body must be a JSON object.' }
  }

  const record = payload as Record<string, unknown>
  const message = record.message
  const sessionId = record.sessionId

  if (typeof message !== 'string' || message.trim().length === 0) {
    return { ok: false, message: 'message is required.' }
  }

  const trimmedMessage = message.trim()
  if (trimmedMessage.length > maxMessageLength) {
    return { ok: false, message: `message must be ${maxMessageLength} characters or fewer.` }
  }

  if (sessionId !== undefined) {
    if (typeof sessionId !== 'string' || sessionId.trim().length === 0 || sessionId.length > maxSessionIdLength) {
      return { ok: false, message: `sessionId must be a non-empty string up to ${maxSessionIdLength} characters.` }
    }
  }

  return { ok: true, value: { message: trimmedMessage, sessionId } }
}

export function headerValue(headers: HttpRequest['headers'], name: string): string | undefined {
  if (!headers) return undefined
  const lowerName = name.toLowerCase()
  const entry = Object.entries(headers).find(([key]) => key.toLowerCase() === lowerName)
  return entry?.[1]
}
