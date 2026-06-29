import { useState } from 'react'
import { KeyRound, LockKeyhole, PackageCheck, PauseCircle, TimerReset } from 'lucide-react'

import { cn } from '@/lib/utils'

import {
  IconBadge,
  StatusBadge,
  TrustTradeoffShell,
  toneClasses,
  type Tone,
  type VisualProps,
} from './shared/trust-tradeoff-kit'
import { VisualStateController } from './shared/visual-state-control'

const tradeoffScenarios = [
  {
    id: 'cache',
    label: 'Cache reuse',
    safer: 'bounded cache key, source visible',
    faster: 'fast but stale risk',
    Icon: PackageCheck,
    safePos: { left: '46%', top: '34%' },
    fastPos: { left: '70%', top: '52%' },
  },
  {
    id: 'secrets',
    label: 'Production credential',
    safer: 'protected deploy gate',
    faster: 'too much privilege',
    Icon: KeyRound,
    safePos: { left: '36%', top: '58%' },
    fastPos: { left: '78%', top: '72%' },
  },
  {
    id: 'skip',
    label: 'Skipped jobs',
    safer: 'skip is named and reversible',
    faster: 'hidden evidence gap',
    Icon: PauseCircle,
    safePos: { left: '50%', top: '50%' },
    fastPos: { left: '76%', top: '36%' },
  },
  {
    id: 'parallel',
    label: 'Runner parallelism',
    safer: 'capacity monitored',
    faster: 'queue moves, flakes rise',
    Icon: TimerReset,
    safePos: { left: '58%', top: '26%' },
    fastPos: { left: '82%', top: '24%' },
  },
  {
    id: 'retries',
    label: 'Retry policy',
    safer: 'retry reason logged',
    faster: 'failures hidden by rerun',
    Icon: TimerReset,
    safePos: { left: '42%', top: '44%' },
    fastPos: { left: '74%', top: '46%' },
  },
  {
    id: 'gate',
    label: 'Protected deploy gate',
    safer: 'auditable release power',
    faster: 'must not bypass approval',
    Icon: LockKeyhole,
    safePos: { left: '30%', top: '36%' },
    fastPos: { left: '66%', top: '64%' },
  },
] as const

export function TradeoffFrameSlideVisual({ className }: VisualProps) {
  const [mode, setMode] = useState<'safer' | 'faster'>('safer')
  const activeTone: Tone = mode === 'safer' ? 'success' : 'warning'

  return (
    <TrustTradeoffShell
      className={className}
      title="Speed trust privilege tradeoff frame"
      code="TRIAXIS_20"
      status={mode === 'safer' ? 'bounded + auditable' : 'warnings visible'}
      ariaLabel="Tri-axis tradeoff frame plotting speed, trust, and privilege scenarios with text interpretation"
      railContent={
        <div className="grid content-start gap-3">
          <div className="rounded-md border border-primary/25 bg-accent/70 p-2">
            <p className="font-mono text-[9px] font-semibold uppercase leading-4 text-primary">posture reading</p>
            <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
              {mode === 'safer'
                ? 'Speed changes stay bounded when the trust and privilege cost remains auditable.'
                : 'Speed gains can be discussed only when privilege and trust warnings stay visible.'}
            </p>
          </div>
          <div className="grid gap-2" aria-label="Scenario interpretation cards">
            {tradeoffScenarios.map((scenario) => {
              const Icon = scenario.Icon

              return (
                <div
                  key={scenario.id}
                  className={cn('min-w-0 rounded-md border bg-card/82 p-2', toneClasses[activeTone].border)}
                >
                  <div className="flex items-center gap-2">
                    <IconBadge Icon={Icon} tone={activeTone} />
                    <p className="truncate text-xs font-semibold leading-4 text-foreground">{scenario.label}</p>
                  </div>
                  <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                    {mode === 'safer' ? scenario.safer : scenario.faster}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      }
      controls={
        <VisualStateController
          model={{
            label: 'Tradeoff posture',
            value: mode,
            onValueChange: setMode,
            steps: [
              {
                value: 'safer',
                label: 'Safer',
                description: 'Plots scenarios where speed changes are bounded and evidence remains auditable.',
                status: 'evidence preserved',
              },
              {
                value: 'faster',
                label: 'Faster',
                description: 'Plots scenarios where speed gains move toward visible trust and privilege warnings.',
                status: 'risk warning',
              },
            ],
          }}
        />
      }
    >
      <div className="h-full min-h-[26rem] w-full">
        <div className="flex h-full min-h-0 flex-col rounded-lg border border-border bg-card/72 p-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-[9px] font-semibold uppercase leading-3 text-muted-foreground">scenario plot</p>
            <StatusBadge tone={activeTone}>{mode === 'safer' ? 'evidence preserved' : 'risk warning'}</StatusBadge>
          </div>

          <div className="relative min-h-0 flex-1 overflow-hidden rounded-md border border-border bg-background/70">
            <div className="absolute bottom-8 left-7 right-6 h-px bg-border" />
            <div className="absolute bottom-8 left-7 top-5 w-px bg-border" />
            <div className="absolute bottom-8 left-7 h-px w-[82%] origin-left -rotate-[32deg] bg-border" />
            <span className="absolute bottom-1 right-4 font-mono text-[8px] font-semibold uppercase tracking-normal text-muted-foreground">
              more speed
            </span>
            <span className="absolute left-2 top-2 font-mono text-[8px] font-semibold uppercase tracking-normal text-muted-foreground">
              more trust
            </span>
            <span className="absolute bottom-12 left-20 font-mono text-[8px] font-semibold uppercase tracking-normal text-muted-foreground">
              more privilege
            </span>

            {tradeoffScenarios.map((scenario) => {
              const Icon = scenario.Icon
              const pos = mode === 'safer' ? scenario.safePos : scenario.fastPos

              return (
                <button
                  key={scenario.id}
                  type="button"
                  style={pos}
                  className={cn(
                    'absolute flex max-w-[7.5rem] -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-md border bg-card/95 px-1.5 py-1 text-left shadow-sm outline-none transition-[left,top,background-color,border-color] duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none',
                    toneClasses[activeTone].border,
                  )}
                  aria-label={`${scenario.label}: ${mode === 'safer' ? scenario.safer : scenario.faster}`}
                >
                  <Icon className={cn('size-3.5 shrink-0', toneClasses[activeTone].text)} aria-hidden="true" />
                  <span className="min-w-0 truncate text-[10px] font-semibold leading-3 text-foreground">
                    {scenario.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </TrustTradeoffShell>
  )
}
