import { Handle, Position, type NodeProps, type NodeTypes } from '@xyflow/react'
import type { LucideIcon } from 'lucide-react'
import {
  Bot,
  Boxes,
  CheckCheck,
  CircleGauge,
  FileCheck2,
  GitBranch,
  PackageCheck,
  ServerCog,
} from 'lucide-react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import type {
  FlowActorNode,
  FlowArtifactNode,
  FlowEnvironmentNode,
  FlowEvidenceNode,
  FlowGateNode,
  FlowMetricNode,
  FlowStageNode,
  FlowSystemNode,
  VisualFlowNode,
  VisualFlowNodeData,
  VisualFlowTone,
} from './flow-node-kit'

type SimpleVisualFlowKind =
  | 'stage'
  | 'gate'
  | 'artifact'
  | 'environment'
  | 'system'
  | 'evidence'
  | 'metric'
  | 'actor'

type SimpleVisualFlowNodeConfig = {
  kind: SimpleVisualFlowKind
  label: string
  fallbackIcon: LucideIcon
}

type SimpleToneClasses = {
  node: string
  icon: string
  accent: string
  chip: string
  text: string
}

const simpleToneClasses: Record<VisualFlowTone, SimpleToneClasses> = {
  primary: {
    node: 'border-primary/35 bg-card/95 text-foreground shadow-[0_8px_24px_color-mix(in_oklch,var(--primary),transparent_92%)]',
    icon: 'border-primary/25 bg-primary/10 text-primary',
    accent: 'bg-primary',
    chip: 'border-primary/20 bg-primary/10 text-primary',
    text: 'text-primary',
  },
  success: {
    node: 'border-chart-2/35 bg-card/95 text-foreground shadow-[0_8px_24px_color-mix(in_oklch,var(--chart-2),transparent_93%)]',
    icon: 'border-chart-2/25 bg-chart-2/10 text-chart-2',
    accent: 'bg-chart-2',
    chip: 'border-chart-2/20 bg-chart-2/10 text-chart-2',
    text: 'text-chart-2',
  },
  warning: {
    node: 'border-chart-4/40 bg-card/95 text-foreground shadow-[0_8px_24px_color-mix(in_oklch,var(--chart-4),transparent_93%)]',
    icon: 'border-chart-4/30 bg-chart-4/10 text-chart-4',
    accent: 'bg-chart-4',
    chip: 'border-chart-4/25 bg-chart-4/10 text-chart-4',
    text: 'text-chart-4',
  },
  danger: {
    node: 'border-destructive/40 bg-card/95 text-foreground shadow-[0_8px_24px_color-mix(in_oklch,var(--destructive),transparent_93%)]',
    icon: 'border-destructive/30 bg-destructive/10 text-destructive',
    accent: 'bg-destructive',
    chip: 'border-destructive/25 bg-destructive/10 text-destructive',
    text: 'text-destructive',
  },
  muted: {
    node: 'border-border bg-card/95 text-foreground shadow-sm',
    icon: 'border-border bg-muted/70 text-muted-foreground',
    accent: 'bg-muted-foreground',
    chip: 'border-border bg-muted/50 text-muted-foreground',
    text: 'text-muted-foreground',
  },
  ghost: {
    node: 'border-dashed border-border bg-background/80 text-muted-foreground',
    icon: 'border-border bg-background text-muted-foreground',
    accent: 'bg-border',
    chip: 'border-border bg-muted/35 text-muted-foreground',
    text: 'text-muted-foreground',
  },
}

const simpleVisualFlowNodeConfigs = {
  flowStage: { kind: 'stage', label: 'Stage', fallbackIcon: GitBranch },
  flowGate: { kind: 'gate', label: 'Gate', fallbackIcon: CheckCheck },
  flowArtifact: { kind: 'artifact', label: 'Artifact', fallbackIcon: PackageCheck },
  flowEnvironment: { kind: 'environment', label: 'Environment', fallbackIcon: ServerCog },
  flowSystem: { kind: 'system', label: 'System', fallbackIcon: Boxes },
  flowEvidence: { kind: 'evidence', label: 'Evidence', fallbackIcon: FileCheck2 },
  flowMetric: { kind: 'metric', label: 'Metric', fallbackIcon: CircleGauge },
  flowActor: { kind: 'actor', label: 'Actor', fallbackIcon: Bot },
} satisfies Record<VisualFlowNode['type'], SimpleVisualFlowNodeConfig>

