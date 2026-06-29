import { useState } from 'react'
import { Check, FileCheck2 } from 'lucide-react'

import { cn } from '@/lib/utils'

import { FamilyShell, MiniCard, type VisualProps } from './shared/evidence-metrics-kit'
import { VisualStateController } from './shared/visual-state-control'

const releaseEvidence = [
  ['SRC', 'Change', 'What changed?'],
  ['VAL', 'Validation', 'What ran, failed, or skipped?'],
  ['SHA', 'Artifact', 'What digest was built?'],
  ['ENV', 'Deploy target', 'Where did it land?'],
  ['GATE', 'Policy gates', 'Which approval or rule passed?'],
  ['HLTH', 'Health', 'Is the release behaving?'],
  ['RBK', 'Recovery', 'How do we restore service?'],
] as const

export function EvidenceChainSlideVisual({ className }: VisualProps) {
  const [activeIndex, setActiveIndex] = useState(2)
  const active = releaseEvidence[activeIndex]

  return (
    <FamilyShell
      className={className}
      title="Release evidence chain"
      code="EVIDENCE_17"
      status="check is not enough"
      ariaLabel="Release evidence chain showing why a green check is incomplete without artifacts logs tests approvals outcomes and recovery"
      railDensity="dense"
      railContent={
        <div className="grid gap-3">
          <MiniCard
            label={active[1]}
            value="question answered"
            detail={active[2]}
            Icon={FileCheck2}
            tone="primary"
            active
          />
          <div className="rounded-md border border-chart-4/35 bg-chart-4/10 p-2 text-chart-4">
            <div className="flex items-center gap-2">
              <Check className="size-4" strokeWidth={2.2} />
              <span className="font-mono text-[9px] font-semibold uppercase tracking-normal">status only</span>
            </div>
            <p className="mt-1 text-[11px] leading-4 text-foreground">
              A green check is incomplete unless the release record can answer each node question.
            </p>
          </div>
        </div>
      }
      controls={
        <VisualStateController
          model={{
            label: 'Evidence node',
            value: active[0],
            onValueChange: (value) => {
              const nextIndex = releaseEvidence.findIndex(([code]) => code === value)
              if (nextIndex >= 0) setActiveIndex(nextIndex)
            },
            steps: releaseEvidence.map(([code, label, question]) => ({
              value: code,
              label,
              shortLabel: code,
              description: `${label} evidence answers: ${question}`,
              status: label,
            })),
          }}
        />
      }
    >
      <div className="grid h-full content-center gap-3">
        <div className="rounded-md border border-border/60 bg-card/60 p-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-7" role="list" aria-label="Evidence nodes in release order">
            {releaseEvidence.map(([code, label, question], index) => (
              <div
                key={code}
                role="group"
                className={cn(
                  'flex min-h-24 min-w-0 flex-col items-center justify-center gap-2 rounded-md border border-border bg-background/80 px-1.5 py-3 shadow-none',
                  activeIndex === index && 'border-primary/30 bg-accent/60 text-primary ring-1 ring-primary/10',
                )}
                aria-label={`${label} evidence answers: ${question}${activeIndex === index ? ' Current highlighted node.' : ''}`}
              >
                <span className="font-mono text-[9px] font-semibold uppercase tracking-normal">{code}</span>
                <span className="max-w-full truncate text-[10px] leading-3">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FamilyShell>
  )
}
