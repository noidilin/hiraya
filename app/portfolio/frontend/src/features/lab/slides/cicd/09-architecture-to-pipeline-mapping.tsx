import { useState } from 'react'
import { Position } from '@xyflow/react'
import type { LucideIcon } from 'lucide-react'
import { Boxes, Database, KeyRound, Server, ShieldCheck } from 'lucide-react'

import { cn } from '@/lib/utils'

import { FamilyShell, toneClasses, type CicdSlideVisualProps } from './shared/system-responsibility-kit'
import { SlideFlowCanvas, type SlideFlowCanvasNode, type SlideFlowEdge } from './shared/flow-canvas'
import { VisualStateController } from './shared/visual-state-control'

const pipelineStageCards = ['Validate', 'Build', 'Deploy', 'Verify'] as const
type PipelineStage = (typeof pipelineStageCards)[number]

const architectureBoundaries: Array<{
  id: 'service' | 'module' | 'database' | 'config'
  label: string
  Icon: LucideIcon
  stages: PipelineStage[]
  scope: string
}> = [
  { id: 'service', label: 'Service boundary', Icon: Server, stages: ['Validate', 'Build', 'Deploy', 'Verify'], scope: 'contract + image + target' },
  { id: 'module', label: 'Shared module', Icon: Boxes, stages: ['Validate', 'Build'], scope: 'unit + package consumers' },
  { id: 'database', label: 'Schema/database', Icon: Database, stages: ['Validate', 'Deploy', 'Verify'], scope: 'migration compatibility' },
  { id: 'config', label: 'Runtime config', Icon: KeyRound, stages: ['Validate', 'Deploy', 'Verify'], scope: 'env and secret checks' },
]

export function ArchitectureToPipelineMappingSlideVisual(props: CicdSlideVisualProps) {
  const [selected, setSelected] = useState<(typeof architectureBoundaries)[number]['id']>('service')
  const active = architectureBoundaries.find((boundary) => boundary.id === selected) ?? architectureBoundaries[0]
  const stagePositions: Record<PipelineStage, { x: number; y: number }> = {
    Validate: { x: 480, y: 12 },
    Build: { x: 480, y: 108 },
    Deploy: { x: 480, y: 204 },
    Verify: { x: 480, y: 300 },
  }
  const boundaryPositions = architectureBoundaries.map((boundary, index) => ({
    boundary,
    position: { x: 24, y: index * 96 + 12 },
  }))
  const nodes: SlideFlowCanvasNode[] = [
    ...boundaryPositions.map(({ boundary, position }): SlideFlowCanvasNode => ({
      id: boundary.id,
      type: 'flowSystem' as const,
      position,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: {
        label: boundary.label,
        code: 'boundary',
        detail: `${boundary.label} affects ${boundary.stages.join(', ')}. Scope: ${boundary.scope}.`,
        status: boundary.scope,
        Icon: boundary.Icon,
        tone: boundary.id === selected ? 'primary' : 'muted',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
    })),
    ...pipelineStageCards.map((stage): SlideFlowCanvasNode => {
      const included = active.stages.includes(stage)

      return {
        id: stage,
        type: 'flowStage' as const,
        position: stagePositions[stage],
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          label: stage,
          code: 'stage',
          detail: `${stage} is ${included ? 'included' : 'outside'} the selected scope for ${active.label}.`,
          status: included ? 'in scope' : 'outside',
          Icon: ShieldCheck,
          tone: included ? 'primary' : 'ghost',
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        },
      }
    }),
  ]
  const edges: SlideFlowEdge[] = architectureBoundaries.flatMap((boundary) =>
    boundary.stages.map((stage): SlideFlowEdge => ({
      id: `${boundary.id}-${stage}`,
      source: boundary.id,
      target: stage,
      type: 'slideEdge' as const,
      data: {
        tone: boundary.id === selected ? 'primary' : 'ghost',
        animated: boundary.id === selected,
        dashed: boundary.id !== selected,
        label: boundary.id === selected ? boundary.scope : undefined,
      },
    })),
  )

  return (
    <FamilyShell
      className={props.className}
      label="Architecture to pipeline mapping"
      code="ARCH_PIPE_09"
      status={active.scope}
      railContent={
        <div className="grid content-start gap-2" aria-label="Selected architecture boundary stage scope">
          {pipelineStageCards.map((stage) => {
            const included = active.stages.includes(stage)
            return (
              <div
                key={stage}
                tabIndex={0}
                className={cn(
                  'rounded-md border p-2 outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  included ? toneClasses.primary.panel : toneClasses.ghost.panel,
                )}
                aria-label={`${stage} stage is ${included ? 'included' : 'not included'} for ${active.label}`}
              >
                <p className="font-mono text-[9px] font-bold uppercase leading-3 tracking-normal">{stage}</p>
                <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                  {included ? 'in selected scope' : 'outside selected scope'}
                </p>
              </div>
            )
          })}
          <p aria-live="polite" className="sr-only">
            {active.label} affects {active.stages.join(', ')}.
          </p>
        </div>
      }
      controls={
        <VisualStateController
          model={{
            label: 'Architecture boundary',
            value: selected,
            onValueChange: setSelected,
            steps: architectureBoundaries.map((boundary) => ({
              value: boundary.id,
              label: boundary.label,
              shortLabel: boundary.id === 'database' ? 'Schema/database' : boundary.label.replace(' boundary', ''),
              description: `${boundary.label} highlights ${boundary.stages.join(', ')} with scope ${boundary.scope}.`,
              status: boundary.scope,
            })),
          }}
        />
      }
    >
      <div className="h-full w-full min-w-0">
        <SlideFlowCanvas
          key={selected}
          aria-label="Zoomable architecture boundary to pipeline stage map"
          defaultNodes={nodes}
          defaultEdges={edges}
          layoutCaptureId="slide-09-architecture-pipeline"
          fitViewOptions={{ padding: 0.16 }}
          minZoom={0.22}
          maxZoom={1.7}
          onNodeClick={(_, node) => {
            if (architectureBoundaries.some((boundary) => boundary.id === node.id)) {
              setSelected(node.id as (typeof architectureBoundaries)[number]['id'])
            }
          }}
          onSelectionChange={({ nodes: selectedNodes }) => {
            const selectedBoundary = selectedNodes.find((node) => architectureBoundaries.some((boundary) => boundary.id === node.id))
            if (selectedBoundary) {
              setSelected(selectedBoundary.id as (typeof architectureBoundaries)[number]['id'])
            }
          }}
        />
      </div>
    </FamilyShell>
  )
}
