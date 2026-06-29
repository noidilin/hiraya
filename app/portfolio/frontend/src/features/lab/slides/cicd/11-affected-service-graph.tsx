import { useState } from 'react'
import { Panel, Position } from '@xyflow/react'
import { Boxes, Database, FileText, Lock, Server, ServerCog, ToggleLeft } from 'lucide-react'

import { cn } from '@/lib/utils'

import { FamilyShell, StatusPill, type CicdSlideVisualProps } from './shared/system-responsibility-kit'
import { SlideFlowCanvas, type SlideFlowCanvasNode, type SlideFlowEdge } from './shared/flow-canvas'
import { VisualStateController } from './shared/visual-state-control'

const serviceGraphNodes = [
  { id: 'lib', label: 'shared library', x: 94, y: 42, included: true, kind: 'dependency', Icon: Boxes },
  { id: 'schema', label: 'schema contract', x: 476, y: 42, included: true, kind: 'contract', Icon: FileText },
  { id: 'downstream', label: 'billing service', x: 506, y: 196, included: true, kind: 'downstream', Icon: Server },
  { id: 'resource', label: 'shared queue', x: 322, y: 308, included: false, kind: 'resource', Icon: Database },
  { id: 'flag', label: 'feature flag', x: 74, y: 226, included: true, kind: 'config', Icon: ToggleLeft },
  { id: 'lock', label: 'deploy lock', x: 286, y: 16, included: false, kind: 'release', Icon: Lock },
] as const