type SimpleSurfaceProps = {
  data: VisualFlowNodeData
  selected?: boolean
  config: SimpleVisualFlowNodeConfig
  children: (surface: {
    Icon: LucideIcon
    meta: string
    status: string
    tone: SimpleToneClasses
  }) => React.ReactNode
}

function SimpleFlowHandles({ data }: { data: VisualFlowNodeData }) {
  return (
    <>
      <Handle
        type="target"
        position={data.targetPosition ?? Position.Left}
        className="!size-2 !border-none !bg-transparent"
      />
      <Handle
        type="source"
        position={data.sourcePosition ?? Position.Right}
        className="!size-2 !border-none !bg-transparent"
      />
    </>
  )
}

function SimpleFlowSurface({ data, selected, config, children }: SimpleSurfaceProps) {
  const tone = simpleToneClasses[data.tone ?? 'muted']
  const Icon = data.Icon ?? config.fallbackIcon
  const status = data.status ?? config.label
  const meta = data.metric ?? data.code ?? status
  const ariaLabel = [
    data.code,
    data.label,
    config.label,
    data.status ? `Status: ${data.status}` : undefined,
    data.metric ? `Metric: ${data.metric}` : undefined,
    data.detail,
  ]
    .filter(Boolean)
    .join('. ')

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          tabIndex={0}
          role="group"
          aria-label={ariaLabel}
          data-flow-kind={config.kind}
          className={cn(
            'nodrag nopan relative text-left outline-none transition duration-150',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            selected && 'ring-2 ring-primary/25',
          )}
        >
          <SimpleFlowHandles data={data} />
          {children({ Icon, meta, status, tone })}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-64">
        <span className="font-medium">{data.label}</span>
        <span className="block text-muted-foreground">{data.detail}</span>
      </TooltipContent>
    </Tooltip>
  )
}

function SimpleIcon({ Icon, tone }: { Icon: LucideIcon; tone: SimpleToneClasses }) {
  return (
    <span aria-hidden="true" className={cn('flex size-6 shrink-0 items-center justify-center rounded-sm border', tone.icon)}>
      <Icon className="size-3.5" strokeWidth={2.2} />
    </span>
  )
}

function SimpleRectNode({
  data,
  selected,
  config,
  widthClassName = 'w-32',
}: {
  data: VisualFlowNodeData
  selected?: boolean
  config: SimpleVisualFlowNodeConfig
  widthClassName?: string
}) {
  return (
    <SimpleFlowSurface data={data} selected={selected} config={config}>
      {({ Icon, status, tone }) => (
        <div className={cn('overflow-hidden rounded-md border backdrop-blur-md', widthClassName, tone.node)}>
          <span aria-hidden="true" className={cn('block h-1 w-full', tone.accent)} />
          <div className="grid min-w-0 grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-2 px-2 py-2">
            <SimpleIcon Icon={Icon} tone={tone} />
            <span className="min-w-0">
              <span className="block truncate text-[11px] font-semibold leading-4 text-foreground">{data.label}</span>
              <span className="block truncate font-mono text-[8px] font-semibold uppercase leading-3 text-muted-foreground">
                {status}
              </span>
            </span>
          </div>
        </div>
      )}
    </SimpleFlowSurface>
  )
}

