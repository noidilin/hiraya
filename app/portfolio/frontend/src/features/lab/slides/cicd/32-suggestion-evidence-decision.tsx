import { useState } from 'react'
import {
  AlertTriangle,
  Bot,
  Check,
  HeartPulse,
  PackageCheck,
  ScanSearch,
  Server,
  TimerReset,
  User,
  XCircle,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { FamilyShell, IconBadge, MiniCard, toneClasses, type Tone, type VisualProps } from './shared/evidence-metrics-kit'
import { VisualStateController } from './shared/visual-state-control'

const evidenceNodes = [
  ['ran', 'Ran', 'Unit, integration, and smoke jobs completed with timestamps.', Check, 'success'],
  ['skipped', 'Skipped', 'Skipped jobs carry reason, owner, and expiry.', AlertTriangle, 'warning'],
  ['validation', 'Validation', 'Validation results show pass, fail, and coverage boundaries.', ScanSearch, 'primary'],
  ['artifact', 'Artifact', 'Immutable digest links plan to build output.', PackageCheck, 'primary'],
  ['deploy', 'Deploy', 'Target environment reports the intended version.', Server, 'primary'],
  ['health', 'Health', 'Health signals confirm runtime behavior after deploy.', HeartPulse, 'success'],
  ['approval', 'Approval', 'Human approval trail records risk acceptance.', User, 'warning'],
  ['recovery', 'Recovery', 'Rollback or roll-forward path is known before decision.', TimerReset, 'primary'],
] as const

export function SuggestionEvidenceDecisionSlideVisual({ className }: VisualProps) {
  const [complete, setComplete] = useState(false)
  const [activeNode, setActiveNode] = useState<(typeof evidenceNodes)[number][0]>('ran')
  const activeEvidence = evidenceNodes.find(([id]) => id === activeNode) ?? evidenceNodes[0]

  return (
    <FamilyShell
      className={className}
      title="Suggestion evidence decision"
      code="AI_BOUNDARY_11"
      status={complete ? 'ready for judgment' : 'blocked by evidence'}
      ariaLabel="Layered handoff from AI suggestion to pipeline evidence to human decision where AI is not authoritative"
      railContent={
        <div className="grid content-start gap-3">
          <MiniCard
            label={activeEvidence[1]}
            value="selected evidence"
            detail={activeEvidence[2]}
            Icon={activeEvidence[3]}
            tone={activeEvidence[4] as Tone}
            active
          />
          <div className="rounded-md border border-primary/25 bg-accent/70 p-2">
            <p className="font-mono text-[9px] font-semibold uppercase leading-4 text-primary">allowed verbs</p>
            <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
              AI may draft or inspect. Pipelines prove what happened. Humans judge risk, approval, and recovery.
            </p>
          </div>
          <Badge variant="outline" className={cn('w-fit rounded-sm font-mono text-[8px] uppercase', complete ? 'border-chart-2/35 bg-chart-2/10 text-chart-2' : 'border-destructive/40 bg-destructive/10 text-destructive')}>
            {complete ? 'ready for human judgment' : 'blocked: inspect evidence first'}
          </Badge>
        </div>
      }
      controls={
        <VisualStateController
          model={{
            label: 'Evidence state',
            value: complete ? 'complete' : 'missing',
            onValueChange: (value) => setComplete(value === 'complete'),
            steps: [
              {
                value: 'missing',
                label: 'Missing',
                description: 'The decision remains blocked while required evidence nodes are incomplete.',
                status: 'blocked',
              },
              {
                value: 'complete',
                label: 'Complete',
                description: 'The decision becomes ready for human judgment after the evidence chain is complete.',
                status: 'ready',
              },
            ],
          }}
        />
      }
    >
      <div className="grid h-full min-h-[26rem] content-center gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="outline" className="rounded-sm border-primary/30 bg-accent font-mono text-[8px] uppercase text-primary">
            proposed change: optimize deploy plan
          </Badge>
          <Badge variant="outline" className={cn('rounded-sm font-mono text-[8px] uppercase', complete ? 'border-chart-2/35 bg-chart-2/10 text-chart-2' : 'border-destructive/35 bg-destructive/10 text-destructive')}>
            {complete ? 'nodes complete' : 'decision blocked'}
          </Badge>
        </div>
        <div className="grid gap-3 lg:grid-cols-[9rem_minmax(0,1fr)_9rem] lg:items-stretch">
          <div className="rounded-md border border-primary/30 bg-card/80 p-3">
            <div className="flex items-center gap-2">
              <IconBadge Icon={Bot} tone="primary" />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold leading-4 text-foreground">Suggestion</p>
                <p className="truncate font-mono text-[8px] uppercase text-muted-foreground">AI advisory only</p>
              </div>
            </div>
            <p className="mt-2 text-[11px] leading-4 text-muted-foreground">Allowed verbs: draft, inspect, summarize. AI cannot approve or release.</p>
          </div>
          <div className="rounded-md border border-border bg-card/75 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold leading-4 text-foreground">Evidence</p>
                <p className="font-mono text-[8px] uppercase text-muted-foreground">pipeline owned, keyboard inspectable</p>
              </div>
              <Badge variant="outline" className={cn('rounded-sm font-mono text-[8px] uppercase', complete ? 'border-chart-2/35 bg-chart-2/10 text-chart-2' : 'border-destructive/35 bg-destructive/10 text-destructive')}>
                {complete ? 'nodes complete' : 'decision blocked'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="list" aria-label="Inspectable evidence nodes required before the decision gate">
              {evidenceNodes.map(([id, label, detail, Icon, tone]) => (
                <Button
                  key={id}
                  type="button"
                  variant="outline"
                  onClick={() => setActiveNode(id)}
                  aria-pressed={activeNode === id}
                  aria-label={`Inspect ${label} evidence: ${detail}`}
                  className={cn(
                    'h-auto min-w-0 justify-start gap-1 rounded-md px-2 py-3 text-left shadow-none',
                    activeNode === id && 'border-primary/35 bg-accent/70 text-primary ring-1 ring-primary/10',
                  )}
                >
                  <Icon className={cn('size-3.5 shrink-0', toneClasses[tone as Tone].text)} strokeWidth={2.2} />
                  <span className="truncate text-[10px] font-semibold leading-3">{label}</span>
                </Button>
              ))}
            </div>
          </div>
          <div className={cn('rounded-md border bg-card/80 p-3', complete ? 'border-chart-2/35 bg-chart-2/5' : 'border-destructive/35 bg-destructive/5')}>
            <div className="flex items-center gap-2">
              <IconBadge Icon={complete ? User : XCircle} tone={complete ? 'success' : 'danger'} />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold leading-4 text-foreground">Decision</p>
                <p className="truncate font-mono text-[8px] uppercase text-muted-foreground">human owned</p>
              </div>
            </div>
            <p className="mt-2 text-[11px] leading-4 text-muted-foreground">Allowed verbs: judge risk, approve, choose recovery.</p>
            <Badge variant="outline" className={cn('mt-2 rounded-sm font-mono text-[8px] uppercase', complete ? 'border-chart-2/35 bg-chart-2/10 text-chart-2' : 'border-destructive/40 bg-destructive/10 text-destructive')}>
              {complete ? 'ready for human judgment' : 'blocked: inspect evidence first'}
            </Badge>
          </div>
        </div>
      </div>
    </FamilyShell>
  )
}
