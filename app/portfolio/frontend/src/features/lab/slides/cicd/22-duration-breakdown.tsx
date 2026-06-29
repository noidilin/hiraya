import { useState } from 'react'
import { Clock3, ScanSearch, TimerReset } from 'lucide-react'

import { cn } from '@/lib/utils'

import { FamilyShell, MiniCard, type VisualProps } from './shared/evidence-metrics-kit'

const durationSegments = [
  { id: 'queue', label: 'Queue', value: 7, cause: 'runner contention', lever: 'right-size capacity' },
  { id: 'setup', label: 'Setup', value: 5, cause: 'cold toolchain', lever: 'pinned image' },
  { id: 'execution', label: 'Execution', value: 18, cause: 'slow suite', lever: 'targeted split' },
  { id: 'transfer', label: 'Transfer', value: 6, cause: 'large artifact', lever: 'cache correctly' },
  { id: 'deploy', label: 'Deploy wait', value: 28, cause: 'approval queue', lever: 'policy automation' },
  { id: 'verify', label: 'Verify', value: 9, cause: 'manual checks', lever: 'smoke signal' },
] as const

export function DurationBreakdownSlideVisual({ className }: VisualProps) {
  const [activeId, setActiveId] = useState<(typeof durationSegments)[number]['id']>(durationSegments[4].id)
  const active = durationSegments.find((segment) => segment.id === activeId) ?? durationSegments[4]
  const total = durationSegments.reduce((sum, segment) => sum + segment.value, 0)

  return (
    <FamilyShell
      className={className}
      title="Feedback time breakdown"
      code="TIME_05"
      status={`${total}m total`}
      ariaLabel="Duration timeline separating feedback waiting and bottlenecks with root cause and improvement hints"
      railContent={
        <div className="grid gap-2">
          <MiniCard label={active.label} value={`${active.value}m`} detail="Total duration is only the clue." Icon={Clock3} tone="primary" active />
          <MiniCard label="Likely root cause" value={active.cause} detail="Read the segment before choosing a fix." Icon={ScanSearch} tone="warning" active />
          <MiniCard label="Improvement lever" value={active.lever} detail="Optimize the bottleneck, not the average." Icon={TimerReset} tone="success" active />
        </div>
      }
    >
      <div className="grid h-full content-center gap-4">
        <div className="flex h-16 overflow-hidden rounded-md border border-border bg-border" aria-label="Segmented duration bar">
          {durationSegments.map((segment) => (
            <button
              key={segment.id}
              type="button"
              onClick={() => setActiveId(segment.id)}
              onFocus={() => setActiveId(segment.id)}
              style={{ width: `${(segment.value / total) * 100}%` }}
              className={cn(
                'min-w-[2.25rem] border-r border-border px-1 text-center font-mono text-[9px] font-semibold uppercase tracking-normal outline-none transition-colors motion-reduce:transition-none',
                segment.id === activeId ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted',
                segment.id === 'deploy' && segment.id !== activeId && 'bg-destructive/10 text-destructive',
              )}
              aria-pressed={segment.id === activeId}
              aria-label={`${segment.label}: ${segment.value} minutes, likely cause ${segment.cause}, improvement ${segment.lever}`}
            >
              {segment.value}m
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-1 text-center font-mono text-[8px] font-semibold uppercase leading-3 tracking-normal text-muted-foreground sm:grid-cols-6">
          {durationSegments.map((segment) => (
            <span key={segment.id} className={cn('truncate', segment.id === activeId && 'text-primary')}>
              {segment.label}
            </span>
          ))}
        </div>
      </div>
    </FamilyShell>
  )
}
