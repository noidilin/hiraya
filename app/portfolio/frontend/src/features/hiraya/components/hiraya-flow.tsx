import { Activity, Boxes, GitBranch, ShieldCheck, Terminal, Zap, type LucideIcon } from 'lucide-react'

import type { HirayaFlowStep } from '@/content/hirayaContent'

import { HirayaSectionFrame, HirayaSectionHeader } from './hiraya-section'

const flowIcons: readonly LucideIcon[] = [Terminal, Zap, GitBranch, ShieldCheck, Boxes, Activity]

function HirayaFlowStepCard({ step, index }: { step: HirayaFlowStep; index: number }) {
  const Icon = flowIcons[index % flowIcons.length]
  const stepNumber = String(index + 1).padStart(2, '0')

  return (
    <article className="relative border border-border bg-background/70 p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span className="font-mono text-xs text-muted-foreground">{stepNumber}</span>
      </div>
      <h3 className="font-semibold tracking-normal text-foreground">{step.title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.summary}</p>
      {step.evidence ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {step.evidence.map((evidence) => (
            <span
              key={evidence}
              className="rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[10px] uppercase tracking-normal text-muted-foreground"
            >
              {evidence}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  )
}

export function HirayaFlow({ steps }: { steps: readonly HirayaFlowStep[] }) {
  return (
    <HirayaSectionFrame>
      <HirayaSectionHeader
        eyebrow="Delivery flow"
        title="Reviewed change path from pull request to rollback"
        description="The SDLC route renders each control path as a separate card so validation, artifact publishing, GitOps sync, infrastructure delivery, and rollback remain visibly distinct."
      />
      <div className="grid gap-4 p-5 lg:grid-cols-5">
        {steps.map((step, index) => (
          <HirayaFlowStepCard key={step.id} step={step} index={index} />
        ))}
      </div>
    </HirayaSectionFrame>
  )
}
