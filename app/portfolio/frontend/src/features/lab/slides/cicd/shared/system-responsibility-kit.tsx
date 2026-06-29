import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { VisualShellEffect } from '@/features/lab/visuals/visual-shell-effect'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { VisualShellFooter } from './visual-state-control'

export type CicdSlideVisualProps = {
  className?: string
}

export type Tone = 'primary' | 'muted' | 'risk' | 'good' | 'warn' | 'ghost'

export type DetailRailToken = {
  label: ReactNode
  tone?: Tone
}

export type VisualShellRailDensity = 'standard' | 'dense'

export const visualShellBodyClassName = 'grid min-h-0 flex-1 gap-3 p-3 sm:p-4 lg:grid-cols-[minmax(0,1fr)_260px]'
export const visualShellDenseBodyClassName = 'grid min-h-0 flex-1 gap-3 p-3 sm:p-4 lg:grid-cols-[minmax(0,1fr)_280px]'
export const visualShellMainRegionClassName = 'flex min-h-0 min-w-0 items-center justify-center'
export const visualShellMainRegionFillClassName = 'min-h-0 min-w-0'
export const visualShellRightRailClassName =
  'min-h-0 min-w-0 overflow-y-auto border-t border-border/70 pt-3 lg:w-[260px] lg:border-l lg:border-t-0 lg:pl-3 lg:pt-0'
export const visualShellDenseRightRailClassName =
  'min-h-0 min-w-0 overflow-y-auto border-t border-border/70 pt-3 lg:w-[280px] lg:border-l lg:border-t-0 lg:pl-3 lg:pt-0'

export function getVisualShellBodyClassName(density: VisualShellRailDensity = 'standard') {
  return density === 'dense' ? visualShellDenseBodyClassName : visualShellBodyClassName
}

export function getVisualShellRailClassName(density: VisualShellRailDensity = 'standard') {
  return density === 'dense' ? visualShellDenseRightRailClassName : visualShellRightRailClassName
}

export const toneClasses: Record<Tone, { panel: string; icon: string; badge: string; dot: string; text: string }> = {
  primary: {
    panel: 'border-primary/30 bg-accent text-foreground ring-1 ring-primary/10',
    icon: 'border-primary/30 bg-primary text-primary-foreground',
    badge: 'border-primary/30 bg-accent text-primary',
    dot: 'bg-primary',
    text: 'text-primary',
  },
  muted: {
    panel: 'border-border bg-card/82 text-foreground',
    icon: 'border-border bg-muted text-muted-foreground',
    badge: 'border-border bg-card text-muted-foreground',
    dot: 'bg-muted-foreground',
    text: 'text-muted-foreground',
  },
  risk: {
    panel: 'border-destructive/35 bg-destructive/10 text-foreground ring-1 ring-destructive/10',
    icon: 'border-destructive/35 bg-destructive text-destructive-foreground',
    badge: 'border-destructive/35 bg-destructive/10 text-destructive',
    dot: 'bg-destructive',
    text: 'text-destructive',
  },
  good: {
    panel: 'border-chart-2/25 bg-chart-2/10 text-foreground ring-1 ring-chart-2/10',
    icon: 'border-chart-2/30 bg-chart-2 text-primary-foreground',
    badge: 'border-chart-2/30 bg-chart-2/10 text-chart-2',
    dot: 'bg-chart-2',
    text: 'text-chart-2',
  },
  warn: {
    panel: 'border-chart-4/30 bg-chart-4/10 text-foreground ring-1 ring-chart-4/10',
    icon: 'border-chart-4/30 bg-chart-4 text-primary-foreground',
    badge: 'border-chart-4/30 bg-chart-4/10 text-chart-4',
    dot: 'bg-chart-4',
    text: 'text-chart-4',
  },
  ghost: {
    panel: 'border-dashed border-border bg-muted/35 text-muted-foreground',
    icon: 'border-border bg-card text-muted-foreground',
    badge: 'border-border bg-muted text-muted-foreground',
    dot: 'bg-border',
    text: 'text-muted-foreground',
  },
}

