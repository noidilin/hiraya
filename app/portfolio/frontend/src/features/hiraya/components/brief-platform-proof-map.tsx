import { useMemo, useState } from 'react'
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
      className="pointer-events-none h-full w-full rounded-2xl border border-border/70 bg-background/42 p-4 shadow-inner"
      aria-label={`${zone.label} zone`}
    >
      <h3 className="font-mono text-[10px] font-semibold uppercase tracking-normal text-primary/80">{zone.label}</h3>
    </section>
  )
}

function ProofMapNode({ data }: NodeProps<Node<ProofMapNodeData, 'proofMapNode'>>) {
  const { mapNode, isLensNode, onInspect } = data
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
        'nodrag nopan group relative w-40 rounded-md border p-2 text-left outline-none backdrop-blur-md transition duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none',
        role.shell,
        isLensNode ? 'opacity-100 shadow-sm' : 'opacity-50 saturate-75 hover:opacity-85 focus:opacity-100',
      )}
    >
      <Handle type="target" position={Position.Left} className="!size-2 !border-none !bg-transparent" />
      <Handle type="source" position={Position.Right} className="!size-2 !border-none !bg-transparent" />
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
  const inspectedNode = inspectedNodeId ? findNode(content, inspectedNodeId) : undefined
  const activeNodeIds = useMemo(() => new Set(activeLens.highlightedNodeIds), [activeLens.highlightedNodeIds])

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
      position: mapNode.position,
      data: {
        mapNode,
        isLensNode: activeNodeIds.has(mapNode.id),
        onInspect: setInspectedNodeId,
      },
      draggable: false,
      zIndex: 10,
    }))

    return [...zoneNodes, ...mapNodes]
  }, [activeNodeIds, content.nodes, content.zones])

  const edges = useMemo<Edge[]>(() => {
    return content.edges.map((edge) => {
      const active = edge.lensIds.includes(activeLens.id)

      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: active ? edge.label : undefined,
        type: 'smoothstep',
        animated: active,
        markerEnd: active ? activeMarker : inactiveMarker,
        style: active ? activeEdgeStyle : inactiveEdgeStyle,
        labelBgPadding: [6, 3],
        labelBgBorderRadius: 3,
        labelStyle: {
          fill: active ? 'var(--primary)' : 'var(--muted-foreground)',
          fontSize: 10,
          fontWeight: 700,
          opacity: active ? 1 : 0.34,
        },
        className: active ? 'brief-proof-map-edge-active' : 'brief-proof-map-edge-context',
      }
    })
  }, [activeLens.id, content.edges])

  const handleLensChange = (lensId: BriefProofMapLensId) => {
    const nextLens = findLens(content, lensId)
    setActiveLensId(nextLens.id)
    setInspectedNodeId(null)
  }

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

        <div className="h-[40rem] min-h-[34rem] overflow-hidden rounded-lg border border-border bg-background/72">
          <ReactFlow
            fitView
            fitViewOptions={{ padding: 0.03, maxZoom: 1.12 }}
            minZoom={0.42}
            maxZoom={1.18}
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnDrag
            zoomOnScroll={false}
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
            className="text-foreground [&_.brief-proof-map-edge-context]:pointer-events-none [&_.react-flow__attribution]:hidden [&_.react-flow__edge]:pointer-events-none [&_.react-flow__node]:!cursor-default [&_.react-flow__node]:!pointer-events-auto [&_.react-flow__pane]:!cursor-grab"
          >
            <Background color="var(--border)" gap={24} size={1} />
            <Controls
              position="bottom-right"
              showInteractive={false}
              className="!border-border !bg-card/90 !text-foreground [&_button]:!border-border [&_button]:!bg-card [&_button]:!text-foreground"
            />
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
