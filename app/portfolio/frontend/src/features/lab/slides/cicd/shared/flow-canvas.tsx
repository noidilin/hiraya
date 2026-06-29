import {
  BaseEdge,
  Handle,
  Panel,
  Position,
  ReactFlow,
  getBezierPath,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeTypes,
  type NodeProps,
  type OnNodeDrag,
  type ReactFlowProps,
} from '@xyflow/react'
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { visualFlowNodeTypes, type VisualFlowNode } from '@/features/lab/visuals/flow'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export type SlideFlowTone = 'primary' | 'muted' | 'success' | 'warning' | 'danger' | 'ghost'

export type SlideFlowNodeData = {
  label: string
  code?: string
  detail: string
  status?: string
  Icon?: LucideIcon
  tone?: SlideFlowTone
  sourcePosition?: Position
  targetPosition?: Position
}

export type SlideFlowEdgeData = {
  tone?: SlideFlowTone
  label?: string
  dashed?: boolean
  animated?: boolean
}

export type SlideFlowNode = Node<SlideFlowNodeData, 'slideCard'>
export type SlideFlowCanvasNode = SlideFlowNode | VisualFlowNode
export type SlideFlowEdge = Edge<SlideFlowEdgeData, 'slideEdge'>

const flowToneClasses: Record<
  SlideFlowTone,
  {
    node: string
    icon: string
    badge: string
    edge: string
  }
> = {
  primary: {
    node: 'border-primary/35 bg-accent text-foreground ring-1 ring-primary/10',
    icon: 'border-primary/35 bg-primary text-primary-foreground',
    badge: 'border-primary/30 bg-accent text-primary',
    edge: 'var(--primary)',
  },
  muted: {
    node: 'border-border bg-card/90 text-foreground',
    icon: 'border-border bg-muted text-muted-foreground',
    badge: 'border-border bg-card text-muted-foreground',
    edge: 'var(--muted-foreground)',
  },
  success: {
    node: 'border-chart-2/30 bg-chart-2/10 text-foreground ring-1 ring-chart-2/10',
    icon: 'border-chart-2/30 bg-chart-2 text-primary-foreground',
    badge: 'border-chart-2/30 bg-chart-2/10 text-chart-2',
    edge: 'var(--chart-2)',
  },
  warning: {
    node: 'border-chart-4/35 bg-chart-4/10 text-foreground ring-1 ring-chart-4/10',
    icon: 'border-chart-4/35 bg-chart-4 text-primary-foreground',
    badge: 'border-chart-4/35 bg-chart-4/10 text-chart-4',
    edge: 'var(--chart-4)',
  },
  danger: {
    node: 'border-destructive/35 bg-destructive/10 text-foreground ring-1 ring-destructive/10',
    icon: 'border-destructive/35 bg-destructive text-destructive-foreground',
    badge: 'border-destructive/35 bg-destructive/10 text-destructive',
    edge: 'var(--destructive)',
  },
  ghost: {
    node: 'border-dashed border-border bg-muted/35 text-muted-foreground',
    icon: 'border-border bg-card text-muted-foreground',
    badge: 'border-border bg-muted text-muted-foreground',
    edge: 'var(--border)',
  },
}

function SlideCardNode({ data, selected }: NodeProps<SlideFlowNode>) {
  const Icon = data.Icon
  const tone = flowToneClasses[data.tone ?? 'muted']

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          tabIndex={0}
          role="group"
          aria-label={`${data.label}: ${data.detail}`}
          className={cn(
            'w-[8.75rem] rounded-md border px-2.5 py-2 text-left shadow-none outline-none backdrop-blur-md transition duration-150',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            selected && 'ring-2 ring-primary/25',
            tone.node,
          )}
        >
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
          <div className="flex min-w-0 items-center gap-2">
            {Icon ? (
              <span aria-hidden="true" className={cn('flex size-8 shrink-0 items-center justify-center rounded-md border', tone.icon)}>
                <Icon className="size-4" strokeWidth={2.2} />
              </span>
            ) : null}
            <span className="min-w-0">
              {data.code ? (
                <span className="block truncate font-mono text-[8px] font-semibold uppercase leading-3 tracking-normal text-muted-foreground">
                  {data.code}
                </span>
              ) : null}
              <span className="block truncate text-xs font-semibold leading-4 tracking-normal text-foreground">
                {data.label}
              </span>
            </span>
          </div>
          {data.status ? (
            <Badge
              variant="outline"
              className={cn('mt-2 h-5 max-w-full rounded-sm px-1.5 font-mono text-[8px] font-semibold uppercase tracking-normal', tone.badge)}
            >
              <span className="truncate">{data.status}</span>
            </Badge>
          ) : null}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-60">
        {data.detail}
      </TooltipContent>
    </Tooltip>
  )
}

function SlideEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<SlideFlowEdge>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.24,
  })
  const tone = flowToneClasses[data?.tone ?? 'muted']

  return (
    <>
      <BaseEdge id={`${id}-base`} path={edgePath} style={{ stroke: 'var(--border)', strokeWidth: 1 }} />
      <path
        aria-hidden="true"
        d={edgePath}
        className={cn(data?.animated && 'slide-flow-edge--animated')}
        fill="none"
        stroke={tone.edge}
        strokeDasharray={data?.dashed ? '4 7' : undefined}
        strokeLinecap="round"
        strokeWidth={data?.tone === 'ghost' ? 1 : 2.3}
      />
      {data?.label ? (
        <foreignObject x={labelX - 42} y={labelY - 12} width={84} height={24} className="pointer-events-none">
          <div className="flex h-6 items-center justify-center">
            <span className="max-w-full truncate rounded-sm border border-border bg-card/90 px-1.5 font-mono text-[8px] font-semibold uppercase leading-4 text-muted-foreground shadow-sm">
              {data.label}
            </span>
          </div>
        </foreignObject>
      ) : null}
    </>
  )
}

export const slideFlowNodeTypes = {
  slideCard: SlideCardNode,
} satisfies NodeTypes

const defaultSlideFlowNodeTypes = {
  ...slideFlowNodeTypes,
  ...visualFlowNodeTypes,
} satisfies NodeTypes

export const slideFlowEdgeTypes = {
  slideEdge: SlideEdge,
}

export const SLIDE_FLOW_LEGACY_CANVAS_WIDTH = 736
export const SLIDE_FLOW_LEGACY_CANVAS_HEIGHT = 416
export const SLIDE_FLOW_DESKTOP_CANVAS_WIDTH = 960
export const SLIDE_FLOW_DESKTOP_CANVAS_HEIGHT = 540
export const SLIDE_FLOW_CANVAS_WIDTH = SLIDE_FLOW_LEGACY_CANVAS_WIDTH
export const SLIDE_FLOW_CANVAS_HEIGHT = SLIDE_FLOW_LEGACY_CANVAS_HEIGHT

export type SlideFlowCanvasProps = Omit<
  ReactFlowProps<SlideFlowCanvasNode, SlideFlowEdge>,
  'edgeTypes' | 'proOptions' | 'fitView' | 'nodeTypes'
> & {
  className?: string
  fitViewMaxZoom?: number
  graphLegend?: ReactNode
  layoutCaptureId?: string
  nodeTypes?: NodeTypes
  surfaceClassName?: string
}

type CapturedLayoutPositions = Record<string, { x: number; y: number }>

function readCapturedLayout(storageKey: string): CapturedLayoutPositions {
  try {
    return JSON.parse(window.localStorage.getItem(storageKey) ?? '{}') as CapturedLayoutPositions
  } catch {
    return {}
  }
}

function writeCapturedLayout(storageKey: string, positions: CapturedLayoutPositions) {
  window.localStorage.setItem(storageKey, JSON.stringify(positions, null, 2))
}

