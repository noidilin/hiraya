import type { LucideIcon } from 'lucide-react'
import { Check, Lock, Paperclip } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

type EvidenceState = 'complete' | 'active' | 'queued'

type EvidenceNode = {
  id: string
  label: string
  code: string
  detail: string
  state: EvidenceState
  Icon: LucideIcon
}

type EvidenceConnection = {
  id: string
  label: string
  state: 'active' | 'inactive'
}

type EvidenceChainProps = {
  className?: string
}

const evidenceNodes: EvidenceNode[] = [
  {
    id: 'sealed',
    label: 'Locked',
    code: 'SIG',
    detail: 'Signed artifact is sealed before it moves downstream.',
    state: 'complete',
    Icon: Lock,
  },
  {
    id: 'attached',
    label: 'Attached',
    code: 'ATT',
    detail: 'Build logs and test output are attached to the release candidate.',
    state: 'active',
    Icon: Paperclip,
  },
  {
    id: 'verified',
    label: 'Verify',
    code: 'VRF',
    detail: 'Reviewer confirmation is queued until the evidence bundle is checked.',
    state: 'queued',
    Icon: Check,
  },
]

const evidenceConnections: EvidenceConnection[] = [
  {
    id: 'sealed-attached',
    label: 'Flowing',
    state: 'active',
  },
  {
    id: 'attached-verified',
    label: 'Queued',
    state: 'inactive',
  },
]

const nodeStateClassNames: Record<
  EvidenceState,
  {
    node: string
    icon: string
    badge: string
    marker: string
  }
> = {
  complete: {
    node: 'border-primary/35 bg-accent text-primary ring-2 ring-primary/10',
    icon: 'border-primary/35 bg-primary text-primary-foreground',
    badge: 'border-primary/30 bg-primary text-primary-foreground',
    marker: 'bg-primary',
  },
  active: {
    node: 'border-primary/55 bg-card text-primary ring-2 ring-primary/15',
    icon: 'status-pulse-active border-primary/40 bg-primary text-primary-foreground',
    badge: 'border-primary/30 bg-accent text-primary',
    marker: 'bg-primary status-pulse-active',
  },
  queued: {
    node: 'border-border bg-muted/70 text-muted-foreground ring-1 ring-border/70',
    icon: 'border-border bg-card text-muted-foreground',
    badge: 'border-border bg-card text-muted-foreground',
    marker: 'bg-muted-foreground',
  },
}

function EvidenceNodeMarker({ node }: { node: EvidenceNode }) {
  const Icon = node.Icon
  const tone = nodeStateClassNames[node.state]

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          tabIndex={0}
          role="group"
          aria-label={`${node.label} evidence, ${node.state}`}
          className={cn(
            'flex min-w-0 flex-col items-center rounded-lg px-1.5 py-1 outline-none transition duration-150',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          )}
        >
          <div
            className={cn(
              'relative flex size-[clamp(3rem,16vw,4.25rem)] shrink-0 items-center justify-center rounded-full border backdrop-blur-md',
              'after:pointer-events-none after:absolute after:inset-1.5 after:rounded-full after:border after:border-current/20',
              node.state === 'queued' &&
                'before:pointer-events-none before:absolute before:inset-0 before:rounded-full before:bg-[repeating-linear-gradient(135deg,transparent_0_7px,color-mix(in_oklch,var(--border),transparent_18%)_7px_8px)]',
              tone.node,
            )}
          >
            <span
              aria-hidden="true"
              className={cn('relative z-10 flex size-8 items-center justify-center rounded-full border sm:size-9', tone.icon)}
            >
              <Icon className="size-4" strokeWidth={2.3} />
            </span>
            <span
              aria-hidden="true"
              className={cn(
                'absolute -right-0.5 -top-0.5 z-20 size-3 rounded-full border-2 border-card',
                tone.marker,
              )}
            />
          </div>

          <Badge
            variant="outline"
            className={cn(
              'mt-2 h-5 max-w-full rounded-full px-2 font-mono text-[10px] font-semibold uppercase tracking-normal',
              tone.badge,
            )}
          >
            {node.code}
          </Badge>
          <span className="mt-1 max-w-[4.5rem] truncate text-center text-[11px] font-medium leading-4 tracking-normal text-foreground">
            {node.label}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">{node.detail}</TooltipContent>
    </Tooltip>
  )
}

