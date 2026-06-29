import { useState } from 'react'
import { Position } from '@xyflow/react'
import {
  Activity,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Gauge,
  HeartPulse,
  PackageCheck,
  Rocket,
  Route,
  ScanSearch,
  TimerReset,
  XCircle,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { TooltipProvider } from '@/components/ui/tooltip'
import { simplifiedVisualFlowNodeTypes } from '@/features/lab/visuals/flow'
import { cn } from '@/lib/utils'

import { LoopPipelineShell, toneClasses, type Tone, type VisualProps } from './shared/loop-pipeline-kit'
import { SlideFlowCanvas, type SlideFlowCanvasNode, type SlideFlowEdge, type SlideFlowTone } from './shared/flow-canvas'
import { VisualStateController } from './shared/visual-state-control'

type ReleaseOutcome = 'healthy' | 'degraded' | 'failed'

const intendedVersion = 'sha256:88ae90'

const outcomeConfig: Record<
  ReleaseOutcome,
  {
    status: string
    label: string
    summary: string
    route: string[]
    edgeLabel: string
    feedbackLabel: string
    improvementStatus: string
    tone: Tone
    flowTone: SlideFlowTone
  }
> = {
  healthy: {
    status: 'accepted',
    label: 'Healthy',
    summary: 'Healthy route accepts the intended version after runtime checks and stores release evidence.',
    route: ['artifact', 'deploy', 'verify', 'smoke', 'health', 'signals', 'decision', 'accept', 'record', 'improve'],
    edgeLabel: 'healthy accept',
    feedbackLabel: 'release evidence improves design',
    improvementStatus: 'evidence feedback',
    tone: 'ok',
    flowTone: 'success',
  },
  degraded: {
    status: 'progressive action',
    label: 'Degraded',
    summary: 'Degraded route keeps the version visible, uses feature flags or roll-forward, then records the lesson.',
    route: ['artifact', 'deploy', 'verify', 'smoke', 'health', 'signals', 'decision', 'progressive', 'learn', 'record', 'improve'],
    edgeLabel: 'degraded action',
    feedbackLabel: 'incident learning improves pipeline',
    improvementStatus: 'incident feedback',
    tone: 'hold',
    flowTone: 'warning',
  },
  failed: {
    status: 'rollback',
    label: 'Failed',
    summary: 'Failed route rolls back, preserves the failed-release record, and turns incident learning into pipeline design change.',
    route: ['artifact', 'deploy', 'verify', 'smoke', 'health', 'signals', 'decision', 'rollback', 'learn', 'record', 'improve'],
    edgeLabel: 'failed rollback',
    feedbackLabel: 'incident learning improves pipeline',
    improvementStatus: 'incident feedback',
    tone: 'risk',
    flowTone: 'danger',
  },
}

const canvasNodes = [
  {
    id: 'artifact',
    type: 'flowArtifact',
    x: 44,
    y: 52,
    label: 'Intended version',
    code: 'ART',
    status: intendedVersion,
    detail: `The release route follows the intended artifact version ${intendedVersion}.`,
    Icon: PackageCheck,
    sourcePosition: Position.Right,
    targetPosition: Position.Bottom,
  },
  {
    id: 'deploy',
    type: 'flowStage',
    x: 232,
    y: 52,
    label: 'Deploy',
    code: 'DPL',
    status: 'start route',
    detail: 'Deploy the intended artifact into the runtime environment.',
    Icon: Rocket,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'verify',
    type: 'flowStage',
    x: 438,
    y: 52,
    label: 'Runtime verification',
    code: 'CHK',
    status: 'verify version',
    detail: 'Confirm the running service is the intended version before release acceptance.',
    Icon: ScanSearch,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'smoke',
    type: 'flowEvidence',
    x: 704,
    y: 42,
    label: 'Smoke checks',
    code: 'SMK',
    status: 'signal',
    detail: 'Representative smoke checks in the health signal cluster.',
    Icon: Activity,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Left,
  },
  {
    id: 'health',
    type: 'flowEvidence',
    x: 786,
    y: 176,
    label: 'Health checks',
    code: 'HTH',
    status: 'signal',
    detail: 'Representative health checks in the health signal cluster.',
    Icon: HeartPulse,
    sourcePosition: Position.Left,
    targetPosition: Position.Top,
  },
  {
    id: 'signals',
    type: 'flowEvidence',
    x: 622,
    y: 294,
    label: 'Logs metrics traces',
    code: 'OBS',
    status: 'cluster',
    detail: 'Logs, metrics, traces, dashboards, and alerts are grouped as release health evidence.',
    Icon: Gauge,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
  {
    id: 'decision',
    type: 'flowGate',
    x: 398,
    y: 226,
    label: 'Release acceptance',
    code: 'GATE',
    status: 'healthy degraded failed?',
    detail: 'Decision gate asks whether the intended version is running, healthy, and safe to accept.',
    Icon: ClipboardCheck,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Right,
  },
  {
    id: 'accept',
    type: 'flowStage',
    x: 708,
    y: 420,
    label: 'Accept release',
    code: 'OK',
    status: 'healthy branch',
    detail: 'Healthy branch accepts the release and keeps evidence attached to the intended version.',
    Icon: CheckCircle2,
    sourcePosition: Position.Left,
    targetPosition: Position.Top,
  },
  {
    id: 'progressive',
    type: 'flowStage',
    x: 396,
    y: 428,
    label: 'Progressive action',
    code: 'FF',
    status: 'degraded branch',
    detail: 'Degraded branch uses feature flags, progressive delivery, or roll-forward action.',
    Icon: Route,
    sourcePosition: Position.Left,
    targetPosition: Position.Top,
  },
  {
    id: 'rollback',
    type: 'flowStage',
    x: 98,
    y: 420,
    label: 'Rollback',
    code: 'RBK',
    status: 'failed branch',
    detail: 'Failed branch restores the prior safe version while preserving failed-release evidence.',
    Icon: XCircle,
    sourcePosition: Position.Top,
    targetPosition: Position.Right,
  },
  {
    id: 'learn',
    type: 'flowStage',
    x: 64,
    y: 286,
    label: 'Incident learning',
    code: 'LRN',
    status: 'learn',
    detail: 'Incident learning captures what failed and what release operations should change.',
    Icon: FileCheck2,
    sourcePosition: Position.Top,
    targetPosition: Position.Bottom,
  },
  {
    id: 'improve',
    type: 'flowStage',
    x: 64,
    y: 164,
    label: 'Pipeline improvement',
    code: 'IMP',
    status: 'feedback',
    detail: 'Release evidence and incident learning can improve pipeline design for the next release route.',
    Icon: TimerReset,
    sourcePosition: Position.Right,
    targetPosition: Position.Bottom,
  },
  {
    id: 'record',
    type: 'flowEvidence',
    x: 246,
    y: 306,
    label: 'Release evidence record',
    code: 'REC',
    status: 'saved',
    detail: 'Release evidence record links outcome, health signals, and intended version identity.',
    Icon: FileCheck2,
    sourcePosition: Position.Left,
    targetPosition: Position.Right,
  },
] as const

const baseEdges = [
  {
    id: 'artifact-deploy',
    source: 'artifact',
    target: 'deploy',
    route: ['artifact', 'deploy'],
    label: 'same version',
  },
  {
    id: 'deploy-verify',
    source: 'deploy',
    target: 'verify',
    route: ['deploy', 'verify'],
    label: 'runtime',
  },
  {
    id: 'verify-smoke',
    source: 'verify',
    target: 'smoke',
    route: ['verify', 'smoke'],
    label: 'smoke',
  },
  {
    id: 'verify-health',
    source: 'verify',
    target: 'health',
    route: ['verify', 'health'],
    label: 'health',
  },
  {
    id: 'smoke-signals',
    source: 'smoke',
    target: 'signals',
    route: ['smoke', 'signals'],
    label: 'signals',
  },
  {
    id: 'health-signals',
    source: 'health',
    target: 'signals',
    route: ['health', 'signals'],
    label: 'signals',
  },
  {
    id: 'signals-decision',
    source: 'signals',
    target: 'decision',
    route: ['signals', 'decision'],
    label: 'decide',
  },
  {
    id: 'decision-accept',
    source: 'decision',
    target: 'accept',
    route: ['decision', 'accept'],
    label: 'healthy accept',
  },
  {
    id: 'decision-progressive',
    source: 'decision',
    target: 'progressive',
    route: ['decision', 'progressive'],
    label: 'degraded action',
  },
  {
    id: 'decision-rollback',
    source: 'decision',
    target: 'rollback',
    route: ['decision', 'rollback'],
    label: 'failed rollback',
  },
  {
    id: 'accept-record',
    source: 'accept',
    target: 'record',
    route: ['accept', 'record'],
    label: 'accept record',
  },
  {
    id: 'progressive-learn',
    source: 'progressive',
    target: 'learn',
    route: ['progressive', 'learn'],
    label: 'learn',
  },
  {
    id: 'rollback-learn',
    source: 'rollback',
    target: 'learn',
    route: ['rollback', 'learn'],
    label: 'incident',
  },
  {
    id: 'learn-record',
    source: 'learn',
    target: 'record',
    route: ['learn', 'record'],
    label: 'evidence',
  },
  {
    id: 'record-improve',
    source: 'record',
    target: 'improve',
    route: ['record', 'improve'],
    label: 'learning improves pipeline',
  },
  {
    id: 'improve-artifact',
    source: 'improve',
    target: 'artifact',
    route: ['improve', 'artifact'],
    label: 'next release design',
  },
] as const

function isActiveRoute(route: Set<string>, ids: readonly string[]) {
  return ids.every((id) => route.has(id))
}

export function ReleaseOperationsLoopSlideVisual({ className }: VisualProps) {
  const [outcome, setOutcome] = useState<ReleaseOutcome>('healthy')
  const config = outcomeConfig[outcome]
  const activeRoute = new Set(config.route)

  const nodes: SlideFlowCanvasNode[] = canvasNodes.map((node) => {
    const isActive = activeRoute.has(node.id)
    const isDecision = node.id === 'decision'
    const isArtifact = node.id === 'artifact'
    const isHealthSignal = node.id === 'smoke' || node.id === 'health' || node.id === 'signals'

    return {
      id: node.id,
      type: node.type,
      position: { x: node.x, y: node.y },
      data: {
        label: node.label,
        code: node.code,
        detail: node.detail,
        status: isDecision
          ? `${config.label.toLowerCase()} route`
          : isArtifact
            ? intendedVersion
            : node.id === 'improve'
              ? config.improvementStatus
              : isHealthSignal && isActive
                ? `${config.label.toLowerCase()} signal`
                : node.status,
        Icon: node.Icon,
        tone: isActive ? (isArtifact ? 'primary' : config.flowTone) : 'ghost',
        sourcePosition: node.sourcePosition,
        targetPosition: node.targetPosition,
      },
    }
  })

  const edges: SlideFlowEdge[] = baseEdges.map((edge) => {
    const active = isActiveRoute(activeRoute, edge.route)
    const branchEdge = edge.id.startsWith('decision-')

    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'slideEdge',
      data: {
        tone: active ? (branchEdge ? config.flowTone : 'primary') : 'ghost',
        label: edge.id === 'record-improve' && active ? config.feedbackLabel : branchEdge && active ? config.edgeLabel : edge.label,
        animated: active,
        dashed: !active || branchEdge,
      },
    }
  })

  return (
    <TooltipProvider>
      <LoopPipelineShell
        className={className}
        label="Branching release operations loop"
        code="OPS_16"
        status={config.status}
        railDensity="dense"
        railContent={
          <div className="grid content-start gap-2">
            <div className={cn('rounded-md border p-2', toneClasses[config.tone].node)}>
              <p className="font-mono text-[8px] font-semibold uppercase leading-3 text-muted-foreground">route status</p>
              <p className="mt-1 text-xs font-semibold leading-4 text-foreground">{config.label}</p>
              <Badge variant="outline" className={cn('mt-2 rounded-sm font-mono text-[8px]', toneClasses[config.tone].badge)}>
                {config.status}
              </Badge>
            </div>

            <div className="rounded-md border border-border bg-card/80 p-2">
              <p className="font-mono text-[8px] font-semibold uppercase leading-3 text-muted-foreground">intended artifact</p>
              <p className="mt-1 font-mono text-xs font-semibold leading-4 text-foreground">{intendedVersion}</p>
              <p className="mt-1 text-[11px] leading-4 text-muted-foreground">The same version badge remains in the canvas for every route.</p>
            </div>

            <div className="rounded-md border border-border bg-card/80 p-2" aria-label="Health evidence detail rail">
              <p className="font-mono text-[8px] font-semibold uppercase leading-3 text-muted-foreground">health evidence</p>
              <div className="mt-2 grid gap-1.5">
                {['Smoke checks', 'Health checks', 'Logs metrics traces'].map((signal) => (
                  <div key={signal} className="flex items-center gap-2 rounded-sm border border-border bg-background/70 px-2 py-1.5">
                    <span className={cn('size-1.5 shrink-0 rounded-full', toneClasses[config.tone].dot)} aria-hidden="true" />
                    <span className="text-[11px] font-semibold leading-4 text-foreground">{signal}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11px] leading-4 text-muted-foreground" aria-live="polite">
              {config.summary}
            </p>
          </div>
        }
        controls={
          <VisualStateController
            model={{
              label: 'Deploy outcome',
              value: outcome,
              onValueChange: setOutcome,
              steps: [
                {
                  value: 'healthy',
                  label: 'Healthy',
                  description: 'Signals route the release to acceptance and preserve intended-version evidence.',
                  status: 'accepted',
                },
                {
                  value: 'degraded',
                  label: 'Degraded',
                  description: 'Signals route the release through progressive action before learning improves the pipeline.',
                  status: 'roll forward',
                },
                {
                  value: 'failed',
                  label: 'Failed',
                  description: 'Signals route the release to rollback, incident learning, and pipeline improvement.',
                  status: 'rollback',
                },
              ],
            }}
          />
        }
      >
        <div className="relative min-h-0 w-full lg:h-full">
          <SlideFlowCanvas
            key={outcome}
            aria-label={`Zoomable branching release operations graph for the ${config.label.toLowerCase()} route. The intended version ${intendedVersion} remains visible while deploy, runtime verification, health signal evidence, release acceptance, outcome branch, incident learning, pipeline improvement, and release evidence record are connected.`}
            defaultNodes={nodes}
            defaultEdges={edges}
            layoutCaptureId="slide-16-release-operations"
            nodeTypes={simplifiedVisualFlowNodeTypes}
            fitViewOptions={{ padding: 0.06 }}
            minZoom={0.18}
            maxZoom={1.8}
            surfaceClassName="bg-background/35"
          />
          <div
            role="group"
            className="pointer-events-none absolute right-3 top-3 rounded-sm border border-border bg-card/90 px-2 py-1 font-mono text-[8px] font-semibold uppercase tracking-normal text-muted-foreground shadow-sm"
            aria-label="Health signal cluster contains smoke checks, health checks, logs, metrics, traces, dashboards, and alerts."
          >
            health signal cluster
          </div>
          <p className="sr-only">
            Reduced-motion route updates use static node emphasis and text labels. The feedback arrow from release evidence to pipeline improvement means{' '}
            {outcome === 'healthy' ? 'release evidence improves design' : 'incident learning improves pipeline design'}, not a nested local delivery loop.
          </p>
        </div>
      </LoopPipelineShell>
    </TooltipProvider>
  )
}
