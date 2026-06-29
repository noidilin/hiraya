import { useMemo, useState } from 'react'
import { AlertTriangle, Bot, CheckCircle2, Gauge, GitBranch, PackageCheck, Route } from 'lucide-react'

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

const suggestions = [
  {
    id: 'ordering',
    label: 'Fail-fast ordering',
    detail: 'Run cheap deterministic checks before the slow matrix.',
    risk: 'low',
    after: [3, 3, 14, 2, 2, 3],
    Icon: Route,
  },
  {
    id: 'cache',
    label: 'Cache key review',
    detail: 'Split dependency cache from source-derived build cache.',
    risk: 'medium',
    after: [5, 2, 17, 2, 2, 3],
    Icon: PackageCheck,
  },
  {
    id: 'shard',
    label: 'Shard slow tests',
    detail: 'Parallelize only after flaky tests are identified.',
    risk: 'medium',
    after: [4, 3, 11, 3, 3, 3],
    Icon: GitBranch,
  },
  {
    id: 'repeat',
    label: 'Repeated-work detection',
    detail: 'Flag identical setup and build steps across jobs before caching.',
    risk: 'low',
    after: [5, 2, 13, 2, 2, 3],
    Icon: Gauge,
  },
] as const

const timingSegments = [
  { id: 'queue', label: 'queue', before: 8 },
  { id: 'setup', label: 'setup', before: 4 },
  { id: 'exec', label: 'exec', before: 22 },
  { id: 'xfer', label: 'transfer', before: 3 },
  { id: 'lock', label: 'lock', before: 4 },
  { id: 'deploy', label: 'deploy wait', before: 5 },
] as const

const checklistItems = ['what ran', 'what skipped', 'what built', 'what deployed'] as const

