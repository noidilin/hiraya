import { useState } from 'react'
import { Panel, Position } from '@xyflow/react'
import { Boxes, Database, FileWarning, GitBranch, PackageCheck, Server, ServerCog, ShieldCheck, Waypoints } from 'lucide-react'

import { simplifiedVisualFlowNodeTypes } from '@/features/lab/visuals/flow'
import { FamilyShell, StatusPill, type CicdSlideVisualProps, type Tone } from './shared/system-responsibility-kit'
import { SlideFlowCanvas, type SlideFlowCanvasNode, type SlideFlowEdge, type SlideFlowTone } from './shared/flow-canvas'
import { VisualStateController } from './shared/visual-state-control'

type SuggestionState = 'accepted' | 'rejected' | 'needs evidence'
type SuggestionId = 'contract' | 'promotion' | 'rollback' | 'shortcut'

const suggestionTone: Record<SuggestionState, Tone> = {
  accepted: 'good',
  rejected: 'risk',
  'needs evidence': 'warn',
}

const suggestionFlowTone: Record<SuggestionState, SlideFlowTone> = {
  accepted: 'success',
  rejected: 'danger',
  'needs evidence': 'warning',
}

const suggestions = [
  {
    id: 'contract',
    label: 'add contract tests',
    target: 'API -> DB',
    state: 'accepted',
  },
  {
    id: 'promotion',
    label: 'warn image rebuild',
    target: 'registry edge',
    state: 'needs evidence',
  },
  {
    id: 'rollback',
    label: 'rollback check',
    target: 'deploy target',
    state: 'accepted',
  },
  {
    id: 'shortcut',
    label: 'skip staging',
    target: 'release route',
    state: 'rejected',
  },
] as const satisfies readonly {
  id: SuggestionId
  label: string
  target: string
  state: SuggestionState
}[]

const reviewSystems = [
  {
    id: 'ui',
    label: 'web UI',
    code: 'service',
    detail: 'Frontend service sends release actions and deployment status requests to the API.',
    status: 'entrypoint',
    x: 56,
    y: 102,
    Icon: Server,
  },
  {
    id: 'api',
    label: 'release API',
    code: 'service',
    detail: 'Backend service coordinates artifact identity, contract checks, and deployment requests.',
    status: 'reviewed',
    x: 286,
    y: 102,
    Icon: ServerCog,
  },
  {
    id: 'schema',
    label: 'contract schema',
    code: 'schema',
    detail: 'Schema package defines the UI-to-API and API-to-database compatibility boundary.',
    status: 'test scope',
    x: 286,
    y: 278,
    Icon: GitBranch,
  },
  {
    id: 'db',
    label: 'release DB',
    code: 'database',
    detail: 'Deployment records, approvals, and rollback references are stored here.',
    status: 'stateful',
    x: 520,
    y: 278,
    Icon: Database,
  },
  {
    id: 'package',
    label: 'image package',
    code: 'package',
    detail: 'Signed runtime image should be promoted without rebuilding per environment.',
    status: 'same artifact',
    x: 520,
    y: 102,
    Icon: PackageCheck,
  },
  {
    id: 'module',
    label: 'infra module',
    code: 'module',
    detail: 'Infrastructure module configures ingress, secrets, observability, and rollback hooks.',
    status: 'config bound',
    x: 520,
    y: 428,
    Icon: Boxes,
  },
] as const

const reviewCallouts = [
  {
    id: 'promotion-warning',
    label: 'promotion warning',
    code: 'evidence',
    detail: 'Artifact-promotion review signal: image rebuild would break same-artifact traceability.',
    status: 'needs evidence',
    x: 760,
    y: 54,
    Icon: FileWarning,
    tone: 'warning' as const,
  },
  {
    id: 'rollback-observability',
    label: 'rollback + observe',
    code: 'evidence',
    detail: 'Rollback and observability checks must be tied to the deployment target before release.',
    status: 'accepted scope',
    x: 760,
    y: 360,
    Icon: ShieldCheck,
    tone: 'success' as const,
  },
] as const