export function AffectedServiceGraphSlideVisual(props: CicdSlideVisualProps) {
  const [mode, setMode] = useState<'targeted' | 'all'>('targeted')
  const includedCount = mode === 'all' ? serviceGraphNodes.length : serviceGraphNodes.filter((node) => node.included).length
  const canvasNodes: SlideFlowCanvasNode[] = [
    {
      id: 'service-a',
      type: 'flowSystem',
      position: { x: 286, y: 164 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: {
        label: 'service_a',
        code: 'changed',
        detail: 'Changed service version sha:91cf. Dependency scope starts here before validation expands outward.',
        status: 'sha:91cf changed',
        Icon: ServerCog,
        tone: 'primary',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
    },
    ...serviceGraphNodes.map((node): SlideFlowCanvasNode => {
      const included = mode === 'all' || node.included

      return {
        id: node.id,
        type: 'flowSystem',
        position: { x: node.x, y: node.y },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          label: node.label,
          code: node.kind,
          detail: `${node.label} is ${included ? 'inside' : 'outside'} the ${mode === 'all' ? 'test-all fallback' : 'targeted'} validation radius for service_a.`,
          status: included ? (node.included ? 'included check' : 'fallback included') : 'outside radius',
          Icon: node.Icon,
          tone: included ? (node.included ? 'primary' : 'warning') : 'ghost',
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        },
      }
    }),
  ]
  const canvasEdges: SlideFlowEdge[] = serviceGraphNodes.map((node) => {
    const included = mode === 'all' || node.included

    return {
      id: `service-a-${node.id}`,
      source: 'service-a',
      target: node.id,
      type: 'slideEdge',
      data: {
        tone: included ? (node.included ? 'primary' : 'warning') : 'ghost',
        label: included ? (node.included ? 'include' : 'fallback') : 'outside',
        animated: included,
        dashed: !included || !node.included,
      },
    }
  })

  return (
    <FamilyShell
      className={props.className}
      label="Affected service graph"
      code="SVC_GRAPH_11"
      status={`${includedCount} checks selected`}
      railDensity="dense"
      railContent={
        <div className="grid content-start gap-2">
          <div role="list" aria-label="Graph relationship list" className="grid gap-1.5">
            {serviceGraphNodes.map((node) => {
              const included = mode === 'all' || node.included
              return (
                <div
                  key={node.id}
                  role="listitem"
                  tabIndex={0}
                  aria-label={`${node.label}: service_a to ${node.kind}. ${included ? (node.included ? 'Included in selected checks.' : 'Included by test-all fallback.') : 'Outside targeted radius.'}`}
                  className="flex items-center justify-between gap-2 rounded-md border border-border bg-card/75 px-2 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[11px] leading-4">{node.label}</span>
                    <span className="block truncate font-mono text-[8px] font-semibold uppercase leading-3 text-muted-foreground">
                      service_a to {node.kind}
                    </span>
                  </span>
                  <StatusPill tone={included ? (node.included ? 'primary' : 'warn') : 'ghost'}>
                    {included ? (node.included ? 'included' : 'fallback') : 'outside'}
                  </StatusPill>
                </div>
              )
            })}
            <div
              tabIndex={0}
              role="group"
              aria-label={`${includedCount} of ${serviceGraphNodes.length} dependency checks selected. ${mode === 'all' ? 'Every dependency is included because targeting confidence is low.' : 'Direct contracts, config, and downstream behavior are included; queue and deploy lock stay visible but outside radius.'}`}
              className="rounded-md border border-border bg-card/75 px-2 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <p className="font-mono text-[8px] font-semibold uppercase leading-3 text-muted-foreground">selected checks</p>
              <p className="text-[11px] leading-4 text-foreground">
                {mode === 'all' ? 'Every dependency is included because targeting confidence is low.' : 'Direct contracts, config, and downstream behavior are included; queue and deploy lock stay visible but outside radius.'}
              </p>
            </div>
          </div>
        </div>
      }
      controls={
        <VisualStateController
          model={{
            label: 'Validation radius',
            value: mode,
            onValueChange: setMode,
            steps: [
              {
                value: 'targeted',
                label: 'Targeted radius',
                description: 'Includes the changed service, direct contracts, config, and downstream checks.',
                status: `${serviceGraphNodes.filter((node) => node.included).length} checks`,
              },
              {
                value: 'all',
                label: 'Test-all fallback',
                shortLabel: 'Test all',
                description: 'Expands the radius to every related node when targeting is not trustworthy enough.',
                status: `${serviceGraphNodes.length} checks`,
              },
            ],
          }}
        />
      }
    >
      <div className="h-full w-full min-w-0">
        <SlideFlowCanvas
          key={mode}
          aria-label={`Zoomable affected-service dependency graph with ${mode === 'all' ? 'test-all fallback' : 'targeted validation'} radius`}
          defaultNodes={canvasNodes}
          defaultEdges={canvasEdges}
          layoutCaptureId="slide-11-affected-service"
          fitViewOptions={{ padding: mode === 'all' ? 0.18 : 0.22 }}
          minZoom={0.22}
          maxZoom={1.7}
        >
          <Panel position="top-left" className="pointer-events-none">
            <div
              className={cn(
                'rounded-md border bg-card/88 px-2 py-1.5 shadow-sm backdrop-blur-md',
                mode === 'all' ? 'border-chart-4/35 text-chart-4' : 'border-primary/30 text-primary',
              )}
            >
              <p className="font-mono text-[8px] font-semibold uppercase leading-3 tracking-normal">
                {mode === 'all' ? 'test-all radius' : 'targeted radius'}
              </p>
              <p className="text-[10px] font-medium leading-3 text-foreground">
                {mode === 'all' ? 'all dependencies included' : 'direct dependencies included'}
              </p>
            </div>
          </Panel>
          <Panel position="bottom-left" className="pointer-events-none">
            <div className="rounded-md border border-border bg-card/88 px-2 py-1.5 shadow-sm backdrop-blur-md">
              <p className="font-mono text-[8px] font-semibold uppercase leading-3 tracking-normal text-muted-foreground">
                service version
              </p>
              <p className="text-[10px] font-semibold leading-3 text-foreground">service_a sha:91cf</p>
            </div>
          </Panel>
        </SlideFlowCanvas>
      </div>
    </FamilyShell>
  )
}
