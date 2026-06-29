import { useState } from 'react'
import { BrainCircuit, Waypoints } from 'lucide-react'

import { cn } from '@/lib/utils'

import { FamilyShell, MiniCard, toneClasses, type Tone, type VisualProps } from './shared/evidence-metrics-kit'
import { VisualStateController } from './shared/visual-state-control'

const constellationClusters = [
  ['Speed', 'lead time / frequency', 'primary', 'left-[2%] top-[12%]'],
  ['Reliability', 'failure / recovery', 'success', 'right-[2%] top-[12%]'],
  ['Trust', 'trace / flakes', 'primary', 'left-[36%] top-[34%]'],
  ['Efficiency', 'cache / capacity', 'warning', 'left-[2%] bottom-[8%]'],
  ['Security', 'gates / audit', 'danger', 'right-[2%] bottom-[8%]'],
] as const

const tradeoffNotes = {
  gates: 'More gates can reduce risk while increasing lead time.',
  parallelism: 'More parallelism improves feedback while raising cost and runner pressure.',
  selective: 'Selective validation saves time but can miss dependency risk.',
} as const

const tradeoffLegend = [
  ['gates', 'Gates vs lead time', 'solid when selected', 'stroke-primary/70'],
  ['parallelism', 'Parallelism vs cost', 'solid when selected', 'stroke-chart-4/70'],
  ['selective', 'Selective validation risk', 'solid when selected', 'stroke-destructive/70'],
] as const

export function MetricConstellationSlideVisual({ className }: VisualProps) {
  const [tradeoff, setTradeoff] = useState<keyof typeof tradeoffNotes>('gates')

  return (
    <FamilyShell
      className={className}
      title="Metric constellation"
      code="METRIC_09"
      status="context balanced"
      ariaLabel="Five cluster release confidence model with tension lines and interpretation labels"
      railDensity="dense"
      railContent={
        <div className="grid gap-3">
          <MiniCard label="Interpretation" value={tradeoff} detail={tradeoffNotes[tradeoff]} Icon={BrainCircuit} tone="primary" active />
          <div className="grid gap-1 rounded-md border border-border bg-card/80 p-2" aria-label="Metric tension line legend">
            {tradeoffLegend.map(([key, label, detail, color]) => (
              <div key={label} className="flex min-w-0 items-center gap-2">
                <svg aria-hidden="true" viewBox="0 0 32 4" className="h-1 w-8 shrink-0">
                  <path d="M1 2 H31" className={color} fill="none" strokeWidth="2" strokeDasharray={tradeoff === key ? '0' : '5 4'} />
                </svg>
                <span className="text-[9px] leading-3 text-muted-foreground">
                  {label} <span className="font-mono uppercase">{detail}</span>
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] leading-4 text-muted-foreground">
            No cluster wins alone. The chosen release model decides which tension is acceptable and which evidence must
            stay visible.
          </p>
        </div>
      }
      controls={
        <VisualStateController
          model={{
            label: 'Metric tension',
            value: tradeoff,
            onValueChange: setTradeoff,
            steps: [
              {
                value: 'gates',
                label: 'Gates',
                description: tradeoffNotes.gates,
                status: 'risk / time',
              },
              {
                value: 'parallelism',
                label: 'Parallelism',
                description: tradeoffNotes.parallelism,
                status: 'speed / cost',
              },
              {
                value: 'selective',
                label: 'Selective',
                description: tradeoffNotes.selective,
                status: 'time / coverage',
              },
            ],
          }}
        />
      }
    >
      <div className="grid h-full gap-3">
        <div className="relative min-h-[22rem] rounded-md border border-border bg-card/55 p-3">
          <svg aria-hidden="true" viewBox="0 0 320 190" preserveAspectRatio="none" className="absolute inset-0 size-full">
            <path d="M56 46 C143 44 178 44 264 46" className="stroke-primary/35" fill="none" strokeWidth="1.5" strokeDasharray={tradeoff === 'gates' ? '0' : '5 7'} />
            <path d="M70 148 C126 88 178 88 250 148" className="stroke-chart-4/45" fill="none" strokeWidth="1.5" strokeDasharray={tradeoff === 'parallelism' ? '0' : '5 7'} />
            <path d="M160 88 C128 120 102 142 70 148" className="stroke-destructive/40" fill="none" strokeWidth="1.5" strokeDasharray={tradeoff === 'selective' ? '0' : '5 7'} />
          </svg>
          {constellationClusters.map(([label, detail, tone, position]) => (
            <div
              key={label}
              className={cn('absolute w-[6.5rem] rounded-md border bg-card/90 p-2 shadow-sm', toneClasses[tone as Tone].border, position)}
            >
              <p className="truncate text-[11px] font-semibold leading-4 text-foreground">{label}</p>
              <p className="truncate font-mono text-[8px] uppercase leading-3 tracking-normal text-muted-foreground">{detail}</p>
            </div>
          ))}
          <div className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-primary/30 bg-accent text-primary">
            <Waypoints className="size-5" strokeWidth={2.2} />
            <span className="mt-1 font-mono text-[7px] font-semibold uppercase">context</span>
          </div>
        </div>
      </div>
    </FamilyShell>
  )
}
