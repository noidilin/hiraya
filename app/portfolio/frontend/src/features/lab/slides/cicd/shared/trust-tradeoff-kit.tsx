import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

import { VisualShellEffect } from '@/features/lab/visuals/visual-shell-effect'
import { cn } from '@/lib/utils'
import {
  VisualShellDetailRail,
  VisualShellRail,
  getVisualShellBodyClassName,
  visualShellMainRegionFillClassName,
  type DetailRailToken,
  type VisualShellRailDensity,
} from './system-responsibility-kit'
import { VisualShellFooter } from './visual-state-control'

export type VisualProps = {
  className?: string
}

export type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'muted'

export const toneClasses: Record<Tone, { border: string; bg: string; text: string; icon: string; dot: string }> = {
  primary: {
    border: 'border-primary/35',
    bg: 'bg-accent',
    text: 'text-primary',
    icon: 'border-primary/30 bg-primary text-primary-foreground',
    dot: 'bg-primary',
  },
  success: {
    border: 'border-chart-2/35',
    bg: 'bg-chart-2/10',
    text: 'text-chart-2',
    icon: 'border-chart-2/35 bg-chart-2 text-primary-foreground',
    dot: 'bg-chart-2',
  },
  warning: {
    border: 'border-chart-4/35',
    bg: 'bg-chart-4/10',
    text: 'text-chart-4',
    icon: 'border-chart-4/35 bg-chart-4 text-primary-foreground',
    dot: 'bg-chart-4',
  },
  danger: {
    border: 'border-destructive/35',
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    icon: 'border-destructive/35 bg-destructive text-destructive-foreground',
    dot: 'bg-destructive',
  },
  muted: {
    border: 'border-border',
    bg: 'bg-card/82',
    text: 'text-muted-foreground',
    icon: 'border-border bg-muted text-muted-foreground',
    dot: 'bg-muted-foreground/60',
  },
}

export function TrustTradeoffShell({
  className,
  title,
  code,
  status,
  ariaLabel,
  detail,
  detailTokens,
  railContent,
  railDensity = 'standard',
  children,
  controls,
}: VisualProps & {
  title: string
  code: string
  status: string
  ariaLabel: string
  detail?: string
  detailTokens?: DetailRailToken[]
  railContent?: ReactNode
  railDensity?: VisualShellRailDensity
  children: ReactNode
  controls?: ReactNode
}) {
  return (
    <section
      aria-label={ariaLabel}
      className={cn(
        'relative flex min-h-[190px] overflow-hidden rounded-lg border border-border/80 bg-background/45',
        'before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_44%_28%,color-mix(in_oklch,var(--primary),transparent_92%),transparent_52%)]',
        'after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border),transparent_68%)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border),transparent_72%)_1px,transparent_1px)] after:bg-[size:24px_24px] after:opacity-25',
        className,
      )}
    >
      <VisualShellEffect tone="tradeoff" />
      <div className="relative z-10 flex min-h-[190px] w-full flex-1 flex-col">
        <div className={getVisualShellBodyClassName(railDensity)}>
          <div className={visualShellMainRegionFillClassName}>{children}</div>
          {railContent ? (
            <VisualShellRail title={title} density={railDensity}>
              {railContent}
            </VisualShellRail>
          ) : (
            <VisualShellDetailRail
              title={title}
              code={code}
              status={status}
              detail={detail}
              tokens={detailTokens}
              density={railDensity}
            />
          )}
        </div>
        {controls ? <VisualShellFooter>{controls}</VisualShellFooter> : null}
      </div>
    </section>
  )
}

export function IconBadge({ Icon, tone = 'primary' }: { Icon: LucideIcon; tone?: Tone }) {
  return (
    <span
      aria-hidden="true"
      className={cn('flex size-8 shrink-0 items-center justify-center rounded-md border', toneClasses[tone].icon)}
    >
      <Icon className="size-4" strokeWidth={2.2} />
    </span>
  )
}

export function StatusBadge({ tone, children }: { tone: Tone; children: ReactNode }) {
  const classes = toneClasses[tone]

  return (
    <span
      className={cn(
        'inline-flex h-5 max-w-full items-center gap-1 rounded-sm border px-1.5 font-mono text-[8px] font-semibold uppercase leading-4 tracking-normal',
        classes.border,
        classes.bg,
        classes.text,
      )}
    >
      <span aria-hidden="true" className={cn('size-1.5 shrink-0 rounded-full', classes.dot)} />
      <span className="truncate">{children}</span>
    </span>
  )
}
