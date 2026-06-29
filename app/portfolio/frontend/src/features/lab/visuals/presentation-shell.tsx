import { CheckCircle2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type PresentationShellProps = {
  className?: string
}

const progressSegments = [
  { label: 'Brief', value: 100, state: 'complete' },
  { label: 'Model', value: 100, state: 'active' },
  { label: 'Pipeline', value: 0, state: 'idle' },
  { label: 'Evidence', value: 0, state: 'idle' },
] as const

export function PresentationShell({ className }: PresentationShellProps) {
  return (
    <Card
      aria-label="Presentation shell for Lazy CI/CD"
      className={cn(
        'relative aspect-[21/9] w-full gap-0 overflow-hidden rounded-xl border-border/90 bg-card/85 py-0 shadow-none ring-1 ring-border/80 backdrop-blur-md',
        'before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklch,var(--primary),transparent_88%),transparent_38%)]',
        className,
      )}
    >
      <div
        aria-label="Presentation progress"
        className="absolute inset-x-0 top-0 z-20 grid h-1.5 grid-cols-4 gap-px bg-border/70"
      >
        {progressSegments.map((segment) => (
          <Progress
            key={segment.label}
            aria-label={`${segment.label} progress`}
            value={segment.value}
            className={cn(
              'h-full rounded-none bg-muted/70',
              segment.state === 'active' &&
                'animated-flow-line [&>[data-slot=progress-indicator]]:bg-transparent',
              segment.state === 'idle' &&
                '[&>[data-slot=progress-indicator]]:bg-transparent',
            )}
          />
        ))}
      </div>

      <div className="relative z-10 flex h-full flex-col px-4 pb-3 pt-4 sm:px-7 sm:pb-5 sm:pt-6 lg:px-10 lg:pb-7 lg:pt-8">
        <div className="flex items-center justify-center">
          <Badge className="h-6 rounded-full bg-primary px-3 font-mono text-[10px] font-semibold uppercase tracking-normal text-primary-foreground shadow-none sm:h-7 sm:px-4 sm:text-[11px]">
            Chapter 01 / Introduction
          </Badge>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center text-center">
          <div className="max-w-[46rem]">
            <p className="mb-1 font-mono text-[10px] font-medium uppercase tracking-normal text-muted-foreground sm:mb-2 sm:text-[11px]">
              Lazy CI/CD Lab
            </p>
            <h1 className="text-[22px] font-semibold leading-[1.05] tracking-normal text-foreground sm:text-4xl lg:text-5xl">
              CI/CD without the ceremony
            </h1>
          </div>
        </div>

        <Separator className="bg-border/80" />
        <footer className="flex min-h-8 items-center justify-between gap-3 pt-2 font-mono text-[10px] uppercase tracking-normal text-muted-foreground sm:min-h-10 sm:text-[11px]">
          <span className="hidden sm:inline">deck: kinetic-logic</span>
          <Badge
            variant="outline"
            className="h-6 rounded-full border-primary/30 bg-accent px-2.5 font-mono text-[10px] font-semibold uppercase tracking-normal text-primary"
          >
            <CheckCircle2 aria-hidden="true" className="size-3" />
            System ready
          </Badge>
          <span>stage 01 / 11</span>
        </footer>
      </div>
    </Card>
  )
}
