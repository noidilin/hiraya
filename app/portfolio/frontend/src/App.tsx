import { ArrowUp, BookOpen, CheckCircle2, Circle, Database, Loader2, ShieldCheck } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'

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
import { createGuideClient, fallbackText, statusLabel, type GuideCitation, type GuideStatus } from '@/lib/guide-api'
import { cn } from '@/lib/utils'

const guideClient = createGuideClient()

type ChatMessage = {
  id: string
  role: 'visitor' | 'guide'
  content: string
  status?: GuideStatus
  citations?: GuideCitation[]
}

const starterQuestions = [
  'How does Hiraya deploy infrastructure?',
  'What security gates are implemented?',
  'What is intentionally out of scope for the guide?',
]

const pipelineSteps = [
  { label: 'Curate', state: 'success', detail: 'docs/portfolio/*.md' },
  { label: 'Ingest', state: 'active', detail: 'Bedrock KB sync' },
  { label: 'Answer', state: 'idle', detail: '/api/guide/chat' },
]

const narrativeCards = [
  {
    title: 'Durable project introduction',
    text: 'Hiraya Portfolio gives Portfolio Visitors a stable place to evaluate the project even when the disposable EKS environment is offline.',
  },
  {
    title: 'EKS remains the delivery proof',
    text: 'Vintage Storefront remains the EKS/GitOps demonstration workload while this Portfolio Stack stays durable outside cluster rebuilds.',
  },
  {
    title: 'Guide answers from approved evidence',
    text: 'Hiraya Guide uses Curated Project Knowledge for architecture, CI/CD, security gates, decisions, and the Target Team Permission Model.',
  },
]

