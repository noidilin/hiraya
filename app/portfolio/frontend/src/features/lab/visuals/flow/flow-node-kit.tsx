import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
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

import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export type VisualFlowTone = 'primary' | 'success' | 'warning' | 'danger' | 'muted' | 'ghost'

export type VisualFlowNodeData = {
  label: string
  code?: string
  detail: string
  status?: string
  metric?: string
  Icon?: LucideIcon
  tone?: VisualFlowTone
  sourcePosition?: Position
  targetPosition?: Position
}

export type FlowStageNode = Node<VisualFlowNodeData, 'flowStage'>
export type FlowGateNode = Node<VisualFlowNodeData, 'flowGate'>
export type FlowArtifactNode = Node<VisualFlowNodeData, 'flowArtifact'>
export type FlowEnvironmentNode = Node<VisualFlowNodeData, 'flowEnvironment'>
export type FlowSystemNode = Node<VisualFlowNodeData, 'flowSystem'>
export type FlowEvidenceNode = Node<VisualFlowNodeData, 'flowEvidence'>
export type FlowMetricNode = Node<VisualFlowNodeData, 'flowMetric'>
export type FlowActorNode = Node<VisualFlowNodeData, 'flowActor'>

export type VisualFlowNode =
  | FlowStageNode
  | FlowGateNode
  | FlowArtifactNode
  | FlowEnvironmentNode
  | FlowSystemNode
  | FlowEvidenceNode
  | FlowMetricNode
  | FlowActorNode

type VisualFlowKind =
  | 'stage'
  | 'gate'
  | 'artifact'
  | 'environment'
  | 'system'
  | 'evidence'
  | 'metric'
  | 'actor'

type VisualFlowNodeConfig = {
  kind: VisualFlowKind
  label: string
  fallbackIcon: LucideIcon
}

type ToneClasses = {
  panel: string
  strongPanel: string
  icon: string
  badge: string
  dot: string
  text: string
  line: string
  ring: string
}

const flowToneClasses: Record<VisualFlowTone, ToneClasses> = {
  primary: {
    panel: 'border-primary/35 bg-accent text-foreground ring-1 ring-primary/10',
    strongPanel: 'border-primary bg-primary text-primary-foreground shadow-[0_12px_34px_color-mix(in_oklch,var(--primary),transparent_84%)]',
    icon: 'border-primary/35 bg-primary text-primary-foreground',
    badge: 'border-primary/30 bg-accent text-primary',
    dot: 'bg-primary status-pulse-active',
    text: 'text-primary',
    line: 'bg-primary',
    ring: 'border-primary/35 bg-accent text-primary',
  },
  success: {
    panel: 'border-chart-2/30 bg-chart-2/10 text-foreground ring-1 ring-chart-2/10',
    strongPanel: 'border-chart-2 bg-chart-2 text-primary-foreground shadow-[0_12px_34px_color-mix(in_oklch,var(--chart-2),transparent_86%)]',
    icon: 'border-chart-2/30 bg-chart-2 text-primary-foreground',
    badge: 'border-chart-2/30 bg-chart-2/10 text-chart-2',
    dot: 'bg-chart-2',
    text: 'text-chart-2',
    line: 'bg-chart-2',
    ring: 'border-chart-2/35 bg-chart-2/10 text-chart-2',
  },
  warning: {
    panel: 'border-chart-4/35 bg-chart-4/10 text-foreground ring-1 ring-chart-4/10',
    strongPanel: 'border-chart-4 bg-chart-4 text-primary-foreground shadow-[0_12px_34px_color-mix(in_oklch,var(--chart-4),transparent_86%)]',
    icon: 'border-chart-4/35 bg-chart-4 text-primary-foreground',
    badge: 'border-chart-4/35 bg-chart-4/10 text-chart-4',
    dot: 'bg-chart-4',
    text: 'text-chart-4',
    line: 'bg-chart-4',
    ring: 'border-chart-4/40 bg-chart-4/10 text-chart-4',
  },
  danger: {
    panel: 'border-destructive/35 bg-destructive/10 text-foreground ring-1 ring-destructive/10',
    strongPanel: 'border-destructive bg-destructive text-destructive-foreground shadow-[0_12px_34px_color-mix(in_oklch,var(--destructive),transparent_86%)]',
    icon: 'border-destructive/35 bg-destructive text-destructive-foreground',
    badge: 'border-destructive/35 bg-destructive/10 text-destructive',
    dot: 'bg-destructive',
    text: 'text-destructive',
    line: 'bg-destructive',
    ring: 'border-destructive/40 bg-destructive/10 text-destructive',
  },
  muted: {
    panel: 'border-border bg-card/90 text-foreground',
    strongPanel: 'border-border bg-card text-foreground',
    icon: 'border-border bg-muted text-muted-foreground',
    badge: 'border-border bg-card text-muted-foreground',
    dot: 'bg-muted-foreground',
    text: 'text-muted-foreground',
    line: 'bg-muted-foreground',
    ring: 'border-border bg-muted/60 text-muted-foreground',
  },
  ghost: {
    panel: 'border-dashed border-border bg-muted/35 text-muted-foreground',
    strongPanel: 'border-dashed border-border bg-muted/45 text-muted-foreground',
    icon: 'border-border bg-card text-muted-foreground',
    badge: 'border-border bg-muted text-muted-foreground',
    dot: 'bg-muted-foreground/55',
    text: 'text-muted-foreground',
    line: 'bg-border',
    ring: 'border-dashed border-border bg-muted/35 text-muted-foreground',
  },
}

