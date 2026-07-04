import { useMemo, useState } from 'react'
import { Background, MarkerType, Panel, Position, ReactFlow, type Edge } from '@xyflow/react'
import { Database, Globe2, KeyRound, LockKeyhole, Network, Server, ShieldCheck } from 'lucide-react'

import { TabsContent } from '@/components/motion/tabs'
import { Card } from '@/components/ui/card'
import { visualFlowNodeTypes, type VisualFlowNode, type VisualFlowNodeData } from '@/features/lab/visuals/flow'
import type {
  ArchitectureRuntimeInteractionsContent,
  ArchitectureRuntimeTabId,
  RuntimeServiceBoundary,
  SecretMaterializationStep,
} from '@/content/hiraya/architectureRuntimeInteractions'
import { cn } from '@/lib/utils'

import { HirayaSectionShell } from './hiraya-section'

type ArchitectureRuntimeInteractionExplorerProps = {
  content: ArchitectureRuntimeInteractionsContent
  className?: string
}

type ServiceBoundaryStatus = RuntimeServiceBoundary['status']
type VisibleRuntimeTabId = Exclude<ArchitectureRuntimeTabId, 'service-boundaries'>
type RuntimeFlowNodeData = VisualFlowNodeData & {
  serviceBoundaryId?: string
  serviceBoundaryContext?: string
}

type SecretFlowNodeData = VisualFlowNodeData & {
  secretStepId?: string
}

const visibleRuntimeTabIds = ['request-paths', 'secret-materialization'] as const satisfies readonly VisibleRuntimeTabId[]

const tabLabels: Record<VisibleRuntimeTabId, string> = {
  'request-paths': 'Request paths',
  'secret-materialization': 'Secret materialization',
}

const statusClasses: Record<ServiceBoundaryStatus, string> = {
  active: 'border-primary/30 bg-primary/10 text-primary',
  legacy: 'border-border bg-muted/50 text-muted-foreground',
  data: 'border-border bg-card text-foreground',
  'platform-support': 'border-border bg-muted/50 text-muted-foreground',
}

const runtimeFlowEdgeStyle = {
  stroke: 'var(--muted-foreground)',
  strokeOpacity: 0.42,
  strokeWidth: 1.6,
}

const runtimeFlowMarker = {
  type: MarkerType.ArrowClosed,
  color: 'var(--muted-foreground)',
}

function StatusTag({ status }: { status: ServiceBoundaryStatus }) {
  return <span className={cn('border px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-normal', statusClasses[status])}>{status.replace('-', ' ')}</span>
}

