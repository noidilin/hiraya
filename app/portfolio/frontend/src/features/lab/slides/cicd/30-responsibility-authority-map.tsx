import { Bot, Code2, GitCommitHorizontal, LockKeyhole, Server, User } from 'lucide-react'

import { cn } from '@/lib/utils'

import { FamilyShell, toneClasses, type CicdSlideVisualProps, type Tone } from './shared/system-responsibility-kit'

const authorityLanes = [
  { id: 'ai', label: 'AI assistant', Icon: Bot, actions: [['summarize evidence', 'advisory'], ['draft workflow', 'proposal']] },
  { id: 'dev', label: 'Developer', Icon: Code2, actions: [['open change', 'proposal'], ['trigger safe rerun', 'automation']] },
  { id: 'reviewer', label: 'Reviewer', Icon: User, actions: [['review diff', 'approval-required'], ['accept scope', 'approval-required']] },
  { id: 'platform', label: 'Platform', Icon: Server, actions: [['runner identity', 'automation'], ['apply infra', 'approval-required']] },
  { id: 'security', label: 'Security', Icon: LockKeyhole, actions: [['secret boundary', 'approval-required'], ['policy exception', 'approval-required']] },
  { id: 'release', label: 'Release owner', Icon: GitCommitHorizontal, actions: [['production gate', 'approval-required'], ['rollback call', 'approval-required']] },
] as const

const authorityTone: Record<string, Tone> = {
  advisory: 'ghost',
  proposal: 'primary',
  automation: 'good',
  'approval-required': 'warn',
}

export function ResponsibilityAuthorityMapSlideVisual(props: CicdSlideVisualProps) {
  return (
    <FamilyShell
      className={props.className}
      label="Responsibility and authority map"
      code="AUTH_30"
      status="approval boundaries"
      railDensity="dense"
      railContent={
        <div className="grid gap-3">
          <div>
            <p className="font-mono text-[9px] font-semibold uppercase leading-3 tracking-normal text-muted-foreground">
              authority note
            </p>
            <p className="mt-1 text-sm font-semibold leading-5 text-foreground">AI can assist, but named owners keep accountability.</p>
            <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
              Advisory and proposal work can be delegated. Production access, protected-environment approval, exception
              review, and rollback calls remain explicit owner decisions.
            </p>
          </div>
          <div className="grid gap-1.5" aria-label="Authority state legend">
            {Object.entries(authorityTone).map(([authority, tone]) => (
              <span key={authority} className={cn('rounded-md border px-2 py-1.5 font-mono text-[8px] font-bold uppercase', toneClasses[tone].panel)}>
                {authority}
              </span>
            ))}
          </div>
        </div>
      }
    >
      <div className="grid h-full w-full gap-2 md:grid-cols-2 xl:grid-cols-3">
        {authorityLanes.map((lane) => {
          const Icon = lane.Icon
          return (
            <section key={lane.id} aria-label={`${lane.label} lane`} className="rounded-md border border-border bg-card/80 p-2">
              <div className="mb-2 flex items-center gap-2">
                <span className={cn('flex size-7 items-center justify-center rounded-md border', lane.id === 'ai' ? toneClasses.ghost.icon : toneClasses.muted.icon)}>
                  <Icon className="size-3.5" strokeWidth={2.2} />
                </span>
                <h3 className="truncate text-xs font-semibold leading-4">{lane.label}</h3>
              </div>
              <div className="grid gap-1.5">
                {lane.actions.map(([action, authority]) => (
                  <div
                    key={action}
                    className={cn(
                      'rounded-md border px-2 py-1.5 text-left',
                      toneClasses[authorityTone[authority]].panel,
                    )}
                  >
                    <span className="block truncate text-[11px] font-semibold leading-4">{action}</span>
                    <span className="mt-0.5 block truncate font-mono text-[8px] font-bold uppercase text-muted-foreground">{authority}</span>
                  </div>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </FamilyShell>
  )
}