const visualFlowNodeConfigs = {
  flowStage: { kind: 'stage', label: 'Stage', fallbackIcon: GitBranch },
  flowGate: { kind: 'gate', label: 'Gate', fallbackIcon: CheckCheck },
  flowArtifact: { kind: 'artifact', label: 'Artifact', fallbackIcon: PackageCheck },
  flowEnvironment: { kind: 'environment', label: 'Environment', fallbackIcon: ServerCog },
  flowSystem: { kind: 'system', label: 'System', fallbackIcon: Boxes },
  flowEvidence: { kind: 'evidence', label: 'Evidence', fallbackIcon: FileCheck2 },
  flowMetric: { kind: 'metric', label: 'Metric', fallbackIcon: CircleGauge },
  flowActor: { kind: 'actor', label: 'Actor', fallbackIcon: Bot },
} satisfies Record<VisualFlowNode['type'], VisualFlowNodeConfig>

type VisualFlowSurfaceProps = NodeProps<VisualFlowNode> & {
  config: VisualFlowNodeConfig
  children: (surface: {
    ariaLabel: string
    Icon: LucideIcon
    status: string
    tone: ToneClasses
  }) => React.ReactNode
}

function FlowHandles({ data }: { data: VisualFlowNodeData }) {
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

function FlowTooltipSurface({ data, selected, config, children }: VisualFlowSurfaceProps) {
  const tone = flowToneClasses[data.tone ?? 'muted']
  const Icon = data.Icon ?? config.fallbackIcon
  const status = data.status ?? config.label
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
          <FlowHandles data={data} />
          {children({ ariaLabel, Icon, status, tone })}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-64">
        <span className="font-medium">{data.label}</span>
        <span className="block text-muted-foreground">{data.detail}</span>
      </TooltipContent>
    </Tooltip>
  )
}

function CodeLabel({ code, fallback }: { code?: string; fallback: string }) {
  return (
    <span className="truncate font-mono text-[8px] font-semibold uppercase leading-3 tracking-normal text-muted-foreground">
      {code ?? fallback}
    </span>
  )
}

function StatusBadge({
  children,
  tone,
  className,
}: {
  children: React.ReactNode
  tone: ToneClasses
  className?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'h-5 min-w-0 overflow-hidden rounded-sm px-1.5 font-mono text-[8px] font-semibold uppercase tracking-normal',
        tone.badge,
        className,
      )}
    >
      <span aria-hidden="true" className={cn('size-1.5 shrink-0 rounded-full', tone.dot)} />
      <span className="min-w-0 truncate">{children}</span>
    </Badge>
  )
}

export function FlowStageNodeComponent(props: NodeProps<FlowStageNode>) {
  const config = visualFlowNodeConfigs.flowStage

  return (
    <FlowTooltipSurface {...props} config={config}>
      {({ Icon, status, tone }) => (
        <div className={cn('w-40 overflow-hidden rounded-lg border backdrop-blur-md', tone.panel)}>
          <div className="grid min-w-0 grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-2 px-2.5 py-2">
            <span className={cn('flex size-8 items-center justify-center rounded-md border', tone.icon)}>
              <Icon className="size-4" strokeWidth={2.2} />
            </span>
            <span className="min-w-0">
              <CodeLabel code={props.data.code} fallback={config.label} />
              <span className="block truncate text-xs font-semibold leading-4 text-foreground">
                {props.data.label}
              </span>
            </span>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-t border-current/10 px-2.5 py-1.5">
            <span className="min-w-0 truncate font-mono text-[8px] font-semibold uppercase text-muted-foreground">
              {status}
            </span>
            {props.data.metric ? (
              <span className={cn('shrink-0 font-mono text-[10px] font-semibold leading-4', tone.text)}>
                {props.data.metric}
              </span>
            ) : null}
          </div>
          <span aria-hidden="true" className={cn('block h-1 w-full', tone.line)} />
        </div>
      )}
    </FlowTooltipSurface>
  )
}

