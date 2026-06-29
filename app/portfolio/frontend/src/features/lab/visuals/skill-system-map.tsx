import {
  BaseEdge,
  Handle,
  Position,
  ReactFlow,
  getSmoothStepPath,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from '@xyflow/react'
import type { LucideIcon } from 'lucide-react'
import { BrainCircuit, Cloud, DatabaseZap, Network, PlugZap } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

type SkillNodeTone = 'core' | 'memory' | 'api' | 'cloud'

type SkillNodeData = {
  code: string
  label: string
  role: string
  detail: string
  tone: SkillNodeTone
  Icon: LucideIcon
}

type SkillEdgeData = {
  label: string
}

type SkillNode = Node<SkillNodeData, 'skillModule'>
type SkillEdge = Edge<SkillEdgeData, 'skillConnector'>

const skillModules: SkillNodeData[] = [
  {
    code: 'CORE',
    label: 'Skill Hub',
    role: 'Routes intent',
    detail: 'Selects the right lab skill and keeps the explanation path coherent.',
    tone: 'core',
    Icon: BrainCircuit,
  },
  {
    code: 'MEM',
    label: 'Memory',
    role: 'Keeps context',
    detail: 'Carries prior lab state, terminology, and learner progress into the next step.',
    tone: 'memory',
    Icon: DatabaseZap,
  },
  {
    code: 'API',
    label: 'API',
    role: 'Calls tools',
    detail: 'Connects the lesson to build logs, package metadata, and workflow checks.',
    tone: 'api',
    Icon: PlugZap,
  },
  {
    code: 'CLD',
    label: 'Cloud',
    role: 'Maps deploys',
    detail: 'Grounds CI/CD concepts in environments, releases, and infrastructure targets.',
    tone: 'cloud',
    Icon: Cloud,
  },
]

const toneClassNames: Record<
  SkillNodeTone,
  {
    node: string
    icon: string
    badge: string
    dot: string
  }
> = {
  core: {
    node: 'border-primary/45 bg-accent text-primary ring-2 ring-primary/10',
    icon: 'border-primary/35 bg-primary text-primary-foreground',
    badge: 'border-primary/30 bg-primary text-primary-foreground',
    dot: 'bg-primary status-pulse-active',
  },
  memory: {
    node: 'border-border bg-card/90 text-foreground',
    icon: 'border-primary/25 bg-accent text-primary',
    badge: 'border-primary/25 bg-accent text-primary',
    dot: 'bg-primary',
  },
  api: {
    node: 'border-border bg-card/90 text-foreground',
    icon: 'border-border bg-muted text-muted-foreground',
    badge: 'border-border bg-muted text-muted-foreground',
    dot: 'bg-muted-foreground',
  },
  cloud: {
    node: 'border-border bg-card/90 text-foreground',
    icon: 'border-chart-2/25 bg-chart-2/10 text-chart-2',
    badge: 'border-chart-2/25 bg-chart-2/10 text-chart-2',
    dot: 'bg-chart-2',
  },
}

const skillNodes: SkillNode[] = [
  {
    id: 'core',
    type: 'skillModule',
    position: { x: 226, y: 8 },
    sourcePosition: Position.Bottom,
    data: skillModules[0],
  },
  {
    id: 'memory',
    type: 'skillModule',
    position: { x: 86, y: 104 },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    data: skillModules[1],
  },
  {
    id: 'api',
    type: 'skillModule',
    position: { x: 366, y: 104 },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    data: skillModules[2],
  },
  {
    id: 'cloud',
    type: 'skillModule',
    position: { x: 226, y: 196 },
    targetPosition: Position.Top,
    data: skillModules[3],
  },
]

const skillEdges: SkillEdge[] = [
  {
    id: 'core-memory',
    source: 'core',
    target: 'memory',
    type: 'skillConnector',
    data: { label: 'context' },
  },
  {
    id: 'core-api',
    source: 'core',
    target: 'api',
    type: 'skillConnector',
    data: { label: 'tools' },
  },
  {
    id: 'memory-cloud',
    source: 'memory',
    target: 'cloud',
    type: 'skillConnector',
    data: { label: 'context deploy' },
  },
  {
    id: 'api-cloud',
    source: 'api',
    target: 'cloud',
    type: 'skillConnector',
    data: { label: 'tool deploy' },
  },
]

function SkillModuleNode({ data }: NodeProps<SkillNode>) {
  const Icon = data.Icon
  const tone = toneClassNames[data.tone]

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          tabIndex={0}
          role="group"
          aria-label={`${data.label}: ${data.role}. ${data.detail}`}
          className={cn(
            'nodrag nopan w-[128px] rounded-lg border px-2.5 py-2 shadow-none outline-none backdrop-blur-md transition duration-150',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            tone.node,
          )}
        >
          <Handle type="target" position={Position.Top} className="!size-1.5 !border-none !bg-transparent" />
          <Handle type="source" position={Position.Bottom} className="!size-1.5 !border-none !bg-transparent" />

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
            <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] leading-4 uppercase tracking-normal text-muted-foreground">
              <span aria-hidden="true" className={cn('size-1.5 rounded-full', tone.dot)} />
              <span className="truncate">{data.role}</span>
            </p>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">{data.detail}</TooltipContent>
    </Tooltip>
  )
}

