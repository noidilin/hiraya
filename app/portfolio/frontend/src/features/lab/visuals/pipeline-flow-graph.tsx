import {
  BaseEdge,
  Handle,
  Position,
  ReactFlow,
  getBezierPath,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from '@xyflow/react'
import type { LucideIcon } from 'lucide-react'
import { CircleDot, Clock3, GitCommitHorizontal, Hammer, Rocket, ShieldCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

type PipelineStageTone = 'idle' | 'active' | 'error' | 'pending'
type PipelineEdgeTone = 'active' | 'blocked' | 'idle'

type PipelineNodeData = {
  code: 'SRC' | 'BLD' | 'DPL' | 'VRF'
  label: string
  stateLabel: string
  detail: string
  tone: PipelineStageTone
  Icon: LucideIcon
}

type PipelineEdgeData = {
  tone: PipelineEdgeTone
}

type PipelineNode = Node<PipelineNodeData, 'pipelineStage'>
type PipelineEdge = Edge<PipelineEdgeData, 'pipelineConnector'>

const pipelineStages: PipelineNodeData[] = [
  {
    code: 'SRC',
    label: 'Source',
    stateLabel: 'Idle source',
    detail: 'Commit is queued and ready for the next runner pickup.',
    tone: 'idle',
    Icon: GitCommitHorizontal,
  },
  {
    code: 'BLD',
    label: 'Build',
    stateLabel: 'Active build',
    detail: 'Runner is compiling, testing, and packaging the candidate.',
    tone: 'active',
    Icon: Hammer,
  },
  {
    code: 'DPL',
    label: 'Deploy',
    stateLabel: 'Failed deploy',
    detail: 'Release gate is blocked by a failed deployment check.',
    tone: 'error',
    Icon: Rocket,
  },
  {
    code: 'VRF',
    label: 'Verify',
    stateLabel: 'Pending verify',
    detail: 'Verification waits until the deploy stage is unblocked.',
    tone: 'pending',
    Icon: ShieldCheck,
  },
]

const toneClassNames: Record<
  PipelineStageTone,
  {
    node: string
    icon: string
    badge: string
    dot: string
  }
> = {
  idle: {
    node: 'border-border bg-card/90 text-foreground',
    icon: 'border-border bg-muted text-muted-foreground',
    badge: 'border-border bg-muted text-muted-foreground',
    dot: 'bg-muted-foreground',
  },
  active: {
    node: 'border-primary/45 bg-accent text-primary ring-2 ring-primary/10',
    icon: 'border-primary/35 bg-primary text-primary-foreground',
    badge: 'border-primary/30 bg-primary text-primary-foreground',
    dot: 'bg-primary status-pulse-active',
  },
  error: {
    node: 'border-destructive/45 bg-destructive/10 text-destructive ring-2 ring-destructive/10',
    icon: 'border-destructive/35 bg-destructive text-destructive-foreground',
    badge: 'border-destructive/30 bg-destructive text-destructive-foreground',
    dot: 'bg-destructive',
  },
  pending: {
    node: 'border-border bg-muted/70 text-muted-foreground',
    icon: 'border-border bg-card text-muted-foreground',
    badge: 'border-border bg-card text-muted-foreground',
    dot: 'bg-muted-foreground',
  },
}

const pipelineNodes: PipelineNode[] = [
  {
    id: 'source',
    type: 'pipelineStage',
    position: { x: 0, y: 44 },
    sourcePosition: Position.Right,
    data: pipelineStages[0],
  },
  {
    id: 'build',
    type: 'pipelineStage',
    position: { x: 156, y: 44 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    data: pipelineStages[1],
  },
  {
    id: 'deploy',
    type: 'pipelineStage',
    position: { x: 312, y: 44 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    data: pipelineStages[2],
  },
  {
    id: 'verify',
    type: 'pipelineStage',
    position: { x: 468, y: 44 },
    targetPosition: Position.Left,
    data: pipelineStages[3],
  },
]

const pipelineEdges: PipelineEdge[] = [
  {
    id: 'source-build',
    source: 'source',
    target: 'build',
    type: 'pipelineConnector',
    data: { tone: 'active' },
  },
  {
    id: 'build-deploy',
    source: 'build',
    target: 'deploy',
    type: 'pipelineConnector',
    data: { tone: 'blocked' },
  },
  {
    id: 'deploy-verify',
    source: 'deploy',
    target: 'verify',
    type: 'pipelineConnector',
    data: { tone: 'idle' },
  },
]

function PipelineStageNode({ data }: NodeProps<PipelineNode>) {
  const Icon = data.Icon
  const tone = toneClassNames[data.tone]

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          tabIndex={0}
          role="group"
          aria-label={`${data.code} ${data.label}: ${data.stateLabel}`}
          className={cn(
            'nodrag nopan w-[116px] rounded-lg border px-2.5 py-2 shadow-none outline-none backdrop-blur-md transition duration-150',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            tone.node,
          )}
        >
          <Handle type="target" position={Position.Left} className="!size-1.5 !border-none !bg-transparent" />
          <Handle type="source" position={Position.Right} className="!size-1.5 !border-none !bg-transparent" />

          <div className="flex items-center justify-between gap-2">
            <span
              aria-hidden="true"
              className={cn('flex size-8 shrink-0 items-center justify-center rounded-md border', tone.icon)}
            >
              <Icon className="size-4" strokeWidth={2.2} />
            </span>
            <Badge
              variant="outline"
              className={cn(
                'h-5 rounded-full px-2 font-mono text-[10px] font-semibold uppercase tracking-normal',
                tone.badge,
              )}
            >
              {data.code}
            </Badge>
          </div>

          <div className="mt-2 min-w-0">
            <p className="truncate text-sm font-semibold leading-5 tracking-normal">{data.label}</p>
            <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] leading-4 uppercase tracking-normal">
              <span aria-hidden="true" className={cn('size-1.5 rounded-full', tone.dot)} />
              <span className="truncate">{data.stateLabel}</span>
            </p>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">{data.detail}</TooltipContent>
    </Tooltip>
  )
}

function CompactPipelineStage({ stage }: { stage: PipelineNodeData }) {
  const Icon = stage.Icon
  const tone = toneClassNames[stage.tone]

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          tabIndex={0}
          role="group"
          aria-label={`${stage.code} ${stage.label}: ${stage.stateLabel}`}
          className={cn(
            'min-w-0 rounded-md border px-1.5 py-2 text-center outline-none backdrop-blur-md',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            tone.node,
          )}
        >
          <span
            aria-hidden="true"
            className={cn('mx-auto flex size-8 items-center justify-center rounded-md border', tone.icon)}
          >
            <Icon className="size-4" strokeWidth={2.2} />
          </span>
          <p className="mt-1.5 font-mono text-[10px] font-semibold uppercase leading-3 tracking-normal">{stage.code}</p>
          <p className="mt-1 truncate text-[11px] font-medium leading-4 tracking-normal">{stage.label}</p>
          <span aria-hidden="true" className={cn('mx-auto mt-1 block size-1.5 rounded-full', tone.dot)} />
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">{stage.detail}</TooltipContent>
    </Tooltip>
  )
}

function CompactPipelineConnector({ tone }: { tone: PipelineEdgeTone }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'mt-8 h-0.5 min-w-3 flex-1 rounded-full bg-border',
        tone === 'active' && 'animated-flow-line bg-transparent',
        tone === 'blocked' && 'border-t-2 border-dashed border-destructive bg-transparent',
      )}
    />
  )
}

function PipelineConnectorEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<PipelineEdge>) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.28,
  })

  const tone = data?.tone ?? 'idle'

  return (
    <>
      <BaseEdge id={`${id}-base`} path={edgePath} style={{ stroke: 'var(--border)', strokeWidth: 1.2 }} />
      {tone === 'active' ? (
        <path
          aria-hidden="true"
          d={edgePath}
          className="pipeline-flow-graph__edge--active"
          fill="none"
          stroke="var(--primary)"
          strokeLinecap="round"
          strokeWidth={2.4}
        />
      ) : tone === 'blocked' ? (
        <path
          aria-hidden="true"
          d={edgePath}
          fill="none"
          stroke="var(--destructive)"
          strokeDasharray="4 7"
          strokeLinecap="round"
          strokeWidth={2}
        />
      ) : null}
    </>
  )
}

const nodeTypes = {
  pipelineStage: PipelineStageNode,
}

const edgeTypes = {
  pipelineConnector: PipelineConnectorEdge,
}

const compactConnectorTones: PipelineEdgeTone[] = ['active', 'blocked', 'idle']

type PipelineFlowGraphProps = {
  className?: string
}

export function PipelineFlowGraph({ className }: PipelineFlowGraphProps) {
  return (
    <TooltipProvider>
      <div
        aria-label="Pipeline flow graph showing source, build, deploy, and verify stages"
        className={cn(
          'relative min-h-[190px] overflow-hidden rounded-lg border border-border/80 bg-background/45',
          'before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_34%_48%,color-mix(in_oklch,var(--primary),transparent_90%),transparent_42%)]',
          'after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border),transparent_62%)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border),transparent_62%)_1px,transparent_1px)] after:bg-[size:24px_24px] after:opacity-25',
          className,
        )}
      >
        <style>
          {`
            @keyframes pipeline-flow-graph-dash {
              to {
                stroke-dashoffset: -18;
              }
            }

            .pipeline-flow-graph__edge--active {
              stroke-dasharray: 10 8;
              animation: pipeline-flow-graph-dash 0.9s linear infinite;
            }

            @media (prefers-reduced-motion: reduce) {
              .pipeline-flow-graph__edge--active {
                animation: none;
                stroke-dasharray: 6 8;
              }
            }
          `}
        </style>

        <div className="relative z-10 flex min-h-[190px] flex-col justify-center p-3 sm:hidden">
          <div className="flex min-w-0 items-start gap-1.5">
            {pipelineStages.map((stage, index) => (
              <div key={stage.code} className="contents">
                <div className="min-w-0 flex-1">
                  <CompactPipelineStage stage={stage} />
                </div>
                {index < compactConnectorTones.length ? (
                  <CompactPipelineConnector tone={compactConnectorTones[index]} />
                ) : null}
              </div>
            ))}
          </div>
          <p className="mt-3 text-center font-mono text-[10px] uppercase leading-4 tracking-normal text-muted-foreground">
            SRC - BLD - DPL - VRF
          </p>
        </div>

        <div className="relative z-10 hidden h-[190px] w-full sm:block">
          <ReactFlow
            aria-label="Left to right CI/CD pipeline"
            nodes={pipelineNodes}
            edges={pipelineEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: 0.14 }}
            minZoom={0.3}
            maxZoom={1.05}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnDrag={false}
            zoomOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            preventScrolling={false}
            proOptions={{ hideAttribution: true }}
            className="text-foreground [&_.react-flow__edge]:pointer-events-none [&_.react-flow__node]:!cursor-default [&_.react-flow__pane]:!cursor-default"
          />
        </div>

        <div className="pointer-events-none relative z-20 flex items-center justify-between gap-2 px-3 pb-3 sm:absolute sm:inset-x-3 sm:bottom-3 sm:px-0 sm:pb-0">
          <Badge
            variant="outline"
            className="h-6 rounded-full border-primary/30 bg-accent px-2.5 font-mono text-[10px] font-semibold uppercase tracking-normal text-primary"
          >
            <CircleDot aria-hidden="true" className="size-3" />
            Flow active
          </Badge>
          <Badge
            variant="outline"
            className="h-6 rounded-full border-destructive/30 bg-destructive/10 px-2.5 font-mono text-[10px] font-semibold uppercase tracking-normal text-destructive"
          >
            <Clock3 aria-hidden="true" className="size-3" />
            Verify queued
          </Badge>
        </div>
      </div>
    </TooltipProvider>
  )
}
