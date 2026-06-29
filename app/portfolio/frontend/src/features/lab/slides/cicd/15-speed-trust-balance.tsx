import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Gauge, GitBranch, PackageCheck, Route, Zap } from 'lucide-react'

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

const speedStates = [
  {
    value: 'careful',
    label: 'Careful',
    meter: 82,
    warning: 'Longer feedback, evidence remains visible.',
    tone: 'success' as Tone,
  },
  {
    value: 'balanced',
    label: 'Balanced',
    meter: 76,
    warning: 'Fast path is acceptable because skipped work is recorded.',
    tone: 'primary' as Tone,
  },
  {
    value: 'aggressive',
    label: 'Aggressive',
    meter: 41,
    warning: 'Speed hides evidence unless traceability conditions are met.',
    tone: 'warning' as Tone,
  },
] as const

const levers = [
  { id: 'failfast', label: 'Fail-fast order', condition: 'keep full failure record', Icon: Route },
  { id: 'cache', label: 'Cache reuse', condition: 'pin cache key + source', Icon: PackageCheck },
  { id: 'matrix', label: 'Matrix shards', condition: 'show shard coverage', Icon: GitBranch },
  { id: 'capacity', label: 'Runner burst', condition: 'watch queue and flakes', Icon: Zap },
] as const

const riskTokens = ['Skipped jobs named', 'Cache freshness proven', 'Flakes quarantined', 'Artifact unchanged'] as const

export function SpeedTrustBalanceSlideVisual({ className }: VisualProps) {
  const [speed, setSpeed] = useState<(typeof speedStates)[number]['value']>('balanced')
  const state = speedStates.find((item) => item.value === speed) ?? speedStates[1]
  const aggressive = speed === 'aggressive'

  return (
    <TrustTradeoffShell
      className={className}
      title="Speed and trust control surface"
      code="BALANCE_15"
      status="evidence required"
      ariaLabel="Speed and trust balance with optimization levers, evidence risks, and confidence meter"
      railContent={
        <div className="grid content-start gap-3">
          <div className="rounded-md border border-primary/25 bg-accent/70 p-2">
            <p className="font-mono text-[9px] font-semibold uppercase leading-4 text-primary">selected posture</p>
            <p className="mt-1 text-[11px] leading-4 text-muted-foreground" aria-live="polite">
              {state.warning}
            </p>
          </div>
          <div className="grid gap-2" aria-label="Optimization lever conditions">
            {levers.map((lever) => {
              const Icon = lever.Icon

              return (
                <div key={lever.id} className="flex min-w-0 items-center gap-2 rounded-md border border-border bg-card/82 p-2 text-left">
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold leading-4">{lever.label}</span>
                    <span className="block truncate font-mono text-[8px] uppercase leading-3 tracking-normal text-muted-foreground">
                      {lever.condition}
                    </span>
                  </span>
                </div>
              )
            })}
          </div>
          <div className="grid gap-2" aria-label="Evidence risk checklist">
            {riskTokens.map((risk, index) => {
              const risky = aggressive && index < 2
              const Icon = risky ? AlertTriangle : CheckCircle2

              return (
                <div
                  key={risk}
                  className={cn(
                    'flex min-w-0 items-center gap-2 rounded-md border bg-card/82 p-2',
                    risky ? toneClasses.warning.border : toneClasses.success.border,
                  )}
                >
                  <IconBadge Icon={Icon} tone={risky ? 'warning' : 'success'} />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold leading-4 text-foreground">{risk}</p>
                    <p className="truncate font-mono text-[8px] uppercase leading-3 tracking-normal text-muted-foreground">
                      {risky ? 'warning before speed counts' : 'preserved evidence'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      }
      controls={
        <VisualStateController
          model={{
            label: 'Speed posture',
            value: speed,
            onValueChange: setSpeed,
            steps: speedStates.map((item) => ({
              value: item.value,
              label: item.label,
              description: `${item.warning} Confidence reads ${item.meter} percent.`,
              status: `${item.meter}% confidence`,
            })),
            ariaValueText: (step, index) => `${step.label} speed, ${speedStates[index]?.meter ?? state.meter} percent confidence`,
          }}
        />
      }
    >
      <div className="grid h-full min-h-[26rem] gap-3 lg:grid-cols-[minmax(8rem,0.8fr)_minmax(14rem,1.4fr)_minmax(8rem,0.8fr)]">
        <div className="grid content-center gap-2" aria-label="Optimization levers">
          {levers.map((lever) => {
            const Icon = lever.Icon

            return (
              <div
                key={lever.id}
                className="flex min-w-0 items-center gap-2 rounded-md border border-border bg-card/82 p-2 text-left"
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold leading-4">{lever.label}</span>
                  <span className="block truncate font-mono text-[8px] uppercase leading-3 tracking-normal text-muted-foreground">
                    {lever.condition}
                  </span>
                </span>
              </div>
            )
          })}
        </div>

        <div className="flex min-h-0 flex-col items-center justify-center rounded-lg border border-primary/25 bg-card/82 p-4 text-center">
          <div className="mb-2 flex justify-center">
            <StatusBadge tone={state.tone}>{state.label}</StatusBadge>
          </div>
          <div className="mx-auto flex size-[min(22rem,72%)] min-h-56 min-w-56 flex-col items-center justify-center rounded-full border border-border bg-background/80 shadow-[0_0_0_10px_color-mix(in_oklch,var(--primary),transparent_94%)]">
            <Gauge className={cn('size-8', toneClasses[state.tone].text)} aria-hidden="true" />
            <p className="mt-2 font-mono text-4xl font-semibold leading-10 text-foreground">{state.meter}%</p>
            <p className="font-mono text-[8px] uppercase leading-3 tracking-normal text-muted-foreground">
              confidence
            </p>
          </div>
          <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
            Optimization only counts when each shortcut keeps its evidence condition visible.
          </p>
          <p className="mt-1 text-[11px] leading-4 text-muted-foreground" aria-live="polite">
            {state.warning}
          </p>
        </div>

        <div className="grid content-center gap-2" aria-label="Evidence risk checklist">
          {riskTokens.map((risk, index) => {
            const risky = aggressive && index < 2
            const Icon = risky ? AlertTriangle : CheckCircle2

            return (
              <div
                key={risk}
                className={cn(
                  'flex min-w-0 items-center gap-2 rounded-md border bg-card/82 p-2',
                  risky ? toneClasses.warning.border : toneClasses.success.border,
                )}
              >
                <IconBadge Icon={Icon} tone={risky ? 'warning' : 'success'} />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold leading-4 text-foreground">{risk}</p>
                  <p className="truncate font-mono text-[8px] uppercase leading-3 tracking-normal text-muted-foreground">
                    {risky ? 'warning before speed counts' : 'preserved evidence'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </TrustTradeoffShell>
  )
}
