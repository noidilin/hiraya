import { useState } from 'react'
import { Position } from '@xyflow/react'
import { Code2, Database, KeyRound, PackageCheck, Server, ShieldCheck } from 'lucide-react'

import { cn } from '@/lib/utils'

import { FamilyShell, StatusPill, toneClasses, type CicdSlideVisualProps } from './shared/system-responsibility-kit'
import { SlideFlowCanvas, type SlideFlowCanvasNode, type SlideFlowEdge } from './shared/flow-canvas'
import { VisualStateController } from './shared/visual-state-control'

export function CoupledValidationModelSlideVisual(props: CicdSlideVisualProps) {
  const [scenario, setScenario] = useState<'ui' | 'schema'>('schema')
  const broad = scenario === 'schema'
  const components = [
    { label: 'Frontend', Icon: Code2, active: true },
    { label: 'Backend', Icon: Server, active: broad },
    { label: 'Schema / DB', Icon: Database, active: broad },
    { label: 'Runtime config', Icon: KeyRound, active: broad },
  ]
  const componentNodes: SlideFlowCanvasNode[] = components.map((component, index): SlideFlowCanvasNode => ({
    id: component.label,
    type: 'flowSystem',
    position: { x: 20, y: index * 86 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    data: {
      label: component.label,
      code: component.active ? 'check' : 'linked',
      detail: `${component.label} is ${component.active ? 'inside' : 'linked to'} the selected validation scope.`,
      status: component.active ? 'inside scope' : 'visible link',
      Icon: component.Icon,
      tone: component.active ? (broad ? 'danger' : 'primary') : 'ghost',
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    },
  }))
  const nodes: SlideFlowCanvasNode[] = [
    ...componentNodes,
    {
      id: 'gate',
      type: 'flowGate',
      position: { x: 285, y: 112 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: {
        label: 'Validation gate',
        code: 'gate',
        detail: broad ? 'The selected schema-coupled change validates app, schema, config, and promotion compatibility.' : 'The selected UI change runs a narrower focused validation path.',
        status: broad ? 'app + schema + config' : 'focused UI checks',
        Icon: ShieldCheck,
        tone: broad ? 'danger' : 'primary',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
    },
    {
      id: 'artifact',
      type: 'flowArtifact',
      position: { x: 540, y: 112 },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Left,
      data: {
        label: 'sha256:8f3a',
        code: 'artifact',
        detail: 'One immutable image is promoted after validation succeeds.',
        status: 'one image',
        Icon: PackageCheck,
        tone: 'primary',
        sourcePosition: Position.Bottom,
        targetPosition: Position.Left,
      },
    },
    ...(['dev', 'staging', 'production'] as const).map((env, index): SlideFlowCanvasNode => ({
      id: env,
      type: 'flowEnvironment' as const,
      position: { x: 180 + index * 180, y: 300 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: {
        label: env,
        code: 'promote',
        detail: `The same image is promoted to ${env} with ${index === 2 ? 'approval' : 'environment config'}.`,
        status: index === 2 ? 'approval' : 'config',
        Icon: PackageCheck,
        tone: index === 2 && broad ? 'warning' : 'muted',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
    })),
  ]
  const edges: SlideFlowEdge[] = [
    ...components.map((component): SlideFlowEdge => ({
      id: `${component.label}-gate`,
      source: component.label,
      target: 'gate',
      type: 'slideEdge' as const,
      data: {
        tone: component.active ? (broad ? 'danger' : 'primary') : 'ghost',
        animated: component.active,
        dashed: !component.active,
      },
    })),
    {
      id: 'gate-artifact',
      source: 'gate',
      target: 'artifact',
      type: 'slideEdge',
      data: { tone: broad ? 'danger' : 'primary', animated: true, label: broad ? 'broad' : 'narrow' },
    },
    {
      id: 'artifact-dev',
      source: 'artifact',
      target: 'dev',
      type: 'slideEdge',
      data: { tone: 'primary', animated: true, label: 'same image' },
    },
    {
      id: 'dev-staging',
      source: 'dev',
      target: 'staging',
      type: 'slideEdge',
      data: { tone: 'muted', dashed: false },
    },
    {
      id: 'staging-production',
      source: 'staging',
      target: 'production',
      type: 'slideEdge',
      data: { tone: broad ? 'warning' : 'muted', dashed: broad, label: broad ? 'approval' : undefined },
    },
  ]

  return (
    <FamilyShell
      className={props.className}
      label="Coupled validation model"
      code="COUPLED_10"
      status={broad ? 'broad validation gate' : 'narrow UI path'}
      railContent={
        <div className="grid content-start gap-2">
          <div className={cn('rounded-md border p-2', broad ? toneClasses.risk.panel : toneClasses.primary.panel)}>
            <p className="font-mono text-[8px] font-semibold uppercase leading-3 text-muted-foreground">selected scenario</p>
            <p className="mt-1 text-xs font-semibold leading-4 text-foreground">{broad ? 'Schema-coupled' : 'Small UI change'}</p>
          </div>
          <div className="rounded-md border border-border bg-card/80 p-2">
            <p className="font-mono text-[8px] font-semibold uppercase leading-3 text-muted-foreground">config marker</p>
            <p className="mt-1 text-xs leading-4 text-foreground">Config stays outside image; compatibility is validated before promotion.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone={broad ? 'warn' : 'good'}>{broad ? 'migration compatible' : 'checks pass'}</StatusPill>
            <span className="rounded-sm border border-border bg-card px-2 py-1 font-mono text-[8px] font-semibold uppercase tracking-normal text-muted-foreground">
              same image through dev, staging, production
            </span>
          </div>
        </div>
      }
      controls={
        <VisualStateController
          model={{
            label: 'Change scenario',
            value: scenario,
            onValueChange: setScenario,
            steps: [
              {
                value: 'ui',
                label: 'Small UI change',
                shortLabel: 'UI change',
                description: 'Narrows the validation gate to focused UI checks while linked systems stay visible.',
                status: 'narrow UI path',
              },
              {
                value: 'schema',
                label: 'Schema-coupled',
                description: 'Broadens validation across app, schema, config, and promotion compatibility.',
                status: 'broad validation gate',
              },
            ],
          }}
        />
      }
    >
      <div className="h-full w-full min-w-0">
        <SlideFlowCanvas
          key={scenario}
          aria-label={broad ? 'Zoomable broad coupled validation graph' : 'Zoomable narrow UI validation graph'}
          defaultNodes={nodes}
          defaultEdges={edges}
          layoutCaptureId="slide-10-coupled-validation"
          fitViewOptions={{ padding: 0.16 }}
          minZoom={0.22}
          maxZoom={1.7}
        />
      </div>
    </FamilyShell>
  )
}
