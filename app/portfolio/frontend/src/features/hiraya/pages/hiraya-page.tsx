import { useNavigate } from '@tanstack/react-router'
import {
  CircleDollarSign,
  FileText,
  GitBranch,
  Network,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import { AppPageShell } from '@/components/app/layout/app-page-shell'
import { GlobalDock } from '@/components/app/navigation/global-dock'
import {
  ExpandableActionBar,
  type ExpandableActionBarItem,
} from '@/components/motion/expandable-action-bar'
import {
  findHirayaPage,
  hirayaPages,
  resolveHirayaRouteId,
  type HirayaPageContent as HirayaPageContentModel,
  type HirayaRouteId,
} from '@/content/hirayaContent'
import { defaultLabLocale, type LabLocaleKey } from '@/content/labContentTypes'
import { GuideChatLauncher } from '@/features/guide-chat/components/guide-chat-launcher'
import { HirayaFlow } from '@/features/hiraya/components/hiraya-flow'
import { HirayaHero } from '@/features/hiraya/components/hiraya-hero'
import { HirayaMediaSlotGrid } from '@/features/hiraya/components/hiraya-media-slot'
import { HirayaMetricGrid } from '@/features/hiraya/components/hiraya-metric-grid'
import { HirayaPillarGrid } from '@/features/hiraya/components/hiraya-pillar-grid'
import { HirayaProofPointGrid } from '@/features/hiraya/components/hiraya-proof-point-grid'
import { HirayaSection } from '@/features/hiraya/components/hiraya-section'

type HirayaPageProps = {
  activePageId?: string
}

const hirayaPageIcons: Record<HirayaRouteId, LucideIcon> = {
  brief: FileText,
  arch: Network,
  cost: CircleDollarSign,
  sdlc: GitBranch,
  waf: ShieldCheck,
}

function getHirayaHref(pageId: HirayaRouteId) {
  return `/hiraya/${pageId}`
}

function HirayaPageContent({ page }: { page: HirayaPageContentModel }) {
  return (
    <div className="grid gap-6">
      {page.metrics ? <HirayaMetricGrid metrics={page.metrics} /> : null}
      {page.mediaSlots ? <HirayaMediaSlotGrid slots={page.mediaSlots} /> : null}
      {page.proofPoints ? <HirayaProofPointGrid proofPoints={page.proofPoints} /> : null}
      {page.sections.map((section) => (
        <HirayaSection key={section.id} section={section} />
      ))}
      {page.flow ? <HirayaFlow steps={page.flow} /> : null}
      {page.pillars ? <HirayaPillarGrid pillars={page.pillars} /> : null}
    </div>
  )
}

function HirayaActionBar({ activePageId }: { activePageId: HirayaRouteId }) {
  const navigate = useNavigate()

  const navigateToPage = useCallback(
    (pageId: HirayaRouteId) => {
      void navigate({ to: getHirayaHref(pageId) })
    },
    [navigate],
  )

  const actionItems = useMemo<ExpandableActionBarItem[]>(
    () =>
      hirayaPages.map((page) => {
        const Icon = hirayaPageIcons[page.id]

        return {
          id: page.id,
          label: page.shortLabel,
          icon: <Icon aria-hidden="true" />,
          active: page.id === activePageId,
          onClick: () => navigateToPage(page.id),
        }
      }),
    [activePageId, navigateToPage],
  )

  return (
    <div className="relative h-[38px] w-[194px] shrink-0">
      <ExpandableActionBar
        items={actionItems}
        activeId={activePageId}
        size="sm"
        className="absolute right-0 top-0 origin-right"
        classNames={{
          track: 'min-h-[38px] rounded-xl border-border/70 bg-card/92 px-1 py-0.5 shadow-xl',
          item: 'group h-8 min-w-8 px-2 text-muted-foreground hover:text-foreground disabled:text-muted-foreground/45 [&_svg]:size-3.5',
          label: 'font-mono text-[11px] tracking-normal text-muted-foreground',
          shortcut: 'font-mono text-[10px] tracking-normal text-muted-foreground/70',
        }}
      />
    </div>
  )
}

export function HirayaPage({ activePageId }: HirayaPageProps) {
  const [locale, setLocale] = useState<LabLocaleKey>(defaultLabLocale)
  const resolvedPageId = resolveHirayaRouteId(activePageId)
  const activePage = findHirayaPage(activePageId)
  const ActiveIcon = hirayaPageIcons[resolvedPageId]

  return (
    <AppPageShell
      dock={
        <>
          <HirayaActionBar activePageId={resolvedPageId} />
          <GlobalDock locale={locale} onLocaleChange={setLocale} isHirayaActive />
        </>
      }
      contentClassName="mx-auto flex min-h-svh w-full max-w-[1680px] flex-col gap-8 px-4 py-24 sm:px-6 lg:px-8"
    >
      <HirayaHero page={activePage} icon={ActiveIcon} />
      <HirayaPageContent page={activePage} />
      <GuideChatLauncher />
    </AppPageShell>
  )
}
