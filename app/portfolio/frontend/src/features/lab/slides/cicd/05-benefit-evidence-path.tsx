import { useState } from 'react'
import { Clock3, PackageCheck, Route, ShieldCheck, User } from 'lucide-react'

import { cn } from '@/lib/utils'

import { FamilyShell, MiniCard, type VisualProps } from './shared/evidence-metrics-kit'
import { VisualStateController } from './shared/visual-state-control'

const benefitEvidence = [
  {
    id: 'feedback',
    benefit: 'Faster feedback',
    evidence: 'Checks ran',
    question: 'Which tests failed fast enough to change the decision?',
    Icon: Clock3,
  },
  {
    id: 'release',
    benefit: 'Reliable release',
    evidence: 'Artifact built',
    question: 'Which immutable digest is moving downstream?',
    Icon: PackageCheck,
  },
  {
    id: 'trace',
    benefit: 'Traceability',
    evidence: 'Env received it',
    question: 'Which deployed version matches the source change?',
    Icon: Route,
  },
  {
    id: 'collab',
    benefit: 'Safer collaboration',
    evidence: 'Approval recorded',
    question: 'Who accepted risk and under what policy?',
    Icon: User,
  },
  {
    id: 'speed',
    benefit: 'Controlled speed',
    evidence: 'Health and recovery known',
    question: 'Can the team verify health and restore service?',
    Icon: ShieldCheck,
  },
] as const

export function BenefitEvidencePathSlideVisual({ className }: VisualProps) {
  const [activeId, setActiveId] = useState<(typeof benefitEvidence)[number]['id']>(benefitEvidence[0].id)
  const active = benefitEvidence.find((item) => item.id === activeId) ?? benefitEvidence[0]

  return (
    <FamilyShell
      className={className}
      title="Benefit evidence path"
      code="EVIDENCE_02"
      status="benefits proved"
      ariaLabel="Benefit evidence path connecting CI/CD benefits to concrete proof"
      railContent={
        <div className="grid gap-3">
          <MiniCard
            label={active.evidence}
            value="practical question"
            detail={active.question}
            Icon={active.Icon}
            tone="primary"
            active
          />
          <p className="text-[11px] leading-4 text-muted-foreground">
            Benefits are credible when each claim points to observable release evidence, not just a completed automation step.
          </p>
        </div>
      }
      controls={
        <VisualStateController
          model={{
            label: 'Evidence sequence',
            value: activeId,
            onValueChange: setActiveId,
            steps: benefitEvidence.map((item) => ({
              value: item.id,
              label: item.benefit,
              shortLabel: item.evidence,
              description: `${item.evidence} highlights the practical question: ${item.question}`,
              status: item.evidence,
            })),
          }}
        />
      }
    >
      <div className="grid h-full content-center gap-3">
        <div className="grid gap-2 sm:grid-cols-5">
          {benefitEvidence.map((item, index) => {
            const isActive = activeId === item.id
            const Icon = item.Icon
            return (
              <div
                key={item.id}
                role="group"
                className={cn(
                  'relative flex min-h-24 min-w-0 items-center justify-start gap-2 rounded-md border border-border bg-card/70 px-2 py-3 text-left shadow-none',
                  isActive && 'border-primary/30 bg-accent/60 text-primary ring-1 ring-primary/10',
                )}
                aria-label={`${item.benefit}: ${item.evidence}. ${item.question}${isActive ? ' Current highlighted step.' : ''}`}
              >
                {index > 0 ? (
                  <span aria-hidden="true" className="absolute -left-2 top-1/2 hidden h-px w-2 bg-border sm:block" />
                ) : null}
                <Icon className="size-4 shrink-0" strokeWidth={2.2} />
                <span className="min-w-0">
                  <span className="block truncate text-[11px] font-semibold leading-4">{item.benefit}</span>
                  <span className="block truncate font-mono text-[8px] uppercase leading-3 tracking-normal text-muted-foreground">
                    {item.evidence}
                  </span>
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </FamilyShell>
  )
}
