import type { LucideIcon } from 'lucide-react'
import { Bot, User } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

type ResponsibilityLane = {
  id: string
  label: string
  actor: string
  shareLabel: string
  detail: string
  progress: number
  Icon: LucideIcon
  tone: 'human' | 'assistant'
}

type ResponsibilityLanesProps = {
  className?: string
}

const responsibilityLanes: ResponsibilityLane[] = [
  {
    id: 'human',
    label: 'Human',
    actor: 'Product judgment',
    shareLabel: '34%',
    detail: 'Sets intent, accepts risk, and makes the release call.',
    progress: 34,
    Icon: User,
    tone: 'human',
  },
  {
    id: 'assistant',
    label: 'AI assistant',
    actor: 'Execution support',
    shareLabel: '66%',
    detail: 'Drafts workflows, checks evidence, and explains pipeline state.',
    progress: 66,
    Icon: Bot,
    tone: 'assistant',
  },
]

const laneToneClassNames: Record<
  ResponsibilityLane['tone'],
  {
    row: string
    icon: string
    badge: string
    progress: string
  }
> = {
  human: {
    row: 'border-border/90 bg-card/85',
    icon: 'border-border bg-muted text-muted-foreground',
    badge: 'border-border bg-card text-muted-foreground',
    progress: 'bg-muted [&>[data-slot=progress-indicator]]:bg-muted-foreground/45',
  },
  assistant: {
    row: 'border-primary/25 bg-accent ring-1 ring-primary/10',
    icon: 'border-primary/30 bg-primary text-primary-foreground',
    badge: 'border-primary/30 bg-primary text-primary-foreground',
    progress: 'bg-primary/15 [&>[data-slot=progress-indicator]]:bg-primary',
  },
}

function LaneRow({ lane }: { lane: ResponsibilityLane }) {
  const Icon = lane.Icon
  const tone = laneToneClassNames[lane.tone]

  return (
    <Card
      role="listitem"
      className={cn(
        'grid gap-3 rounded-lg border p-3 shadow-none transition-colors duration-150 [--card-spacing:--spacing(0)] sm:grid-cols-[minmax(0,1fr)_minmax(8rem,40%)] sm:items-center',
        tone.row,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          aria-hidden="true"
          className={cn('flex size-9 shrink-0 items-center justify-center rounded-md border', tone.icon)}
        >
          <Icon className="size-4" strokeWidth={2.2} />
        </span>

        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold leading-5 tracking-normal text-foreground">{lane.label}</h3>
            <Badge
              variant="outline"
              className={cn('h-5 font-mono text-[10px] font-semibold uppercase tracking-normal', tone.badge)}
            >
              {lane.shareLabel}
            </Badge>
          </div>
          <p className="mt-0.5 truncate font-mono text-[10px] leading-4 text-muted-foreground">{lane.actor}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{lane.detail}</p>
        </div>
      </div>

      <div className="min-w-0">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-normal text-muted-foreground">Responsibility</span>
          <span className="font-mono text-[11px] font-semibold text-foreground">{lane.progress}/100</span>
        </div>
        <Progress
          aria-label={`${lane.label} responsibility share ${lane.shareLabel}`}
          value={lane.progress}
          className={cn('h-2 rounded-full', tone.progress)}
        />
      </div>
    </Card>
  )
}

export function ResponsibilityLanes({ className }: ResponsibilityLanesProps) {
  return (
    <div
      aria-label="Responsibility lanes for human and AI assistant"
      className={cn(
        'relative min-h-[190px] overflow-hidden rounded-lg border border-border/80 bg-background/45 p-3 sm:p-4',
        'before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(135deg,color-mix(in_oklch,var(--primary),transparent_93%),transparent_42%)]',
        className,
      )}
    >
      <div className="relative z-10 flex h-full min-h-[166px] flex-col">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold leading-4 tracking-normal text-foreground">
              Responsibility split
            </p>
            <p className="truncate font-mono text-[10px] leading-4 text-muted-foreground">
              {'human + assistant -> shared release confidence'}
            </p>
          </div>
          <Badge
            variant="outline"
            className="h-5 shrink-0 border-primary/25 bg-accent px-2 font-mono text-[9px] font-semibold uppercase tracking-normal text-primary"
          >
            LANE_08
          </Badge>
        </div>

        <div role="list" className="flex flex-1 flex-col justify-center gap-2.5">
          {responsibilityLanes.map((lane) => (
            <LaneRow key={lane.id} lane={lane} />
          ))}
        </div>
      </div>
    </div>
  )
}
