import { useState } from 'react'
import { CheckCircle2, Database, Gauge, KeyRound, ShieldCheck, TimerReset } from 'lucide-react'

import { TooltipProvider } from '@/components/ui/tooltip'

import { LoopPipelineShell, StageChip, type Stage, type VisualProps } from './shared/loop-pipeline-kit'
import { VisualStateController } from './shared/visual-state-control'

const constraintLayers: Stage[] = [
  { id: 'architecture', code: 'ARCH', label: 'Architecture', detail: 'Service, schema, and configuration boundaries decide validation shape.', Icon: Database, tone: 'hold' },
  { id: 'speed', code: 'OPT', label: 'Optimization', detail: 'Caches, matrices, and parallelism must preserve evidence.', Icon: Gauge, tone: 'active' },
  { id: 'permissions', code: 'PERM', label: 'Permissions', detail: 'Each stage needs scoped power and audit records.', Icon: KeyRound, tone: 'risk' },
  { id: 'security', code: 'SEC', label: 'Security and compliance', detail: 'Policy, approval, scanning, and provenance gates protect releases.', Icon: ShieldCheck, tone: 'risk' },
  { id: 'recovery', code: 'RCV', label: 'Recovery', detail: 'Rollback and roll-forward paths keep release risk controlled.', Icon: TimerReset, tone: 'hold' },
]

export function SimpleVsProductionRealitySlideVisual({ className }: VisualProps) {
  const [depth, setDepth] = useState('3')
  const depthCount = Number(depth)
  const visibleLayers = constraintLayers.slice(0, depthCount)

  return (
    <TooltipProvider>
      <LoopPipelineShell
        className={className}
        label="Simple six stage model compared with production constraints"
        code="REAL_06"
        status={`${depthCount} layers shown`}
        railContent={
          <div className="grid content-start gap-3">
            <div className="rounded-md border border-primary/25 bg-accent/70 p-2">
              <p className="font-mono text-[9px] font-semibold uppercase leading-4 text-primary">production reality</p>
              <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                The six steps remain useful, but each production layer adds boundaries that must keep evidence visible.
              </p>
            </div>
            <div className="grid gap-2">
              {visibleLayers.map((layer) => (
                <StageChip key={layer.id} stage={layer} compact />
              ))}
            </div>
          </div>
        }
        controls={
          <VisualStateController
            model={{
              label: 'Production layers',
              value: depth,
              onValueChange: setDepth,
              steps: [
                {
                  value: '1',
                  label: 'One layer',
                  shortLabel: '1 layer',
                  description: 'Only the first production constraint is visible, keeping the model simple.',
                  status: 'thin context',
                },
                {
                  value: '3',
                  label: 'Three layers',
                  shortLabel: '3 layers',
                  description: 'Architecture, optimization, and permissions show where the clean model starts to bend.',
                  status: 'working context',
                },
                {
                  value: '5',
                  label: 'Five layers',
                  shortLabel: '5 layers',
                  description: 'The full production path includes security and recovery controls before confidence survives.',
                  status: 'full context',
                },
              ],
            }}
          />
        }
      >
        <div className="grid h-full min-h-[25rem] w-full gap-3 lg:grid-cols-[minmax(8rem,0.55fr)_minmax(0,1.45fr)]">
          <div className="flex min-h-0 flex-col justify-center rounded-md border border-border bg-card/80 p-3">
            <p className="font-mono text-[9px] font-semibold uppercase leading-4 text-muted-foreground">clean model</p>
            <div className="mt-3 grid gap-2">
              {['Validate', 'Build', 'Infra', 'Deploy', 'Verify', 'Feedback'].map((label, index) => (
                <div key={label} className="flex items-center gap-2 rounded-sm border border-border bg-background/70 px-2 py-2">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-muted font-mono text-[8px] font-semibold text-muted-foreground">
                    {index + 1}
                  </span>
                  <span className="text-[11px] font-semibold leading-4 text-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex min-h-0 flex-col rounded-md border border-border bg-card/80 p-3">
            <p className="font-mono text-[9px] font-semibold uppercase leading-4 text-muted-foreground">production path with controls</p>
            <div className="relative mt-3 grid flex-1 content-center gap-3">
              <div aria-hidden="true" className="absolute bottom-4 left-5 top-4 w-px bg-border" />
              {visibleLayers.map((layer, index) => (
                <div key={layer.id} className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-2">
                  <span className="z-10 mt-1 flex size-7 items-center justify-center rounded-full border border-primary/25 bg-background font-mono text-[8px] font-semibold text-primary">
                    {index + 1}
                  </span>
                  <StageChip stage={layer} />
                </div>
              ))}
              <div className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-2">
                <span className="z-10 mt-1 flex size-7 items-center justify-center rounded-full border border-chart-2/30 bg-background text-chart-2">
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                </span>
                <div className="rounded-md border border-chart-2/30 bg-chart-2/10 px-3 py-3">
                  <p className="text-[11px] font-semibold leading-4 text-foreground">Release confidence survives the constraints.</p>
                  <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">Evidence remains visible across boundaries.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </LoopPipelineShell>
    </TooltipProvider>
  )
}