function TimingBar({
  label,
  values,
  total,
  tone,
}: {
  label: string
  values: readonly number[]
  total: number
  tone: Tone
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="font-mono text-[9px] font-semibold uppercase leading-3 tracking-normal text-muted-foreground">
          {label}
        </p>
        <p className="font-mono text-[10px] font-semibold leading-3 text-foreground">{total}m</p>
      </div>
      <ul
        className="flex h-8 list-none overflow-hidden rounded-md border border-border bg-border p-0"
        aria-label={`${label} timing segments, total ${total} minutes`}
      >
        {values.map((value, index) => (
          <li
            key={timingSegments[index].id}
            className={cn(
              'flex min-w-[1.2rem] items-center justify-center border-r border-border last:border-r-0 transition-[flex-basis] duration-300 motion-reduce:transition-none',
              index % 2 === 0 ? toneClasses[tone].bg : 'bg-card',
            )}
            style={{ flexBasis: `${Math.max(value, 1)}%`, flexGrow: value }}
            aria-label={`${timingSegments[index].label}: ${value} minutes`}
            title={`${timingSegments[index].label}: ${value} minutes`}
          >
            <span className="px-1 font-mono text-[8px] font-semibold uppercase tracking-normal text-muted-foreground">
              {value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function OptimizationAssistantPanelSlideVisual({ className }: VisualProps) {
  const [selectedId, setSelectedId] = useState<(typeof suggestions)[number]['id']>('ordering')
  const selected = suggestions.find((item) => item.id === selectedId) ?? suggestions[0]
  const beforeValues = timingSegments.map((segment) => segment.before)
  const beforeTotal = beforeValues.reduce((sum, value) => sum + value, 0)
  const afterTotal = selected.after.reduce((sum, value) => sum + value, 0)
  const delta = beforeTotal - afterTotal
  const riskTone: Tone = selected.risk === 'low' ? 'success' : 'warning'
  const confidence = useMemo(() => (selected.risk === 'low' ? 'suggestion has evidence path' : 'needs flaky-test review'), [selected.risk])

  return (
    <TrustTradeoffShell
      className={className}
      title="Measured optimization workspace"
      code="AI_OPT_29"
      status="suggestion pending proof"
      ariaLabel="Optimization assistant panel with selectable AI suggestions, before and after timing bars, and evidence risk checklist"
      railContent={
        <div className="grid content-start gap-3">
          <div className="rounded-md border border-primary/25 bg-accent/70 p-2">
            <div className="flex items-center gap-2">
              <IconBadge Icon={Bot} tone="primary" />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold leading-4 text-foreground">{selected.label}</p>
                <p className="text-[11px] leading-4 text-muted-foreground">{selected.detail}</p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] leading-4 text-muted-foreground">
              <StatusBadge tone={riskTone}>{selected.risk} risk</StatusBadge>
              <span aria-live="polite">
                AI suggests saving {delta} minutes; {confidence}.
              </span>
            </div>
          </div>
          <div className="grid gap-2" aria-label="AI optimization suggestions">
            {suggestions.map((suggestion) => {
              const Icon = suggestion.Icon
              const active = suggestion.id === selectedId

              return (
                <div
                  key={suggestion.id}
                  className={cn(
                    'flex min-w-0 items-center gap-2 rounded-md border bg-card/82 p-2 text-left transition-colors motion-reduce:transition-none',
                    active && 'border-primary/35 bg-accent/70 text-primary',
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold leading-4">{suggestion.label}</span>
                    <span className="block truncate font-mono text-[8px] uppercase leading-3 tracking-normal text-muted-foreground">
                      {suggestion.risk} risk
                    </span>
                  </span>
                </div>
              )
            })}
          </div>
          <div className="grid gap-2" aria-label="Evidence risk review">
            {checklistItems.map((item, index) => {
              const risk = selected.risk === 'medium' && index === 1
              const Icon = risk ? AlertTriangle : CheckCircle2

              return (
                <div
                  key={item}
                  className={cn('flex min-w-0 items-center gap-2 rounded-md border bg-card/82 p-2', risk ? toneClasses.warning.border : toneClasses.success.border)}
                >
                  <IconBadge Icon={Icon} tone={risk ? 'warning' : 'success'} />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold capitalize leading-4 text-foreground">{item}</p>
                    <p className="truncate font-mono text-[8px] uppercase leading-3 tracking-normal text-muted-foreground">
                      {risk ? 'must explain' : 'visible'}
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
            label: 'Suggestion',
            value: selectedId,
            onValueChange: setSelectedId,
            steps: suggestions.map((suggestion) => ({
              value: suggestion.id,
              label: suggestion.label,
              shortLabel: suggestion.label.replace(' ', '\u00a0'),
              description: `${suggestion.detail} Timing bars, risk badge, and checklist evidence update for this suggestion.`,
              status: `${suggestion.risk} risk`,
            })),
          }}
        />
      }
    >
      <div className="grid h-full min-h-[26rem] w-full content-center gap-4 rounded-lg border border-border bg-card/72 p-4">
          <TimingBar label="before" values={beforeValues} total={beforeTotal} tone="muted" />
          <TimingBar label="after suggestion" values={selected.after} total={afterTotal} tone="primary" />
          <div className="grid grid-cols-2 gap-1 text-center font-mono text-[8px] font-semibold uppercase leading-3 tracking-normal text-muted-foreground">
            {timingSegments.map((segment, index) => (
              <span key={segment.id} className="truncate">
                {segment.label}: {selected.after[index]}m
              </span>
            ))}
          </div>
          <div className="rounded-md border border-primary/25 bg-accent/70 p-3">
            <div className="flex items-center gap-2">
              <IconBadge Icon={Bot} tone="primary" />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold leading-4 text-foreground">{selected.label}</p>
                <p className="text-[11px] leading-4 text-muted-foreground">{selected.detail}</p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] leading-4 text-muted-foreground">
              <StatusBadge tone={riskTone}>{selected.risk} risk</StatusBadge>
              <span aria-live="polite">
                AI suggests saving {delta} minutes; {confidence}.
              </span>
            </div>
          </div>
      </div>
    </TrustTradeoffShell>
  )
}
