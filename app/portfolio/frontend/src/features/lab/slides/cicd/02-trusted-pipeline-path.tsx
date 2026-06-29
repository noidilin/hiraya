import { useState } from 'react'
import { Position } from '@xyflow/react'
import { CheckCircle2, FileCheck2, GitCommitHorizontal, PackageCheck, Rocket, ShieldCheck } from 'lucide-react'

import { TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import { LoopPipelineShell, type Stage, type Tone, type VisualProps } from './shared/loop-pipeline-kit'
import { SlideFlowCanvas, type SlideFlowCanvasNode, type SlideFlowEdge, type SlideFlowTone } from './shared/flow-canvas'
import { VisualStateController } from './shared/visual-state-control'

const trustedPipelineStages: Stage[] = [
  { id: 'change', code: 'CHG', label: 'Change', detail: 'A source change enters the shared path.', Icon: GitCommitHorizontal, tone: 'muted' },
  { id: 'validate', code: 'VAL', label: 'Validate', detail: 'Tests, review checks, and policy checks answer merge safety.', Icon: ShieldCheck, tone: 'active' },
  { id: 'ci-gate', code: 'CI', label: 'Merge gate', detail: 'CI asks: is this change safe to merge?', Icon: CheckCircle2, tone: 'active' },
  { id: 'artifact', code: 'ART', label: 'Artifact', detail: 'A build artifact carries source identity forward.', Icon: PackageCheck, tone: 'hold' },
  { id: 'deploy', code: 'DPL', label: 'Deploy and verify', detail: 'The accepted artifact is deployed and verified.', Icon: Rocket, tone: 'hold' },
  { id: 'cd-gate', code: 'CD', label: 'Release gate', detail: 'CD asks: can this accepted change be promoted safely?', Icon: FileCheck2, tone: 'hold' },
]

const trustedPipelineNodeTypes = {
  change: 'flowStage',
  validate: 'flowStage',
  'ci-gate': 'flowGate',
  artifact: 'flowArtifact',
  deploy: 'flowStage',
  'cd-gate': 'flowGate',
} as const

export function TrustedPipelinePathSlideVisual({ className }: VisualProps) {
  const [focus, setFocus] = useState<'ci' | 'cd'>('ci')
  const isCi = focus === 'ci'

  const stages = trustedPipelineStages.map((stage) => ({
    ...stage,
    tone:
      (isCi && ['validate', 'ci-gate'].includes(stage.id)) || (!isCi && ['artifact', 'deploy', 'cd-gate'].includes(stage.id))
        ? ('active' as Tone)
        : stage.id === 'change'
          ? ('muted' as Tone)
          : ('hold' as Tone),
  }))
  const flowToneByStageTone: Record<Tone, SlideFlowTone> = {
    active: 'primary',
    muted: 'muted',
    risk: 'danger',
    hold: 'warning',
    ok: 'success',
  }
  const nodes: SlideFlowCanvasNode[] = stages.map((stage, index) => ({
    id: stage.id,
    type: trustedPipelineNodeTypes[stage.id as keyof typeof trustedPipelineNodeTypes],
    position: { x: index * 172, y: index % 2 === 0 ? 48 : 112 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    data: {
      label: stage.label,
      code: stage.code,
      detail: stage.detail,
      status: stage.id === 'ci-gate' ? 'safe to merge?' : stage.id === 'cd-gate' ? 'safe to release?' : undefined,
      Icon: stage.Icon,
      tone: flowToneByStageTone[stage.tone ?? 'muted'],
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    },
  }))
  const edges: SlideFlowEdge[] = stages.slice(0, -1).map((stage, index) => {
    const active = (isCi && index < 2) || (!isCi && index >= 2)

    return {
      id: `${stage.id}-${stages[index + 1].id}`,
      source: stage.id,
      target: stages[index + 1].id,
      type: 'slideEdge',
      data: {
        tone: active ? 'primary' : 'ghost',
        label: index < 2 ? 'CI' : 'CD',
        animated: active,
        dashed: !active,
      },
    }
  })

  return (
    <TooltipProvider>
      <LoopPipelineShell
        className={className}
        label="Trusted pipeline path with CI and CD gates"
        code="PIPE_02"
        status={isCi ? 'merge confidence' : 'release confidence'}
        railContent={
          <div className="grid content-start gap-2">
            <div className={cn('rounded-md border p-2', isCi ? 'border-primary/30 bg-accent' : 'border-border bg-card/70')}>
              <p className="font-mono text-[9px] font-semibold uppercase leading-3 text-muted-foreground">CI gate question</p>
              <p className="mt-1 text-xs font-semibold leading-4 text-foreground">Safe to merge?</p>
              <p className="mt-1 text-[11px] leading-4 text-muted-foreground">Validation evidence supports merge confidence.</p>
            </div>
            <div className={cn('rounded-md border p-2', !isCi ? 'border-primary/30 bg-accent' : 'border-border bg-card/70')}>
              <p className="font-mono text-[9px] font-semibold uppercase leading-3 text-muted-foreground">CD gate question</p>
              <p className="mt-1 text-xs font-semibold leading-4 text-foreground">Safe to release?</p>
              <p className="mt-1 text-[11px] leading-4 text-muted-foreground">Artifact, deployment, and verification evidence supports promotion.</p>
            </div>
            <p className="text-[11px] leading-4 text-muted-foreground" aria-live="polite">
              {isCi
                ? 'CI focus: validation evidence supports a merge decision.'
                : 'CD focus: artifact, deployment, and verification evidence supports promotion.'}
            </p>
          </div>
        }
        controls={
          <VisualStateController
            model={{
              label: 'Pipeline question',
              value: focus,
              onValueChange: setFocus,
              steps: [
                {
                  value: 'ci',
                  label: 'CI',
                  description: 'Highlights validation evidence and the merge safety gate.',
                  status: 'merge confidence',
                },
                {
                  value: 'cd',
                  label: 'CD',
                  description: 'Highlights artifact, deploy, verify, and release promotion evidence.',
                  status: 'release confidence',
                },
              ],
            }}
          />
        }
      >
        <div className="h-full w-full min-w-0" aria-label="Linear pipeline with visible evidence connectors and two explicit decision gates">
          <SlideFlowCanvas
            key={focus}
            aria-label={isCi ? 'Zoomable CI-focused trusted pipeline graph' : 'Zoomable CD-focused trusted pipeline graph'}
            defaultNodes={nodes}
            defaultEdges={edges}
            layoutCaptureId="slide-02-trusted-pipeline"
            fitViewOptions={{ padding: 0.22 }}
          />
        </div>
      </LoopPipelineShell>
    </TooltipProvider>
  )
}
