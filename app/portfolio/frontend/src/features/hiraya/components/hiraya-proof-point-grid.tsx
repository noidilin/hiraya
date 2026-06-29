import { BadgeCheck } from 'lucide-react'

import type { HirayaProofPoint } from '@/content/hirayaContent'

import { HirayaSectionFrame, HirayaSectionHeader } from './hiraya-section'

function HirayaProofPointCard({ proofPoint }: { proofPoint: HirayaProofPoint }) {
  return (
    <article className="border border-border bg-background/70 p-5 transition-colors hover:border-primary/60">
      <div className="mb-4 flex items-start justify-between gap-4">
        <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
          <BadgeCheck className="size-5" aria-hidden="true" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-normal text-muted-foreground">{proofPoint.id}</span>
      </div>
      <h3 className="text-base font-semibold tracking-normal text-foreground">{proofPoint.title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{proofPoint.summary}</p>
      {proofPoint.evidenceRefs ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {proofPoint.evidenceRefs.map((evidenceRef) => (
            <span
              key={evidenceRef}
              className="rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[10px] uppercase tracking-normal text-muted-foreground"
            >
              {evidenceRef}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  )
}

export function HirayaProofPointGrid({ proofPoints }: { proofPoints: readonly HirayaProofPoint[] }) {
  return (
    <HirayaSectionFrame>
      <HirayaSectionHeader
        eyebrow="Proof points"
        title="Claims are connected to implementation evidence"
        description="Each card frames a portfolio claim as something that can be inspected through the evidence checklist or future media previews."
      />
      <div className="grid gap-4 p-5 lg:grid-cols-3">
        {proofPoints.map((proofPoint) => (
          <HirayaProofPointCard key={proofPoint.id} proofPoint={proofPoint} />
        ))}
      </div>
    </HirayaSectionFrame>
  )
}
