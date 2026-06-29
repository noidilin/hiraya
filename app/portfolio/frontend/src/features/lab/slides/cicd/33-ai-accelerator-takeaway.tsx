import { Activity, Check, Lock, PackageCheck, Paperclip, ShieldCheck, Sparkles, User } from 'lucide-react'

import { Badge } from '@/components/ui/badge'

import { FamilyShell, MiniCard, type VisualProps } from './shared/evidence-metrics-kit'

const assistActions = ['understand', 'draft', 'inspect', 'summarize', 'compare'] as const
const groundingControls = [
  ['Gates', ShieldCheck],
  ['Least privilege', Lock],
  ['Immutable artifact', PackageCheck],
  ['Human ownership', User],
  ['Verification', Activity],
  ['Audit evidence', Paperclip],
] as const

export function AiAcceleratorTakeawaySlideVisual({ className }: VisualProps) {
  return (
    <FamilyShell
      className={className}
      title="AI accelerator takeaway"
      code="AI_FINAL_12"
      status="evidence plus judgment"
      ariaLabel="Closing diagram showing AI accelerates while evidence and human judgment gate release"
      railContent={
        <div className="grid content-start gap-3">
          <div className="grid gap-2" aria-label="AI assist actions">
            {assistActions.map((action) => (
              <Badge
                key={action}
                variant="outline"
                className="h-7 justify-start rounded-sm border-primary/25 bg-accent px-2 font-mono text-[9px] font-semibold uppercase tracking-normal text-primary"
              >
                <Sparkles className="size-3" />
                {action}
              </Badge>
            ))}
          </div>
          <div className="rounded-md border border-primary/25 bg-accent/70 p-2">
            <p className="font-mono text-[9px] font-semibold uppercase leading-4 text-primary">course close</p>
            <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
              AI accelerates the loop only when gates, evidence, and human judgment remain attached.
            </p>
          </div>
        </div>
      }
    >
      <div className="grid h-full min-h-[26rem] gap-4 lg:grid-cols-[minmax(0,1fr)_9rem] lg:items-center">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {groundingControls.map(([label, Icon]) => (
            <MiniCard key={label} label={label} detail="Grounding control required before release." Icon={Icon} tone="success" active className="min-h-28" />
          ))}
        </div>
        <div className="flex min-h-36 flex-col items-center justify-center rounded-full border-2 border-primary bg-accent text-center text-primary shadow-[0_0_0_8px_color-mix(in_oklch,var(--primary),transparent_92%)]">
          <Check className="size-6" strokeWidth={2.3} />
          <span className="mt-1 font-mono text-[8px] font-semibold uppercase leading-3">release</span>
          <span className="mt-1 px-2 text-[10px] leading-3 text-foreground">human judged</span>
        </div>
      </div>
    </FamilyShell>
  )
}