export function FamilyShell({
  className,
  label,
  code,
  status,
  detail,
  detailTokens,
  railContent,
  railDensity = 'standard',
  children,
  controls,
}: CicdSlideVisualProps & {
  label: string
  code: string
  status: string
  detail?: string
  detailTokens?: DetailRailToken[]
  railContent?: ReactNode
  railDensity?: VisualShellRailDensity
  children: ReactNode
  controls?: ReactNode
}) {
  return (
    <TooltipProvider>
      <section
        aria-label={label}
        className={cn(
          'relative flex min-h-[250px] overflow-hidden rounded-lg border border-border/80 bg-background/45',
          'before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_42%_34%,color-mix(in_oklch,var(--primary),transparent_91%),transparent_46%)]',
          'after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border),transparent_70%)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border),transparent_74%)_1px,transparent_1px)] after:bg-[size:24px_24px] after:opacity-25',
          className,
        )}
      >
        <style>
          {`
            @keyframes family-three-dash { to { stroke-dashoffset: -22; } }
            .family-three-flow {
              stroke-dasharray: 10 8;
              animation: family-three-dash 1.1s linear infinite;
            }
            @media (prefers-reduced-motion: reduce) {
              .family-three-flow {
                animation: none;
                stroke-dasharray: 6 8;
              }
            }
          `}
        </style>
        <VisualShellEffect tone="system" />
        <div className="relative z-10 flex min-h-[250px] w-full flex-1 flex-col">
          <div className={getVisualShellBodyClassName(railDensity)}>
            <div className={visualShellMainRegionClassName}>{children}</div>
            {railContent ? (
              <VisualShellRail title={label} density={railDensity}>
                {railContent}
              </VisualShellRail>
            ) : (
              <VisualShellDetailRail
                title={label}
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
    </TooltipProvider>
  )
}

export function VisualShellDetailRail({
  title,
  code,
  status,
  detail,
  tokens,
  density = 'standard',
}: {
  title: string
  code: string
  status: string
  detail?: string
  tokens?: DetailRailToken[]
  density?: VisualShellRailDensity
}) {
  const fallbackTokens: DetailRailToken[] = [
    { label: code, tone: 'primary' },
    { label: status, tone: 'good' },
    { label: title, tone: 'muted' },
  ]
  const visibleTokens = (tokens?.length ? tokens : fallbackTokens).slice(0, 5)

  return (
    <VisualShellRail title={title} density={density}>
      <div className="grid min-w-0 content-start gap-3">
        <Badge
          variant="outline"
          className="h-auto w-fit max-w-full whitespace-normal rounded-sm border-primary/25 bg-accent px-2 py-0.5 font-mono text-[8px] font-semibold uppercase leading-3 tracking-normal text-primary"
        >
          {status}
        </Badge>
        <div className="min-w-0">
          <p className="font-mono text-[9px] font-semibold uppercase leading-3 tracking-normal text-muted-foreground">{code}</p>
          <p className="mt-1 text-sm font-semibold leading-5 text-foreground">{title}</p>
        </div>
        <p className="text-[11px] leading-4 text-muted-foreground">
          {detail ?? `${title} is showing the current visual state: ${status}.`}
        </p>
        <div className="flex min-w-0 flex-wrap gap-1.5" aria-label={`${title} status tokens`}>
          {visibleTokens.map((token, index) => (
            <StatusPill key={index} tone={token.tone ?? 'muted'}>
              {token.label}
            </StatusPill>
          ))}
        </div>
      </div>
    </VisualShellRail>
  )
}

export function VisualShellRail({
  title,
  density = 'standard',
  children,
  className,
}: {
  title: string
  density?: VisualShellRailDensity
  children: ReactNode
  className?: string
}) {
  return (
    <aside aria-label={`${title} detail rail`} className={cn(getVisualShellRailClassName(density), className)}>
      {children}
    </aside>
  )
}

export function IconCard({
  label,
  eyebrow,
  detail,
  Icon,
  tone = 'muted',
  selected,
  onClick,
  className,
}: {
  label: string
  eyebrow: string
  detail: string
  Icon: LucideIcon
  tone?: Tone
  selected?: boolean
  onClick?: () => void
  className?: string
}) {
  const content = (
    <>
      <span aria-hidden="true" className={cn('flex size-8 shrink-0 items-center justify-center rounded-md border', toneClasses[tone].icon)}>
        <Icon className="size-4" strokeWidth={2.2} />
      </span>
      <span className="min-w-0 text-left">
        <span className="block truncate font-mono text-[8px] font-semibold uppercase leading-3 tracking-normal text-muted-foreground">
          {eyebrow}
        </span>
        <span className="block truncate text-[12px] font-semibold leading-4 tracking-normal">{label}</span>
      </span>
    </>
  )

  const classes = cn(
    'flex min-w-0 items-center gap-2 rounded-md border px-2 py-2 outline-none transition-colors motion-reduce:transition-none',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    toneClasses[tone].panel,
    selected && 'ring-2 ring-primary/25',
    className,
  )

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {onClick ? (
          <button type="button" onClick={onClick} className={classes} aria-pressed={selected}>
            {content}
          </button>
        ) : (
          <div tabIndex={0} role="group" aria-label={`${label}: ${detail}`} className={classes}>
            {content}
          </div>
        )}
      </TooltipTrigger>
      <TooltipContent>{detail}</TooltipContent>
    </Tooltip>
  )
}

export function StatusPill({ children, tone = 'muted' }: { children: ReactNode; tone?: Tone }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'h-5 max-w-full min-w-0 rounded-sm px-2 font-mono text-[8px] font-semibold uppercase tracking-normal',
        toneClasses[tone].badge,
      )}
    >
      <span className="min-w-0 truncate">{children}</span>
    </Badge>
  )
}