export function SlideFlowCanvas({
  className,
  defaultNodes,
  graphLegend,
  layoutCaptureId,
  nodes,
  nodesDraggable = false,
  noDragClassName,
  noPanClassName,
  onNodeDragStop,
  surfaceClassName,
  nodeTypes,
  fitViewOptions,
  fitViewMaxZoom = 1,
  minZoom = 0.25,
  maxZoom = 1.65,
  children,
  ...props
}: SlideFlowCanvasProps) {
  const mergedNodeTypes = useMemo(
    () => ({ ...defaultSlideFlowNodeTypes, ...nodeTypes }),
    [nodeTypes],
  )
  const [capturedPositions, setCapturedPositions] = useState<CapturedLayoutPositions>({})
  const [storageRevision, setStorageRevision] = useState(0)
  const storageKey = layoutCaptureId ? `lazycicd:flow-layout:${layoutCaptureId}` : undefined
  const captureEnabled = useMemo(() => {
    if (!layoutCaptureId || typeof window === 'undefined') return false

    const params = new URLSearchParams(window.location.search)
    return params.get('layout') === '1' || params.get('layout') === layoutCaptureId
  }, [layoutCaptureId])
  const initialPositions = useMemo<CapturedLayoutPositions>(
    () => {
      const sourceNodes = nodes ?? defaultNodes ?? []

      return Object.fromEntries(
        sourceNodes.map((node) => [
          node.id,
          {
            x: Math.round(node.position.x),
            y: Math.round(node.position.y),
          },
        ]),
      )
    },
    [defaultNodes, nodes],
  )
  const storedPositions = useMemo<CapturedLayoutPositions>(() => {
    void storageRevision
    if (!captureEnabled || !storageKey || typeof window === 'undefined') return {}

    return readCapturedLayout(storageKey)
  }, [captureEnabled, storageKey, storageRevision])
  const displayedPositions = useMemo(
    () => ({ ...initialPositions, ...storedPositions, ...capturedPositions }),
    [capturedPositions, initialPositions, storedPositions],
  )
  const capturedDefaultNodes = useMemo(() => {
    if (!captureEnabled || !defaultNodes) return defaultNodes

    return defaultNodes.map((node) => ({
      ...node,
      position: displayedPositions[node.id] ?? node.position,
    }))
  }, [captureEnabled, defaultNodes, displayedPositions])
  const capturedNodes = useMemo(() => {
    if (!captureEnabled || !nodes) return nodes

    return nodes.map((node) => ({
      ...node,
      position: displayedPositions[node.id] ?? node.position,
    }))
  }, [captureEnabled, displayedPositions, nodes])

  const handleNodeDragStop = useCallback<OnNodeDrag<SlideFlowCanvasNode>>(
    (event, node, draggedNodes) => {
      onNodeDragStop?.(event, node, draggedNodes)

      if (!captureEnabled || !storageKey || typeof window === 'undefined') return

      const next = {
        ...initialPositions,
        ...readCapturedLayout(storageKey),
        [node.id]: {
          x: Math.round(node.position.x),
          y: Math.round(node.position.y),
        },
      }
      setCapturedPositions(next)
      writeCapturedLayout(storageKey, next)
      setStorageRevision((revision) => revision + 1)
      console.info(`[flow-layout:${layoutCaptureId}]`, next)
    },
    [captureEnabled, initialPositions, layoutCaptureId, onNodeDragStop, storageKey],
  )

  const copyCapturedLayout = useCallback(async () => {
    if (!storageKey || typeof window === 'undefined') return

    const positions = { ...initialPositions, ...readCapturedLayout(storageKey), ...capturedPositions }
    setCapturedPositions(positions)
    await window.navigator.clipboard?.writeText(JSON.stringify(positions, null, 2))
  }, [capturedPositions, initialPositions, storageKey])

  const resetCapturedLayout = useCallback(() => {
    if (!storageKey || typeof window === 'undefined') return

    window.localStorage.removeItem(storageKey)
    setCapturedPositions({})
    setStorageRevision((revision) => revision + 1)
  }, [storageKey])

  return (
    <div
      className={cn(
        'relative min-h-[18rem] w-full flex-1 overflow-hidden rounded-md bg-background/35',
        'aspect-[960/540] max-h-full sm:min-h-[22rem] lg:h-full lg:min-h-[30rem] lg:aspect-auto',
        surfaceClassName,
        className,
      )}
    >
      <style>
        {`
          @keyframes slide-flow-edge-dash {
            to { stroke-dashoffset: -18; }
          }

          .slide-flow-edge--animated {
            stroke-dasharray: 10 8;
            animation: slide-flow-edge-dash 0.95s linear infinite;
          }

          @media (prefers-reduced-motion: reduce) {
            .slide-flow-edge--animated {
              animation: none;
              stroke-dasharray: 6 8;
            }
          }

          .slide-flow-canvas .react-flow__node,
          .slide-flow-canvas .react-flow__node * {
            cursor: default !important;
          }

          .slide-flow-canvas .react-flow__pane {
            cursor: grab !important;
          }

          .slide-flow-canvas .react-flow__pane.dragging {
            cursor: grabbing !important;
          }

          .slide-flow-canvas--capture .react-flow__node,
          .slide-flow-canvas--capture .react-flow__node * {
            cursor: grab !important;
          }

          .slide-flow-canvas--capture .react-flow__node.dragging,
          .slide-flow-canvas--capture .react-flow__node.dragging * {
            cursor: grabbing !important;
          }
        `}
      </style>
      <ReactFlow
        fitView
        fitViewOptions={{ padding: 0.18, ...fitViewOptions, maxZoom: fitViewMaxZoom }}
        minZoom={minZoom}
        maxZoom={maxZoom}
        defaultNodes={capturedDefaultNodes}
        nodes={capturedNodes}
        nodesDraggable={captureEnabled || nodesDraggable}
        nodesConnectable={false}
        elementsSelectable
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        zoomOnDoubleClick
        preventScrolling
        noDragClassName={captureEnabled ? 'slide-flow-no-drag-disabled' : noDragClassName}
        noPanClassName={captureEnabled ? 'slide-flow-no-pan-disabled' : noPanClassName}
        onNodeDragStop={handleNodeDragStop}
        nodeTypes={mergedNodeTypes}
        edgeTypes={slideFlowEdgeTypes}
        proOptions={{ hideAttribution: true }}
        className={cn(
          'slide-flow-canvas text-foreground [&_.react-flow__attribution]:hidden',
          captureEnabled && 'slide-flow-canvas--capture',
        )}
        {...props}
      >
        {captureEnabled && layoutCaptureId ? (
          <Panel position="top-right" className="nodrag nopan max-w-64">
            <div className="rounded-md border border-primary/30 bg-card/95 p-2 text-[10px] leading-4 shadow-sm backdrop-blur-md">
              <p className="font-mono font-semibold uppercase text-primary">layout capture</p>
              <p className="text-muted-foreground">{layoutCaptureId}</p>
              <div className="mt-2 flex gap-1.5">
                <button
                  type="button"
                  className="rounded-sm border border-border bg-background px-2 py-1 font-mono font-semibold uppercase text-foreground"
                  onClick={copyCapturedLayout}
                >
                  copy
                </button>
                <button
                  type="button"
                  className="rounded-sm border border-border bg-background px-2 py-1 font-mono font-semibold uppercase text-muted-foreground"
                  onClick={resetCapturedLayout}
                >
                  reset
                </button>
              </div>
              <p className="mt-1 font-mono text-muted-foreground">{Object.keys(displayedPositions).length} positions</p>
            </div>
          </Panel>
        ) : null}
        {graphLegend ? (
          <Panel position="bottom-left" className="pointer-events-none max-w-[min(16rem,calc(100%_-_1.5rem))]">
            <div className="rounded-sm border border-border bg-card/90 px-2 py-1 text-[10px] leading-4 text-muted-foreground shadow-sm">
              {graphLegend}
            </div>
          </Panel>
        ) : null}
        {children}
      </ReactFlow>
    </div>
  )
}