const responseStates = [
  { status: 'answered' as const, text: 'Curated evidence found; show the answer with normalized title/source citations.' },
  { status: 'refused' as const, text: 'Insufficient curated evidence; refuse instead of guessing project details.' },
  { status: 'not_ready' as const, text: 'Knowledge ingestion is unavailable; explain the preparation state clearly.' },
  { status: 'error' as const, text: 'Unexpected service failure; show a safe retry-oriented message.' },
]

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'guide',
      content:
        'Hiraya Guide is ready for API wiring. Ask about architecture, CI/CD, security gates, team roles, or documented decisions. Answers should come only from curated project knowledge.',
    },
  ])
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState<string>()
  const [isSending, setIsSending] = useState(false)

  const canSend = input.trim().length > 0 && !isSending

  const latestCitations = useMemo(
    () => messages.findLast((message) => message.citations?.length)?.citations ?? [],
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
          content: payload.answer ?? fallbackText(status),
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
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <main className="grid-overlay min-h-svh bg-background px-4 py-4 md:px-6">
      <div className="mx-auto flex min-h-[calc(100svh-2rem)] max-w-7xl flex-col gap-4">
        <header className="flex h-16 items-center justify-between rounded-xl border bg-card/90 px-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Database className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-5">Hiraya Portfolio</p>
              <p className="font-mono text-[11px] text-muted-foreground">lazyhiraya.noidilin.dev / portfolio-stack</p>
            </div>
          </div>
          <StatusToken state="active">guide-api wiring</StatusToken>
        </header>

        <section className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_430px]">
          <div className="grid min-h-0 gap-4 lg:grid-rows-[auto_1fr]">
            <section className="rounded-xl border bg-card/90 p-5 backdrop-blur-md">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="max-w-3xl">
                  <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-primary">Kinetic Logic · knowledge path</p>
                  <h1 className="text-[30px] font-semibold leading-9 tracking-tight">
                    Curated docs flow into a Bedrock Knowledge Base, then back through a guarded Guide API.
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                    This narrative shell explains Hiraya as a DevOps portfolio: the durable Hiraya Portfolio hosts
                    the project story for Portfolio Visitors, while Vintage Storefront remains the EKS/GitOps
                    demonstration workload. Hiraya Guide answers only from Curated Project Knowledge and labels
                    target-state topics such as the Target Team Permission Model honestly.
                  </p>
                </div>
                <div className="min-w-52 rounded-lg border bg-background p-3">
                  <p className="font-mono text-[11px] uppercase text-muted-foreground">api target</p>
                  <p className="mt-1 font-mono text-xs text-foreground">POST /api/guide/chat</p>
                  <div className="mt-3 h-1 rounded-full bg-muted">
                    <div className="animated-flow-line h-1 w-2/3 rounded-full" />
                  </div>
                </div>
              </div>
            </section>

            <section className="grid min-h-0 gap-4 xl:grid-cols-[1fr_320px]">
              <div className="rounded-xl border bg-card/90 p-5 backdrop-blur-md">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Portfolio delivery map</h2>
                    <p className="text-sm text-muted-foreground">Public SPA, same-origin API, curated citations.</p>
                  </div>
                  <StatusToken state="idle">v1 lean</StatusToken>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {pipelineSteps.map((step, index) => (
                    <PipelineStep key={step.label} index={index + 1} {...step} />
                  ))}
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {narrativeCards.map((card) => (
                    <InfoPanel key={card.title} icon={<BookOpen className="size-4" />} title={card.title} text={card.text} />
                  ))}
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <InfoPanel icon={<BookOpen className="size-4" />} title="Evidence" text="Reviewed Markdown under docs/portfolio is the answer source of truth." />
                  <InfoPanel icon={<ShieldCheck className="size-4" />} title="Controls" text="No transcript persistence, no broad CORS, no raw chunks returned to browser." />
                  <InfoPanel icon={<CheckCircle2 className="size-4" />} title="Validation" text="UI expects answered, refused, not_ready, and error status values." />
                </div>
              </div>

              <div className="rounded-xl border bg-card/90 p-5 backdrop-blur-md">
                <h2 className="text-lg font-semibold">Runtime contract</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <ContractRow label="Health" value="GET /api/health" />
                  <ContractRow label="Chat" value="POST /api/guide/chat" />
                  <ContractRow label="Session" value={sessionId ? 'bedrock-session-id' : 'browser state'} />
                  <ContractRow label="Cache" value="CloudFront: no API cache" />
                </dl>
                <div className="mt-5 rounded-lg bg-accent px-3 py-2 text-xs leading-5 text-accent-foreground">
                  Guide responses should be complete, citation-normalized, and refused when curated evidence is insufficient.
                </div>
                <div className="mt-4 space-y-2">
                  {responseStates.map((state) => (
                    <div key={state.status} className="rounded-lg border bg-background px-3 py-2">
                      <p className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                        {statusLabel(state.status)}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{state.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <GuidePanel
            messages={messages}
            input={input}
            isSending={isSending}
            canSend={canSend}
            latestCitations={latestCitations}
            onInputChange={setInput}
            onSend={(message) => void sendMessage(message)}
          />
        </section>
      </div>
    </main>
  )
}

function GuidePanel({
  messages,
  input,
  isSending,
  canSend,
  latestCitations,
  onInputChange,
  onSend,
}: {
  messages: ChatMessage[]
  input: string
  isSending: boolean
  canSend: boolean
  latestCitations: GuideCitation[]
  onInputChange: (value: string) => void
  onSend: (message?: string) => void
}) {
  return (
    <aside className="flex min-h-[640px] flex-col overflow-hidden rounded-xl border bg-card/90 backdrop-blur-md">
      <div className="border-b px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">assistant panel</p>
            <h2 className="text-xl font-semibold">Hiraya Guide</h2>
          </div>
          <StatusToken state={isSending ? 'active' : 'idle'}>{isSending ? 'retrieving' : 'ready'}</StatusToken>
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

function PipelineStep({ label, state, detail, index }: { label: string; state: string; detail: string; index: number }) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex items-center justify-between">
        <div className={cn('flex size-9 items-center justify-center rounded-lg', state === 'active' ? 'bg-primary text-primary-foreground' : state === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-muted text-muted-foreground')}>
          {state === 'success' ? <CheckCircle2 className="size-4" /> : <Circle className={cn('size-4', state === 'active' && 'status-pulse-active fill-current')} />}
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">step {index.toString().padStart(2, '0')}</span>
      </div>
      <h3 className="mt-4 text-lg font-semibold leading-6">{label}</h3>
      <p className="mt-1 font-mono text-[11px] text-muted-foreground">{detail}</p>
    </div>
  )
}

function InfoPanel({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="mb-3 text-primary">{icon}</div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-5 text-muted-foreground">{text}</p>
    </div>
  )
}

function ContractRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b pb-2 last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono text-xs">{value}</dd>
    </div>
  )
}

function StatusToken({ state, children }: { state: 'success' | 'error' | 'active' | 'idle'; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium',
        state === 'success' && 'bg-emerald-50 text-emerald-700',
        state === 'error' && 'bg-red-50 text-red-700',
        state === 'active' && 'bg-accent text-primary',
        state === 'idle' && 'bg-muted text-muted-foreground',
      )}
    >
      <span
        className={cn(
          'size-1.5 rounded-full',
          state === 'success' && 'bg-emerald-600',
          state === 'error' && 'bg-red-600',
          state === 'active' && 'status-pulse-active bg-primary',
          state === 'idle' && 'bg-muted-foreground',
        )}
      />
      {children}
    </span>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
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
        {message.citations?.length ? (
          <ul className="mt-3 space-y-1 border-t pt-3 font-mono text-[11px] text-muted-foreground">
            {message.citations.map((citation) => (
              <li key={`${citation.title}-${citation.source}`}>
                {citation.title} · {citation.source}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  )
}

function LoadingBubble() {
  return (
    <div className="flex justify-start">
      <div className="inline-flex items-center gap-2 rounded-lg border bg-background px-3.5 py-3 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin text-primary" />
        Asking curated knowledge...
      </div>
    </div>
  )
}

export default App
