import { useState } from 'react'
import { FileCheck2, ScanSearch } from 'lucide-react'

import { cn } from '@/lib/utils'

import { FamilyShell, MiniCard, type Tone, type VisualProps } from './shared/evidence-metrics-kit'
import { VisualStateController } from './shared/visual-state-control'

const securityBranches = [
  ['block', 'Block', 'Release stops until critical evidence is fixed.', 'danger'],
  ['exception', 'Exception', 'Documented review with expiry, owner, and audit record.', 'warning'],
  ['advisory', 'Advisory', 'Accepted follow-up action stays visible.', 'primary'],
  ['repeat', 'Repeated process', 'Repeated issue changes the process, not just one PR.', 'warning'],
  ['false', 'False positive', 'Reviewed and retained so teams can trust future results.', 'muted'],
] as const

export function SecurityAuditConfidenceSlideVisual({ className }: VisualProps) {
  const [activeId, setActiveId] = useState<(typeof securityBranches)[number][0]>(securityBranches[1][0])
  const active = securityBranches.find(([id]) => id === activeId) ?? securityBranches[1]

  return (
    <FamilyShell
      className={className}
      title="Security audit confidence"
      code="SEC_08"
      status="retained evidence"
      ariaLabel="Security evidence chain and taxonomy for security review audit trails and developer action"
      railContent={
        <div className="grid gap-3">
          <MiniCard label={active[1]} value="developer action" detail={`${active[2]} Evidence is searchable for audit.`} Icon={FileCheck2} tone={active[3] as Tone} active />
          <p className="text-[11px] leading-4 text-muted-foreground">
            Findings branch into block, exception, advisory, repeated-process, or false-positive states before they become
            retained audit evidence and developer action.
          </p>
        </div>
      }
      controls={
        <VisualStateController
          model={{
            label: 'Classification',
            value: activeId,
            onValueChange: setActiveId,
            steps: securityBranches.map(([id, label, detail, tone]) => ({
              value: id,
              label,
              description: `${detail} The selected classification changes the developer action and audit confidence output.`,
              status: tone,
            })),
          }}
        />
      }
    >
      <div className="grid h-full content-center gap-3 lg:grid-cols-[8rem_minmax(0,1fr)] lg:items-center">
        <MiniCard label="Finding input" value="scanner / policy" detail="A finding is classified before it affects release confidence." Icon={ScanSearch} tone="primary" active />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {securityBranches.map(([id, label, detail, tone]) => (
            <div
              key={id}
              aria-label={`${label}: ${detail}`}
              className={cn(
                'grid min-w-0 gap-1 rounded-md border border-border bg-card/75 px-2 py-2 text-center',
                activeId === id && 'border-primary/35 bg-accent/70 text-primary ring-1 ring-primary/10',
              )}
            >
              <span className="truncate text-[10px] font-semibold leading-3">{label}</span>
              <span className="font-mono text-[8px] uppercase text-muted-foreground">{tone}</span>
            </div>
          ))}
        </div>
      </div>
    </FamilyShell>
  )
}
