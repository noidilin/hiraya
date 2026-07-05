import { useCallback, useMemo, useState } from 'react'
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Panel,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
  type OnNodeDrag,
} from '@xyflow/react'
import {
  CloudCog,
  Database,
  FileCheck2,
  Globe2,
  KeyRound,
  PackageCheck,
  Server,
  ShieldCheck,
  Workflow,
  type LucideIcon,
} from 'lucide-react'

import type {
  BriefPlatformProofMapContent,
  BriefProofMapLens,
  BriefProofMapLensId,
  BriefProofMapNode,
  BriefProofMapNodeKind,
  BriefProofMapNodeRole,
  BriefProofMapZone,
} from '@/content/hiraya/briefPlatformProofMap'
import { isAwsProductIcon, ProductIcon } from '@/components/app/product-icons'
import { cn } from '@/lib/utils'

import { HirayaSectionShell } from './hiraya-section'

type BriefPlatformProofMapProps = {
  content: BriefPlatformProofMapContent
  className?: string
}

type ProofMapNodeData = {
  mapNode: BriefProofMapNode
  isLensNode: boolean
  layoutCaptureEnabled: boolean
  onInspect: (nodeId: string) => void
} & Record<string, unknown>

type ProofMapZoneData = {
  zone: BriefProofMapZone
} & Record<string, unknown>

type ProofMapGraphNode =
  | Node<ProofMapNodeData, 'proofMapNode'>
  | Node<ProofMapZoneData, 'proofMapZone'>