export function FlowGateNodeComponent(props: NodeProps<FlowGateNode>) {
  const config = visualFlowNodeConfigs.flowGate

  return (
    <FlowTooltipSurface {...props} config={config}>
      {({ Icon, status, tone }) => (
        <div className={cn('w-44 overflow-hidden rounded-lg border backdrop-blur-md', tone.panel)}>
          <div className="flex min-w-0 items-center justify-between gap-2 px-2.5 py-2">
            <span className="flex min-w-0 items-center gap-2">
              <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-md border', tone.icon)}>
                <Icon className="size-3.5" strokeWidth={2.2} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold leading-4 text-foreground">
                  {props.data.label}
                </span>
                <CodeLabel code={props.data.code} fallback={config.label} />
              </span>
            </span>
            <span className={cn('shrink-0 rounded-full px-2 py-0.5 font-mono text-[8px] font-semibold uppercase', tone.badge)}>
              gate
            </span>
          </div>
          <div className="h-1.5 overflow-hidden bg-muted/70">
            <span
              aria-hidden="true"
              className={cn('flow-node-progress-sweep block h-full w-2/3 rounded-r-full', tone.line, tone.text)}
            />
          </div>
          <div className="truncate px-2.5 py-1.5 font-mono text-[8px] font-semibold uppercase text-muted-foreground">
            {status}
          </div>
        </div>
      )}
    </FlowTooltipSurface>
  )
}

export function FlowArtifactNodeComponent(props: NodeProps<FlowArtifactNode>) {
  const config = visualFlowNodeConfigs.flowArtifact

  return (
    <FlowTooltipSurface {...props} config={config}>
      {({ Icon, status, tone }) => (
        <div className={cn('flex w-36 min-w-0 items-center gap-2 rounded-full border px-2.5 py-2 backdrop-blur-md', tone.panel)}>
          <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-full border', tone.icon)}>
            <Icon className="size-4" strokeWidth={2.2} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold leading-4 text-foreground">{props.data.label}</span>
            <span className="flex min-w-0 items-center gap-1.5">
              <CodeLabel code={props.data.code} fallback={config.label} />
              <span className={cn('min-w-0 truncate font-mono text-[9px] font-semibold leading-3', tone.text)}>
                {props.data.metric ?? status}
              </span>
            </span>
          </span>
        </div>
      )}
    </FlowTooltipSurface>
  )
}

export function FlowEnvironmentNodeComponent(props: NodeProps<FlowEnvironmentNode>) {
  const config = visualFlowNodeConfigs.flowEnvironment

  return (
    <FlowTooltipSurface {...props} config={config}>
      {({ Icon, status, tone }) => (
        <div className="flex w-32 flex-col items-center text-center">
          <div
            className={cn(
              'flow-node-breathe relative flex size-20 items-center justify-center rounded-full border-2 backdrop-blur-md',
              'after:pointer-events-none after:absolute after:inset-2 after:rounded-full after:border after:border-current/20',
              tone.ring,
            )}
          >
            <span className={cn('relative z-10 flex size-9 items-center justify-center rounded-full border', tone.icon)}>
              <Icon className="size-4" strokeWidth={2.2} />
            </span>
          </div>
          <span className="mt-1.5 max-w-full truncate text-xs font-semibold leading-4 text-foreground">
            {props.data.label}
          </span>
          <span className="max-w-full truncate font-mono text-[8px] font-semibold uppercase text-muted-foreground">
            {props.data.code ?? status}
          </span>
        </div>
      )}
    </FlowTooltipSurface>
  )
}

export function FlowSystemNodeComponent(props: NodeProps<FlowSystemNode>) {
  const config = visualFlowNodeConfigs.flowSystem

  return (
    <FlowTooltipSurface {...props} config={config}>
      {({ Icon, status, tone }) => (
        <div className={cn('w-36 rounded-md border px-2.5 py-2 backdrop-blur-md', tone.panel)}>
          <div className="flex items-center justify-between gap-2">
            <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-md border', tone.icon)}>
              <Icon className="size-4" strokeWidth={2.2} />
            </span>
            <StatusBadge tone={tone} className="max-w-[4.75rem]">
              {props.data.code ?? config.label}
            </StatusBadge>
          </div>
          <span className="mt-2 block truncate text-xs font-semibold leading-4 text-foreground">
            {props.data.label}
          </span>
          <span className="block truncate font-mono text-[8px] font-semibold uppercase text-muted-foreground">
            {status}
          </span>
        </div>
      )}
    </FlowTooltipSurface>
  )
}

