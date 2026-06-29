import { Link } from "@tanstack/react-router"
import { useCallback, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, CircleDot, GitBranch } from "lucide-react"

import { ExpandableRouteNavigator } from "@/features/lab/navigation/expandable-route-navigator"
import type { PresentationNavigationControls } from "@/features/lab/presentation/presentation-viewer"
import {
  ExpandableActionBar,
  type ExpandableActionBarItem,
} from "@/components/motion/expandable-action-bar"
import { Button } from "@/components/ui/button"
import { labChapters, labTopicOrder } from "@/content/labChapters"
import {
  resolveLabLocaleContent,
  type LabChapter,
} from "@/content/labContentTypes"
import { defaultAppLocale, type AppLocale } from "@/i18n/locales"
import { cn } from "@/lib/utils"

type LessonNavigatorProps = {
  chapters?: readonly LabChapter[]
  activeChapterId: string
  activeTopicId: string
  locale?: AppLocale
  controls?: PresentationNavigationControls
  getTopicHref?: (chapterId: string, topicId: string) => string | undefined
  onTopicSelect?: (chapterId: string, topicId: string) => void
}

const progressRadius = 15
const progressCircumference = 2 * Math.PI * progressRadius


function ChapterIcon({ index }: { index: number }) {
  return (
    <span className="grid size-4 place-items-center font-mono text-[10px] font-semibold">
      {index + 1}
    </span>
  )
}