const roleClasses: Record<BriefProofMapNodeRole, {
  shell: string
  icon: string
  text: string
}> = {
  authority: {
    shell: 'border-amber-500/40 bg-amber-500/10 text-foreground ring-1 ring-amber-500/10',
    icon: 'border-amber-500/40 bg-amber-500 text-white',
    text: 'text-amber-700 dark:text-amber-300',
  },
  runtime: {
    shell: 'border-slate-200 bg-white text-slate-950 ring-1 ring-slate-200/70',
    icon: 'border-slate-200 bg-slate-50 text-slate-700',
    text: 'text-slate-500',
  },
  proof: {
    shell: 'border-emerald-500/35 bg-emerald-500/10 text-foreground ring-1 ring-emerald-500/10',
    icon: 'border-emerald-500/35 bg-emerald-500 text-white',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
}

const kindIcons: Record<BriefProofMapNodeKind, LucideIcon> = {
  actor: Globe2,
  stage: Workflow,
  artifact: PackageCheck,
  system: Server,
  environment: CloudCog,
  evidence: FileCheck2,
  gate: ShieldCheck,
}

function ProofMapZoneNode({ data }: NodeProps<Node<ProofMapZoneData, 'proofMapZone'>>) {
  const { zone } = data

  return (
    <section
      className="pointer-events-none relative h-full w-full rounded-2xl border border-border/70 bg-background/42 p-4 shadow-inner"
      aria-label={`${zone.label} zone`}
    >
      <h3 className="absolute right-4 top-4 max-w-[26rem] text-right font-mono text-[10px] font-semibold uppercase tracking-normal text-slate-950">
        {zone.label}
      </h3>
    </section>
  )
}

function ProofMapNode({ data }: NodeProps<Node<ProofMapNodeData, 'proofMapNode'>>) {
  const { mapNode, isLensNode, layoutCaptureEnabled, onInspect } = data
  const role = roleClasses[mapNode.role]
  const Icon = mapNode.id === 'vintage-postgres' ? Database : mapNode.id === 'secrets-manager' || mapNode.id === 'vintage-secrets' ? KeyRound : kindIcons[mapNode.kind]
  const productIconHasWhiteTile = mapNode.toolIcon ? isAwsProductIcon(mapNode.toolIcon) : false

  return (
    <button
      type="button"
      aria-label={`${mapNode.label}. ${mapNode.role}. ${mapNode.posture}. ${mapNode.detail}`}
      data-proof-map-role={mapNode.role}
      data-proof-map-state={isLensNode ? 'lens-node' : 'context-node'}
      onClick={() => onInspect(mapNode.id)}
      onFocus={() => onInspect(mapNode.id)}
      className={cn(
        'group relative w-40 rounded-md border p-2 text-left outline-none backdrop-blur-md transition duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none',
        layoutCaptureEnabled ? 'cursor-grab active:cursor-grabbing' : 'nodrag nopan',
        role.shell,
        isLensNode ? 'opacity-100 shadow-sm' : 'opacity-50 saturate-75 hover:opacity-85 focus:opacity-100',
      )}
    >
      <Handle id="target-left" type="target" position={Position.Left} className="!size-2 !border-none !bg-transparent" />
      <Handle id="target-right" type="target" position={Position.Right} className="!size-2 !border-none !bg-transparent" />
      <Handle id="target-top" type="target" position={Position.Top} className="!size-2 !border-none !bg-transparent" />
      <Handle id="target-bottom" type="target" position={Position.Bottom} className="!size-2 !border-none !bg-transparent" />
      <Handle id="source-left" type="source" position={Position.Left} className="!size-2 !border-none !bg-transparent" />
      <Handle id="source-right" type="source" position={Position.Right} className="!size-2 !border-none !bg-transparent" />
      <Handle id="source-top" type="source" position={Position.Top} className="!size-2 !border-none !bg-transparent" />
      <Handle id="source-bottom" type="source" position={Position.Bottom} className="!size-2 !border-none !bg-transparent" />
      <span className="flex min-w-0 items-center gap-2">
        <span className={cn('grid size-8 shrink-0 place-items-center rounded border', mapNode.toolIcon ? (productIconHasWhiteTile ? 'border-slate-200 bg-white text-slate-950' : 'border-border bg-background text-foreground') : role.icon)}>
          {mapNode.toolIcon ? <ProductIcon icon={mapNode.toolIcon} className="size-5" /> : <Icon className="size-4" aria-hidden="true" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn('block truncate font-mono text-[9px] font-semibold uppercase leading-3 tracking-normal', role.text)}>
            {mapNode.role}
          </span>
          <span className="block truncate text-xs font-semibold leading-4 text-current">{mapNode.label}</span>
        </span>
      </span>
    </button>
  )
}

const nodeTypes = {
  proofMapNode: ProofMapNode,
  proofMapZone: ProofMapZoneNode,
}

const activeEdgeStyle = {
  stroke: 'var(--primary)',
  strokeWidth: 2.4,
  strokeOpacity: 0.92,
}

const inactiveEdgeStyle = {
  stroke: 'var(--muted-foreground)',
  strokeWidth: 1.2,
  strokeOpacity: 0.18,
}

const activeMarker = {
  type: MarkerType.ArrowClosed,
  color: 'var(--primary)',
}

const inactiveMarker = {
  type: MarkerType.ArrowClosed,
  color: 'var(--muted-foreground)',
}

function findLens(content: BriefPlatformProofMapContent, lensId: BriefProofMapLensId) {
  return content.lenses.find((lens) => lens.id === lensId) ?? content.lenses[0]
}

function findNode(content: BriefPlatformProofMapContent, nodeId: string) {
  return content.nodes.find((node) => node.id === nodeId) ?? content.nodes[0]
}

type CapturedProofMapPositions = Record<string, { x: number; y: number }>

const proofMapLayoutCaptureId = 'brief-platform-proof-map'
const proofMapLayoutStorageKey = `hiraya:flow-layout:${proofMapLayoutCaptureId}`

function readCapturedProofMapLayout(): CapturedProofMapPositions {
  if (typeof window === 'undefined') return {}

  try {
    return JSON.parse(window.localStorage.getItem(proofMapLayoutStorageKey) ?? '{}') as CapturedProofMapPositions
  } catch {
    return {}
  }
}

function writeCapturedProofMapLayout(positions: CapturedProofMapPositions) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(proofMapLayoutStorageKey, JSON.stringify(positions, null, 2))
}

type ProofMapEdgeRoute = {
  sourceHandle?: string
  targetHandle?: string
  offset?: number
  stepPosition?: number
}