export function FlowEvidenceNodeComponent(props: NodeProps<FlowEvidenceNode>) {
  const config = visualFlowNodeConfigs.flowEvidence

  return (
    <FlowTooltipSurface {...props} config={config}>
      {({ Icon, status, tone }) => (
        <div className="flex w-28 flex-col items-center text-center">
          <div
            className={cn(
              'flow-node-breathe relative flex size-[4.75rem] shrink-0 items-center justify-center rounded-full border backdrop-blur-md',
              'after:pointer-events-none after:absolute after:inset-1.5 after:rounded-full after:border after:border-current/20',
              tone.ring,
            )}
          >
            <span className={cn('relative z-10 flex size-9 items-center justify-center rounded-full border', tone.icon)}>
              <Icon className="size-4" strokeWidth={2.3} />
            </span>
            <span aria-hidden="true" className={cn('absolute -right-0.5 -top-0.5 z-20 size-3 rounded-full border-2 border-card', tone.dot)} />
          </div>
          <Badge
            variant="outline"
            className={cn('mt-2 h-5 max-w-full rounded-full px-2 font-mono text-[9px] font-semibold uppercase tracking-normal', tone.badge)}
          >
            {props.data.code ?? status}
          </Badge>
          <span className="mt-1 max-w-full truncate text-[11px] font-medium leading-4 text-foreground">
            {props.data.label}
          </span>
        </div>
      )}
    </FlowTooltipSurface>
  )
}

export function FlowMetricNodeComponent(props: NodeProps<FlowMetricNode>) {
  const config = visualFlowNodeConfigs.flowMetric

  return (
    <FlowTooltipSurface {...props} config={config}>
      {({ Icon, status, tone }) => (
        <div
          className={cn(
            'flow-node-slow-scale relative flex size-28 flex-col items-center justify-center rounded-full border-2 text-center backdrop-blur-md',
            'after:pointer-events-none after:absolute after:inset-3 after:rounded-full after:border after:border-current/15',
            tone.ring,
          )}
        >
          <Icon className={cn('relative z-10 size-5', tone.text)} strokeWidth={2.3} />
          <span className="mt-1 max-w-[5rem] truncate text-[11px] font-semibold leading-4 text-foreground">
            {props.data.label}
          </span>
          <span className={cn('font-mono text-sm font-semibold leading-5', tone.text)}>
            {props.data.metric ?? props.data.code ?? status}
          </span>
        </div>
      )}
    </FlowTooltipSurface>
  )
}

export function FlowActorNodeComponent(props: NodeProps<FlowActorNode>) {
  const config = visualFlowNodeConfigs.flowActor

  return (
    <FlowTooltipSurface {...props} config={config}>
      {({ Icon, status, tone }) => (
        <div className="flex w-28 flex-col items-center text-center">
          <div className={cn('relative flex size-16 items-center justify-center rounded-full border backdrop-blur-md', tone.panel, tone.text)}>
            <span aria-hidden="true" className="flow-node-orbit-marker absolute -inset-1 rounded-full" />
            <span className={cn('relative z-10 flex size-10 items-center justify-center rounded-full border', tone.icon)}>
              <Icon className="size-5" strokeWidth={2.2} />
            </span>
          </div>
          <span className="mt-1.5 max-w-full truncate text-xs font-semibold leading-4 text-foreground">
            {props.data.label}
          </span>
          <span className="max-w-full truncate font-mono text-[8px] font-semibold uppercase text-muted-foreground">
            {props.data.code ?? status}
          </span>
        </div>
      )}
    </FlowTooltipSurface>
  )
}

export const visualFlowNodeTypes = {
  flowStage: FlowStageNodeComponent,
  flowGate: FlowGateNodeComponent,
  flowArtifact: FlowArtifactNodeComponent,
  flowEnvironment: FlowEnvironmentNodeComponent,
  flowSystem: FlowSystemNodeComponent,
  flowEvidence: FlowEvidenceNodeComponent,
  flowMetric: FlowMetricNodeComponent,
  flowActor: FlowActorNodeComponent,
}
