import { CheckCircle2, Image, MonitorPlay, Network, TimerReset, type LucideIcon } from 'lucide-react'

import type { HirayaMediaSlot } from '@/content/hiraya/types'

import { HirayaSectionFrame, HirayaSectionHeader, HirayaTag } from './hiraya-section'

type MediaSlotTone = {
  label: string
  className: string
  icon: LucideIcon
}

const mediaSlotStatusTone: Record<HirayaMediaSlot['status'], MediaSlotTone> = {
  planned: {
    label: 'Planned',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    icon: TimerReset,
  },
  placeholder: {
    label: 'Placeholder',
    className: 'border-primary/30 bg-primary/10 text-primary',
    icon: Network,
  },
  ready: {
    label: 'Ready',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    icon: CheckCircle2,
  },
}

const mediaSlotTypeIcons: Record<HirayaMediaSlot['type'], LucideIcon> = {
  'intro-video': MonitorPlay,
  'screenshot-hover': Image,
  'diagram-frame': Network,
}

function HirayaMediaSlotCard({ slot }: { slot: HirayaMediaSlot }) {
  const statusTone = mediaSlotStatusTone[slot.status]
  const StatusIcon = statusTone.icon
  const TypeIcon = mediaSlotTypeIcons[slot.type]
  const isDiagramFrame = slot.type === 'diagram-frame'

  return (
    <article className="group grid min-h-56 overflow-hidden border border-border bg-background/70 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.7fr)]">
      <div className="p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-normal ${statusTone.className}`}
          >
            <StatusIcon className="size-3" aria-hidden="true" />
            {statusTone.label}
          </span>
          <HirayaTag>{slot.type.replaceAll('-', ' ')}</HirayaTag>
        </div>
        <h3 className="text-lg font-semibold tracking-normal text-foreground">{slot.title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{slot.description}</p>
        {slot.evidenceRefs ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {slot.evidenceRefs.map((evidenceRef) => (
              <span
                key={evidenceRef}
                className="rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[10px] uppercase tracking-normal text-muted-foreground"
              >
                {evidenceRef}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="relative min-h-48 border-t border-border bg-muted/25 lg:border-l lg:border-t-0">
        <div className="absolute inset-0 grid-overlay opacity-45" />
        <div className="relative z-10 flex h-full min-h-48 flex-col items-center justify-center gap-3 p-5 text-center">
          <span className="grid size-14 place-items-center rounded-full border border-primary/30 bg-primary/10 text-primary transition-transform group-hover:scale-105">
            <TypeIcon className="size-7" aria-hidden="true" />
          </span>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            {isDiagramFrame ? 'Reserved architecture frame' : 'Curated media slot'}
          </p>
          <p className="max-w-xs text-xs leading-5 text-muted-foreground">
            Assets can be attached later without changing the content contract. Missing media is intentionally not loaded.
          </p>
        </div>
      </div>
    </article>
  )
}

export function HirayaMediaSlotGrid({ slots }: { slots: readonly HirayaMediaSlot[] }) {
  return (
    <HirayaSectionFrame>
      <HirayaSectionHeader
        eyebrow="Evidence media"
        title="Planned media slots render as safe placeholders"
        description="Screenshots, diagrams, and videos are progressive enhancements. Until curated assets exist, the route shows explicit placeholders instead of broken embeds."
      />
      <div className="grid gap-4 p-5">
        {slots.map((slot) => (
          <HirayaMediaSlotCard key={slot.id} slot={slot} />
        ))}
      </div>
    </HirayaSectionFrame>
  )
}