const proofMapEdgeRoutes: Record<string, ProofMapEdgeRoute> = {
  // Delivery authority descends into retained artifacts and accepted runtime state.
  'actions-ecr': { sourceHandle: 'source-bottom', targetHandle: 'target-top', offset: 34, stepPosition: 0.52 },
  'accepted-argocd': { sourceHandle: 'source-bottom', targetHandle: 'target-top', offset: 58, stepPosition: 0.42 },
  'ecr-workload': { sourceHandle: 'source-bottom', targetHandle: 'target-top', offset: 42, stepPosition: 0.58 },
  'argocd-workload': { sourceHandle: 'source-top', targetHandle: 'target-bottom', offset: 32, stepPosition: 0.45 },
  'workload-smoke': { sourceHandle: 'source-right', targetHandle: 'target-left', offset: 52, stepPosition: 0.66 },

  // Cross-lane authority links leave through top/bottom ports instead of sharing horizontal tracks.
  'infra-oidc': { sourceHandle: 'source-top', targetHandle: 'target-bottom', offset: 44, stepPosition: 0.5 },

  // Platform substrate, workload runtime, and cluster bootstrap use separate horizontal bands.
  'nodes-workload': { sourceHandle: 'source-bottom', targetHandle: 'target-top', offset: 18, stepPosition: 0.45 },
  'core-bootstrap': { sourceHandle: 'source-bottom', targetHandle: 'target-top', offset: 24, stepPosition: 0.5 },
  'platform-controllers': { sourceHandle: 'source-top', targetHandle: 'target-bottom', offset: 40, stepPosition: 0.46 },
  'bridge-secrets': { sourceHandle: 'source-bottom', targetHandle: 'target-right', offset: 44, stepPosition: 0.55 },
  'service-bridges-secrets': { sourceHandle: 'source-bottom', targetHandle: 'target-top', offset: 18, stepPosition: 0.5 },
  'secrets-private': { sourceHandle: 'source-left', targetHandle: 'target-bottom', offset: 44, stepPosition: 0.54 },

  // Public proof stays on a right-edge spine; the reverse request edge detours below the runtime row.
  'public-storefront': { sourceHandle: 'source-right', targetHandle: 'target-left', offset: 36, stepPosition: 0.56 },
  'visitor-storefront': { sourceHandle: 'source-bottom', targetHandle: 'target-top', offset: 18, stepPosition: 0.5 },
  'storefront-workload': { sourceHandle: 'source-bottom', targetHandle: 'target-bottom', offset: 68, stepPosition: 0.5 },
  'smoke-public': { sourceHandle: 'source-top', targetHandle: 'target-bottom', offset: 22, stepPosition: 0.5 },

  // Operations evidence uses lower tracks so health/metrics links do not collapse into one diagonal.
  'cluster-prometheus': { sourceHandle: 'source-bottom', targetHandle: 'target-left', offset: 72, stepPosition: 0.34 },
  'workload-metrics': { sourceHandle: 'source-bottom', targetHandle: 'target-left', offset: 56, stepPosition: 0.42 },
  'argocd-ops': { sourceHandle: 'source-bottom', targetHandle: 'target-left', offset: 86, stepPosition: 0.28 },
  'prometheus-ops': { sourceHandle: 'source-bottom', targetHandle: 'target-top', offset: 22, stepPosition: 0.5 },
}

function getAutomaticEdgeHandles(content: BriefPlatformProofMapContent, sourceId: string, targetId: string) {
  const source = findNode(content, sourceId)
  const target = findNode(content, targetId)
  const dx = target.position.x - source.position.x
  const dy = target.position.y - source.position.y

  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0
      ? { sourceHandle: 'source-right', targetHandle: 'target-left' }
      : { sourceHandle: 'source-left', targetHandle: 'target-right' }
  }

  return dy >= 0
    ? { sourceHandle: 'source-bottom', targetHandle: 'target-top' }
    : { sourceHandle: 'source-top', targetHandle: 'target-bottom' }
}

function getEdgeRoute(content: BriefPlatformProofMapContent, edge: BriefPlatformProofMapContent['edges'][number]) {
  const automaticHandles = getAutomaticEdgeHandles(content, edge.source, edge.target)
  const route = proofMapEdgeRoutes[edge.id]

  return {
    sourceHandle: route?.sourceHandle ?? automaticHandles.sourceHandle,
    targetHandle: route?.targetHandle ?? automaticHandles.targetHandle,
    ...(route?.offset || route?.stepPosition
      ? {
          pathOptions: {
            offset: route.offset,
            stepPosition: route.stepPosition,
          },
        }
      : {}),
  }
}

function LensButton({ lens, active, onSelect }: { lens: BriefProofMapLens; active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className={cn(
        'grid min-h-24 content-start gap-1.5 border p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/45',
        active
          ? 'border-primary/55 bg-primary/10 text-foreground shadow-sm'
          : 'border-border bg-background/70 text-muted-foreground hover:border-primary/30 hover:text-foreground',
      )}
    >
      <span className="flex min-w-0 items-start justify-between gap-2">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-normal">Proof Lens</span>
        {lens.nextRoute ? (
          <span className="shrink-0 border border-border bg-card/80 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-normal text-muted-foreground">
            {lens.nextRoute}
          </span>
        ) : null}
      </span>
      <span className="text-sm font-semibold leading-5 tracking-normal">{lens.label}</span>
      <span className="text-xs leading-5 text-muted-foreground">{lens.summary}</span>
    </button>
  )
}

