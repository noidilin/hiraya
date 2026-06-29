import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { statusLabel } from '@/lib/guide-api'
import { cn } from '@/lib/utils'

import { CitationList } from './citation-list'
import type { ChatMessage } from '../types'

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isVisitor = message.role === 'visitor'

  return (
    <article className={cn('flex', isVisitor ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[88%] rounded-lg px-3.5 py-3 text-sm leading-5',
          isVisitor ? 'bg-primary text-primary-foreground' : 'border bg-background',
        )}
      >
        {message.status ? (
          <p className="mb-1 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
            {statusLabel(message.status)}
          </p>
        ) : null}
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.citations?.length ? <CitationList citations={message.citations} /> : null}
      </div>
    </article>
  )
}

export function LoadingBubble() {
  const { t } = useTranslation()

  return (
    <div className="flex justify-start">
      <div className="inline-flex items-center gap-2 rounded-lg border bg-background px-3.5 py-3 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin text-primary" />
        {t('guide.panel.thinking')}
      </div>
    </div>
  )
}
