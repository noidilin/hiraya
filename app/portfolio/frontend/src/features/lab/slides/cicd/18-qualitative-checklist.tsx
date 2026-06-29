import { useState } from 'react'
import { Activity, Boxes, Eye, GitBranch, RotateCcw, ShieldCheck } from 'lucide-react'

import { cn } from '@/lib/utils'

import { FamilyShell, MiniCard, type Tone, type VisualProps } from './shared/evidence-metrics-kit'

const checklistGroups = [
  {
    id: 'architecture',
    label: 'Architecture',
    status: 'strong',
    question: 'Does validation follow service boundaries and dependency risk?',
    Icon: Boxes,
  },
  {
    id: 'visibility',
    label: 'Platform visibility',
    status: 'weak',
    question: 'Can teams see queues, failures, owners, and runtime signals?',
    Icon: Eye,
  },
  {
    id: 'infrastructure',
    label: 'Infrastructure repeatability',
    status: 'strong',
    question: 'Can environments be rebuilt from reviewed plans and evidence?',
    Icon: GitBranch,
  },
  {
    id: 'boundaries',
    label: 'Permission boundaries',
    status: 'weak',
    question: 'Are powerful actions scoped, auditable, and environment-protected?',
    Icon: ShieldCheck,
  },
  {
    id: 'optimization',
    label: 'Optimization quality',
    status: 'unknown',
    question: 'Did speed preserve traceability and trustworthy feedback?',
    Icon: Activity,
  },
  {
    id: 'release',
    label: 'Release operations',
    status: 'weak',
    question: 'Does acceptance include health, rollback, and learning?',
    Icon: RotateCcw,
  },
] as const

const statusTone: Record<(typeof checklistGroups)[number]['status'], Tone> = {
  strong: 'success',
  weak: 'warning',
  unknown: 'muted',
}

type QualitativeChecklistSlideVisualProps = VisualProps

export function QualitativeChecklistSlideVisual({ className }: QualitativeChecklistSlideVisualProps) {
  const [activeId, setActiveId] = useState<(typeof checklistGroups)[number]['id']>('boundaries')
  const active = checklistGroups.find((group) => group.id === activeId) ?? checklistGroups[3]
  const strongCount = checklistGroups.filter((group) => group.status === 'strong').length

  return (
    <FamilyShell
      className={className}
      title="Qualitative evaluation checklist"
      code="QUAL_18"
      status={`${strongCount}/6 strong`}
      ariaLabel="Grouped qualitative evaluation checklist for lifecycle fit visibility repeatability boundaries optimization and release operations"
      railContent={
        <div className="grid gap-3">
          <MiniCard
            label={active.label}
            value={active.status}
            detail={active.question}
            Icon={active.Icon}
            tone={statusTone[active.status]}
            active
          />
          <p className="text-[11px] leading-4 text-muted-foreground">
            Qualitative evaluation asks whether the pipeline changes team behavior: trust, lifecycle fit, repeatability,
            boundaries, optimization quality, and release operations.
          </p>
        </div>
      }
    >
      <div className="grid h-full content-center gap-3">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Qualitative evaluation groups">
          {checklistGroups.map((group) => {
            const Icon = group.Icon
            const selected = activeId === group.id
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => setActiveId(group.id)}
                onFocus={() => setActiveId(group.id)}
                className={cn(
                  'min-h-32 rounded-md border border-border bg-card/75 p-3 text-left outline-none transition-colors motion-reduce:transition-none',
                  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  selected && 'border-primary/35 bg-accent/65 text-primary ring-1 ring-primary/10',
                )}
                aria-pressed={selected}
                aria-label={`${group.label}: ${group.status}. ${group.question}`}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-md border', selected ? 'border-primary/30 bg-primary text-primary-foreground' : 'border-border bg-muted text-muted-foreground')}>
                    <Icon className="size-4" strokeWidth={2.2} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold leading-4 text-foreground">{group.label}</span>
                    <span className="block font-mono text-[8px] font-semibold uppercase leading-3 tracking-normal text-muted-foreground">
                      {group.status}
                    </span>
                  </span>
                </div>
                <p className="mt-3 text-[11px] leading-4 text-muted-foreground">{group.question}</p>
              </button>
            )
          })}
        </div>
      </div>
    </FamilyShell>
  )
}
