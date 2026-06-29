import { BrainCircuit, Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

type OrbitLabel = {
  id: string
  label: string
  detail: string
  className: string
}

type OrbitRing = {
  id: string
  className: string
  duration: string
  direction?: 'normal' | 'reverse'
}

type AiAssistanceOrbitProps = {
  className?: string
}

const orbitLabels: OrbitLabel[] = [
  {
    id: 'draft',
    label: 'DRAFT',
    detail: 'Convert intent into a first pass workflow',
    className: 'left-1/2 top-[6%] -translate-x-1/2',
  },
  {
    id: 'inspect',
    label: 'INSPECT',
    detail: 'Check logs, diffs, and pipeline evidence',
    className: 'right-[3%] top-1/2 -translate-y-1/2 sm:right-[8%]',
  },
  {
    id: 'summarize',
    label: 'SUMMARIZE',
    detail: 'Compress findings into a release-ready note',
    className: 'bottom-[8%] left-[4%] sm:left-[9%]',
  },
]

const orbitRings: OrbitRing[] = [
  {
    id: 'outer',
    className: 'size-32 opacity-65',
    duration: '22s',
  },
  {
    id: 'inner',
    className: 'size-20 border-primary/45 opacity-80',
    duration: '17s',
    direction: 'reverse',
  },
]

function OrbitLabelChip({ item }: { item: OrbitLabel }) {
  return (
    <li className={cn('absolute z-20', item.className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <Badge
              variant="outline"
              className="h-7 border-primary/25 bg-card/92 px-2.5 font-mono text-[10px] font-semibold tracking-normal text-foreground shadow-[0_8px_22px_color-mix(in_oklch,var(--foreground),transparent_94%)] backdrop-blur-md"
            >
              <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
              {item.label}
            </Badge>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">{item.detail}</TooltipContent>
      </Tooltip>
    </li>
  )
}

export function AiAssistanceOrbit({ className }: AiAssistanceOrbitProps) {
  return (
    <TooltipProvider>
      <div
        aria-label="AI assistance orbit showing draft, inspect, and summarize support modes"
        className={cn(
          'relative min-h-[190px] overflow-hidden rounded-lg border border-border/80 bg-background/45 p-3 sm:p-4',
          'before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_50%,color-mix(in_oklch,var(--primary),transparent_90%),transparent_44%)]',
          'after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border),transparent_72%)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border),transparent_76%)_1px,transparent_1px)] after:bg-[size:24px_24px] after:opacity-25',
          className,
        )}
      >
        <div className="relative z-10 flex h-full min-h-[166px] items-center justify-center">
          <div aria-hidden="true" className="relative size-40 shrink-0">
            {orbitRings.map((ring) => (
              <div
                key={ring.id}
                className={cn(
                  'orbit-ring absolute inset-0 m-auto rounded-full',
                  ring.className,
                )}
                style={{
                  animationDuration: ring.duration,
                  animationDirection: ring.direction,
                }}
              />
            ))}
          </div>

          <div className="status-pulse-active absolute z-10 flex size-16 flex-col items-center justify-center gap-0.5 rounded-full border border-primary bg-primary text-primary-foreground shadow-[0_0_0_9px_color-mix(in_oklch,var(--primary),transparent_88%),0_18px_45px_color-mix(in_oklch,var(--primary),transparent_76%)] ring-1 ring-primary/25 sm:size-[4.5rem]">
            <div className="absolute inset-2 rounded-full border border-primary-foreground/25" />
            <div className="absolute -right-1 top-2 flex size-6 items-center justify-center rounded-full border border-primary-foreground/45 bg-primary-foreground text-primary shadow-sm">
              <Sparkles className="size-3.5" strokeWidth={2.2} />
            </div>
            <BrainCircuit className="relative size-6 sm:size-7" strokeWidth={2.1} />
            <span className="relative font-mono text-[10px] font-semibold leading-none tracking-normal">
              AI
            </span>
          </div>

          <ul aria-label="AI assistance modes" className="absolute inset-0">
            {orbitLabels.map((item) => (
              <OrbitLabelChip key={item.id} item={item} />
            ))}
          </ul>
        </div>
      </div>
    </TooltipProvider>
  )
}
