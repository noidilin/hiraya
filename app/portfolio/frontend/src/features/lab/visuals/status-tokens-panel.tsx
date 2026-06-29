import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { StatusToken, type LabStatus } from '@/features/lab/components/status-token'
import { cn } from '@/lib/utils'
import { VisualShellEffect } from './visual-shell-effect'

type StatusTokenItem = {
  status: LabStatus
  label: string
  detail: string
}

type StatusTokensPanelProps = {
  className?: string
}

const statusTokens: StatusTokenItem[] = [
  {
    status: 'passed',
    label: 'Passed',
    detail: 'Checks completed with a clean report',
  },
  {
    status: 'failed',
    label: 'Failed',
    detail: 'Gate is blocked until the error is resolved',
  },
  {
    status: 'rollback',
    label: 'Rollback Ready',
    detail: 'Previous release is staged for recovery',
  },
  {
    status: 'progress',
    label: 'In Progress',
    detail: 'Runner is still streaming pipeline output',
  },
]

export function StatusTokensPanel({ className }: StatusTokensPanelProps) {
  return (
    <TooltipProvider>
      <div
        aria-label="Status token examples"
        className={cn(
          'relative flex min-h-[190px] items-center overflow-hidden rounded-lg border border-border/80 bg-background/45 p-4 sm:p-5',
          'before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_50%,color-mix(in_oklch,var(--primary),transparent_93%),transparent_48%)]',
          className,
        )}
      >
        <VisualShellEffect tone="metrics" />
        <ul className="relative z-10 flex w-full flex-wrap items-center justify-center gap-2.5">
          {statusTokens.map((item) => (
            <li key={item.status}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="rounded-full transition-transform duration-150 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transform-none"
                  >
                    <StatusToken status={item.status} label={item.label} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">{item.detail}</TooltipContent>
              </Tooltip>
            </li>
          ))}
        </ul>
      </div>
    </TooltipProvider>
  )
}
