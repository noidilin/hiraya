import { useId, useMemo, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

import type { BriefProofPathCard } from '@/content/hiraya/briefProofPathOverview'
import { cn } from '@/lib/utils'

import { HirayaSectionShell } from './hiraya-section'

type BriefProofPathOverviewProps = {
  cards: readonly BriefProofPathCard[]
  className?: string
}

function cardTone(active: boolean) {
  return active ? 'border-primary/45 bg-primary/10' : 'border-border bg-background/72 hover:border-primary/35'
}

export function BriefProofPathOverview({ cards, className }: BriefProofPathOverviewProps) {
  const [activeCardId, setActiveCardId] = useState<BriefProofPathCard['id']>(cards[0]?.id ?? 'design-goals')
  const detailPanelId = useId()
  const activeCard = useMemo(
    () => cards.find((card) => card.id === activeCardId) ?? cards[0],
    [activeCardId, cards],
  )
  const activeIndex = activeCard ? cards.findIndex((card) => card.id === activeCard.id) : -1

  if (!activeCard) return null

  return (
    <HirayaSectionShell
      className={className}
      eyebrow="Portfolio Proof Path"
      title="Why this is a platform demonstration, not just a static site"
      description="The Brief route starts with four inspectable overview cards. Hover, focus, or tap a card to see the proof logic before opening evidence media."
    >
      <div className="grid gap-4 p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" role="list" aria-label="Portfolio proof path overview cards">
          {cards.map((card) => {
            const active = card.id === activeCard.id

            return (
              <div key={card.id} role="listitem">
                <button
                  type="button"
                  aria-expanded={active}
                  aria-controls={detailPanelId}
                  onClick={() => setActiveCardId(card.id)}
                  onFocus={() => setActiveCardId(card.id)}
                  onMouseEnter={() => setActiveCardId(card.id)}
                  className={cn(
                    'group grid h-full min-h-36 w-full content-start gap-3 border p-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/45',
                    cardTone(active),
                  )}
                >
                  <div>
                    <h3 className="text-sm font-semibold tracking-normal text-foreground">{card.label}</h3>
                    <p className="mt-1.5 text-2xl font-semibold tracking-normal text-foreground">{card.value}</p>
                    <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{card.note}</p>
                  </div>
                </button>
              </div>
            )
          })}
        </div>

        <article
          id={detailPanelId}
          className="grid gap-4 border border-primary/25 bg-background/78 p-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:p-5"
          aria-live="polite"
        >
          <div className="grid content-start gap-3">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-primary">
              {activeIndex >= 0 ? String(activeIndex + 1).padStart(2, '0') : '01'} · active proof card
            </p>
            <div>
              <h3 className="text-lg font-semibold tracking-normal text-foreground">{activeCard.detailTitle}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{activeCard.detailSummary}</p>
            </div>
          </div>

          <ul className="grid gap-3">
            {activeCard.detailBullets.map((bullet) => (
              <li key={bullet} className="flex gap-3 border border-border bg-card/55 p-3 text-sm leading-6 text-muted-foreground">
                <CheckCircle2 className="mt-1 size-3.5 shrink-0 text-primary" aria-hidden="true" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </HirayaSectionShell>
  )
}
