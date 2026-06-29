import { useState } from 'react'
import { Position } from '@xyflow/react'
import { Cloud, Code2, FileCheck2, GitBranch, Network, SearchCheck, Server, ShieldCheck } from 'lucide-react'

import { FamilyShell, type CicdSlideVisualProps } from './shared/system-responsibility-kit'
import { SlideFlowCanvas, type SlideFlowCanvasNode, type SlideFlowEdge } from './shared/flow-canvas'
import { VisualStateController } from './shared/visual-state-control'

const skillDomains = [
  { id: 'app', label: 'Application design', shortLabel: 'App', Icon: Code2, stages: ['Validate', 'Build', 'Verify'], detail: 'Services, modules, contracts, and schema boundaries define useful checks.' },
  { id: 'platform', label: 'Platform', shortLabel: 'Platform', Icon: Server, stages: ['Build', 'Deploy'], detail: 'Runners, caches, queues, and identity shape how automation runs.' },
  { id: 'infra', label: 'Infrastructure', shortLabel: 'Infra', Icon: Cloud, stages: ['Plan', 'Apply', 'Deploy'], detail: 'Networks, databases, ingress, secrets, and targets connect artifacts to runtime.' },
  { id: 'security', label: 'Security', shortLabel: 'Security', Icon: ShieldCheck, stages: ['Validate', 'Plan', 'Apply'], detail: 'Least privilege, scans, provenance, and approvals constrain powerful stages.' },
  { id: 'opt', label: 'Optimization', shortLabel: 'Optimize', Icon: SearchCheck, stages: ['Validate', 'Build'], detail: 'Feedback order, caching, parallelism, and flake handling improve learning speed.' },
  { id: 'obs', label: 'Observability', shortLabel: 'Observe', Icon: FileCheck2, stages: ['Verify', 'Feedback'], detail: 'Logs, traces, metrics, and evidence keep releases inspectable.' },
  { id: 'release', label: 'Release operations', shortLabel: 'Release', Icon: GitBranch, stages: ['Deploy', 'Verify'], detail: 'Promotion, rollback, locks, and approvals preserve release intent.' },
] as const

export function SystemSkillMapSlideVisual(props: CicdSlideVisualProps) {
  const [selected, setSelected] = useState<(typeof skillDomains)[number]['id']>('app')
  const active = skillDomains.find((domain) => domain.id === selected) ?? skillDomains[0]
  const center = { x: 330, y: 180 }
  const domainPositions = skillDomains.map((domain, index) => {
    const angle = -90 + index * (360 / skillDomains.length)
    return {
      domain,
      x: center.x + Math.cos((angle * Math.PI) / 180) * 250,
      y: center.y + Math.sin((angle * Math.PI) / 180) * 145,
    }
  })
  const nodes: SlideFlowCanvasNode[] = [
    {
      id: 'cicd',
      type: 'flowSystem',
      position: center,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: {
        label: 'CI/CD',
        code: 'CORE',
        detail: 'The delivery path is shaped by multiple surrounding system skills.',
        status: 'delivery path',
        Icon: Network,
        tone: 'primary',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
    },
    ...domainPositions.map(({ domain, x, y }): SlideFlowCanvasNode => ({
      id: domain.id,
      type: 'flowSystem' as const,
      position: { x, y },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: {
        label: domain.label,
        code: domain.stages[0],
        detail: `${domain.detail} Affects ${domain.stages.join(', ')}.`,
        status: `${domain.stages.length} stages`,
        Icon: domain.Icon,
        tone: domain.id === selected ? 'primary' : 'muted',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
    })),
  ]
  const edges: SlideFlowEdge[] = skillDomains.map((domain) => ({
    id: `cicd-${domain.id}`,
    source: 'cicd',
    target: domain.id,
    type: 'slideEdge',
    data: {
      tone: domain.id === selected ? 'primary' : 'ghost',
      label: domain.id === selected ? 'active' : undefined,
      animated: domain.id === selected,
      dashed: domain.id !== selected,
    },
  }))

  return (
    <FamilyShell
      className={props.className}
      label="CI/CD system skill map"
      code="SYS_MAP_08"
      status={`${active.stages.join(' + ')} influenced`}
      railContent={
        <div className="grid content-start gap-2">
          {['Repeatable', 'Observable', 'Safe to change'].map((label, index) => (
            <div key={label} tabIndex={0} className="rounded-md border border-border bg-card/80 p-2 outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <p className="font-mono text-[8px] font-semibold uppercase leading-3 text-muted-foreground">detail chip {index + 1}</p>
              <p className="text-xs font-semibold leading-4 text-foreground">{label}</p>
            </div>
          ))}
          <div className="rounded-md border border-primary/25 bg-accent/60 p-2">
            <p className="font-mono text-[8px] font-semibold uppercase leading-3 text-primary">selected scope</p>
            <p className="mt-1 text-xs leading-4 text-foreground">{active.detail}</p>
          </div>
        </div>
      }
      controls={
        <VisualStateController
          model={{
            label: 'Skill domain',
            value: selected,
            onValueChange: setSelected,
            steps: skillDomains.map((domain) => ({
              value: domain.id,
              label: domain.label,
              shortLabel: domain.shortLabel,
              description: `${domain.detail} The map highlights ${domain.stages.join(', ')} influence.`,
              status: `${domain.stages.length} stages`,
            })),
          }}
        />
      }
    >
      <div className="h-full w-full min-w-0">
        <SlideFlowCanvas
          key={selected}
          aria-label="Zoomable CI/CD system skill map"
          defaultNodes={nodes}
          defaultEdges={edges}
          layoutCaptureId="slide-08-system-skill-map"
          fitViewOptions={{ padding: 0.16 }}
          minZoom={0.2}
          maxZoom={1.7}
        />
      </div>
    </FamilyShell>
  )
}