function EvidenceConnector({
  connection,
  orientation = 'horizontal',
}: {
  connection: EvidenceConnection
  orientation?: 'horizontal' | 'vertical'
}) {
  const isActive = connection.state === 'active'

  if (orientation === 'vertical') {
    return (
      <div
        aria-label={`${connection.label} evidence connection`}
        className="flex h-14 shrink-0 flex-col items-center justify-center"
      >
        <span
          aria-hidden="true"
          className={cn(
            'relative h-9 w-1 rounded-full',
            isActive ? 'animated-flow-line bg-transparent [background-size:100%_22px]' : 'bg-transparent',
          )}
        >
          {!isActive ? (
            <span className="absolute inset-y-0 left-1/2 border-l-2 border-dashed border-muted-foreground/45" />
          ) : null}
          {isActive ? (
            <span className="absolute bottom-0 left-1/2 size-2 -translate-x-1/2 rotate-[135deg] border-r-2 border-t-2 border-primary bg-background" />
          ) : (
            <span className="absolute bottom-0 left-1/2 size-2 -translate-x-1/2 rounded-full border border-muted-foreground/60 bg-card" />
          )}
        </span>
        <Badge
          variant="outline"
          className={cn(
            'mt-1 h-5 rounded-full px-2 font-mono text-[9px] font-semibold uppercase tracking-normal',
            isActive
              ? 'border-primary/30 bg-accent text-primary'
              : 'border-border bg-muted text-muted-foreground',
          )}
        >
          {connection.label}
        </Badge>
      </div>
    )
  }

  return (
    <div
      aria-label={`${connection.label} evidence connection`}
      className="flex min-w-6 flex-1 flex-col items-center pt-[clamp(1.55rem,8vw,2.15rem)]"
    >
      <span
        aria-hidden="true"
        className={cn(
          'relative h-1 w-full min-w-6 rounded-full',
          isActive ? 'animated-flow-line bg-transparent' : 'bg-transparent',
        )}
      >
        {!isActive ? (
          <span className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-muted-foreground/45" />
        ) : null}
        {isActive ? (
          <span className="absolute right-0 top-1/2 size-2 -translate-y-1/2 rotate-45 border-r-2 border-t-2 border-primary bg-background" />
        ) : (
          <span className="absolute right-0 top-1/2 size-2 -translate-y-1/2 rounded-full border border-muted-foreground/60 bg-card" />
        )}
      </span>
      <Badge
        variant="outline"
        className={cn(
          'mt-2 h-5 rounded-full px-2 font-mono text-[9px] font-semibold uppercase tracking-normal',
          isActive
            ? 'border-primary/30 bg-accent text-primary'
            : 'border-border bg-muted text-muted-foreground',
        )}
      >
        {connection.label}
      </Badge>
    </div>
  )
}

export function EvidenceChain({ className }: EvidenceChainProps) {
  return (
    <TooltipProvider>
      <div
        aria-label="Evidence chain showing signed, attached, and verified release evidence"
        className={cn(
          'relative flex min-h-[190px] items-center overflow-hidden rounded-lg border border-border/80 bg-background/45 px-3 py-4 sm:p-5',
          'before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_36%_48%,color-mix(in_oklch,var(--primary),transparent_91%),transparent_45%)]',
          'after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border),transparent_66%)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border),transparent_66%)_1px,transparent_1px)] after:bg-[size:24px_24px] after:opacity-25',
          className,
        )}
      >
        <div className="relative z-10 mx-auto flex w-full flex-col items-center justify-center sm:hidden">
          {evidenceNodes.map((node, index) => (
            <div key={node.id} className="flex flex-col items-center">
              <EvidenceNodeMarker node={node} />
              {index < evidenceConnections.length ? (
                <EvidenceConnector connection={evidenceConnections[index]} orientation="vertical" />
              ) : null}
            </div>
          ))}
        </div>

        <div className="relative z-10 mx-auto hidden w-full max-w-[29rem] items-start justify-center gap-2 sm:flex">
          {evidenceNodes.map((node, index) => (
            <div key={node.id} className="contents">
              <EvidenceNodeMarker node={node} />
              {index < evidenceConnections.length ? (
                <EvidenceConnector connection={evidenceConnections[index]} />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}
