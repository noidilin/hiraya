import type { GuideCitation, GuideStatus } from '@/lib/guide-api'

export type ChatMessage = {
  id: string
  role: 'visitor' | 'guide'
  content: string
  status?: GuideStatus
  citations?: GuideCitation[]
}
