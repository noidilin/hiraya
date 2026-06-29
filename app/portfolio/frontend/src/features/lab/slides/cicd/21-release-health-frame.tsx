import { useState } from 'react'
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  Check,
  FileCheck2,
  Gauge,
  HeartPulse,
  PackageCheck,
  Server,
  ShieldCheck,
  Undo2,
} from 'lucide-react'

import { FamilyShell, MiniCard, type Tone, type VisualProps } from './shared/evidence-metrics-kit'
import { VisualStateController } from './shared/visual-state-control'

const releaseStates = {
  healthy: {
    label: 'Healthy',
    acceptance: 'Accepted after version, smoke, health, and rollback evidence.',
    tone: 'success' as Tone,
    signals: {
      smoke: ['Smoke pass', 'Critical paths respond after deploy.', 'success'],
      health: ['Health steady', 'Readiness, liveness, and synthetic checks agree.', 'success'],
      logs: ['Logs quiet', 'No new error pattern after the version change.', 'success'],
      metrics: ['Metrics normal', 'Latency and saturation stay inside budget.', 'success'],
      traces: ['Traces clean', 'Slow spans remain below the release threshold.', 'success'],
      alerts: ['Alerts quiet', 'No production alert is firing for this release.', 'success'],
      rollback: ['Rollback ready', 'Known-good artifact and command are rehearsed.', 'primary'],
      learning: ['Learning captured', 'Incident notes feed the next checklist.', 'primary'],
    },
  },
  warning: {
    label: 'Warning',
    acceptance: 'Hold acceptance until trace latency and alert noise are explained.',
    tone: 'warning' as Tone,
    signals: {
      smoke: ['Smoke pass', 'Critical paths respond, but acceptance still waits.', 'success'],
      health: ['Health mixed', 'One regional synthetic check is unstable.', 'warning'],
      logs: ['Log noise', 'New warning pattern needs owner review.', 'warning'],
      metrics: ['Metric drift', 'Latency is near the service objective boundary.', 'warning'],
      traces: ['Trace slow', 'Checkout spans are slower than the baseline.', 'warning'],
      alerts: ['Alert watch', 'A low-priority alert is noisy but not paging.', 'warning'],
      rollback: ['Rollback ready', 'Recovery path exists if warning turns into failure.', 'primary'],
      learning: ['Learning queued', 'Follow-up is attached before acceptance.', 'warning'],
    },
  },
  failed: {
    label: 'Failed',
    acceptance: 'Release is not accepted; restore known-good artifact and retain incident evidence.',
    tone: 'danger' as Tone,
    signals: {
      smoke: ['Smoke fail', 'Critical path fails after deploy.', 'danger'],
      health: ['Health failed', 'Readiness checks reject the deployed version.', 'danger'],
      logs: ['Errors rising', 'New exception signature starts at deploy time.', 'danger'],
      metrics: ['Metrics breached', 'Error rate and latency exceed release limits.', 'danger'],
      traces: ['Traces broken', 'Request path shows failing downstream calls.', 'danger'],
      alerts: ['Alert firing', 'Production page is linked to this release.', 'danger'],
      rollback: ['Rollback active', 'Restore known-good artifact before acceptance.', 'danger'],
      learning: ['Incident open', 'Keep evidence for the retro and checklist update.', 'warning'],
    },
  },
} as const

export function ReleaseHealthFrameSlideVisual({ className }: VisualProps) {
  const [state, setState] = useState<keyof typeof releaseStates>('warning')
  const current = releaseStates[state]
  const signalCards = [
    ['smoke', 'Smoke', Check],
    ['health', 'Health checks', HeartPulse],
    ['logs', 'Logs', FileCheck2],
    ['metrics', 'Metrics', Gauge],
    ['traces', 'Traces', Activity],
    ['alerts', 'Alerts', AlertTriangle],
    ['rollback', 'Rollback', Undo2],
    ['learning', 'Incident learning', BrainCircuit],
  ] as const

  return (
    <FamilyShell
      className={className}
      title="Release health dashboard"
      code="HEALTH_04"
      status={current.label}
      ariaLabel="Release health dashboard centered on intended artifact deployed version and release acceptance"
      railDensity="dense"
      railContent={
        <div className="grid gap-3">
          <MiniCard label="Release acceptance" value={current.label} detail={current.acceptance} Icon={ShieldCheck} tone={current.tone} active />
          <div>
            <p className="font-mono text-[9px] font-semibold uppercase leading-3 tracking-normal text-muted-foreground">
              acceptance rule
            </p>
            <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
              The deploy command is only the start. Acceptance waits for intended artifact, deployed version, runtime
              signals, rollback readiness, and incident learning to agree.
            </p>
          </div>
        </div>
      }
      controls={
        <VisualStateController
          model={{
            label: 'Release health',
            value: state,
            onValueChange: setState,
            steps: [
              {
                value: 'healthy',
                label: 'Healthy',
                description: 'Acceptance can proceed because smoke, health, runtime signals, and rollback evidence agree.',
                status: 'accept',
              },
              {
                value: 'warning',
                label: 'Warning',
                description: 'Acceptance pauses while mixed signals are explained and attached to the release record.',
                status: 'hold',
              },
              {
                value: 'failed',
                label: 'Failed',
                description: 'Acceptance stops; restore the known-good artifact and retain incident evidence.',
                status: 'recover',
              },
            ],
          }}
        />
      }
    >
      <div
        className="grid h-full content-center gap-2 sm:grid-cols-2 lg:grid-cols-4"
        role="list"
        aria-label={`Release signals for ${current.label}: smoke, health checks, logs, metrics, traces, alerts, rollback status, and incident learning update acceptance together.`}
      >
        {signalCards.slice(0, 2).map(([key, label, Icon]) => {
          const [value, detail, tone] = current.signals[key]
          return <MiniCard key={key} label={label} value={value} detail={detail} Icon={Icon} tone={tone} active className="min-h-28" />
        })}
        <div className="grid gap-2 rounded-md border border-primary/25 bg-card/80 p-2 sm:col-span-2 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <MiniCard label="Intended artifact" value="sha256:88ae90" detail="Artifact selected by the release plan." Icon={PackageCheck} tone="primary" active />
          <MiniCard label="Deployed version" value="prod v1.18.4" detail="Runtime version observed in the target environment." Icon={Server} tone={current.tone} active />
        </div>
        {signalCards.slice(2).map(([key, label, Icon]) => {
          const [value, detail, tone] = current.signals[key]
          return <MiniCard key={key} label={label} value={value} detail={detail} Icon={Icon} tone={tone} active className="min-h-28" />
        })}
      </div>
    </FamilyShell>
  )
}
