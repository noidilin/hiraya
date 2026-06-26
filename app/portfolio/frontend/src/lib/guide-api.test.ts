import { describe, expect, it, vi } from 'vitest'
import { createGuideClient, fallbackText, statusLabel } from './guide-api'

describe('Hiraya Guide frontend API client', () => {
  it('submits Portfolio Visitor messages to the same-origin Guide API route', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ status: 'answered', answer: 'ok', sessionId: 'next-session', citations: [] }), { status: 200 }))
    const client = createGuideClient(fetcher as unknown as typeof fetch)

    await client.sendMessage({ message: 'How does Hiraya deploy infrastructure?' })

    expect(fetcher).toHaveBeenCalledWith('/api/guide/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'How does Hiraya deploy infrastructure?' }),
    })
  })

  it('sends the returned session id on follow-up calls', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'answered', answer: 'first', sessionId: 'bedrock-session-1', citations: [] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'answered', answer: 'second', sessionId: 'bedrock-session-1', citations: [] }), { status: 200 }))
    const client = createGuideClient(fetcher as unknown as typeof fetch)

    const first = await client.sendMessage({ message: 'Explain the Portfolio Stack.' })
    await client.sendMessage({ message: 'How does it deploy?', sessionId: first.sessionId })

    expect(JSON.parse(fetcher.mock.calls[1]?.[1]?.body as string)).toEqual({ message: 'How does it deploy?', sessionId: 'bedrock-session-1' })
  })

  it('normalizes status labels and fallback text for every Guide response state', () => {
    expect(statusLabel('not_ready')).toBe('not ready')
    expect(fallbackText('answered')).toMatch(/curated project knowledge/i)
    expect(fallbackText('refused')).toMatch(/could not find/i)
    expect(fallbackText('not_ready')).toMatch(/knowledge base/i)
    expect(fallbackText('error')).toMatch(/unexpected error/i)
  })

  it('throws when the API cannot provide the planned response contract', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ status: 'error', answer: 'bad', citations: [] }), { status: 500 }))
    const client = createGuideClient(fetcher as unknown as typeof fetch)

    await expect(client.sendMessage({ message: 'hello' })).rejects.toThrow(/unexpected response/i)
  })
})
