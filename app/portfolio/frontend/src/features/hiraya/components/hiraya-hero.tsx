import type { LucideIcon } from 'lucide-react'
import { Terminal } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import type { HirayaPageContent } from '@/content/hiraya/types'

export function HirayaHero({ page, icon: Icon }: { page: HirayaPageContent; icon: LucideIcon }) {
  const { t } = useTranslation()

  return (
    <section className="border-l-4 border-primary py-4 pl-6 sm:pl-8">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-normal">
          PROJECT_REPORT_01
        </Badge>
        <Badge
          variant="outline"
          className="rounded-full bg-card/75 px-2.5 py-1 font-mono text-[10px] uppercase tracking-normal"
        >
          DEV_PLATFORM
        </Badge>
        <Badge
          variant="secondary"
          className="rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-normal"
        >
          {page.eyebrow}
        </Badge>
      </div>
      <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary/80">{page.sourceSection}</p>
          <h1 className="mt-3 max-w-5xl text-4xl font-semibold tracking-normal text-foreground sm:text-5xl lg:text-6xl">
            {page.title}
          </h1>
          <p className="mt-4 max-w-4xl text-base leading-7 text-muted-foreground sm:text-lg">{page.summary}</p>
          <p className="mt-4 max-w-5xl border-l border-border pl-4 text-sm leading-6 text-muted-foreground">
            {page.thesis}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <span className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground">
            <Terminal className="size-4" aria-hidden="true" />
            {t('hiraya.hero.evidenceSlots')}
          </span>
          <span className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card/75 px-4 text-sm font-medium text-foreground">
            <Icon className="size-4" aria-hidden="true" />
            {page.navLabel}
          </span>
        </div>
      </div>
    </section>
  )
}
