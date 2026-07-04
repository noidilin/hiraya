import { CheckCircle2 } from 'lucide-react'

import type { BriefProofPathCard } from '@/content/hiraya/briefProofPathOverview'
import { cn } from '@/lib/utils'

type BriefProofPathOverviewProps = {
  cards: readonly BriefProofPathCard[]
  className?: string
}

function hoverCardPosition(index: number) {
  return cn(index % 2 === 1 && 'md:left-auto md:right-0', index >= 2 && 'xl:left-auto xl:right-0')
}

export function BriefProofPathOverview({ cards, className }: BriefProofPathOverviewProps) {
  return (
    <div
      className={cn('grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4', className)}
      role="list"
      aria-label="Portfolio proof path summary cards"
    >
      {cards.map((card, index) => {
        const detailId = `brief-proof-path-${card.id}`

        return (
          <article key={card.id} role="listitem" className="group relative min-w-0">
            <div
              tabIndex={0}
              aria-describedby={detailId}
              className="h-full border border-border bg-background/70 p-4 outline-none transition-colors hover:border-primary/35 focus-visible:border-primary/45 focus-visible:ring-2 focus-visible:ring-ring/45"
            >
              <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">
                {card.label}
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-normal text-foreground">{card.value}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{card.note}</p>
            </div>

            <div
              id={detailId}
              className={cn(
                'absolute left-0 top-[calc(100%+0.5rem)] z-30 hidden w-[min(28rem,calc(100vw-2rem))] gap-3 border border-primary/30 bg-card p-4 shadow-2xl group-hover:grid group-focus-within:grid',
                hoverCardPosition(index),
              )}
            >
              <div>
                <h3 className="text-sm font-semibold tracking-normal text-foreground">{card.detailTitle}</h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{card.detailSummary}</p>
              </div>
              <ul className="grid gap-2">
                {card.detailBullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2 text-xs leading-5 text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        )
      })}
    </div>
  )
}
