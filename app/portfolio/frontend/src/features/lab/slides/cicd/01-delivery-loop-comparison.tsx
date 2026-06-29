import { Position } from '@xyflow/react'
import { Code2, FileCheck2, Gauge, GitCommitHorizontal, PackageCheck, Rocket, ScanSearch, Server, ShieldCheck, TimerReset } from 'lucide-react'

import { TooltipProvider } from '@/components/ui/tooltip'
import { simplifiedVisualFlowNodeTypes } from '@/features/lab/visuals/flow'
import { cn } from '@/lib/utils'

import { LoopPipelineShell, type Stage, type VisualProps } from './shared/loop-pipeline-kit'
import { SlideFlowCanvas, type SlideFlowCanvasNode, type SlideFlowEdge } from './shared/flow-canvas'

const localStages: Stage[] = [
  { id: 'write', code: 'WR', label: 'Write', detail: 'A local code change is created.', Icon: Code2, tone: 'active' },
  { id: 'inspect', code: 'IN', label: 'Inspect', detail: 'The developer reads and reviews the change locally.', Icon: ScanSearch },
  { id: 'run', code: 'RN', label: 'Run', detail: 'Local tests or commands produce local confidence.', Icon: Gauge },
  { id: 'adjust', code: 'AD', label: 'Adjust', detail: 'The change is revised before it leaves the workstation.', Icon: TimerReset },
]

const sharedStages: Stage[] = [
  { id: 'source', code: 'SRC', label: 'Source change', detail: 'Written code starts shared delivery.', Icon: GitCommitHorizontal, tone: 'active' },
  { id: 'validate', code: 'VAL', label: 'Validate', detail: 'Shared checks expand confidence beyond one machine.', Icon: ShieldCheck, tone: 'active' },
  { id: 'package', code: 'PKG', label: 'Package', detail: 'The pipeline builds a traceable artifact.', Icon: PackageCheck },
  { id: 'deploy', code: 'DPL', label: 'Deploy', detail: 'The artifact is delivered into a runtime environment.', Icon: Rocket },
  { id: 'observe', code: 'OBS', label: 'Observe', detail: 'Health and behavior are verified after deployment.', Icon: Server },
  { id: 'feedback', code: 'FBK', label: 'Feedback', detail: 'Evidence returns to the team for the next change.', Icon: FileCheck2 },
]

type StagePosition = { x: number; y: number; sourcePosition: Position; targetPosition: Position }

const localStagePositions: Record<string, StagePosition> = {
  write: { x: -55, y: -13, sourcePosition: Position.Right, targetPosition: Position.Bottom },
  inspect: { x: 177, y: -15, sourcePosition: Position.Bottom, targetPosition: Position.Left },
  run: { x: 177, y: 115, sourcePosition: Position.Left, targetPosition: Position.Top },
  adjust: { x: -58, y: 118, sourcePosition: Position.Top, targetPosition: Position.Right },
}

const sharedStagePositions: Record<string, StagePosition> = {
  source: { x: 302, y: 269, sourcePosition: Position.Right, targetPosition: Position.Bottom },
  validate: { x: 441, y: 51, sourcePosition: Position.Right, targetPosition: Position.Left },
  package: { x: 711, y: 51, sourcePosition: Position.Bottom, targetPosition: Position.Left },
  deploy: { x: 859, y: 265, sourcePosition: Position.Left, targetPosition: Position.Top },
  observe: { x: 710, y: 490, sourcePosition: Position.Left, targetPosition: Position.Right },
  feedback: { x: 424, y: 491, sourcePosition: Position.Top, targetPosition: Position.Right },
}

const localNodes: SlideFlowCanvasNode[] = localStages.map((stage) => {
  const position = localStagePositions[stage.id]

  return {
    id: `local-${stage.id}`,
    type: 'flowStage',
    position: { x: position.x, y: position.y },
    data: {
      label: stage.label,
      code: stage.code,
      detail: stage.detail,
      status: stage.id === 'write' ? 'step 1 local start' : stage.id === 'run' ? 'step 1 local evidence' : 'step 1 inner loop',
      Icon: stage.Icon,
      tone: 'primary',
      sourcePosition: position.sourcePosition,
      targetPosition: position.targetPosition,
    },
  }
})

const sharedNodes: SlideFlowCanvasNode[] = sharedStages.map((stage) => {
  const position = sharedStagePositions[stage.id]

  return {
    id: `shared-${stage.id}`,
    type: 'flowStage',
    position: { x: position.x, y: position.y },
    data: {
      label: stage.label,
      code: stage.code,
      detail: stage.detail,
      status:
        stage.id === 'source'
          ? 'step 2 outer start'
          : stage.id === 'validate'
            ? 'step 2 handoff target'
            : stage.id === 'package'
              ? 'step 3 artifact evidence'
              : stage.id === 'observe'
                ? 'step 3 runtime evidence'
                : stage.id === 'feedback'
                  ? 'step 3 team feedback'
                  : 'step 3 shared loop',
      Icon: stage.Icon,
      tone:
        stage.id === 'source' || stage.id === 'validate'
          ? 'warning'
          : stage.id === 'package' || stage.id === 'observe' || stage.id === 'feedback'
            ? 'success'
            : 'muted',
      sourcePosition: position.sourcePosition,
      targetPosition: position.targetPosition,
    },
  }
})

const deliveryLoopNodes: SlideFlowCanvasNode[] = [...localNodes, ...sharedNodes]

