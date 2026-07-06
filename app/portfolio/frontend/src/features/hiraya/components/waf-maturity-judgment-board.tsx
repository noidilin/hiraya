import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Hammer } from 'lucide-react'

import type {
  WafMaturityItem,
  WafMaturityJudgmentContent,
  WafMaturityPillar,
  WafMaturityState,
} from '@/content/hiraya/wafMaturityJudgment'
import { cn } from '@/lib/utils'

import { HirayaSectionFrame, HirayaSectionHeader, HirayaTag } from './hiraya-section'

const maturityStateCopy: Record<
  WafMaturityState,
  {
    icon: typeof CheckCircle2
    className: string
    iconClassName: string
  }
> = {
  'strong-now': {
    icon: CheckCircle2,
    className: 'border-emerald-500/25 bg-emerald-500/10',
    iconClassName: 'text-emerald-500',
  },
  'dev-tradeoff': {
    icon: AlertTriangle,
    className: 'border-amber-500/30 bg-amber-500/10',
    iconClassName: 'text-amber-500',
  },
  'harden-next': {
    icon: Hammer,
    className: 'border-primary/30 bg-primary/10',
    iconClassName: 'text-primary',
  },
}

const pillarItemAccessors: Record<WafMaturityState, keyof Pick<WafMaturityPillar, 'strongNow' | 'devTradeoffs' | 'hardenNext'>> = {
  'strong-now': 'strongNow',
  'dev-tradeoff': 'devTradeoffs',
  'harden-next': 'hardenNext',
}

const maturityStates = ['strong-now', 'dev-tradeoff', 'harden-next'] as const satisfies readonly WafMaturityState[]

function EvidenceRefs({ refs }: { refs: readonly string[] }) {
  if (refs.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-1.5" aria-label="Related evidence references">
      {refs.map((ref) => (
        <span
          key={ref}
          className="w-fit border border-primary/25 bg-primary/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-normal text-primary"
        >
          {ref}
        </span>
      ))}
    </div>
  )
}

function MaturityItemCard({ item, compact = false }: { item: WafMaturityItem; compact?: boolean }) {
  return (
    <article className="border-l border-border pl-3">
      <h4 className={cn('font-semibold tracking-normal text-foreground', compact ? 'text-xs leading-5' : 'text-sm leading-5')}>
        {item.title}
      </h4>
      <p className={cn('mt-1 text-muted-foreground', compact ? 'text-xs leading-5' : 'text-sm leading-6')}>{item.summary}</p>
    </article>
  )
}

function PillarSwitcherButton({
  pillar,
  index,
  selected,
  onSelect,
}: {
  pillar: WafMaturityPillar
  index: number
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-controls="waf-maturity-detail-panel"
      onClick={onSelect}
      onFocus={onSelect}
      onMouseEnter={onSelect}
      className={cn(
        'grid gap-2 border bg-background/72 p-3 text-left outline-none ring-offset-background transition-colors hover:border-primary/35 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        selected ? 'border-primary/55 shadow-sm' : 'border-border',
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 font-mono text-[10px] font-semibold uppercase tracking-normal text-primary">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h3 className="text-sm font-semibold leading-5 tracking-normal text-foreground">{pillar.title}</h3>
      </div>
      <p className="pl-6 text-xs leading-5 text-muted-foreground">{pillar.switcherSummary}</p>
    </button>
  )
}

function DetailSection({
  state,
  items,
  content,
}: {
  state: WafMaturityState
  items: readonly WafMaturityItem[]
  content: WafMaturityJudgmentContent
}) {
  const tone = maturityStateCopy[state]
  const copy = content.stateCopy[state]
  const Icon = tone.icon

  return (
    <section className="border border-border bg-background/70 p-3">
      <p className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">
        <Icon className={cn('size-3', tone.iconClassName)} aria-hidden="true" />
        {copy.label}
      </p>
      <div className="mt-3 grid gap-3">
        {items.map((item) => (
          <MaturityItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}

function collectEvidenceRefs(pillar: WafMaturityPillar) {
  return maturityStates.flatMap((state) => pillar[pillarItemAccessors[state]].flatMap((item) => item.evidenceRefs ?? []))
}

function unique(values: readonly string[]) {
  return [...new Set(values)]
}

function PillarDetailPanel({ pillar, content }: { pillar: WafMaturityPillar; content: WafMaturityJudgmentContent }) {
  const evidenceRefs = unique(collectEvidenceRefs(pillar))

  return (
    <section id="waf-maturity-detail-panel" className="min-w-0 border border-border bg-background/78" aria-label={`${pillar.title} ${content.chrome.detailPanelAriaSuffix}`}>
      <div className="border-b border-border bg-muted/35 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-primary">{content.chrome.selectedPillarLabel}</p>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-normal text-primary">
            <Hammer className="size-3" aria-hidden="true" />
            {content.chrome.priorityLabel}: {pillar.priorityRecommendation}
          </span>
        </div>
        <h3 className="mt-2 text-lg font-semibold tracking-normal text-foreground">{pillar.title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{pillar.stance}</p>
      </div>

      <div className="grid gap-4 p-4">
        <div className="grid gap-3 lg:grid-cols-3">
          <DetailSection state="strong-now" items={pillar.strongNow} content={content} />
          <DetailSection state="dev-tradeoff" items={pillar.devTradeoffs} content={content} />
          <DetailSection state="harden-next" items={pillar.hardenNext} content={content} />
        </div>

        <div className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
          {evidenceRefs.length > 0 ? (
            <section className="border border-border bg-card/55 p-3">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">{content.chrome.evidenceSupportLabel}</p>
              <div className="mt-2"><EvidenceRefs refs={evidenceRefs} /></div>
            </section>
          ) : null}

        </div>

        <div className="flex flex-wrap gap-2">
          {pillar.tools.map((tool) => (
            <HirayaTag key={tool}>{tool}</HirayaTag>
          ))}
        </div>
      </div>
    </section>
  )
}

export function WafMaturityJudgmentBoard({
  content,
  className,
}: {
  content: WafMaturityJudgmentContent
  className?: string
}) {
  const [selectedPillarId, setSelectedPillarId] = useState<WafMaturityPillar['id']>(content.pillars[0]?.id ?? 'operational-excellence')
  const selectedPillar = content.pillars.find((pillar) => pillar.id === selectedPillarId) ?? content.pillars[0]

  return (
    <HirayaSectionFrame className={cn('overflow-hidden', className)}>
      <HirayaSectionHeader eyebrow={content.eyebrow} title={content.title} description={content.summary} />

      <div className="grid gap-5 p-5 xl:grid-cols-[18rem_minmax(0,1fr)] xl:items-start">
        <nav className="grid gap-2 xl:sticky xl:top-24" aria-label={content.chrome.pillarSwitcherLabel}>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            {content.pillars.map((pillar, index) => (
              <PillarSwitcherButton
                key={pillar.id}
                pillar={pillar}
                index={index}
                selected={pillar.id === selectedPillar?.id}
                onSelect={() => setSelectedPillarId(pillar.id)}
              />
            ))}
          </div>
        </nav>

        {selectedPillar ? <PillarDetailPanel pillar={selectedPillar} content={content} /> : null}
      </div>
    </HirayaSectionFrame>
  )
}
