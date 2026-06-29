import { Link } from "@tanstack/react-router"
import { BookOpenText, Languages, Sparkles } from "lucide-react"

import { GithubIcon } from "@/components/app/icons"
import { Dock, DockItem, DockSeparator } from "@/components/motion/dock"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { firstLabTopic } from "@/content/labChapters"
import { type LabLocaleKey } from "@/content/labContentTypes"
import { cn } from "@/lib/utils"

type GlobalDockProps = {
  locale: LabLocaleKey
  onLocaleChange: (locale: LabLocaleKey) => void
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
  const nextLocale: LabLocaleKey = locale === "en" ? "zhTW" : "en"
  const localeLabel = locale === "en" ? "EN" : "TW"
  const localeAriaLabel =
    locale === "en" ? "Switch locale to Traditional Chinese" : "Switch locale to English"

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

      <DockTooltip label="Chapters">
        <DockItem aria-label="Open chapters" active={isLessonsActive}>
          <Link
            to={lessonsHref}
            aria-label="Open chapters"
            aria-current={isLessonsActive ? "page" : undefined}
            className="grid size-full place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <BookOpenText className="size-3.5" aria-hidden="true" />
          </Link>
        </DockItem>
      </DockTooltip>

      <DockTooltip label="Hiraya">
        <DockItem aria-label="Open Hiraya" active={isHirayaActive}>
          <Link
            to="/hiraya"
            aria-label="Open Hiraya"
            aria-current={isHirayaActive ? "page" : undefined}
            className="grid size-full place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Sparkles className="size-3.5" aria-hidden="true" />
          </Link>
        </DockItem>
      </DockTooltip>

      <DockTooltip label="Hiraya repository">
        <DockItem aria-label="Open Hiraya repository">
          <a
            href={githubHref}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Open Hiraya repository on GitHub"
            className="grid size-full place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <GithubIcon className="size-3.5" />
          </a>
        </DockItem>
      </DockTooltip>
    </Dock>
  )
}
