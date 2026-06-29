export type GuideStatus = 'answered' | 'refused' | 'not_ready' | 'error'

export type GuideCitation = {
  title: string
  source: string
}

export type GuideChatResponse = {
  status: GuideStatus
  answer: string
  sessionId?: string
  citations: GuideCitation[]
}

type GuideChatPayload = {
  message: string
  sessionId?: string
}

export type GuideClient = {
  sendMessage: (payload: GuideChatPayload) => Promise<GuideChatResponse>
}

export function createGuideClient(fetcher: typeof fetch = fetch): GuideClient {
  return {
    async sendMessage(payload) {
      const response = await fetcher('/api/guide/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const responsePayload = (await response.json()) as Partial<GuideChatResponse>

      if (!response.ok || !isGuideStatus(responsePayload.status)) {
        throw new Error('Guide API returned an unexpected response')
      }

      return {
        status: responsePayload.status,
        answer: responsePayload.answer ?? fallbackText(responsePayload.status),
        sessionId: responsePayload.sessionId,
        citations: responsePayload.citations ?? [],
      }
    },
  }
}

export function statusLabel(status: GuideStatus): string {
  return status.replaceAll('_', ' ')
}

export function fallbackText(status: GuideStatus): string {
  if (status === 'refused') return 'I could not find enough curated project evidence to answer that.'
  if (status === 'not_ready') return 'The knowledge base is still being prepared. Please try again after ingestion.'
  if (status === 'error') return 'The guide hit an unexpected error.'
  return 'Answered from curated project knowledge.'
}

function isGuideStatus(status: unknown): status is GuideStatus {
  return status === 'answered' || status === 'refused' || status === 'not_ready' || status === 'error'
}
