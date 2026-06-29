import { Link } from "@tanstack/react-router"
import { BookOpenText, Languages, Sparkles } from "lucide-react"
import { useTranslation } from "react-i18next"

import { GithubIcon } from "@/components/app/icons"
import { Dock, DockItem, DockSeparator } from "@/components/motion/dock"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { firstLabTopic } from "@/content/labChapters"
import { type AppLocale } from "@/i18n/locales"
import { cn } from "@/lib/utils"

type GlobalDockProps = {
  locale: AppLocale
  onLocaleChange: (locale: AppLocale) => void
  isLessonsActive?: boolean
  isHirayaActive?: boolean
  lessonsHref?: string
  className?: string
}

const githubHref = "https://github.com/noidilin/hiraya"
const defaultLessonsHref = `/chapters/${firstLabTopic.chapterId}/topics/${firstLabTopic.topicId}`

function DockTooltip({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}

export function GlobalDock({
  locale,
  onLocaleChange,
  isLessonsActive = false,
  isHirayaActive = false,
  lessonsHref = defaultLessonsHref,
  className,
}: GlobalDockProps) {
  const { t } = useTranslation()
  const nextLocale: AppLocale = locale === "en" ? "zh-TW" : "en"
  const localeLabel = locale === "en" ? "EN" : "TW"
  const localeAriaLabel =
    locale === "en" ? t("common.language.switchToTraditionalChinese") : t("common.language.switchToEnglish")

  return (
    <Dock size={32} className={cn("gap-1 rounded-xl bg-card/92 px-1 py-0.5 shadow-xl", className)}>
      <DockTooltip label={localeAriaLabel}>
        <DockItem
          aria-label={localeAriaLabel}
          onClick={() => onLocaleChange(nextLocale)}
        >
          <span className="relative grid size-full place-items-center">
            <Languages className="size-3.5 text-primary" aria-hidden="true" />
            <span className="absolute bottom-0.5 right-0 rounded-sm bg-background px-0.5 font-mono text-[8px] font-semibold leading-[10px] text-foreground">
              {localeLabel}
            </span>
          </span>
        </DockItem>
      </DockTooltip>

      <DockSeparator className="mx-0.5 h-5" />

      <DockTooltip label={t("common.nav.chapters")}>
        <DockItem aria-label={t("common.nav.openChapters")} active={isLessonsActive}>
          <Link
            to={lessonsHref}
            aria-label={t("common.nav.openChapters")}
            aria-current={isLessonsActive ? "page" : undefined}
            className="grid size-full place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <BookOpenText className="size-3.5" aria-hidden="true" />
          </Link>
        </DockItem>
      </DockTooltip>

      <DockTooltip label={t("common.nav.hiraya")}>
        <DockItem aria-label={t("common.nav.openHiraya")} active={isHirayaActive}>
          <Link
            to="/hiraya"
            aria-label={t("common.nav.openHiraya")}
            aria-current={isHirayaActive ? "page" : undefined}
            className="grid size-full place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Sparkles className="size-3.5" aria-hidden="true" />
          </Link>
        </DockItem>
      </DockTooltip>

      <DockTooltip label={t("common.nav.repository")}>
        <DockItem aria-label={t("common.nav.repository")}>
          <a
            href={githubHref}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={t("common.nav.openRepository")}
            className="grid size-full place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <GithubIcon className="size-3.5" />
          </a>
        </DockItem>
      </DockTooltip>
    </Dock>
  )
}
