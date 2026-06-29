import { useState } from 'react'
import { Database, Route, ShieldCheck, TimerReset, XCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import { FamilyShell, MiniCard, type VisualProps } from './shared/evidence-metrics-kit'
import { VisualStateController } from './shared/visual-state-control'

const trustRows = [
  ['Flaky-test rate', '1.8%', 'Trust failures only when flakes are visible.', XCircle],
  ['Cache hit rate', '86%', 'Pair hit rate with transfer time and correctness.', Database],
  ['Traceability', 'linked', 'Source, artifact, deploy, and outcome stay connected.', Route],
  ['Rollback readiness', 'ready', 'Known-good artifact and compatible recovery path exist.', TimerReset],
] as const

export function TrustEfficiencyMetricsSlideVisual({ className }: VisualProps) {
  const [scenario, setScenario] = useState<'healthy' | 'unhealthy'>('healthy')
  const unhealthy = scenario === 'unhealthy'

  return (
    <FamilyShell
      className={className}
      title="Trust and efficiency board"
      code="TRUST_07"
      status={unhealthy ? 'speed untrusted' : 'confidence strong'}
      ariaLabel="Paired trust and efficiency board with confidence and unhealthy scenario labels"
      railDensity="dense"
      railContent={
        <div className="grid gap-3">
          <Badge
            variant="outline"
            className={cn(
              'h-auto w-fit rounded-sm px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-normal',
              unhealthy ? 'border-destructive/40 bg-destructive/10 text-destructive' : 'border-primary/30 bg-accent text-primary',
            )}
          >
            confidence {unhealthy ? 'drops' : 'holds'}
          </Badge>
          <div>
            <p className="text-sm font-semibold leading-5 text-foreground">
              {unhealthy ? 'Speed improved, but the evidence is no longer dependable.' : 'Efficiency counts because trust conditions remain intact.'}
            </p>
            <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
              Read each row as signal plus condition: flakes, cache correctness, traceability, and rollback readiness decide
              whether speed remains trustworthy.
            </p>
          </div>
        </div>
      }
      controls={
        <VisualStateController
          model={{
            label: 'Trust scenario',
            value: scenario,
            onValueChange: setScenario,
            steps: [
              {
                value: 'healthy',
                label: 'Healthy',
                description: 'Efficiency signals count because flakes, caches, traceability, and rollback evidence remain trustworthy.',
                status: 'confidence holds',
              },
              {
                value: 'unhealthy',
                label: 'Unhealthy',
                description: 'Speed looks better, but flake and cache signals undermine release confidence.',
                status: 'confidence drops',
              },
            ],
          }}
        />
      }
    >
      <div className="grid h-full content-center gap-3">
        <div className="grid gap-2">
          {trustRows.map(([signal, value, condition, Icon], index) => {
            const risky = unhealthy && index < 2
            return (
              <div key={signal} className="grid gap-2 rounded-md border border-border bg-card/75 p-2 sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                <MiniCard label={signal} value={risky ? (index === 0 ? '9.4%' : '94%') : value} detail="Efficiency signal" Icon={Icon} tone={risky ? 'warning' : 'primary'} active={risky} />
                <MiniCard label="Confidence condition" value={risky ? 'unhealthy scenario' : 'evidence condition'} detail={risky ? 'Looks faster, but failures or caches are no longer trustworthy.' : condition} Icon={ShieldCheck} tone={risky ? 'danger' : 'success'} active />
              </div>
            )
          })}
        </div>
      </div>
    </FamilyShell>
  )
}
