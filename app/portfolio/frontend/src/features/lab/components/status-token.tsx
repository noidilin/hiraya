import type { LucideIcon } from 'lucide-react'
import { Check, Circle, RefreshCw, RotateCcw, X } from 'lucide-react'

import { AnimatedBadge, type AnimatedBadgeStatus } from '@/components/motion/animated-badge'
import { cn } from '@/lib/utils'

type KnownLabStatus = 'passed' | 'failed' | 'rollback' | 'progress' | 'idle'

export type LabStatus = KnownLabStatus | (string & {})
export type StatusTokenTone = 'success' | 'error' | 'active' | 'idle'

type StatusTokenProps = {
  status?: LabStatus
  label: string
  tone?: StatusTokenTone
  icon?: LucideIcon
  pulse?: boolean
  spin?: boolean
  ariaLabel?: string
  className?: string
}

const toneConfig: Record<
  StatusTokenTone,
  {
    status: AnimatedBadgeStatus
    className: string
  }
> = {
  success: {
    status: 'success',
    className: 'border-chart-2/30 bg-chart-2/10 text-chart-2',
  },
  error: {
    status: 'danger',
    className: 'border-destructive/30 bg-destructive/10 text-destructive',
  },
  active: {
    status: 'loading',
    className: 'border-primary/30 bg-accent text-primary',
  },
  idle: {
    status: 'neutral',
    className: 'border-border bg-muted text-muted-foreground',
  },
}

const statusDefaults: Record<
  KnownLabStatus,
  {
    tone: StatusTokenTone
    Icon: LucideIcon
    pulse?: boolean
    spin?: boolean
  }
> = {
  passed: {
    tone: 'success',
    Icon: Check,
  },
  failed: {
    tone: 'error',
    Icon: X,
  },
  rollback: {
    tone: 'idle',
    Icon: RotateCcw,
  },
  progress: {
    tone: 'active',
    Icon: RefreshCw,
    pulse: true,
    spin: true,
  },
  idle: {
    tone: 'idle',
    Icon: Circle,
  },
}

function getKnownStatus(status?: LabStatus): KnownLabStatus | undefined {
  if (!status) return undefined
  return status in statusDefaults ? (status as KnownLabStatus) : undefined
}

export function StatusToken({
  status,
  label,
  tone,
  icon,
  pulse,
  spin,
  ariaLabel,
  className,
}: StatusTokenProps) {
  const knownStatus = getKnownStatus(status)
  const defaults = knownStatus ? statusDefaults[knownStatus] : undefined
  const resolvedTone = tone ?? defaults?.tone ?? 'idle'
  const Icon = icon ?? defaults?.Icon ?? Circle
  const shouldPulse = pulse ?? defaults?.pulse ?? false
  const shouldSpin = spin ?? defaults?.spin ?? false
  const config = toneConfig[resolvedTone]
  const badgeStatus = shouldSpin ? 'loading' : config.status

  return (
    <AnimatedBadge
      aria-label={ariaLabel ?? `${label} status`}
      status={badgeStatus}
      size="sm"
      icon={<Icon aria-hidden="true" className={cn('size-3.5 shrink-0', shouldSpin && 'status-spin-active')} />}
      pulse={shouldPulse}
      contentKey={`${badgeStatus}-${label}`}
      className={cn(
        'min-h-6 gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        config.className,
        className,
      )}
    >
      {label}
    </AnimatedBadge>
  )
}