function CompactSkillModule({ module }: { module: SkillNodeData }) {
  const Icon = module.Icon
  const tone = toneClassNames[module.tone]

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          tabIndex={0}
          role="group"
          aria-label={`${module.label}: ${module.role}. ${module.detail}`}
          className={cn(
            'min-w-0 rounded-md border px-2 py-2 text-center outline-none backdrop-blur-md',
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
          <p className="mt-1.5 font-mono text-[10px] font-semibold uppercase leading-3 tracking-normal">
            {module.code}
          </p>
          <p className="mt-1 truncate text-[11px] font-medium leading-4 tracking-normal">{module.label}</p>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">{module.detail}</TooltipContent>
    </Tooltip>
  )
}

function SkillConnectorEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps<SkillEdge>) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 14,
  })

  return (
    <>
      <BaseEdge id={`${id}-base`} path={edgePath} style={{ stroke: 'var(--border)', strokeWidth: 1.2 }} />
      <path
        aria-hidden="true"
        d={edgePath}
        className="skill-system-map__edge"
        fill="none"
        stroke="var(--primary)"
        strokeLinecap="round"
        strokeWidth={2.2}
      />
    </>
  )
}

const nodeTypes = {
  skillModule: SkillModuleNode,
}

const edgeTypes = {
  skillConnector: SkillConnectorEdge,
}

type SkillSystemMapProps = {
  className?: string
}

export function SkillSystemMap({ className }: SkillSystemMapProps) {
  return (
    <TooltipProvider>
      <div
        role="region"
        aria-label="Skill system dependency map"
        aria-labelledby="skill-system-map-title"
        aria-describedby="skill-system-map-summary"
        className={cn(
          'relative min-h-[250px] overflow-hidden rounded-lg border border-border/80 bg-background/45',
          'before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_28%,color-mix(in_oklch,var(--primary),transparent_90%),transparent_42%)]',
          'after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border),transparent_62%)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border),transparent_62%)_1px,transparent_1px)] after:bg-[size:24px_24px] after:opacity-25',
          className,
        )}
      >
        <style>
          {`
            @keyframes skill-system-map-dash {
              to {
                stroke-dashoffset: -20;
              }
            }

            .skill-system-map__edge {
              stroke-dasharray: 9 8;
              animation: skill-system-map-dash 1s linear infinite;
            }

            .skill-system-map__mobile-edge {
              stroke-dasharray: 9 8;
              animation: skill-system-map-dash 1s linear infinite;
            }

            @media (prefers-reduced-motion: reduce) {
              .skill-system-map__edge,
              .skill-system-map__mobile-edge {
                animation: none;
                stroke-dasharray: 6 8;
              }
            }
          `}
        </style>

        <h3 id="skill-system-map-title" className="sr-only">
          Skill system dependency map
        </h3>
        <p id="skill-system-map-summary" className="sr-only">
          Skill Hub sits at the top. Memory is left middle, API is right middle, and both feed the Cloud module at
          the bottom for deploy mapping.
        </p>

        <div className="relative z-10 min-h-[218px] p-3 sm:hidden">
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-3 top-3 h-[174px] w-[calc(100%-1.5rem)] overflow-visible"
            viewBox="0 0 288 174"
            preserveAspectRatio="none"
          >
            <path
              className="skill-system-map__mobile-edge"
              d="M144 56 L70 96"
              fill="none"
              stroke="var(--primary)"
              strokeLinecap="round"
              strokeWidth="2.2"
            />
            <path
              className="skill-system-map__mobile-edge"
              d="M144 56 L218 96"
              fill="none"
              stroke="var(--primary)"
              strokeLinecap="round"
              strokeWidth="2.2"
            />
            <path
              className="skill-system-map__mobile-edge"
              d="M70 126 L144 164"
              fill="none"
              stroke="var(--primary)"
              strokeLinecap="round"
              strokeWidth="2.2"
            />
            <path
              className="skill-system-map__mobile-edge"
              d="M218 126 L144 164"
              fill="none"
              stroke="var(--primary)"
              strokeLinecap="round"
              strokeWidth="2.2"
            />
          </svg>

          <div className="relative mx-auto h-[186px] w-full max-w-[20rem]">
            <div className="absolute left-1/2 top-0 w-32 -translate-x-1/2">
              <CompactSkillModule module={skillModules[0]} />
            </div>
            <div className="absolute left-0 top-[76px] w-[6.4rem]">
              <CompactSkillModule module={skillModules[1]} />
            </div>
            <div className="absolute right-0 top-[76px] w-[6.4rem]">
              <CompactSkillModule module={skillModules[2]} />
            </div>
            <div className="absolute bottom-0 left-1/2 w-32 -translate-x-1/2">
              <CompactSkillModule module={skillModules[3]} />
            </div>
          </div>
        </div>

        <div className="relative z-10 hidden h-[250px] w-full sm:block">
          <ReactFlow
            role="img"
            aria-label="Skill dependency graph: Skill Hub at top, Memory left middle, API right middle, Cloud bottom center"
            aria-describedby="skill-system-map-summary"
            nodes={skillNodes}
            edges={skillEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: 0.12 }}
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

        <div className="relative z-20 flex items-center justify-between gap-2 px-3 pb-3 sm:absolute sm:inset-x-3 sm:bottom-3 sm:px-0 sm:pb-0">
          <Badge
            variant="outline"
            className="pointer-events-none h-6 rounded-full border-primary/30 bg-accent px-2.5 font-mono text-[10px] font-semibold uppercase tracking-normal text-primary"
          >
            <Network aria-hidden="true" className="size-3" />
            Hub routed
          </Badge>
          <p className="min-w-0 truncate text-right font-mono text-[10px] uppercase leading-4 tracking-normal text-muted-foreground">
            Hub &gt; memory + API &gt; cloud deploy map
          </p>
        </div>
      </div>
    </TooltipProvider>
  )
}
