import { useMemo, useState } from 'react'

import { createGuideClient, type GuideCitation } from '@/lib/guide-api'

import type { ChatMessage } from '../types'

const guideClient = createGuideClient()

const initialGuideMessage: ChatMessage = {
  id: 'welcome',
  role: 'guide',
  content:
    'Hiraya Guide is ready for API wiring. Ask about architecture, CI/CD, security gates, team roles, or documented decisions. Answers should come only from curated project knowledge.',
}

export function useGuideChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([initialGuideMessage])
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState<string>()
  const [isSending, setIsSending] = useState(false)

  const canSend = input.trim().length > 0 && !isSending

  const latestCitations = useMemo<GuideCitation[]>(
    () => messages.findLast((message) => message.role === 'guide')?.citations ?? [],
    [messages],
  )

  async function sendMessage(messageText = input) {
    const trimmedMessage = messageText.trim()

    if (!trimmedMessage || isSending) return

    const visitorMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'visitor',
      content: trimmedMessage,
    }

    setMessages((currentMessages) => [...currentMessages, visitorMessage])
    setInput('')
    setIsSending(true)

    try {
      const payload = await guideClient.sendMessage({ message: trimmedMessage, sessionId })
      const status = payload.status

      if (payload.sessionId) setSessionId(payload.sessionId)

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: crypto.randomUUID(),
          role: 'guide',
          status,
          content: payload.answer,
          citations: payload.citations ?? [],
        },
      ])
    } catch {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: crypto.randomUUID(),
          role: 'guide',
          status: 'error',
          content:
            'The Guide API is not reachable yet. The frontend is already wired to the planned same-origin /api/guide/chat route for the Lambda integration.',
          citations: [],
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  return {
    messages,
    input,
    isSending,
    canSend,
    latestCitations,
    sessionId,
    setInput,
    sendMessage,
  }
}
