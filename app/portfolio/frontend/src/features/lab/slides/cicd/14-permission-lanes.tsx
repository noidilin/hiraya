import { useState } from 'react'

import { cn } from '@/lib/utils'

import { FamilyShell, type CicdSlideVisualProps } from './shared/system-responsibility-kit'
import { VisualStateController } from './shared/visual-state-control'

const permissionStages = ['Validate', 'Build', 'Infra plan', 'Infra apply', 'App deploy', 'Verify'] as const
const permissionCapabilities = ['Read code', 'Publish artifact', 'Plan infra', 'Apply infra', 'Deploy app', 'Access secrets', 'Write production'] as const
const leastPrivilegeAllows: Record<string, string[]> = {
  'Read code': ['Validate', 'Build', 'Infra plan'],
  'Publish artifact': ['Build'],
  'Plan infra': ['Infra plan'],
  'Apply infra': ['Infra apply'],
  'Deploy app': ['App deploy'],
  'Access secrets': ['App deploy', 'Verify'],
  'Write production': ['Infra apply', 'App deploy'],
}

export function PermissionLanesSlideVisual(props: CicdSlideVisualProps) {
  const [mode, setMode] = useState<'unsafe' | 'least'>('least')

  return (
    <FamilyShell
      className={props.className}
      label="Least privilege permission lanes"
      code="PERMS_14"
      status={mode === 'least' ? 'least privilege' : 'over-broad credential'}
      railDensity="dense"
      railContent={
        <div className="grid gap-3">
          <div>
            <p className="font-mono text-[9px] font-semibold uppercase leading-3 tracking-normal text-muted-foreground">
              row and column reading
            </p>
            <p className="mt-1 text-sm font-semibold leading-5 text-foreground">
              {mode === 'least' ? 'Each job identity holds only stage-local power.' : 'One broad credential leaks powerful actions across stages.'}
            </p>
            <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
              Read rows as capabilities and columns as pipeline stages. Powerful cells need explicit environment protection,
              short-lived identity, and audit evidence.
            </p>
          </div>
          <div className="grid gap-1.5 text-[11px] leading-4 text-muted-foreground" aria-label="Permission state legend">
            <span><strong className="text-primary">Allowed</strong> means the stage needs the capability.</span>
            <span><strong className="text-muted-foreground">Blocked</strong> means the identity should not hold it.</span>
            <span><strong className="text-destructive">Unsafe</strong> means over-permission expands blast radius.</span>
          </div>
        </div>
      }
      controls={
        <VisualStateController
          model={{
            label: 'Permission model',
            value: mode,
            onValueChange: setMode,
            steps: [
              {
                value: 'least',
                label: 'Least privilege',
                description: 'Only the capabilities required by each stage are allowed in the matrix.',
                status: 'least privilege',
              },
              {
                value: 'unsafe',
                label: 'Over-broad',
                description: 'Powerful capabilities become available across stages, exposing credential risk.',
                status: 'over-broad credential',
              },
            ],
          }}
        />
      }
    >
      <div className="grid h-full w-full content-center gap-3">
        <div className="overflow-hidden rounded-md border border-border bg-card/80">
          <table className="w-full table-fixed border-collapse text-center">
            <colgroup>
              <col className="w-[21%]" />
              {permissionStages.map((stage) => (
                <col key={stage} />
              ))}
            </colgroup>
            <caption className="sr-only">Stage by capability permission matrix</caption>
            <thead>
              <tr className="bg-muted/60">
                <th className="border-b border-r border-border px-2 py-2 text-left text-[9px] uppercase">capability</th>
                {permissionStages.map((stage) => (
                  <th key={stage} className="border-b border-r border-border px-1 py-2 font-mono text-[7px] uppercase last:border-r-0">{stage}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissionCapabilities.map((capability) => (
                <tr key={capability}>
                  <th className="border-b border-r border-border px-2 py-2 text-left text-[11px] font-medium">{capability}</th>
                  {permissionStages.map((stage) => {
                    const allowed = leastPrivilegeAllows[capability]?.includes(stage)
                    const dangerous =
                      capability === 'Access secrets' ||
                      capability === 'Write production' ||
                      capability === 'Apply infra'
                    const state =
                      mode === 'unsafe' && dangerous && !allowed
                        ? 'unsafe'
                        : allowed
                          ? 'allowed'
                          : 'blocked'
                    return (
                      <td key={`${capability}-${stage}`} className="border-b border-r border-border px-1 py-2 last:border-r-0">
                        <span
                          aria-label={`${capability} during ${stage}: ${state}`}
                          className={cn(
                            'mx-auto flex min-h-6 w-full min-w-0 max-w-20 items-center justify-center rounded-sm border px-1 font-mono text-[7px] font-bold uppercase',
                            state === 'allowed' && 'border-primary/30 bg-accent text-primary',
                            state === 'blocked' && 'border-border bg-muted/50 text-muted-foreground',
                            state === 'unsafe' && 'border-destructive/40 bg-destructive/10 text-destructive',
                          )}
                        >
                          {state}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </FamilyShell>
  )
}
