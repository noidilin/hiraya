import { useState } from 'react'
import { Position } from '@xyflow/react'
import { Activity, Blocks, ClipboardCheck, FileCheck2, GitBranch, ListChecks, Network, Route, ServerCog, ShieldCheck, type LucideIcon } from 'lucide-react'

import { simplifiedVisualFlowNodeTypes } from '@/features/lab/visuals/flow'
import { cn } from '@/lib/utils'

import { FamilyShell, StatusPill, toneClasses, type CicdSlideVisualProps } from './shared/system-responsibility-kit'
import { SlideFlowCanvas, type SlideFlowCanvasNode, type SlideFlowEdge } from './shared/flow-canvas'
import { VisualStateController } from './shared/visual-state-control'

const fitEvidenceOutputs = [
  'validation scope',
  'migration compatibility',
  'artifact promotion',
  'inspectable logs',
  'runner / lock state',
  'plan/apply record',
  'environment output',
  'release trace',
] as const
type FitEvidenceOutput = (typeof fitEvidenceOutputs)[number]
type FitLayerId = 'architecture' | 'platform' | 'infrastructure'

const fitLayers: Array<{
  id: FitLayerId
  label: string
  detail: string
  question: string
  failureSignal: string
  Icon: LucideIcon
  outputs: FitEvidenceOutput[]
}> = [
  {
    id: 'architecture',
    label: 'Architecture',
    detail: 'boundaries, migrations, validation scope',
    question: 'Do service boundaries and migrations define what the pipeline must prove?',
    failureSignal: 'Validation passes locally but misses schema or boundary compatibility.',
    Icon: Blocks,
    outputs: ['validation scope', 'migration compatibility', 'release trace'],
  },
  {
    id: 'platform',
    label: 'Platform',
    detail: 'runners, logs, locks, approvals',
    question: 'Can the automation platform show who ran what, where, and under which lock?',
    failureSignal: 'A release is blocked or flaky with no inspectable runner or log trail.',
    Icon: GitBranch,
    outputs: ['inspectable logs', 'runner / lock state', 'artifact promotion'],
  },
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    detail: 'plan/apply, environment outputs, runtime state',
    question: 'Are infrastructure changes versioned, planned, applied, and traceable to runtime?',
    failureSignal: 'Runtime differs from the release record or environment outputs are missing.',
    Icon: ServerCog,
    outputs: ['plan/apply record', 'environment output', 'release trace'],
  },
]

const evidenceOutputDetails: Record<
  FitEvidenceOutput,
  {
    code: string
    detail: string
    marker: string
    Icon: LucideIcon
  }
> = {
  'validation scope': {
    code: 'scope',
    detail: 'Architecture boundaries determine the validation scope that a change must pass before release.',
    marker: 'boundary check',
    Icon: ListChecks,
  },
  'migration compatibility': {
    code: 'migrate',
    detail: 'Migration compatibility proves a schema or data change can move safely with the application release.',
    marker: 'compat marker',
    Icon: ShieldCheck,
  },
  'artifact promotion': {
    code: 'artifact',
    detail: 'The platform promotes the same released artifact instead of rebuilding per environment.',
    marker: 'same artifact',
    Icon: Route,
  },
  'inspectable logs': {
    code: 'logs',
    detail: 'Inspectable logs expose platform behavior when a run fails, retries, or waits.',
    marker: 'inspectable',
    Icon: Activity,
  },
  'runner / lock state': {
    code: 'locks',
    detail: 'Runner and lock state explain whether a release is executing, queued, serialized, or blocked.',
    marker: 'platform state',
    Icon: Network,
  },
  'plan/apply record': {
    code: 'plan/apply',
    detail: 'Infrastructure plan and apply records make runtime change intent and result auditable.',
    marker: 'infra marker',
    Icon: ClipboardCheck,
  },
  'environment output': {
    code: 'env',
    detail: 'Environment outputs connect release automation to the actual runtime endpoints and bindings.',
    marker: 'runtime output',
    Icon: ServerCog,
  },
  'release trace': {
    code: 'trace',
    detail: 'A trace-to-release record links architecture intent, platform activity, and infrastructure state.',
    marker: 'trace badge',
    Icon: FileCheck2,
  },
}