const reviewEdges = [
  {
    id: 'ui-api',
    source: 'ui',
    target: 'api',
    label: 'calls',
    tone: 'primary',
  },
  {
    id: 'api-schema',
    source: 'api',
    target: 'schema',
    label: 'validates',
    tone: 'primary',
  },
  {
    id: 'api-db',
    source: 'api',
    target: 'db',
    label: 'writes',
    tone: 'primary',
  },
  {
    id: 'api-package',
    source: 'api',
    target: 'package',
    label: 'selects',
    tone: 'primary',
  },
  {
    id: 'package-target',
    source: 'package',
    target: 'target',
    label: 'deploys',
    tone: 'primary',
  },
  {
    id: 'module-target',
    source: 'module',
    target: 'target',
    label: 'configures',
    tone: 'muted',
  },
  {
    id: 'db-module',
    source: 'db',
    target: 'module',
    label: 'migration',
    tone: 'muted',
  },
  {
    id: 'package-promotion-warning',
    source: 'package',
    target: 'promotion-warning',
    label: 'review',
    tone: 'warning',
  },
  {
    id: 'target-rollback-observability',
    source: 'target',
    target: 'rollback-observability',
    label: 'recover',
    tone: 'success',
  },
] as const

const acceptedScopeTextEdges = [
  {
    id: 'schema-accepted-scope',
    source: 'schema',
    target: 'accepted scope',
    label: 'human-scoped contract boundary',
  },
  {
    id: 'module-accepted-scope',
    source: 'module',
    target: 'accepted scope',
    label: 'human-scoped deployment boundary',
  },
] as const

const suggestionHighlights: Record<SuggestionId, { nodes: readonly string[]; edges: readonly string[] }> = {
  contract: {
    nodes: ['api', 'schema', 'db', 'accepted-scope'],
    edges: ['api-schema', 'api-db', 'schema-accepted-scope'],
  },
  promotion: {
    nodes: ['package', 'target', 'promotion-warning'],
    edges: ['api-package', 'package-target', 'package-promotion-warning'],
  },
  rollback: {
    nodes: ['target', 'module', 'rollback-observability', 'accepted-scope'],
    edges: ['module-target', 'target-rollback-observability', 'module-accepted-scope'],
  },
  shortcut: {
    nodes: ['package', 'target'],
    edges: ['package-target'],
  },
}

