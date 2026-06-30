import { CheckCircle2, Image, MonitorPlay, Network, TimerReset, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { HirayaMediaSlot } from '@/content/hiraya/types'

import { HirayaSectionFrame, HirayaSectionHeader, HirayaTag } from './hiraya-section'

type MediaSlotTone = {
  className: string
  icon: LucideIcon
}

const mediaSlotStatusTone: Record<HirayaMediaSlot['status'], MediaSlotTone> = {
  planned: {
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    icon: TimerReset,
  },
  placeholder: {
    className: 'border-primary/30 bg-primary/10 text-primary',
    icon: Network,
  },
  ready: {
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    icon: CheckCircle2,
  },
}

const mediaSlotTypeLabels: Record<HirayaMediaSlot['type'], string> = {
  'intro-video': 'hiraya.mediaSlots.type.introVideo',
  'screenshot-hover': 'hiraya.mediaSlots.type.screenshotHover',
  'diagram-frame': 'hiraya.mediaSlots.type.diagramFrame',
}

const mediaSlotTypeIcons: Record<HirayaMediaSlot['type'], LucideIcon> = {
  'intro-video': MonitorPlay,
  'screenshot-hover': Image,
  'diagram-frame': Network,
}

function HirayaMediaSlotCard({ slot }: { slot: HirayaMediaSlot }) {
  const { t } = useTranslation()
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
            {t(`hiraya.mediaSlots.status.${slot.status}`)}
          </span>
          <HirayaTag>{t(mediaSlotTypeLabels[slot.type])}</HirayaTag>
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
            {isDiagramFrame ? t('hiraya.mediaSlots.reservedArchitectureFrame') : t('hiraya.mediaSlots.curatedMediaSlot')}
          </p>
          <p className="max-w-xs text-xs leading-5 text-muted-foreground">
            {t('hiraya.mediaSlots.missingMediaDescription')}
          </p>
        </div>
      </div>
    </article>
  )
}

export function HirayaMediaSlotGrid({ slots }: { slots: readonly HirayaMediaSlot[] }) {
  const { t } = useTranslation()

  return (
    <HirayaSectionFrame>
      <HirayaSectionHeader
        eyebrow={t('hiraya.mediaSlots.eyebrow')}
        title={t('hiraya.mediaSlots.title')}
        description={t('hiraya.mediaSlots.description')}
      />
      <div className="grid gap-4 p-5">
        {slots.map((slot) => (
          <HirayaMediaSlotCard key={slot.id} slot={slot} />
        ))}
      </div>
    </HirayaSectionFrame>
  )
}