const layerPositions: Record<FitLayerId, { x: number; y: number }> = {
  architecture: { x: 44, y: 56 },
  platform: { x: 44, y: 236 },
  infrastructure: { x: 44, y: 416 },
}

const evidencePositions: Record<FitEvidenceOutput, { x: number; y: number }> = {
  'validation scope': { x: 332, y: 34 },
  'migration compatibility': { x: 548, y: 34 },
  'artifact promotion': { x: 760, y: 126 },
  'inspectable logs': { x: 332, y: 214 },
  'runner / lock state': { x: 548, y: 214 },
  'plan/apply record': { x: 332, y: 394 },
  'environment output': { x: 548, y: 394 },
  'release trace': { x: 760, y: 304 },
}

const crossLayerRelationships = [
  {
    id: 'architecture-platform',
    source: 'architecture',
    target: 'platform',
    label: 'artifact contract',
    detail: 'Architecture boundaries tell the platform what to validate, build, and promote.',
  },
  {
    id: 'platform-infrastructure',
    source: 'platform',
    target: 'infrastructure',
    label: 'serialized change',
    detail: 'Platform locks and approvals serialize infrastructure plan/apply work.',
  },
  {
    id: 'architecture-infrastructure',
    source: 'architecture',
    target: 'infrastructure',
    label: 'runtime shape',
    detail: 'Architecture choices determine runtime dependencies and environment outputs.',
  },
] as const

