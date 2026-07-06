import { useNavigate } from '@tanstack/react-router'
import {
  CircleDollarSign,
  FileText,
  GitBranch,
  Network,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import { useCallback, useMemo } from 'react'

import { AppPageShell } from '@/components/app/layout/app-page-shell'
import { GlobalDock } from '@/components/app/navigation/global-dock'
import {
  ExpandableActionBar,
  type ExpandableActionBarItem,
} from '@/components/motion/expandable-action-bar'
import {
  findHirayaPage,
  getHirayaPages,
  resolveHirayaRouteId,
  type HirayaPageContent as HirayaPageContentModel,
  type HirayaRouteId,
} from '@/content/hiraya/content'
import { getHirayaRouteDesignContent, type HirayaRouteDesignContent } from '@/content/hiraya/route-design-content'
import { GuideChatLauncher } from '@/features/guide-chat/components/guide-chat-launcher'
import { useAppLocale } from '@/i18n/use-app-locale'
import { HirayaHero } from '@/features/hiraya/components/hiraya-hero'
import { HirayaRouteDesign } from '@/features/hiraya/components/hiraya-route-designs'

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

function HirayaPageContent({
  page,
  routeDesignContent,
}: {
  page: HirayaPageContentModel
  routeDesignContent: HirayaRouteDesignContent
}) {
  return <HirayaRouteDesign page={page} content={routeDesignContent} />
}

function HirayaActionBar({ activePageId, pages }: { activePageId: HirayaRouteId; pages: readonly HirayaPageContentModel[] }) {
  const navigate = useNavigate()

  const navigateToPage = useCallback(
    (pageId: HirayaRouteId) => {
      void navigate({ to: getHirayaHref(pageId) })
    },
    [navigate],
  )

  const actionItems = useMemo<ExpandableActionBarItem[]>(
    () =>
      pages.map((page) => {
        const Icon = hirayaPageIcons[page.id]

        return {
          id: page.id,
          label: page.shortLabel,
          icon: <Icon aria-hidden="true" />,
          active: page.id === activePageId,
          onClick: () => navigateToPage(page.id),
        }
      }),
    [activePageId, navigateToPage, pages],
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
          item: 'group h-8 min-w-8 rounded-[10px] px-2 text-muted-foreground hover:text-foreground disabled:text-muted-foreground/45 [&_svg]:size-3.5',
          label: 'font-mono text-[11px] tracking-normal text-muted-foreground',
          shortcut: 'font-mono text-[10px] tracking-normal text-muted-foreground/70',
        }}
      />
    </div>
  )
}

export function HirayaPage({ activePageId }: HirayaPageProps) {
  const { locale, setLocale } = useAppLocale()
  const resolvedPageId = resolveHirayaRouteId(activePageId)
  const pages = getHirayaPages(locale)
  const activePage = findHirayaPage(activePageId, locale)
  const routeDesignContent = useMemo(() => getHirayaRouteDesignContent(locale), [locale])
  return (
    <AppPageShell
      dock={
        <>
          <HirayaActionBar activePageId={resolvedPageId} pages={pages} />
          <GlobalDock locale={locale} onLocaleChange={setLocale} isHirayaActive />
        </>
      }
      contentClassName="mx-auto flex min-h-svh w-full max-w-[1680px] flex-col gap-8 px-4 py-24 sm:px-6 lg:px-8"
    >
      <HirayaHero page={activePage} />
      <HirayaPageContent page={activePage} routeDesignContent={routeDesignContent} />
      <GuideChatLauncher />
    </AppPageShell>
  )
}