function CompactProofMapNodeCard({ node, className }: { node: BriefProofMapNode; className?: string }) {
  return (
    <div className={cn('w-80 max-w-[calc(100vw-2rem)] border border-border bg-popover p-3 text-popover-foreground shadow-xl', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[9px] font-semibold uppercase tracking-normal text-primary">{node.role} · {node.code ?? node.kind}</p>
          <h4 className="mt-1 text-sm font-semibold tracking-normal text-foreground">{node.label}</h4>
        </div>
        <span className="shrink-0 border border-border bg-background px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-normal text-muted-foreground">
          {node.posture}
        </span>
      </div>

      <p className="mt-3 text-xs leading-5 text-muted-foreground">{node.detail}</p>

      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
        {node.sourceRefs.slice(0, 3).map((ref) => (
          <span key={ref} className="border border-border bg-background/80 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-normal text-muted-foreground">
            {ref}
          </span>
        ))}
      </div>
    </div>
  )
}

export function BriefPlatformProofMap({ content, className }: BriefPlatformProofMapProps) {
  const [activeLensId, setActiveLensId] = useState<BriefProofMapLensId>('visitor-request')
  const activeLens = findLens(content, activeLensId)
  const [inspectedNodeId, setInspectedNodeId] = useState<string | null>(null)
  const [capturedPositions, setCapturedPositions] = useState<CapturedProofMapPositions>({})
  const [storageRevision, setStorageRevision] = useState(0)
  const inspectedNode = inspectedNodeId ? findNode(content, inspectedNodeId) : undefined
  const activeNodeIds = useMemo(() => new Set(activeLens.highlightedNodeIds), [activeLens.highlightedNodeIds])
  const layoutCaptureEnabled = useMemo(() => {
    if (typeof window === 'undefined') return false

    const params = new URLSearchParams(window.location.search)
    return params.get('layout') === proofMapLayoutCaptureId || params.get('proofMapLayout') === '1'
  }, [])
  const initialPositions = useMemo<CapturedProofMapPositions>(() => {
    return Object.fromEntries(
      content.nodes.map((node) => [
        node.id,
        {
          x: Math.round(node.position.x),
          y: Math.round(node.position.y),
        },
      ]),
    )
  }, [content.nodes])
  const storedPositions = useMemo<CapturedProofMapPositions>(() => {
    void storageRevision
    if (!layoutCaptureEnabled) return {}

    return readCapturedProofMapLayout()
  }, [layoutCaptureEnabled, storageRevision])
  const displayedPositions = useMemo(
    () => ({ ...initialPositions, ...storedPositions, ...capturedPositions }),
    [capturedPositions, initialPositions, storedPositions],
  )

  const nodes = useMemo<ProofMapGraphNode[]>(() => {
    const zoneNodes = content.zones.map((zone) => ({
      id: `zone:${zone.id}`,
      type: 'proofMapZone' as const,
      position: zone.position,
      data: { zone },
      draggable: false,
      selectable: false,
      zIndex: 0,
      style: {
        width: zone.size.width,
        height: zone.size.height,
      },
    }))

    const mapNodes = content.nodes.map((mapNode) => ({
      id: mapNode.id,
      type: 'proofMapNode' as const,
      position: layoutCaptureEnabled ? displayedPositions[mapNode.id] ?? mapNode.position : mapNode.position,
      data: {
        mapNode,
        isLensNode: activeNodeIds.has(mapNode.id),
        layoutCaptureEnabled,
        onInspect: setInspectedNodeId,
      },
      draggable: layoutCaptureEnabled,
      zIndex: 10,
    }))

    return [...zoneNodes, ...mapNodes]
  }, [activeNodeIds, content.nodes, content.zones, displayedPositions, layoutCaptureEnabled])

  const edges = useMemo<Edge[]>(() => {
    return content.edges.map((edge) => {
      const active = edge.lensIds.includes(activeLens.id)

      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        ...getEdgeRoute(content, edge),
        label: active ? edge.label : undefined,
        type: 'smoothstep',
        animated: active,
        markerEnd: active ? activeMarker : inactiveMarker,
        style: active ? activeEdgeStyle : inactiveEdgeStyle,
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 4,
        labelBgStyle: {
          fill: 'var(--background)',
          fillOpacity: active ? 0.94 : 0.74,
        },
        labelStyle: {
          fill: active ? 'var(--primary)' : 'var(--muted-foreground)',
          fontSize: 10,
          fontWeight: 700,
          opacity: active ? 1 : 0.34,
          paintOrder: 'stroke',
          stroke: 'var(--background)',
          strokeWidth: 3,
        },
        className: active ? 'brief-proof-map-edge-active' : 'brief-proof-map-edge-context',
      }
    })
  }, [activeLens.id, content])

  const handleLensChange = (lensId: BriefProofMapLensId) => {
    const nextLens = findLens(content, lensId)
    setActiveLensId(nextLens.id)
    setInspectedNodeId(null)
  }

  const handleNodeDragStop = useCallback<OnNodeDrag<ProofMapGraphNode>>(
    (_, node) => {
      if (!layoutCaptureEnabled || node.type !== 'proofMapNode') return

      const next = {
        ...initialPositions,
        ...readCapturedProofMapLayout(),
        [node.id]: {
          x: Math.round(node.position.x),
          y: Math.round(node.position.y),
        },
      }

      setCapturedPositions(next)
      writeCapturedProofMapLayout(next)
      setStorageRevision((revision) => revision + 1)
      console.info(`[proof-map-layout:${proofMapLayoutCaptureId}]`, next)
    },
    [initialPositions, layoutCaptureEnabled],
  )

  const copyCapturedLayout = useCallback(async () => {
    if (!layoutCaptureEnabled || typeof window === 'undefined') return

    const positions = { ...initialPositions, ...readCapturedProofMapLayout(), ...capturedPositions }
    setCapturedPositions(positions)
    await window.navigator.clipboard?.writeText(JSON.stringify(positions, null, 2))
  }, [capturedPositions, initialPositions, layoutCaptureEnabled])

  const resetCapturedLayout = useCallback(() => {
    if (typeof window === 'undefined') return

    window.localStorage.removeItem(proofMapLayoutStorageKey)
    setCapturedPositions({})
    setStorageRevision((revision) => revision + 1)
  }, [])

  return (
    <HirayaSectionShell
      className={cn('overflow-hidden', className)}
      eyebrow={content.eyebrow}
      title={content.title}
      description={content.summary}
    >
      <div className="grid gap-5 bg-card/80 p-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {content.lenses.map((lens) => (
            <LensButton
              key={lens.id}
              lens={lens}
              active={lens.id === activeLens.id}
              onSelect={() => handleLensChange(lens.id)}
            />
          ))}
        </div>

        <div className="h-[46rem] min-h-[40rem] overflow-hidden rounded-lg border border-border bg-background/72">
          <ReactFlow
            fitView
            fitViewOptions={{ padding: 0.03, maxZoom: 1.12 }}
            minZoom={0.42}
            maxZoom={1.18}
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            nodesDraggable={layoutCaptureEnabled}
            nodesConnectable={false}
            elementsSelectable={layoutCaptureEnabled}
            panOnDrag
            zoomOnScroll={layoutCaptureEnabled}
            onNodeDragStop={handleNodeDragStop}
            zoomOnPinch
            zoomOnDoubleClick={false}
            preventScrolling={false}
            onNodeClick={(_, node) => {
              if (node.type === 'proofMapNode') setInspectedNodeId(node.id)
            }}
            onNodeMouseEnter={(_, node) => {
              if (node.type === 'proofMapNode') setInspectedNodeId(node.id)
            }}
            onNodeMouseLeave={() => setInspectedNodeId(null)}
            proOptions={{ hideAttribution: true }}
            className={cn(
              'text-foreground [&_.brief-proof-map-edge-context]:pointer-events-none [&_.react-flow__attribution]:hidden [&_.react-flow__edge]:pointer-events-none [&_.react-flow__node]:!pointer-events-auto [&_.react-flow__pane]:!cursor-grab',
              layoutCaptureEnabled ? '[&_.react-flow__node]:!cursor-grab [&_.react-flow__node.dragging]:!cursor-grabbing' : '[&_.react-flow__node]:!cursor-default',
            )}
          >
            <Background color="var(--border)" gap={24} size={1} />
            <Controls
              position="bottom-right"
              showInteractive={false}
              className="!border-border !bg-card/90 !text-foreground [&_button]:!border-border [&_button]:!bg-card [&_button]:!text-foreground"
            />
            {layoutCaptureEnabled ? (
              <Panel position="top-right" className="nodrag nopan max-w-72">
                <div className="rounded-md border border-primary/30 bg-card/95 p-2 text-[10px] leading-4 shadow-sm backdrop-blur-md">
                  <p className="font-mono font-semibold uppercase text-primary">layout capture</p>
                  <p className="text-muted-foreground">Drag nodes, then copy positions.</p>
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
            {inspectedNode ? (
              <Panel position="bottom-left" className="pointer-events-none max-w-[min(22rem,calc(100vw-2rem))]">
                <CompactProofMapNodeCard node={inspectedNode} className="w-full shadow-xl" />
              </Panel>
            ) : null}
          </ReactFlow>
        </div>

      </div>
    </HirayaSectionShell>
  )
}