function CompactServiceBoundaryCard({ service, context, className }: { service: RuntimeServiceBoundary; context?: string; className?: string }) {
  return (
    <div className={cn('w-80 max-w-[calc(100vw-2rem)] border border-border bg-popover p-3 text-popover-foreground shadow-xl', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[9px] font-semibold uppercase tracking-normal text-muted-foreground">{context ?? 'service boundary'}</p>
          <h4 className="mt-1 truncate text-sm font-semibold tracking-normal text-foreground">{service.name}</h4>
        </div>
        <StatusTag status={service.status} />
      </div>

      <p className="mt-3 text-xs leading-5 text-muted-foreground">{service.responsibility}</p>

      <dl className="mt-3 grid gap-2 border-t border-border pt-3 text-[11px] leading-4 text-muted-foreground sm:grid-cols-3">
        <div>
          <dt className="font-mono text-[9px] uppercase tracking-normal">Kubernetes</dt>
          <dd className="mt-1 font-medium text-foreground">{service.kubernetesType}</dd>
        </div>
        <div>
          <dt className="font-mono text-[9px] uppercase tracking-normal">Port</dt>
          <dd className="mt-1 font-medium text-foreground">{service.port ?? 'n/a'}</dd>
        </div>
        <div>
          <dt className="font-mono text-[9px] uppercase tracking-normal">Exposure</dt>
          <dd className="mt-1 font-medium text-foreground">{service.exposure}</dd>
        </div>
      </dl>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {service.participatesIn.map((item) => (
          <span key={item} className="border border-border bg-background/80 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-normal text-muted-foreground">
            {item}
          </span>
        ))}
      </div>

      {service.notes ? <p className="mt-3 border-l-2 border-primary/50 pl-2 text-[11px] leading-4 text-muted-foreground">{service.notes}</p> : null}
    </div>
  )
}

function RuntimeFlowGraph({ content }: { content: ArchitectureRuntimeInteractionsContent }) {
  const [hoveredServiceId, setHoveredServiceId] = useState<string | null>(null)
  const serviceById = useMemo(() => new Map(content.serviceBoundaries.services.map((service) => [service.id, service])), [content.serviceBoundaries.services])
  const hoveredService = hoveredServiceId ? serviceById.get(hoveredServiceId) : undefined
  const hoveredContext = hoveredServiceId === 'frontend' ? 'frontend boundary behavior' : 'service boundary'

  const nodes = useMemo<VisualFlowNode[]>(() => {
    const stageById = new Map(content.requestPaths.stages.map((stage) => [stage.id, stage]))
    const serviceIdByStageId = new Map<string, string>([
      ['storefront', 'frontend'],
      ['static-assets', 'frontend'],
      ['api-proxy', 'frontend'],
      ['gateway', 'gateway'],
      ['auth', 'auth'],
      ['product-service', 'product-service'],
      ['orders', 'orders'],
      ['vintage-postgres', 'vintage-postgres'],
    ])

    const buildNode = (
      id: string,
      type: VisualFlowNode['type'],
      position: { x: number; y: number },
      options: Partial<VisualFlowNodeData> = {},
    ): VisualFlowNode | undefined => {
      const stage = stageById.get(id)
      if (!stage) return undefined

      const service = serviceById.get(serviceIdByStageId.get(id) ?? '')
      const context = id === 'static-assets' || id === 'api-proxy' ? 'frontend boundary behavior' : 'service boundary'

      return {
        id,
        type,
        position,
        data: {
          label: stage.label,
          detail: `${stage.mechanism}. ${stage.description}`,
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
          serviceBoundaryId: service?.id,
          serviceBoundaryContext: service ? context : undefined,
          tooltipContent: null,
          ...options,
        },
      } as VisualFlowNode
    }

    return [
      buildNode('browser', 'flowActor', { x: 0, y: 170 }, { code: 'visitor', status: 'public client', Icon: Globe2, tone: 'muted' }),
      buildNode('public-edge', 'flowGate', { x: 185, y: 166 }, { code: 'edge', status: 'published route', Icon: ShieldCheck, tone: 'primary' }),
      buildNode('storefront', 'flowSystem', { x: 400, y: 166 }, { code: 'frontend', status: 'only public app boundary', Icon: Server, tone: 'primary' }),
      buildNode('static-assets', 'flowArtifact', { x: 620, y: 58 }, { code: 'assets', status: 'served by nginx', Icon: Server, tone: 'ghost' }),
      buildNode('api-proxy', 'flowGate', { x: 620, y: 166 }, { code: '/api', status: 'same-origin proxy', Icon: Network, tone: 'muted' }),
      buildNode('gateway', 'flowSystem', { x: 830, y: 166 }, { code: 'gateway', status: 'private router', Icon: ShieldCheck, tone: 'primary' }),
      buildNode('auth', 'flowSystem', { x: 1045, y: 38 }, { code: '3002', status: 'ClusterIP', Icon: Server, tone: 'muted' }),
      buildNode('product-service', 'flowSystem', { x: 1045, y: 166 }, { code: '3003', status: 'ClusterIP', Icon: Server, tone: 'muted' }),
      buildNode('orders', 'flowSystem', { x: 1045, y: 294 }, { code: '3005', status: 'ClusterIP', Icon: Server, tone: 'muted' }),
      buildNode('vintage-postgres', 'flowEnvironment', { x: 1260, y: 170 }, { code: '5432', status: 'private data', Icon: Database, tone: 'muted' }),
    ].filter(Boolean) as VisualFlowNode[]
  }, [content.requestPaths.stages, serviceById])

  const edges = useMemo<Edge[]>(() => {
    const buildEdge = (id: string, source: string, target: string, label: string): Edge => ({
      id,
      source,
      target,
      label,
      type: 'smoothstep',
      markerEnd: runtimeFlowMarker,
      style: runtimeFlowEdgeStyle,
      labelBgPadding: [6, 3],
      labelBgBorderRadius: 3,
      labelStyle: {
        fill: 'var(--muted-foreground)',
        fontSize: 10,
        fontWeight: 600,
      },
    })

    return [
      buildEdge('browser-edge', 'browser', 'public-edge', 'HTTPS'),
      buildEdge('edge-storefront', 'public-edge', 'storefront', 'HTTPRoute'),
      buildEdge('storefront-static', 'storefront', 'static-assets', 'static files'),
      buildEdge('storefront-api', 'storefront', 'api-proxy', '/api/*'),
      buildEdge('api-gateway', 'api-proxy', 'gateway', 'ClusterIP'),
      buildEdge('gateway-auth', 'gateway', 'auth', '/auth/*'),
      buildEdge('gateway-products', 'gateway', 'product-service', '/products'),
      buildEdge('gateway-orders', 'gateway', 'orders', '/orders/*'),
      buildEdge('auth-db', 'auth', 'vintage-postgres', '5432'),
      buildEdge('products-db', 'product-service', 'vintage-postgres', '5432'),
      buildEdge('orders-db', 'orders', 'vintage-postgres', '5432'),
    ]
  }, [])

  return (
    <div className="h-[32rem] min-h-[28rem] overflow-hidden rounded-md border border-border bg-background/72">
      <ReactFlow
        fitView
        fitViewOptions={{ padding: 0.08, maxZoom: 1 }}
        minZoom={0.42}
        maxZoom={1}
        nodes={nodes}
        edges={edges}
        nodeTypes={visualFlowNodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll={false}
        zoomOnPinch
        zoomOnDoubleClick={false}
        preventScrolling={false}
        onNodeMouseEnter={(_, node) => setHoveredServiceId((node.data as RuntimeFlowNodeData).serviceBoundaryId ?? null)}
        onNodeMouseLeave={() => setHoveredServiceId(null)}
        proOptions={{ hideAttribution: true }}
        className="text-foreground [&_.react-flow__attribution]:hidden [&_.react-flow__edge]:pointer-events-none [&_.react-flow__node]:!cursor-default [&_.react-flow__node]:!pointer-events-auto [&_.react-flow__pane]:!cursor-grab"
      >
        <Background color="var(--border)" gap={24} size={1} />
        {hoveredService ? (
          <Panel position="bottom-left" className="pointer-events-none max-w-[min(22rem,calc(100vw-2rem))]">
            <CompactServiceBoundaryCard service={hoveredService} context={hoveredContext} className="w-full shadow-xl" />
          </Panel>
        ) : null}
      </ReactFlow>
    </div>
  )
}

function RequestPathExplorer({ content }: { content: ArchitectureRuntimeInteractionsContent }) {
  return (
    <div className="grid gap-4 p-4 sm:p-5">
      <Card className="overflow-hidden rounded-lg border-border/90 bg-card/92 py-0 shadow-none backdrop-blur-md">
        <article className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3 p-4">
          <header className="grid min-w-0 gap-2">
            <div className="flex min-h-7 min-w-0 flex-wrap items-center gap-2">
              <span className="shrink-0 border border-border/80 bg-background px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-normal text-primary">
                flow graph
              </span>
              <span className="min-w-0 truncate border border-border/80 bg-background px-2 py-1 font-mono text-[10px] uppercase tracking-normal text-muted-foreground">
                same-origin → private services
              </span>
            </div>
            <div className="w-full min-w-0">
              <h4 className="text-lg font-semibold leading-tight tracking-normal text-foreground">
                One visitor path, multiple private branches
              </h4>
              <p className="mt-1 max-w-4xl text-xs leading-5 text-muted-foreground/86">
                Public traffic reaches only the Storefront route; API requests move through the Storefront proxy and gateway before selecting private services.
              </p>
            </div>
          </header>

          <RuntimeFlowGraph content={content} />
        </article>
      </Card>
    </div>
  )
}

function CompactSecretStepCard({ step, className }: { step: SecretMaterializationStep; className?: string }) {
  return (
    <div className={cn('w-80 max-w-[calc(100vw-2rem)] border border-border bg-popover p-3 text-popover-foreground shadow-xl', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[9px] font-semibold uppercase tracking-normal text-muted-foreground">{step.owner}</p>
          <h4 className="mt-1 text-sm font-semibold tracking-normal text-foreground">{step.label}</h4>
        </div>
        <span className="shrink-0 border border-primary/30 bg-primary/10 px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-normal text-primary">
          {step.mechanism}
        </span>
      </div>

      <p className="mt-3 text-xs leading-5 text-muted-foreground">{step.explanation}</p>

      {step.sourceRef ? (
        <code className="mt-3 block border border-border bg-background/80 px-2 py-1.5 font-mono text-[10px] leading-4 text-foreground">
          {step.sourceRef}
        </code>
      ) : null}
    </div>
  )
}

function SecretMaterializationFlowGraph({ content }: { content: ArchitectureRuntimeInteractionsContent }) {
  const [hoveredStepId, setHoveredStepId] = useState<string | null>(null)
  const stepById = useMemo(() => new Map(content.secretMaterialization.steps.map((step) => [step.id, step])), [content.secretMaterialization.steps])
  const hoveredStep = hoveredStepId ? stepById.get(hoveredStepId) : undefined

  const nodes = useMemo<VisualFlowNode[]>(() => {
    const buildNode = (
      id: string,
      type: VisualFlowNode['type'],
      position: { x: number; y: number },
      options: Partial<VisualFlowNodeData> = {},
    ): VisualFlowNode | undefined => {
      const step = stepById.get(id)
      if (!step) return undefined

      return {
        id,
        type,
        position,
        data: {
          label: step.label,
          detail: step.explanation,
          code: step.sourceRef ?? step.owner,
          status: step.mechanism,
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
          secretStepId: step.id,
          tooltipContent: null,
          ...options,
        },
      } as VisualFlowNode
    }

    return [
      buildNode('aws-secrets-manager', 'flowEnvironment', { x: 0, y: 150 }, { code: '/hiraya/dev/apps/vintage', Icon: KeyRound, tone: 'muted' }),
      buildNode('irsa-reader', 'flowGate', { x: 220, y: 146 }, { code: 'IRSA', Icon: ShieldCheck, tone: 'primary' }),
      buildNode('cluster-secret-store', 'flowSystem', { x: 455, y: 68 }, { code: 'ClusterSecretStore', Icon: Server, tone: 'muted' }),
      buildNode('external-secret', 'flowArtifact', { x: 455, y: 240 }, { code: 'ExternalSecret', Icon: KeyRound, tone: 'ghost' }),
      buildNode('kubernetes-secret', 'flowArtifact', { x: 720, y: 160 }, { code: 'vintage-secrets', Icon: LockKeyhole, tone: 'primary' }),
      buildNode('runtime-consumers', 'flowSystem', { x: 965, y: 160 }, { code: 'pods', Icon: Server, tone: 'muted' }),
    ].filter(Boolean) as VisualFlowNode[]
  }, [stepById])

  const edges = useMemo<Edge[]>(() => {
    const buildEdge = (id: string, source: string, target: string, label: string): Edge => ({
      id,
      source,
      target,
      label,
      type: 'smoothstep',
      markerEnd: runtimeFlowMarker,
      style: runtimeFlowEdgeStyle,
      labelBgPadding: [6, 3],
      labelBgBorderRadius: 3,
      labelStyle: {
        fill: 'var(--muted-foreground)',
        fontSize: 10,
        fontWeight: 600,
      },
    })

    return [
      buildEdge('secret-source-irsa', 'aws-secrets-manager', 'irsa-reader', 'read by role'),
      buildEdge('irsa-store', 'irsa-reader', 'cluster-secret-store', 'provider auth'),
      buildEdge('store-external-secret', 'cluster-secret-store', 'external-secret', 'storeRef'),
      buildEdge('external-secret-target', 'external-secret', 'kubernetes-secret', 'target owner'),
      buildEdge('kubernetes-secret-runtime', 'kubernetes-secret', 'runtime-consumers', 'env refs'),
    ]
  }, [])

  return (
    <div className="h-[28rem] min-h-[24rem] overflow-hidden rounded-md border border-border bg-background/72">
      <ReactFlow
        fitView
        fitViewOptions={{ padding: 0.1, maxZoom: 1 }}
        minZoom={0.42}
        maxZoom={1}
        nodes={nodes}
        edges={edges}
        nodeTypes={visualFlowNodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll={false}
        zoomOnPinch
        zoomOnDoubleClick={false}
        preventScrolling={false}
        onNodeMouseEnter={(_, node) => setHoveredStepId((node.data as SecretFlowNodeData).secretStepId ?? null)}
        onNodeMouseLeave={() => setHoveredStepId(null)}
        proOptions={{ hideAttribution: true }}
        className="text-foreground [&_.react-flow__attribution]:hidden [&_.react-flow__edge]:pointer-events-none [&_.react-flow__node]:!cursor-default [&_.react-flow__node]:!pointer-events-auto [&_.react-flow__pane]:!cursor-grab"
      >
        <Background color="var(--border)" gap={24} size={1} />
        {hoveredStep ? (
          <Panel position="bottom-left" className="pointer-events-none max-w-[min(22rem,calc(100vw-2rem))]">
            <CompactSecretStepCard step={hoveredStep} className="w-full shadow-xl" />
          </Panel>
        ) : null}
      </ReactFlow>
    </div>
  )
}

function SecretMaterializationExplorer({ content }: { content: ArchitectureRuntimeInteractionsContent }) {
  return (
    <div className="grid gap-4 p-4 sm:p-5">
      <Card className="overflow-hidden rounded-lg border-border/90 bg-card/92 py-0 shadow-none backdrop-blur-md">
        <article className="grid gap-3 p-4">
          <header className="grid min-w-0 gap-2">
            <div className="flex min-h-7 min-w-0 flex-wrap items-center gap-2">
              <span className="shrink-0 border border-border/80 bg-background px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-normal text-primary">
                materialization flow
              </span>
              <span className="min-w-0 truncate border border-border/80 bg-background px-2 py-1 font-mono text-[10px] uppercase tracking-normal text-muted-foreground">
                external source → runtime secret → pods
              </span>
            </div>
            <div className="w-full min-w-0">
              <h4 className="text-lg font-semibold leading-tight tracking-normal text-foreground">
                Secrets move by reference, not by copying values into Git
              </h4>
              <p className="mt-1 max-w-4xl text-xs leading-5 text-muted-foreground/86">
                Hover a node to inspect the owner, mechanism, and source reference behind each materialization handoff.
              </p>
            </div>
          </header>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
            <SecretMaterializationFlowGraph content={content} />

            <aside className="grid content-start gap-3 border border-border bg-background/72 p-4">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center border border-primary/30 bg-primary/10 text-primary">
                  <KeyRound className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">non-claims</p>
                  <h4 className="mt-1 text-base font-semibold tracking-normal text-foreground">What this does not say</h4>
                </div>
              </div>
              <ul className="grid gap-2">
                {content.secretMaterialization.nonClaims.map((claim) => (
                  <li key={claim} className="flex gap-2 text-sm leading-6 text-muted-foreground">
                    <LockKeyhole className="mt-1 size-3.5 shrink-0 text-primary" aria-hidden="true" />
                    <span>{claim}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </article>
      </Card>
    </div>
  )
}

export function ArchitectureRuntimeInteractionExplorer({ content, className }: ArchitectureRuntimeInteractionExplorerProps) {
  const defaultTabId: VisibleRuntimeTabId = content.defaultTabId === 'service-boundaries' ? 'request-paths' : content.defaultTabId
  const [selectedTabId, setSelectedTabId] = useState<VisibleRuntimeTabId>(defaultTabId)

  return (
    <HirayaSectionShell
      className={cn('overflow-hidden', className)}
      eyebrow="Runtime interaction"
      title={content.title}
      description={content.summary}
      tabs={{
        items: visibleRuntimeTabIds.map((tabId) => ({ value: tabId, label: tabLabels[tabId] })),
        value: selectedTabId,
        onValueChange: (value) => setSelectedTabId(value as VisibleRuntimeTabId),
      }}
    >
      <div className="bg-card/80">
        <TabsContent value="request-paths" className="m-0">
          <RequestPathExplorer content={content} />
        </TabsContent>
        <TabsContent value="secret-materialization" className="m-0">
          <SecretMaterializationExplorer content={content} />
        </TabsContent>
      </div>
    </HirayaSectionShell>
  )
}
