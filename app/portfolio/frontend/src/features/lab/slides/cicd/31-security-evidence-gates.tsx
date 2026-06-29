import { Bot, FileCheck2, KeyRound, Lock, User, XCircle } from 'lucide-react'

import { FamilyShell, MiniCard, type Tone, type VisualProps } from './shared/evidence-metrics-kit'

const securityGateCards = [
  ['Secret scan', 'pipeline evidence', 'blocked until clean', KeyRound, 'danger'],
  ['Credential scope', 'least privilege', 'pass from policy check', Lock, 'success'],
  ['SBOM + provenance', 'attached artifact', 'pass from signed record', FileCheck2, 'success'],
  ['Exception record', 'human review', 'documented, expiring', User, 'warning'],
] as const

export function SecurityEvidenceGatesSlideVisual({ className }: VisualProps) {
  return (
    <FamilyShell
      className={className}
      title="AI evidence beside gates"
      code="SEC_AI_10"
      status="pipeline enforced"
      ariaLabel="AI generated security work beside enforced evidence gates where AI cannot approve release gates"
      railContent={
        <div className="grid content-start gap-3">
          <MiniCard label="AI summary" value="input only" detail="Compares findings and drafts policy notes; it is not an approval." Icon={Bot} tone="primary" active />
          <div className="flex min-h-28 flex-col items-center justify-center rounded-full border-2 border-destructive bg-card text-center text-destructive">
            <XCircle className="size-6" strokeWidth={2.3} />
            <span className="mt-1 font-mono text-[8px] font-semibold uppercase leading-3">release holds</span>
            <span className="mt-1 px-2 text-[10px] leading-3 text-muted-foreground">until evidence arrives</span>
          </div>
        </div>
      }
    >
      <div className="flex h-full min-h-[25rem] items-center">
        <div className="grid w-full gap-3 sm:grid-cols-2">
          {securityGateCards.map(([label, value, detail, Icon, tone]) => (
            <MiniCard key={label} label={label} value={value} detail={detail} Icon={Icon} tone={tone as Tone} active className="min-h-28" />
          ))}
        </div>
      </div>
    </FamilyShell>
  )
}
