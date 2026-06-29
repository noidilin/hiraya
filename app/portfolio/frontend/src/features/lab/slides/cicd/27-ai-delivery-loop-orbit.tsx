import { Bot, BrainCircuit, CheckCircle2, FileCheck2, Gauge, PackageCheck, ScanSearch, ShieldCheck, Sparkles, User } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { TooltipProvider } from '@/components/ui/tooltip'

import { LoopPipelineShell, StageChip, type Stage, type VisualProps } from './shared/loop-pipeline-kit'

const aiOrbitChips: (Stage & { supports: string })[] = [
  { id: 'draft', code: 'DRAFT', label: 'Draft workflow', detail: 'AI can suggest workflow structure, not approve it.', Icon: Bot, tone: 'hold', supports: 'Gates' },
  { id: 'inspect', code: 'INSPECT', label: 'Inspect evidence', detail: 'AI can summarize logs and diffs that already exist.', Icon: ScanSearch, tone: 'hold', supports: 'Verification' },
  { id: 'compare', code: 'COMPARE', label: 'Compare options', detail: 'AI can compare pipeline choices with explicit tradeoffs.', Icon: Gauge, tone: 'hold', supports: 'Artifact' },
  { id: 'summarize', code: 'SUMMARY', label: 'Summarize release', detail: 'AI can draft release notes from pipeline evidence.', Icon: FileCheck2, tone: 'hold', supports: 'Release truth' },
  { id: 'monitor', code: 'MONITOR', label: 'Monitor signals', detail: 'AI can watch trends and suggest investigation, but health evidence stays in the pipeline.', Icon: BrainCircuit, tone: 'hold', supports: 'Verification' },
]

const authoritativeLoop: Stage[] = [
  { id: 'gates', code: 'GATE', label: 'Gates', detail: 'Policy and review gates remain authoritative.', Icon: ShieldCheck, tone: 'active' },
  { id: 'artifact', code: 'ART', label: 'Artifact', detail: 'Immutable artifact identity remains inside the delivery loop.', Icon: PackageCheck, tone: 'active' },
  { id: 'verify', code: 'VRF', label: 'Verification', detail: 'Runtime verification is pipeline evidence.', Icon: CheckCircle2, tone: 'active' },
  { id: 'truth', code: 'REL', label: 'Release truth', detail: 'Release acceptance belongs to the pipeline and human decision makers.', Icon: User, tone: 'active' },
]

export function AiDeliveryLoopOrbitSlideVisual({ className }: VisualProps) {
  return (
    <TooltipProvider>
      <LoopPipelineShell
        className={className}
        label="AI assistance orbit around authoritative delivery loop"
        code="AI_LOOP_27"
        status="suggestions outside"
        railContent={
          <div className="grid content-start gap-3">
            <div className="rounded-md border border-primary/25 bg-accent p-2">
              <div className="flex items-center gap-2">
                <Sparkles className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
                <p className="font-mono text-[9px] font-semibold uppercase leading-4 text-primary">boundary rule</p>
              </div>
              <p className="mt-1 text-[11px] leading-4 text-foreground">
                AI suggestions need evidence before a person or gate accepts them.
              </p>
            </div>
            <div className="grid gap-2" aria-label="AI assistance suggestions that do not approve release gates">
              {aiOrbitChips.map((chip) => (
                <div key={chip.id} className="grid gap-1">
                  <StageChip stage={chip} compact />
                  <Badge variant="outline" className="w-fit rounded-sm border-chart-4/30 bg-chart-4/10 font-mono text-[8px] text-chart-4">
                    supports {chip.supports}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        }
      >
        <div className="flex h-full min-h-[28rem] w-full items-center justify-center">
          <div
            className="relative aspect-square w-[min(36rem,100%)] max-h-full"
            aria-label="AI assistance surrounds but does not replace the authoritative gates, artifacts, verification, and release evidence loop"
          >
            <div aria-hidden="true" className="orbit-ring absolute left-1/2 top-1/2 size-[88%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70" />
            <div aria-hidden="true" className="absolute left-1/2 top-1/2 size-[56%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary/25 bg-accent/60" />
            <svg aria-hidden="true" viewBox="0 0 320 240" className="absolute inset-0 h-full w-full overflow-visible">
              <defs>
                <marker id="ai-support-arrow" markerHeight="6" markerWidth="6" orient="auto" refX="5" refY="3">
                  <path d="M0 0 L6 3 L0 6 Z" className="fill-chart-4" />
                </marker>
              </defs>
              <path d="M259 44 C229 65 207 81 181 98" fill="none" className="stroke-chart-4/55" markerEnd="url(#ai-support-arrow)" strokeDasharray="5 6" strokeLinecap="round" strokeWidth="1.8" />
              <path d="M265 194 C231 177 207 159 181 139" fill="none" className="stroke-chart-4/55" markerEnd="url(#ai-support-arrow)" strokeDasharray="5 6" strokeLinecap="round" strokeWidth="1.8" />
              <text x="251" y="121" textAnchor="middle" className="fill-chart-4 font-mono text-[7px] font-bold uppercase tracking-normal">
                assists, never approves
              </text>
            </svg>
            <div className="absolute left-1/2 top-1/2 z-10 grid size-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-primary/30 bg-card/95 text-center shadow-sm">
              <ShieldCheck className="size-6 text-primary" aria-hidden="true" />
              <p className="mt-1 font-mono text-[8px] font-semibold uppercase leading-3 text-primary">authoritative loop</p>
            </div>
            <div className="absolute inset-x-[4%] inset-y-[8%] z-20 grid grid-cols-2 gap-3">
              {authoritativeLoop.map((stage) => (
                <div key={stage.id} className="flex items-center justify-center">
                  <StageChip stage={stage} />
                </div>
              ))}
            </div>
            <div className="absolute -right-1 top-3 z-30 flex items-center gap-1 rounded-full border border-chart-4/35 bg-card px-2 py-1 text-chart-4 shadow-sm">
              <BrainCircuit className="size-3.5" aria-hidden="true" />
              <span className="font-mono text-[8px] font-semibold uppercase leading-3">AI orbit</span>
            </div>
          </div>
        </div>
      </LoopPipelineShell>
    </TooltipProvider>
  )
}
