import { FileCheck2, Hammer, PackageCheck, Rocket, Route, ScanSearch, ShieldCheck } from 'lucide-react'

import { TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import { LoopPipelineShell, StageChip, type Stage, type VisualProps } from './shared/loop-pipeline-kit'

const sixStages: (Stage & { x: number; y: number })[] = [
  { id: 'validate', code: 'VAL', label: 'Validate', detail: 'Prove the source change before release.', Icon: ShieldCheck, x: 100, y: 24, tone: 'active' },
  { id: 'build', code: 'BLD', label: 'Build once', detail: 'Package one immutable artifact tied to source.', Icon: Hammer, x: 164, y: 61, tone: 'active' },
  { id: 'infra', code: 'INF', label: 'Deploy infra', detail: 'Change infrastructure when the release needs it.', Icon: Route, x: 164, y: 139 },
  { id: 'app', code: 'APP', label: 'Deploy app', detail: 'Run the built artifact in the target environment.', Icon: Rocket, x: 100, y: 176 },
  { id: 'verify', code: 'VRF', label: 'Verify', detail: 'Check the release after deployment.', Icon: ScanSearch, x: 36, y: 139 },
  { id: 'feedback', code: 'FBK', label: 'Feedback', detail: 'Send release evidence back to the team.', Icon: FileCheck2, x: 36, y: 61 },
]

export function SixStageLoopSlideVisual({ className }: VisualProps) {
  return (
    <TooltipProvider>
      <LoopPipelineShell
        className={className}
        label="Six stage delivery loop with immutable artifact"
        code="LOOP_06"
        status="build once"
        railContent={
          <div className="grid content-start gap-3">
            <div className="rounded-md border border-primary/30 bg-accent p-3">
              <div className="flex items-center gap-2">
                <PackageCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
                <p className="font-mono text-[9px] font-semibold uppercase leading-4 text-primary">immutable artifact</p>
              </div>
              <p className="mt-1 break-words font-mono text-[11px] font-semibold leading-4 text-foreground">sha256:88ae90</p>
              <p className="mt-1 text-xs leading-4 text-muted-foreground">Built after validation, before application deployment.</p>
            </div>
            <div className="grid gap-2">
              {sixStages.map((stage) => (
                <StageChip key={stage.id} stage={stage} compact />
              ))}
            </div>
          </div>
        }
      >
        <div className="relative flex h-full min-h-[26rem] w-full items-center justify-center p-2">
          <svg
            role="img"
            aria-label="Six stage loop in order: validate, build once, deploy infrastructure, deploy application, verify, feedback"
            viewBox="0 0 200 200"
            className="h-full max-h-full min-h-[22rem] w-full overflow-visible"
          >
            <defs>
              <marker id="six-stage-loop-arrow" markerHeight="7" markerWidth="7" orient="auto" refX="6" refY="3.5">
                <path d="M0 0 L7 3.5 L0 7 Z" className="fill-primary" />
              </marker>
            </defs>
            <circle cx="100" cy="100" r="72" fill="none" className="stroke-border" strokeWidth="1.5" />
            <path
              d="M100 28 A72 72 0 1 1 99.5 28"
              fill="none"
              className="loop-pipeline-flow stroke-primary/60"
              markerEnd="url(#six-stage-loop-arrow)"
              strokeLinecap="round"
              strokeWidth="2"
            />
            <path d="M149 50 C160 57 166 68 171 82" fill="none" className="stroke-primary" strokeLinecap="round" strokeWidth="2" />
            <circle cx="154" cy="58" r="4.5" className="fill-primary status-pulse-active" />
            <text x="100" y="96" textAnchor="middle" className="fill-muted-foreground/70 font-mono text-[6px] font-bold uppercase tracking-normal">
              tool agnostic
            </text>
            <text x="100" y="107" textAnchor="middle" className="fill-primary font-mono text-[7px] font-bold uppercase tracking-normal">
              one artifact
            </text>
            {sixStages.map((stage) => (
              <g key={stage.id} transform={`translate(${stage.x} ${stage.y})`}>
                <rect
                  x="-21"
                  y="-12"
                  width="42"
                  height="24"
                  rx="4"
                  className={stage.tone === 'active' ? 'fill-accent stroke-primary' : 'fill-card stroke-border'}
                  strokeWidth={stage.tone === 'active' ? 2 : 1}
                />
                <text
                  dy="0.35em"
                  textAnchor="middle"
                  className={cn(
                    'font-mono text-[8px] font-bold tracking-normal',
                    stage.tone === 'active' ? 'fill-primary' : 'fill-muted-foreground',
                  )}
                >
                  {stage.code}
                </text>
                <title>{`${stage.label}: ${stage.detail}`}</title>
              </g>
            ))}
          </svg>

          <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 translate-y-12 items-center gap-2 rounded-md border border-primary/30 bg-card/95 px-3 py-2 text-primary shadow-sm">
            <PackageCheck className="size-4 shrink-0" aria-hidden="true" />
            <span className="font-mono text-[10px] font-semibold uppercase leading-4">one artifact</span>
          </div>
        </div>
      </LoopPipelineShell>
    </TooltipProvider>
  )
}