const deliveryLoopEdges: SlideFlowEdge[] = [
  {
    id: 'local-write-inspect',
    source: 'local-write',
    target: 'local-inspect',
    type: 'slideEdge',
    data: { tone: 'primary', label: '1 inspect', animated: true },
  },
  {
    id: 'local-inspect-run',
    source: 'local-inspect',
    target: 'local-run',
    type: 'slideEdge',
    data: { tone: 'primary', label: '1 run', animated: true },
  },
  {
    id: 'local-run-adjust',
    source: 'local-run',
    target: 'local-adjust',
    type: 'slideEdge',
    data: { tone: 'primary', label: '1 adjust', animated: true },
  },
  {
    id: 'local-adjust-write',
    source: 'local-adjust',
    target: 'local-write',
    type: 'slideEdge',
    data: { tone: 'primary', label: '1 revise', animated: true },
  },
  {
    id: 'shared-source-validate',
    source: 'shared-source',
    target: 'shared-validate',
    type: 'slideEdge',
    data: { tone: 'warning', label: '2 written code', dashed: true },
  },
  {
    id: 'shared-validate-package',
    source: 'shared-validate',
    target: 'shared-package',
    type: 'slideEdge',
    data: { tone: 'success', label: '3 checks pass', dashed: true },
  },
  {
    id: 'shared-package-deploy',
    source: 'shared-package',
    target: 'shared-deploy',
    type: 'slideEdge',
    data: { tone: 'success', label: '3 artifact', dashed: true },
  },
  {
    id: 'shared-deploy-observe',
    source: 'shared-deploy',
    target: 'shared-observe',
    type: 'slideEdge',
    data: { tone: 'success', label: '3 verify', dashed: true },
  },
  {
    id: 'shared-observe-feedback',
    source: 'shared-observe',
    target: 'shared-feedback',
    type: 'slideEdge',
    data: { tone: 'success', label: '3 evidence', dashed: true },
  },
  {
    id: 'shared-feedback-source',
    source: 'shared-feedback',
    target: 'shared-source',
    type: 'slideEdge',
    data: { tone: 'muted', label: 'next change', dashed: true },
  },
  {
    id: 'handoff-adjust-validate',
    source: 'local-adjust',
    target: 'shared-validate',
    type: 'slideEdge',
    data: { tone: 'warning', label: '2 handoff', dashed: true },
  },
]

const teachingSummaries = [
  {
    code: '1',
    label: 'Local loop',
    detail: 'Write, inspect, run, and adjust create local confidence before the work leaves the machine.',
    active: true,
  },
  {
    code: '2',
    label: 'Shared start',
    detail: 'Source change is the beginning of the outer path, so written code is not treated as done.',
    active: true,
  },
  {
    code: '3',
    label: 'Evidence returns',
    detail: 'Package, deploy, observe, and feedback turn a change into shared delivery knowledge.',
    active: false,
  },
]

export function DeliveryLoopComparisonSlideVisual({ className }: VisualProps) {
  return (
    <TooltipProvider>
      <LoopPipelineShell
        className={className}
        label="Nested delivery loop comparison"
        code="LOOP_01"
        status="local to shared"
        railContent={
          <div className="grid content-start gap-2">
            {teachingSummaries.map((summary) => (
              <div
                key={summary.code}
                className={cn(
                  'rounded-md border p-2',
                  summary.active ? 'border-primary/30 bg-accent' : 'border-border bg-card/70',
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded-full font-mono text-[9px] font-bold',
                      summary.active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {summary.code}
                  </span>
                  <p className="min-w-0 truncate text-xs font-semibold leading-4 text-foreground">{summary.label}</p>
                </div>
                <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{summary.detail}</p>
              </div>
            ))}
          </div>
        }
      >
        <div className="h-full w-full min-w-0">
          <div
            className="relative h-full min-w-0"
            aria-label="Nested loop comparison: local stages are ordered write, inspect, run, adjust; shared delivery stages are ordered source change, validate, package, deploy, observe, feedback."
          >
            <SlideFlowCanvas
              aria-label="Zoomable nested delivery loop graph with four inner local stages, six outer shared delivery stages, and a handoff from local adjustment into shared validation"
              defaultNodes={deliveryLoopNodes}
              defaultEdges={deliveryLoopEdges}
              layoutCaptureId="slide-01-delivery-loop"
              nodeTypes={simplifiedVisualFlowNodeTypes}
              fitViewOptions={{ padding: 0.08 }}
              surfaceClassName="bg-background/35"
            />
            <div className="pointer-events-none absolute left-3 top-3 flex gap-2">
              <span className="rounded-sm border border-primary/25 bg-accent/90 px-2 py-1 font-mono text-[8px] font-semibold uppercase tracking-normal text-primary shadow-sm">
                inner local loop
              </span>
              <span className="rounded-sm border border-border bg-card/90 px-2 py-1 font-mono text-[8px] font-semibold uppercase tracking-normal text-muted-foreground shadow-sm">
                outer shared loop
              </span>
            </div>
            <p className="sr-only">
              Reduced-motion interpretation uses static staged labels: step 1 is the local write inspect run adjust loop,
              step 2 is written code starting the shared path and handing off into validation, and step 3 is package,
              deploy, observe, and feedback evidence returning to the team.
            </p>
          </div>
        </div>
      </LoopPipelineShell>
    </TooltipProvider>
  )
}