export function AiArchitectureReviewSlideVisual(props: CicdSlideVisualProps) {
  const [selected, setSelected] = useState<SuggestionId>(suggestions[1].id)
  const active = suggestions.find((suggestion) => suggestion.id === selected) ?? suggestions[0]
  const highlight = suggestionHighlights[active.id]
  const nodes: SlideFlowCanvasNode[] = [
    ...reviewSystems.map(
      (system): SlideFlowCanvasNode => ({
        id: system.id,
        type: 'flowSystem',
        position: { x: system.x, y: system.y },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          label: system.label,
          code: system.code,
          detail: system.detail,
          status: highlight.nodes.includes(system.id) ? active.state : system.status,
          Icon: system.Icon,
          tone: highlight.nodes.includes(system.id) ? suggestionFlowTone[active.state] : system.id === 'api' ? 'primary' : 'muted',
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        },
      }),
    ),
    {
      id: 'target',
      type: 'flowEnvironment',
      position: { x: 760, y: 218 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: {
        label: 'prod target',
        code: 'deploy',
        detail: 'Deployment target where artifact identity, config, rollback, and observability become release boundaries.',
        status: highlight.nodes.includes('target') ? active.state : 'human scoped',
        Icon: Waypoints,
        tone: highlight.nodes.includes('target') ? suggestionFlowTone[active.state] : 'primary',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
    },
    {
      id: 'accepted-scope',
      type: 'flowEvidence',
      position: { x: 286, y: 436 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: {
        label: 'accepted scope',
        code: 'human marker',
        detail: 'Spatial marker for the human-approved validation and deployment boundary; explanatory decision copy stays outside the graph.',
        status: highlight.nodes.includes('accepted-scope') ? active.state : 'human accepted',
        Icon: ShieldCheck,
        tone: highlight.nodes.includes('accepted-scope') ? suggestionFlowTone[active.state] : 'success',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
    },
    ...reviewCallouts.map(
      (callout): SlideFlowCanvasNode => ({
        id: callout.id,
        type: 'flowEvidence',
        position: { x: callout.x, y: callout.y },
        sourcePosition: Position.Left,
        targetPosition: Position.Left,
        data: {
          label: callout.label,
          code: callout.code,
          detail: callout.detail,
          status: highlight.nodes.includes(callout.id) ? active.state : callout.status,
          Icon: callout.Icon,
          tone: highlight.nodes.includes(callout.id) ? suggestionFlowTone[active.state] : callout.tone,
          sourcePosition: Position.Left,
          targetPosition: Position.Left,
        },
      }),
    ),
  ]
  const edges: SlideFlowEdge[] = [
    ...reviewEdges.map(
      (edge): SlideFlowEdge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'slideEdge',
        data: {
          label: edge.label,
          tone: highlight.edges.includes(edge.id) ? suggestionFlowTone[active.state] : edge.tone,
          animated: highlight.edges.includes(edge.id) || edge.tone === 'primary',
          dashed: !highlight.edges.includes(edge.id) && edge.tone !== 'primary',
        },
      }),
    ),
    {
      id: 'schema-accepted-scope',
      source: 'schema',
      target: 'accepted-scope',
      type: 'slideEdge',
      data: {
        label: 'scoped',
        tone: highlight.edges.includes('schema-accepted-scope') ? suggestionFlowTone[active.state] : 'success',
        animated: highlight.edges.includes('schema-accepted-scope'),
        dashed: !highlight.edges.includes('schema-accepted-scope'),
      },
    },
    {
      id: 'module-accepted-scope',
      source: 'module',
      target: 'accepted-scope',
      type: 'slideEdge',
      data: {
        label: 'boundary',
        tone: highlight.edges.includes('module-accepted-scope') ? suggestionFlowTone[active.state] : 'success',
        animated: highlight.edges.includes('module-accepted-scope'),
        dashed: !highlight.edges.includes('module-accepted-scope'),
      },
    },
  ]

  return (
    <FamilyShell
      className={props.className}
      label="AI architecture review board"
      code="AI_ARCH_28"
      status={`${active.state}: ${active.target}`}
      railDensity="dense"
      railContent={
        <div className="grid content-start gap-2">
          <div className="grid gap-1.5" aria-label="Human review summary">
            <StatusPill tone="primary">AI is suggestion layer</StatusPill>
            <StatusPill tone="good">human accepts scope</StatusPill>
            <StatusPill tone="warn">needs evidence is not approval</StatusPill>
          </div>

          <div className="rounded-md border border-border bg-card/80 p-2">
            <p className="font-mono text-[8px] font-bold uppercase text-muted-foreground">selected suggestion</p>
            <p aria-live="polite" className="mt-1 text-xs leading-4 text-foreground">
              {active.label}: {active.state} for {active.target}.
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Highlighted graph nodes">
              {highlight.nodes.map((node) => (
                <StatusPill key={node} tone={suggestionTone[active.state]}>
                  {node}
                </StatusPill>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-border bg-card/80 p-2">
            <p className="font-mono text-[8px] font-bold uppercase text-muted-foreground">connector text</p>
            <div role="list" className="mt-1 grid gap-1">
              {reviewEdges.map((edge) => (
                <p key={edge.id} role="listitem" className="text-[10px] leading-3 text-muted-foreground">
                  {edge.source} to {edge.target}: {edge.label}
                </p>
              ))}
              {acceptedScopeTextEdges.map((edge) => (
                <p key={edge.id} role="listitem" className="text-[10px] leading-3 text-muted-foreground">
                  {edge.source} to {edge.target}: {edge.label}
                </p>
              ))}
            </div>
          </div>

          <p className="sr-only">
            Human decision summary: accepted suggestions add contract tests and rollback checks. The image rebuild warning needs evidence. The skip staging
            shortcut is rejected and is not part of the accepted architecture map.
          </p>
        </div>
      }
      controls={
        <VisualStateController
          model={{
            label: 'AI suggestion',
            value: selected,
            onValueChange: setSelected,
            steps: suggestions.map((suggestion) => ({
              value: suggestion.id,
              label: suggestion.label,
              shortLabel: suggestion.label.replace('warn ', 'warn\u00a0').replace('add ', 'add\u00a0'),
              description: `${suggestion.state} for ${suggestion.target}; the graph highlights the affected architecture boundary.`,
              status: suggestion.state,
            })),
          }}
        />
      }
    >
      <div className="min-h-0 w-full lg:h-full">
        <SlideFlowCanvas
          key={selected}
          aria-label="Zoomable architecture dependency map with service, package, schema, module, deployment target, accepted scope marker, and spatial review evidence"
          defaultNodes={nodes}
          defaultEdges={edges}
          layoutCaptureId="slide-28-ai-architecture"
          nodeTypes={simplifiedVisualFlowNodeTypes}
          fitViewOptions={{ padding: 0.07 }}
          minZoom={0.2}
          maxZoom={1.75}
        >
          <Panel position="top-left" className="pointer-events-none">
            <div className="rounded-md border border-border bg-card/88 px-2 py-1.5 shadow-sm backdrop-blur-md">
              <p className="font-mono text-[8px] font-semibold uppercase leading-3 tracking-normal text-muted-foreground">accepted map</p>
              <p className="text-[10px] font-medium leading-3 text-foreground">AI review is outside canvas</p>
            </div>
          </Panel>
        </SlideFlowCanvas>
      </div>
    </FamilyShell>
  )
}
