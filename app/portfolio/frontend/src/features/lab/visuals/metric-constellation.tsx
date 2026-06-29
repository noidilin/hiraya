import { Activity, Gauge, ServerCrash, Waypoints } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type MetricTone = 'success' | 'muted' | 'error' | 'primary'

type MetricPoint = {
  id: string
  label: string
  value: string
  description: string
  tone: MetricTone
  Icon: LucideIcon
  positionClassName: string
}

type MetricConstellationProps = {
  className?: string
}

const metricPoints: MetricPoint[] = [
  {
    id: 'uptime',
    label: 'Uptime',
    value: '99.9%',
    description: 'Deployment target availability',
    tone: 'success',
    Icon: Gauge,
    positionClassName: 'left-0 top-0',
  },
  {
    id: 'latency',
    label: 'Latency',
    value: '14ms',
    description: 'Median test feedback delay',
    tone: 'muted',
    Icon: Activity,
    positionClassName: 'right-0 top-0',
  },
  {
    id: 'errors',
    label: 'Errors',
    value: 'ERR_0',
    description: 'Blocked release incidents',
    tone: 'error',
    Icon: ServerCrash,
    positionClassName: 'bottom-0 left-0',
  },
  {
    id: 'events',
    label: 'Events',
    value: '~4.2k',
    description: 'Pipeline events observed',
    tone: 'primary',
    Icon: Waypoints,
    positionClassName: 'bottom-0 right-0',
  },
]

const toneClassNames: Record<
  MetricTone,
  {
    node: string
    icon: string
    badge: string
    dot: string
  }
> = {
  success: {
    node: 'border-chart-2/25 bg-chart-2/10 text-chart-2 ring-chart-2/10',
    icon: 'border-chart-2/25 bg-chart-2 text-primary-foreground',
    badge: 'border-chart-2/25 bg-card/85 text-chart-2',
    dot: 'bg-chart-2',
  },
  muted: {
    node: 'border-border bg-card/90 text-muted-foreground ring-border/60',
    icon: 'border-border bg-muted text-muted-foreground',
    badge: 'border-border bg-card text-muted-foreground',
    dot: 'bg-muted-foreground/55',
  },
  error: {
    node: 'border-destructive/25 bg-destructive/10 text-destructive ring-destructive/10',
    icon: 'border-destructive/25 bg-destructive text-destructive-foreground',
    badge: 'border-destructive/25 bg-card/85 text-destructive',
    dot: 'bg-destructive',
  },
  primary: {
    node: 'border-primary/30 bg-accent text-primary ring-primary/10',
    icon: 'border-primary/30 bg-primary text-primary-foreground',
    badge: 'border-primary/30 bg-card/85 text-primary',
    dot: 'bg-primary',
  },
}

function MetricNode({ metric }: { metric: MetricPoint }) {
  const Icon = metric.Icon
  const tone = toneClassNames[metric.tone]

  return (
    <li
      className={cn(
        'absolute z-20 flex w-[5.5rem] min-w-0 flex-col gap-1 rounded-lg border p-1.5 shadow-[0_10px_28px_color-mix(in_oklch,var(--foreground),transparent_94%)] ring-1 backdrop-blur-md sm:w-[5.875rem]',
        tone.node,
        metric.positionClassName,
      )}
    >
      <div className="flex min-w-0 items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5">
          <span
            aria-hidden="true"
            className={cn('flex size-5 shrink-0 items-center justify-center rounded-md border', tone.icon)}
          >
            <Icon className="size-3" strokeWidth={2.2} />
          </span>
          <span className="truncate text-[10px] font-semibold leading-4 tracking-normal text-foreground">
            {metric.label}
          </span>
        </span>
        <span aria-hidden="true" className={cn('size-1.5 shrink-0 rounded-full', tone.dot)} />
      </div>

      <Badge
        variant="outline"
        className={cn(
          'h-5 w-full justify-center border px-1 font-mono text-[10px] font-semibold uppercase leading-none tracking-normal',
          tone.badge,
        )}
      >
        {metric.value}
      </Badge>

      <p className="truncate font-mono text-[8px] leading-3 text-muted-foreground">{metric.description}</p>
    </li>
  )
}

export function MetricConstellation({ className }: MetricConstellationProps) {
  return (
    <div
      aria-label="Metric constellation showing availability, latency, errors, and pipeline event volume"
      className={cn(
        'relative min-h-[190px] overflow-hidden rounded-lg border border-border/80 bg-background/45 p-3 sm:p-4',
        'before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_50%,color-mix(in_oklch,var(--primary),transparent_91%),transparent_46%)]',
        'after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border),transparent_68%)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border),transparent_72%)_1px,transparent_1px)] after:bg-[size:24px_24px] after:opacity-25',
        className,
      )}
    >
      <div className="relative z-10 flex h-full min-h-[166px] flex-col">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold leading-4 tracking-normal text-foreground">
              Metric constellation
            </p>
            <p className="truncate font-mono text-[10px] leading-4 text-muted-foreground">
              {'signals -> release confidence'}
            </p>
          </div>
          <Badge
            variant="outline"
            className="h-5 shrink-0 border-primary/25 bg-accent px-2 font-mono text-[9px] font-semibold uppercase tracking-normal text-primary"
          >
            METRIC_09
          </Badge>
        </div>

        <div className="relative flex min-h-[150px] flex-1 items-center justify-center">
          <svg
            aria-hidden="true"
            viewBox="0 0 320 172"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 z-0 size-full"
          >
            <g fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path
                d="M58 47 C104 24 188 22 259 45"
                className="stroke-primary/20"
                strokeWidth="1.4"
                strokeDasharray="5 8"
              />
              <path
                d="M62 47 C98 92 111 122 74 138"
                className="stroke-chart-2/20"
                strokeWidth="1.2"
                strokeDasharray="4 7"
              />
              <path
                d="M259 45 C244 89 234 118 250 134"
                className="stroke-muted-foreground/18"
                strokeWidth="1.2"
                strokeDasharray="4 7"
              />
              <path
                d="M75 138 C122 163 196 162 250 134"
                className="stroke-destructive/18"
                strokeWidth="1.2"
                strokeDasharray="5 7"
              />
              <path
                d="M92 61 C135 88 185 89 228 61"
                className="stroke-primary/15"
                strokeWidth="1"
              />
              <path
                d="M92 128 C133 102 185 101 228 128"
                className="stroke-muted-foreground/14"
                strokeWidth="1"
              />
            </g>
          </svg>

          <div
            aria-hidden="true"
            className="relative z-10 flex size-16 items-center justify-center rounded-full border border-primary/25 bg-card/90 text-primary shadow-[0_0_0_8px_color-mix(in_oklch,var(--primary),transparent_93%)] ring-1 ring-border/70 backdrop-blur-md"
          >
            <div className="absolute inset-2 rounded-full border border-border/80" />
            <Waypoints className="relative size-5" strokeWidth={2.2} />
          </div>

          <ul aria-label="Release health metrics">
            {metricPoints.map((metric) => (
              <MetricNode key={metric.id} metric={metric} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