export function SystemFitFrameSlideVisual(props: CicdSlideVisualProps) {
  const [selected, setSelected] = useState<FitLayerId>('architecture')
  const active = fitLayers.find((layer) => layer.id === selected) ?? fitLayers[0]
  const selectedOutputs = new Set<FitEvidenceOutput>(active.outputs)

  const nodes: SlideFlowCanvasNode[] = [
    ...fitLayers.map(
      (layer): SlideFlowCanvasNode => ({
        id: layer.id,
        type: 'flowSystem',
        position: layerPositions[layer.id],
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          label: layer.label,
          code: 'layer',
          detail: `${layer.label}: ${layer.detail}. ${layer.question}`,
          status: layer.id === selected ? 'selected layer' : `${layer.outputs.length} outputs`,
          Icon: layer.Icon,
          tone: layer.id === selected ? 'primary' : 'muted',
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        },
      }),
    ),
    ...fitEvidenceOutputs.map((output): SlideFlowCanvasNode => {
      const evidence = evidenceOutputDetails[output]
      const linked = selectedOutputs.has(output)

      return {
        id: output,
        type: 'flowEvidence',
        position: evidencePositions[output],
        sourcePosition: Position.Left,
        targetPosition: Position.Left,
        data: {
          label: output,
          code: evidence.code,
          detail: evidence.detail,
          status: linked ? evidence.marker : 'available',
          Icon: evidence.Icon,
          tone: linked
            ? output === 'migration compatibility' || output === 'plan/apply record' || output === 'release trace'
              ? 'primary'
              : 'success'
            : 'ghost',
          sourcePosition: Position.Left,
          targetPosition: Position.Left,
        },
      }
    }),
  ]

  const layerOutputEdges: SlideFlowEdge[] = fitLayers.flatMap((layer) =>
    layer.outputs.map(
      (output): SlideFlowEdge => ({
        id: `${layer.id}-${output}`,
        source: layer.id,
        target: output,
        type: 'slideEdge',
        data: {
          tone: layer.id === selected ? 'primary' : 'ghost',
          animated: layer.id === selected,
          dashed: layer.id !== selected,
          label: layer.id === selected ? evidenceOutputDetails[output].code : undefined,
        },
      }),
    ),
  )

  const crossLayerEdges: SlideFlowEdge[] = crossLayerRelationships.map(
    (relationship): SlideFlowEdge => ({
      id: relationship.id,
      source: relationship.source,
      target: relationship.target,
      type: 'slideEdge',
      data: {
        tone: relationship.source === selected || relationship.target === selected ? 'warning' : 'muted',
        dashed: relationship.source !== selected && relationship.target !== selected,
        label: relationship.label,
      },
    }),
  )

  const edges: SlideFlowEdge[] = [...crossLayerEdges, ...layerOutputEdges]

  return (
    <FamilyShell
      className={props.className}
      label="Architecture platform infrastructure fit frame"
      code="FIT_19"
      status={active.label}
      railDensity="dense"
      railContent={
        <div className="grid gap-2">
          <div className={cn('rounded-md border p-2', toneClasses.primary.panel)}>
            <p className="font-mono text-[8px] font-semibold uppercase leading-3 text-muted-foreground">fit question</p>
            <p className="mt-1 text-xs font-semibold leading-4 text-foreground">{active.question}</p>
          </div>

          <div className={cn('rounded-md border p-2', toneClasses.risk.panel)}>
            <p className="font-mono text-[8px] font-semibold uppercase leading-3 text-muted-foreground">failure signal</p>
            <p className="mt-1 text-xs leading-4 text-foreground">{active.failureSignal}</p>
          </div>

          <div className="rounded-md border border-border bg-card/80 p-2">
            <p className="font-mono text-[8px] font-semibold uppercase leading-3 text-muted-foreground">linked evidence</p>
            <div role="list" className="mt-2 grid gap-1.5">
              {fitEvidenceOutputs.map((output) => {
                const linked = selectedOutputs.has(output)
                return (
                  <div
                    key={output}
                    role="listitem"
                    className={cn(
                      'rounded-sm border px-2 py-1 text-[10px] font-medium leading-3',
                      linked ? 'border-primary/30 bg-accent text-primary' : 'border-border bg-muted/35 text-muted-foreground',
                    )}
                  >
                    {output}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-md border border-border bg-card/80 p-2">
            <p className="font-mono text-[8px] font-semibold uppercase leading-3 text-muted-foreground">cross-layer links</p>
            <div className="mt-2 grid gap-1.5">
              {crossLayerRelationships.map((relationship) => (
                <p key={relationship.id} className="text-[10px] leading-4 text-muted-foreground">
                  <span className="font-mono font-semibold uppercase text-foreground">{relationship.label}:</span> {relationship.detail}
                </p>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5" aria-label="Selected fit interpretation">
            <StatusPill tone="good">{active.outputs.length} outputs</StatusPill>
            <span className="rounded-sm border border-border bg-card px-2 py-1 font-mono text-[8px] font-semibold uppercase tracking-normal text-muted-foreground">
              trace links all layers
            </span>
          </div>
          <p aria-live="polite" className="sr-only">
            {active.label} selected. Associated evidence outputs are {active.outputs.join(', ')}. Failure signal: {active.failureSignal}
          </p>
        </div>
      }
      controls={
        <VisualStateController
          model={{
            label: 'Fit layer',
            value: selected,
            onValueChange: setSelected,
            steps: fitLayers.map((layer) => ({
              value: layer.id,
              label: layer.label,
              description: `${layer.label} highlights ${layer.detail} and its linked evidence outputs.`,
              status: `${layer.outputs.length} outputs`,
            })),
          }}
        />
      }
    >
      <SlideFlowCanvas
        key={selected}
        aria-label="Zoomable three-layer architecture platform infrastructure fit map with evidence outputs"
        defaultNodes={nodes}
        defaultEdges={edges}
        layoutCaptureId="slide-19-system-fit"
        nodeTypes={simplifiedVisualFlowNodeTypes}
        fitViewOptions={{ padding: 0.08 }}
        minZoom={0.22}
        maxZoom={1.7}
      />
    </FamilyShell>
  )
}
