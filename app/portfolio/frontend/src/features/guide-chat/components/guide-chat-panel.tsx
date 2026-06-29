import { ArrowUp, Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'

import {
  ChatContainerContent,
  ChatContainerRoot,
  ChatContainerScrollAnchor,
} from '@/components/ui/chat-container'
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from '@/components/ui/prompt-input'
import type { GuideCitation } from '@/lib/guide-api'
import { cn } from '@/lib/utils'

import { LoadingBubble, MessageBubble } from './message-bubble'
import type { ChatMessage } from '../types'

const starterQuestions = [
  'How does Hiraya deploy infrastructure?',
  'What security gates are implemented?',
  'What is intentionally out of scope for the guide?',
]

type GuideChatPanelProps = {
  messages: ChatMessage[]
  input: string
  isSending: boolean
  canSend: boolean
  latestCitations: GuideCitation[]
  onInputChange: (value: string) => void
  onSend: (message?: string) => void
  onClose?: () => void
}

export function GuideChatPanel({
  messages,
  input,
  isSending,
  canSend,
  latestCitations,
  onInputChange,
  onSend,
  onClose,
}: GuideChatPanelProps) {
  return (
    <aside id="hiraya-guide-panel" className="flex h-[min(720px,calc(100svh-2rem))] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border bg-card/95 shadow-2xl backdrop-blur-md">
      <div className="border-b px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">assistant panel</p>
            <h2 className="text-xl font-semibold">Hiraya Guide</h2>
          </div>
          <div className="flex items-center gap-2">
            <StatusToken state={isSending ? 'active' : 'idle'}>{isSending ? 'retrieving' : 'ready'}</StatusToken>
            {onClose ? (
              <button
                type="button"
                className="rounded-lg border bg-background px-2.5 py-1.5 text-xs text-muted-foreground transition duration-150 hover:bg-accent hover:text-foreground"
                onClick={onClose}
                aria-label="Close Hiraya Guide"
              >
                Close
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <ChatContainerRoot className="min-h-0 flex-1 px-5 py-4">
        <ChatContainerContent className="gap-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isSending ? <LoadingBubble /> : null}
          <ChatContainerScrollAnchor />
        </ChatContainerContent>
      </ChatContainerRoot>

      <div className="space-y-3 border-t bg-card/80 p-4">
        <div className="flex flex-wrap gap-2">
          {starterQuestions.map((question) => (
            <button
              key={question}
              type="button"
              className="rounded-lg border bg-background px-2.5 py-1.5 text-left text-xs text-muted-foreground transition duration-150 hover:bg-accent hover:text-foreground disabled:opacity-50"
              disabled={isSending}
              onClick={() => onSend(question)}
            >
              {question}
            </button>
          ))}
        </div>

        <PromptInput
          value={input}
          onValueChange={onInputChange}
          onSubmit={() => onSend()}
          isLoading={isSending}
          disabled={isSending}
          className="rounded-lg border-input bg-background p-2"
        >
          <PromptInputTextarea placeholder="Ask about Hiraya architecture or CI/CD..." />
          <PromptInputActions className="justify-end px-1 pb-1">
            <PromptInputAction tooltip="Send message">
              <button
                type="button"
                className="inline-flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition duration-150 hover:bg-chart-4 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!canSend}
                onClick={() => onSend()}
                aria-label="Send message"
              >
                {isSending ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
              </button>
            </PromptInputAction>
          </PromptInputActions>
        </PromptInput>

        {latestCitations.length > 0 ? (
          <p className="font-mono text-[11px] text-muted-foreground">
            cited: {latestCitations[0]?.title} · {latestCitations[0]?.source}
          </p>
        ) : null}
      </div>
    </aside>
  )
}

function StatusToken({ state, children }: { state: 'active' | 'idle'; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium',
        state === 'active' && 'bg-accent text-primary',
        state === 'idle' && 'bg-muted text-muted-foreground',
      )}
    >
      <span
        className={cn(
          'size-1.5 rounded-full',
          state === 'active' && 'status-pulse-active bg-primary',
          state === 'idle' && 'bg-muted-foreground',
        )}
      />
      {children}
    </span>
  )
}
