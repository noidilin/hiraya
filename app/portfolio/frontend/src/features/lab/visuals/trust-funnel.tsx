import type { CSSProperties } from 'react'
import type { LucideIcon } from 'lucide-react'
import { FlaskConical, GitCommitHorizontal, Rocket } from 'lucide-react'

import { NumberTicker } from '@/components/motion/number-ticker'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

type TrustGate = {
  id: string
  label: string
  count: number
  unit: string
  detail: string
  width: string
  progress: number
  Icon: LucideIcon
  tone: 'muted' | 'active' | 'release'
}

type TrustFunnelProps = {
  className?: string
}

const trustGates: TrustGate[] = [
  {
    id: 'commits',
    label: 'Commit intake',
    count: 120,
    unit: 'commits',
    detail: 'Raw changes enter the pipeline',
    width: '100%',
    progress: 100,
    Icon: GitCommitHorizontal,
    tone: 'muted',
  },
  {
    id: 'tests',
    label: 'Verified tests',
    count: 45,
    unit: 'tests',
    detail: 'Only passing evidence moves forward',
    width: '76%',
    progress: 68,
    Icon: FlaskConical,
    tone: 'active',
  },
  {
    id: 'release',
    label: 'Release candidate',
    count: 1,
    unit: 'release',
    detail: 'A single trusted output ships',
    width: '52%',
    progress: 100,
    Icon: Rocket,
    tone: 'release',
  },
]

const gateToneClassNames: Record<TrustGate['tone'], string> = {
  muted: 'border-border bg-card text-foreground',
  active: 'border-primary/35 bg-accent text-foreground ring-1 ring-primary/15',
  release:
    'border-primary bg-primary text-primary-foreground shadow-[0_8px_24px_color-mix(in_oklch,var(--primary),transparent_82%)]',
}

const iconToneClassNames: Record<TrustGate['tone'], string> = {
  muted: 'border-border bg-muted text-muted-foreground',
  active: 'border-primary/30 bg-primary text-primary-foreground',
  release: 'border-primary-foreground/35 bg-primary-foreground/15 text-primary-foreground',
}

export function TrustFunnel({ className }: TrustFunnelProps) {
  return (
    <Card
      aria-label="Trust funnel reducing commits through tests into a release"
      className={cn(
        'relative min-h-[190px] gap-0 overflow-hidden rounded-lg border-border/90 bg-background/45 p-3 shadow-none ring-1 ring-border/70 sm:p-4',
        'before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--primary),transparent_92%),transparent_44%)]',
        className,
      )}
    >
      <div className="relative z-10 flex h-full min-h-[166px] flex-col">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold leading-4 tracking-normal text-foreground">
              Trust gates
            </p>
            <p className="truncate font-mono text-[10px] leading-4 text-muted-foreground">
              {'commits -> tests -> release'}
            </p>
          </div>
          <Badge
            variant="outline"
            className="h-5 shrink-0 border-primary/25 bg-accent px-2 font-mono text-[9px] font-semibold uppercase tracking-normal text-primary"
          >
            FLTR_SEQ_01
          </Badge>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-2">
          {trustGates.map((gate) => {
            const Icon = gate.Icon

            return (
              <div key={gate.id} className="flex justify-center">
                <div
                  className={cn(
                    'relative min-w-[9.75rem] max-w-full overflow-hidden rounded-lg border transition duration-150',
                    gateToneClassNames[gate.tone],
                  )}
                  style={{ width: gate.width } as CSSProperties}
                >
                  <div className="w-full">
                    <div className="flex min-w-0 items-center justify-between gap-2 px-2.5 py-2 sm:px-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          aria-hidden="true"
                          className={cn(
                            'flex size-7 shrink-0 items-center justify-center rounded-md border',
                            iconToneClassNames[gate.tone],
                          )}
                        >
                          <Icon className="size-3.5" strokeWidth={2.2} />
                        </span>
                        <span className="min-w-0">
                          <span
                            className={cn(
                              'block truncate text-xs font-semibold leading-4 tracking-normal',
                              gate.tone === 'release' ? 'text-primary-foreground' : 'text-foreground',
                            )}
                          >
                            {gate.label}
                          </span>
                          <span
                            className={cn(
                              'block truncate font-mono text-[9px] leading-3',
                              gate.tone === 'release'
                                ? 'text-primary-foreground/80'
                                : 'text-muted-foreground',
                            )}
                          >
                            {gate.detail}
                          </span>
                        </span>
                      </div>

                      <span
                        className={cn(
                          'shrink-0 whitespace-nowrap text-right font-mono text-[13px] font-semibold leading-4',
                          gate.tone === 'release' ? 'text-primary-foreground' : 'text-foreground',
                        )}
                      >
                        <NumberTicker
                          value={gate.count}
                          startOnView
                          blur
                          className="inline-flex justify-end"
                        />{' '}
                        <span
                          className={cn(
                            'text-[10px] font-medium',
                            gate.tone === 'release'
                              ? 'text-primary-foreground/85'
                              : 'text-muted-foreground',
                          )}
                        >
                          {gate.unit}
                        </span>
                      </span>
                    </div>

                    <Progress
                      aria-label={`${gate.count} ${gate.unit} trust gate`}
                      value={gate.progress}
                      className={cn(
                        'h-1 rounded-none bg-muted/70',
                        gate.tone === 'release'
                          ? 'bg-primary-foreground/20 [&>[data-slot=progress-indicator]]:bg-primary-foreground'
                          : gate.tone === 'active'
                            ? '[&>[data-slot=progress-indicator]]:bg-primary'
                            : '[&>[data-slot=progress-indicator]]:bg-muted-foreground/35',
                      )}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