function SimpleCapsuleNode({
  data,
  selected,
  config,
}: {
  data: VisualFlowNodeData
  selected?: boolean
  config: SimpleVisualFlowNodeConfig
}) {
  return (
    <SimpleFlowSurface data={data} selected={selected} config={config}>
      {({ Icon, meta, tone }) => (
        <div className={cn('flex w-32 min-w-0 items-center gap-2 rounded-full border px-2 py-1.5 backdrop-blur-md', tone.node)}>
          <SimpleIcon Icon={Icon} tone={tone} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[11px] font-semibold leading-4 text-foreground">{data.label}</span>
            <span className={cn('block truncate font-mono text-[8px] font-semibold uppercase leading-3', tone.text)}>{meta}</span>
          </span>
        </div>
      )}
    </SimpleFlowSurface>
  )
}

function SimpleSignalNode({
  data,
  selected,
  config,
}: {
  data: VisualFlowNodeData
  selected?: boolean
  config: SimpleVisualFlowNodeConfig
}) {
  return (
    <SimpleFlowSurface data={data} selected={selected} config={config}>
      {({ Icon, meta, tone }) => (
        <div className={cn('grid w-28 min-w-0 grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-2 rounded-md border px-2 py-1.5 backdrop-blur-md', tone.node)}>
          <SimpleIcon Icon={Icon} tone={tone} />
          <span className="min-w-0">
            <span className="block truncate text-[11px] font-semibold leading-4 text-foreground">{data.label}</span>
            <span className={cn('block truncate font-mono text-[8px] font-semibold uppercase leading-3', tone.text)}>{meta}</span>
          </span>
        </div>
      )}
    </SimpleFlowSurface>
  )
}

export function SimpleFlowStageNodeComponent(props: NodeProps<FlowStageNode>) {
  return <SimpleRectNode data={props.data} selected={props.selected} config={simpleVisualFlowNodeConfigs.flowStage} />
}

export function SimpleFlowGateNodeComponent(props: NodeProps<FlowGateNode>) {
  return <SimpleRectNode data={props.data} selected={props.selected} config={simpleVisualFlowNodeConfigs.flowGate} widthClassName="w-36" />
}

export function SimpleFlowArtifactNodeComponent(props: NodeProps<FlowArtifactNode>) {
  return <SimpleCapsuleNode data={props.data} selected={props.selected} config={simpleVisualFlowNodeConfigs.flowArtifact} />
}

export function SimpleFlowEnvironmentNodeComponent(props: NodeProps<FlowEnvironmentNode>) {
  return <SimpleSignalNode data={props.data} selected={props.selected} config={simpleVisualFlowNodeConfigs.flowEnvironment} />
}

export function SimpleFlowSystemNodeComponent(props: NodeProps<FlowSystemNode>) {
  return <SimpleRectNode data={props.data} selected={props.selected} config={simpleVisualFlowNodeConfigs.flowSystem} />
}

export function SimpleFlowEvidenceNodeComponent(props: NodeProps<FlowEvidenceNode>) {
  return <SimpleSignalNode data={props.data} selected={props.selected} config={simpleVisualFlowNodeConfigs.flowEvidence} />
}

export function SimpleFlowMetricNodeComponent(props: NodeProps<FlowMetricNode>) {
  return <SimpleSignalNode data={props.data} selected={props.selected} config={simpleVisualFlowNodeConfigs.flowMetric} />
}

export function SimpleFlowActorNodeComponent(props: NodeProps<FlowActorNode>) {
  return <SimpleSignalNode data={props.data} selected={props.selected} config={simpleVisualFlowNodeConfigs.flowActor} />
}

export const simplifiedVisualFlowNodeTypes = {
  flowStage: SimpleFlowStageNodeComponent,
  flowGate: SimpleFlowGateNodeComponent,
  flowArtifact: SimpleFlowArtifactNodeComponent,
  flowEnvironment: SimpleFlowEnvironmentNodeComponent,
  flowSystem: SimpleFlowSystemNodeComponent,
  flowEvidence: SimpleFlowEvidenceNodeComponent,
  flowMetric: SimpleFlowMetricNodeComponent,
  flowActor: SimpleFlowActorNodeComponent,
} satisfies NodeTypes
