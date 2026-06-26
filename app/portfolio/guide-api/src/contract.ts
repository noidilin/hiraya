export type GuideStatus = 'answered' | 'refused' | 'not_ready' | 'error'

export type GuideCitation = {
  title: string
  source: string
}

export type GuideChatRequest = {
  message: string
  sessionId?: string
}

export type GuideChatResponse = {
  status: GuideStatus
  answer: string
  sessionId?: string
  citations: GuideCitation[]
}

export type HttpRequest = {
  method: string
  path: string
  headers?: Record<string, string | undefined>
  body?: string | null
}

export type HttpResponse = {
  statusCode: number
  headers: Record<string, string>
  body: string
}
