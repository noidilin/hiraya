import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { VisualShellEffect } from '@/features/lab/visuals/visual-shell-effect'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
  VisualShellDetailRail,
  VisualShellRail,
  getVisualShellBodyClassName,
  visualShellMainRegionClassName,
  type DetailRailToken,
  type VisualShellRailDensity,
} from './system-responsibility-kit'
import { VisualShellFooter } from './visual-state-control'

export type VisualProps = {
  className?: string
}

export type Tone = 'active' | 'muted' | 'risk' | 'hold' | 'ok'

export type Stage = {
  id: string
  code: string
  label: string
  detail: string
  Icon: LucideIcon
  tone?: Tone
}

export const toneClasses: Record<
  Tone,
  {
    node: string
    icon: string
    badge: string
    dot: string
  }
> = {
  active: {
    node: 'border-primary/35 bg-accent text-foreground ring-1 ring-primary/10',
    icon: 'border-primary/35 bg-primary text-primary-foreground',
    badge: 'border-primary/30 bg-accent text-primary',
    dot: 'bg-primary status-pulse-active',
  },
  muted: {
    node: 'border-border bg-card/82 text-foreground',
    icon: 'border-border bg-muted text-muted-foreground',
    badge: 'border-border bg-card text-muted-foreground',
    dot: 'bg-muted-foreground',
  },
  risk: {
    node: 'border-destructive/35 bg-destructive/10 text-foreground ring-1 ring-destructive/10',
    icon: 'border-destructive/35 bg-destructive text-destructive-foreground',
    badge: 'border-destructive/35 bg-destructive/10 text-destructive',
    dot: 'bg-destructive',
  },
  hold: {
    node: 'border-chart-4/35 bg-chart-4/10 text-foreground ring-1 ring-chart-4/10',
    icon: 'border-chart-4/35 bg-chart-4/15 text-chart-4',
    badge: 'border-chart-4/35 bg-chart-4/10 text-chart-4',
    dot: 'bg-chart-4',
  },
  ok: {
    node: 'border-chart-2/35 bg-chart-2/10 text-foreground ring-1 ring-chart-2/10',
    icon: 'border-chart-2/35 bg-chart-2 text-primary-foreground',
    badge: 'border-chart-2/35 bg-chart-2/10 text-chart-2',
    dot: 'bg-chart-2',
  },
}

export function LoopPipelineShell({
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
}: VisualProps & {
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
    <section
      aria-label={label}
      className={cn(
        'relative flex min-h-[190px] overflow-hidden rounded-lg border border-border/80 bg-background/45',
        'before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_38%_44%,color-mix(in_oklch,var(--primary),transparent_91%),transparent_45%)]',
        'after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border),transparent_68%)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border),transparent_72%)_1px,transparent_1px)] after:bg-[size:24px_24px] after:opacity-25',
        className,
      )}
    >
      <style>
        {`
          @keyframes family-token-drift {
            0%, 22% { offset-distance: 0%; opacity: 1; }
            48% { offset-distance: 42%; opacity: 1; }
            78%, 100% { offset-distance: 100%; opacity: 1; }
          }

          @keyframes family-dash {
            to { stroke-dashoffset: -20; }
          }

          .loop-pipeline-token {
            animation: family-token-drift 6s ease-in-out infinite;
          }

          .loop-pipeline-flow {
            stroke-dasharray: 9 8;
            animation: family-dash 1.1s linear infinite;
          }

          @keyframes nested-delivery-token {
            0%, 8% { offset-distance: 0%; opacity: 1; }
            40% { offset-distance: 34%; opacity: 1; }
            55% { offset-distance: 45%; opacity: 1; }
            76% { offset-distance: 63%; opacity: 1; }
            100% { offset-distance: 100%; opacity: 1; }
          }

          .nested-delivery-token {
            animation: nested-delivery-token 7s ease-in-out infinite;
          }

          .pipeline-connector {
            position: relative;
            height: 2px;
            min-width: 1.75rem;
            border-radius: 999px;
            background: color-mix(in oklch, var(--border), transparent 10%);
          }

          .pipeline-connector::after {
            content: "";
            position: absolute;
            right: -1px;
            top: 50%;
            width: 0;
            height: 0;
            border-bottom: 4px solid transparent;
            border-left: 6px solid color-mix(in oklch, var(--border), transparent 10%);
            border-top: 4px solid transparent;
            transform: translateY(-50%);
          }

          .pipeline-connector-active {
            background: repeating-linear-gradient(
              90deg,
              color-mix(in oklch, var(--primary), transparent 5%) 0 9px,
              transparent 9px 15px
            );
            box-shadow: 0 0 0 1px color-mix(in oklch, var(--primary), transparent 76%);
          }

          .pipeline-connector-active::after {
            border-left-color: color-mix(in oklch, var(--primary), transparent 5%);
          }

          .pipeline-mobile-segment {
            position: relative;
          }

          .pipeline-mobile-segment::after {
            content: "";
            position: absolute;
            right: -0.35rem;
            top: 50%;
            z-index: 1;
            width: 0;
            height: 0;
            border-bottom: 4px solid transparent;
            border-left: 6px solid currentColor;
            border-top: 4px solid transparent;
            transform: translateY(-50%);
          }

          @media (prefers-reduced-motion: reduce) {
            .loop-pipeline-token,
            .loop-pipeline-flow,
            .nested-delivery-token {
              animation: none;
            }
          }
        `}
      </style>
      <VisualShellEffect tone="pipeline" />
      <div className="relative z-10 flex min-h-[190px] w-full flex-1 flex-col">
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
  )
}

export function StageChip({ stage, compact = false }: { stage: Stage; compact?: boolean }) {
  const Icon = stage.Icon
  const tone = toneClasses[stage.tone ?? 'muted']

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            'min-w-0 rounded-md border text-left outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            compact ? 'px-2 py-1.5' : 'px-2.5 py-2',
            tone.node,
          )}
          aria-label={`${stage.label}: ${stage.detail}`}
        >
          <div className="flex min-w-0 items-center gap-2">
            <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-md border', tone.icon)}>
              <Icon className="size-3.5" strokeWidth={2.2} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block font-mono text-[9px] font-semibold uppercase leading-3 tracking-normal text-muted-foreground">
                {stage.code}
              </span>
              <span className="block break-words text-[11px] font-semibold leading-4 tracking-normal text-foreground">
                {stage.label}
              </span>
            </span>
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-56">
        {stage.detail}
      </TooltipContent>
    </Tooltip>
  )
}

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string; description: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex min-w-0 max-w-full items-center gap-1 overflow-x-auto rounded-md border border-border bg-card/80 p-1"
    >
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="sm"
          variant={value === option.value ? 'default' : 'ghost'}
          className="h-7 shrink-0 rounded-sm px-2 font-mono text-[9px] font-semibold uppercase tracking-normal"
          aria-pressed={value === option.value}
          aria-label={`${option.label}: ${option.description}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