function ProgressIcon({
  current,
  total,
}: {
  current: number
  total: number
}) {
  const progress = total > 0 ? (current / total) * 100 : 0
  const offset = progressCircumference * (1 - progress / 100)

  return (
    <span
      className="grid size-4 shrink-0 place-items-center text-muted-foreground"
      role="img"
      aria-label={`Overall lesson progress ${current} of ${total}`}
    >
      <svg aria-hidden="true" className="size-4 -rotate-90" viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r={progressRadius}
          className="fill-none stroke-border"
          strokeWidth="3"
        />
        <circle
          cx="18"
          cy="18"
          r={progressRadius}
          className="fill-none stroke-current"
          strokeDasharray={progressCircumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth="3"
        />
      </svg>
    </span>
  )
}

export function LessonNavigator({
  chapters = labChapters,
  activeChapterId,
  activeTopicId,
  locale = defaultAppLocale,
  getTopicHref,
  onTopicSelect,
}: LessonNavigatorProps) {
  const [openChapterId, setOpenChapterId] = useState<string | null>(null)

  const closePanel = useCallback(() => setOpenChapterId(null), [])
  const navigatorItems = useMemo(
    () =>
      chapters.map((chapter, chapterIndex) => {
        const activeTopicInChapterIndex = chapter.topics.findIndex(
          (topic) => topic.id === activeTopicId && topic.chapterId === activeChapterId,
        )
        const chapterProgress =
          chapter.id === activeChapterId && activeTopicInChapterIndex >= 0
            ? activeTopicInChapterIndex + 1
            : 0
        const chapterContent = resolveLabLocaleContent(chapter.content, locale)

        return {
          id: chapter.id,
          label: `Ch ${chapterIndex + 1}`,
          icon: <ChapterIcon index={chapterIndex} />,
          panel: (
            <div className="overflow-y-auto p-2">
              <div className="mb-1.5 flex min-w-0 items-start justify-between gap-3 px-1">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold leading-5 text-foreground">
                    {chapterContent.title}
                  </h2>
                  <p className="mt-0.5 font-mono text-[10px] uppercase leading-4 tracking-normal text-muted-foreground">
                    {chapterProgress}/{chapter.topics.length} topics
                  </p>
                </div>
                <GitBranch className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              </div>

              <div className="grid gap-1" aria-label={`Chapter ${chapterIndex + 1} topics`}>
                {chapter.topics.map((topic, topicIndex) => {
                  const topicContent = resolveLabLocaleContent(topic.content, locale)
                  const isTopicActive =
                    topic.id === activeTopicId && topic.chapterId === activeChapterId
                  const href = getTopicHref?.(topic.chapterId, topic.id)
                  const topicLabel = `Topic ${topicIndex + 1}: ${topicContent.title}`
                  const className = cn(
                    "h-auto min-h-8 w-full justify-start gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs",
                    isTopicActive
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )
                  const content = (
                    <>
                      <span className="w-6 shrink-0 font-mono text-[10px]">
                        {String(topicIndex + 1).padStart(2, "0")}
                      </span>
                      <CircleDot className="size-3.5 shrink-0" aria-hidden="true" />
                      <span className="min-w-0 truncate">{topicContent.title}</span>
                    </>
                  )

                  return href ? (
                    <Button key={topic.id} asChild variant="ghost" className={className}>
                      <Link
                        to={href}
                        aria-current={isTopicActive ? "page" : undefined}
                        aria-label={topicLabel}
                        onClick={closePanel}
                      >
                        {content}
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      key={topic.id}
                      type="button"
                      variant="ghost"
                      className={className}
                      aria-current={isTopicActive ? "page" : undefined}
                      aria-label={topicLabel}
                      onClick={() => {
                        closePanel()
                        onTopicSelect?.(topic.chapterId, topic.id)
                      }}
                    >
                      {content}
                    </Button>
                  )
                })}
              </div>
            </div>
          ),
        }
      }),
    [
      activeChapterId,
      activeTopicId,
      chapters,
      closePanel,
      getTopicHref,
      locale,
      onTopicSelect,
    ],
  )

  return (
    <div className="fixed bottom-3 right-3 z-50 flex max-w-[calc(100vw-1.5rem)] sm:bottom-4 sm:right-4">
      <ExpandableRouteNavigator
        aria-label="Lesson navigation"
        activeItemId={openChapterId}
        currentItemId={activeChapterId}
        onActiveItemChange={setOpenChapterId}
        closedHeight={38}
        className="static inset-auto bottom-auto z-auto flex-none px-0"
        classNames={{
          root: "max-w-[calc(100vw-1rem)] rounded-xl border-border/75 bg-card/90 shadow-xl backdrop-blur-xl",
          panel: "max-w-none",
          bar: "max-w-[calc(100vw-1rem)] overflow-x-auto p-1",
          tabList: "shrink-0",
          controls: "shrink-0",
          tab: "h-7 min-w-7 px-1.5 text-xs text-muted-foreground",
          activeTab: "rounded-lg bg-foreground/[0.045]",
          label: "font-mono text-xs tracking-normal",
          pill: "rounded-lg",
        }}
        items={navigatorItems}
      />
    </div>
  )
}

export function LessonActionBar({
  chapters = labChapters,
  activeChapterId,
  activeTopicId,
  controls,
}: Pick<LessonNavigatorProps, "chapters" | "activeChapterId" | "activeTopicId" | "controls">) {
  const allTopics = useMemo(() => chapters.flatMap((chapter) => chapter.topics), [chapters])
  const activeTopicIndex = allTopics.findIndex(
    (topic) => topic.chapterId === activeChapterId && topic.id === activeTopicId,
  )
  const globalTopicNumber = Math.max(activeTopicIndex, 0) + 1
  const totalTopics = allTopics.length || labTopicOrder.length
  const actionItems = useMemo<ExpandableActionBarItem[]>(() => [
    {
      id: "previous",
      label: controls?.previous.label ?? "Previous",
      icon: controls?.previous.icon ?? <ChevronLeft aria-hidden="true" />,
      disabled: !controls?.previous || controls.previous.disabled,
      onClick: () => {
        controls?.previous.onSelect()
      },
    },
    {
      id: "progress",
      label: `${globalTopicNumber}/${totalTopics}`,
      icon: <ProgressIcon current={globalTopicNumber} total={totalTopics} />,
    },
    {
      id: "next",
      label: controls?.next.label ?? "Next",
      icon: controls?.next.icon ?? <ChevronRight aria-hidden="true" />,
      disabled: !controls?.next || controls.next.disabled,
      onClick: () => {
        controls?.next.onSelect()
      },
    },
  ], [controls, globalTopicNumber, totalTopics])

  return (
    <div className="relative h-[38px] w-[114px] shrink-0">
      <ExpandableActionBar
        items={actionItems}
        size="sm"
        className="absolute right-0 top-0 origin-right"
        classNames={{
          track: "min-h-[38px] rounded-xl border-border/70 bg-card/92 px-1 py-0.5 shadow-xl",
          item: "group h-8 min-w-8 px-2 text-muted-foreground hover:text-foreground disabled:text-muted-foreground/45 [&_svg]:size-3.5",
          label: "font-mono text-[11px] tracking-normal text-muted-foreground",
        }}
      />
    </div>
  )
}
