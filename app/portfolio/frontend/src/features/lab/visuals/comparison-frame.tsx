import type { LucideIcon } from 'lucide-react'
import { CheckCircle2, GitCompareArrows, GripVertical, TriangleAlert } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type ComparisonSide = {
  id: string
  label: string
  badge: string
  heading: string
  detail: string
  metrics: string[]
  Icon: LucideIcon
  tone: 'weak' | 'strong'
}

type ComparisonFrameProps = {
  className?: string
}

const comparisonSides: ComparisonSide[] = [
  {
    id: 'weak',
    label: 'Before',
    badge: 'WEAK',
    heading: 'Manual handoff',
    detail: 'A release waits on scattered checks and verbal confirmation.',
    metrics: ['No signed artifact', 'Logs reviewed late', 'Risk discovered after merge'],
    Icon: TriangleAlert,
    tone: 'weak',
  },
  {
    id: 'strong',
    label: 'After',
    badge: 'STRONG',
    heading: 'Evidence-backed gate',
    detail: 'Pipeline state, proof bundle, and reviewer intent stay attached.',
    metrics: ['Signed output', 'Tests visible inline', 'Release decision is traceable'],
    Icon: CheckCircle2,
    tone: 'strong',
  },
]

const sideToneClassNames: Record<
  ComparisonSide['tone'],
  {
    panel: string
    icon: string
    badge: string
    marker: string
  }
> = {
  weak: {
    panel: 'border-border/85 bg-card/85',
    icon: 'border-border bg-muted text-muted-foreground',
    badge: 'border-border bg-card text-muted-foreground',
    marker: 'bg-muted-foreground/55',
  },
  strong: {
    panel: 'border-primary/25 bg-accent text-foreground ring-1 ring-primary/10',
    icon: 'border-primary/30 bg-primary text-primary-foreground',
    badge: 'border-primary/30 bg-accent text-primary',
    marker: 'bg-primary',
  },
}

function ComparisonPanel({ side }: { side: ComparisonSide }) {
  const Icon = side.Icon
  const tone = sideToneClassNames[side.tone]

  return (
    <div className={cn('flex min-w-0 flex-col justify-between rounded-lg border p-3 sm:p-4', tone.panel)}>
      <div className="min-w-0">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-semibold uppercase leading-4 tracking-normal text-muted-foreground">
              {side.label}
            </p>
            <h3 className="truncate text-sm font-semibold leading-5 tracking-normal text-foreground">
              {side.heading}
            </h3>
          </div>

          <span
            aria-hidden="true"
            className={cn('flex size-8 shrink-0 items-center justify-center rounded-md border', tone.icon)}
          >
            <Icon className="size-4" strokeWidth={2.2} />
          </span>
        </div>

        <Badge
          variant="outline"
          className={cn('mt-3 h-5 font-mono text-[9px] font-semibold uppercase tracking-normal', tone.badge)}
        >
          {side.badge}
        </Badge>

        <p className="mt-2 text-xs leading-5 text-muted-foreground">{side.detail}</p>
      </div>

      <ul className="mt-3 space-y-1.5" aria-label={`${side.label} release characteristics`}>
        {side.metrics.map((metric) => (
          <li key={metric} className="flex min-w-0 items-center gap-2 text-[11px] leading-4 text-muted-foreground">
            <span aria-hidden="true" className={cn('size-1.5 shrink-0 rounded-full', tone.marker)} />
            <span className="min-w-0 truncate">{metric}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ComparisonFrame({ className }: ComparisonFrameProps) {
  return (
    <Card
      aria-label="Comparison frame contrasting weak manual release handoff with strong evidence-backed gate"
      className={cn(
        'relative min-h-[190px] gap-0 overflow-hidden rounded-lg border-border/90 bg-background/45 p-3 shadow-none ring-1 ring-border/70 sm:p-4',
        'before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_52%,color-mix(in_oklch,var(--primary),transparent_91%),transparent_42%)]',
        'after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border),transparent_64%)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border),transparent_70%)_1px,transparent_1px)] after:bg-[size:24px_24px] after:opacity-25',
        className,
      )}
    >
      <div className="relative z-10 flex h-full min-h-[166px] flex-col">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold leading-4 tracking-normal text-foreground">
              Release contrast
            </p>
            <p className="truncate font-mono text-[10px] leading-4 text-muted-foreground">
              {'manual handoff -> evidence gate'}
            </p>
          </div>
          <Badge
            variant="outline"
            className="h-5 shrink-0 border-primary/25 bg-accent px-2 font-mono text-[9px] font-semibold uppercase tracking-normal text-primary"
          >
            CMP_06
          </Badge>
        </div>

        <div className="relative grid flex-1 grid-cols-2 gap-2 sm:gap-3">
          {comparisonSides.map((side) => (
            <ComparisonPanel key={side.id} side={side} />
          ))}

          <Separator
            orientation="vertical"
            decorative
            className="absolute left-1/2 top-3 z-20 hidden h-[calc(100%-1.5rem)] -translate-x-1/2 bg-border sm:block"
          />
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 z-30 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-primary/30 bg-card/95 text-primary shadow-[0_8px_24px_color-mix(in_oklch,var(--primary),transparent_86%)] backdrop-blur-md"
          >
            <GripVertical className="size-4" strokeWidth={2.4} />
          </div>
          <div className="sr-only">
            The centered divider compares a weak manual release process with a stronger evidence-backed release gate.
          </div>
        </div>

        <div className="mt-3 flex items-center justify-center gap-2 text-center font-mono text-[10px] leading-4 text-muted-foreground">
          <GitCompareArrows className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
          <span>center split is static in phase 1</span>
        </div>
      </div>
    </Card>
  )
}
