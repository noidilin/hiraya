import { ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { HirayaWellArchitectedPillar } from '@/content/hiraya/types'

import { HirayaSectionFrame, HirayaSectionHeader, HirayaTag } from './hiraya-section'

function HirayaPillarCard({ pillar }: { pillar: HirayaWellArchitectedPillar }) {
  const { t } = useTranslation()

  return (
    <article className="grid gap-5 border border-border bg-background/70 p-5 transition-colors hover:border-primary/60">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-normal text-muted-foreground">{pillar.id}</p>
          <h3 className="mt-1 text-lg font-semibold tracking-normal text-foreground">{pillar.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{pillar.stance}</p>
        </div>
      </div>

      <div>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">{t('hiraya.pillars.highlights')}</p>
        <ul className="mt-3 grid gap-2">
          {pillar.highlights.map((highlight) => (
            <li key={highlight} className="text-sm leading-6 text-muted-foreground">
              <span className="mr-2 font-mono text-[10px] font-semibold text-primary">//</span>
              {highlight}
            </li>
          ))}
        </ul>
      </div>

      {pillar.futureHardening ? (
        <div className="border border-dashed border-border bg-card/55 p-4">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">
            {t('hiraya.pillars.futureHardening')}
          </p>
          <ul className="mt-2 grid gap-2">
            {pillar.futureHardening.map((item) => (
              <li key={item} className="text-xs leading-5 text-muted-foreground">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {pillar.tools.map((tool) => (
          <HirayaTag key={tool}>{tool}</HirayaTag>
        ))}
      </div>
    </article>
  )
}

export function HirayaPillarGrid({ pillars }: { pillars: readonly HirayaWellArchitectedPillar[] }) {
  const { t } = useTranslation()

  return (
    <HirayaSectionFrame>
      <HirayaSectionHeader
        eyebrow={t('hiraya.pillars.eyebrow')}
        title={t('hiraya.pillars.title')}
        description={t('hiraya.pillars.description')}
      />
      <div className="grid gap-4 p-5 xl:grid-cols-2">
        {pillars.map((pillar) => (
          <HirayaPillarCard key={pillar.id} pillar={pillar} />
        ))}
      </div>
    </HirayaSectionFrame>
  )
}
