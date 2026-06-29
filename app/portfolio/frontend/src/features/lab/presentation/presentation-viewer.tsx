import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Hash } from 'lucide-react'

import { TopicContent } from '@/features/lab/presentation/topic-content'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { labChapters } from '@/content/labChapters'
import {
  defaultLabLocale,
  resolveLabLocaleContent,
  type LabChapter,
  type LabLocaleKey,
  type LabTopic,
} from '@/content/labContentTypes'
import { labPresentationUiContent } from '@/content/labVisualContent'
import { cn } from '@/lib/utils'

type TopicTarget = {
  chapterId: string
  topicId: string
}

export type PresentationNavigationAction = {
  label: string
  icon: ReactNode
  disabled: boolean
  onSelect: () => void
}

export type PresentationNavigationControls = {
  previous: PresentationNavigationAction
  next: PresentationNavigationAction
}

type PresentationViewerProps = {
  chapters?: readonly LabChapter[]
  activeChapterId: string
  activeTopicId: string
  getTopicHref?: (chapterId: string, topicId: string) => string | undefined
  onTopicSelect?: (chapterId: string, topicId: string) => void
  locale?: LabLocaleKey
  className?: string
  onNavigationControlsChange?: (controls: PresentationNavigationControls | undefined) => void
}

function resolveTopicTarget(topic?: LabTopic): TopicTarget | undefined {
  return topic ? { chapterId: topic.chapterId, topicId: topic.id } : undefined
}

export function PresentationViewer({
  chapters = labChapters,
  activeChapterId,
  activeTopicId,
  getTopicHref,
  onTopicSelect,
  locale = defaultLabLocale,
  className,
  onNavigationControlsChange,
}: PresentationViewerProps) {
  const [shownKeyPointTopicIds, setShownKeyPointTopicIds] = useState<Set<string>>(() => new Set())
  const [keyPointDialogTarget, setKeyPointDialogTarget] = useState<TopicTarget | undefined>()
  const [isKeyPointDialogOpen, setIsKeyPointDialogOpen] = useState(false)
  const allTopics = useMemo(() => chapters.flatMap((chapter) => chapter.topics), [chapters])
  const activeChapter = chapters.find((chapter) => chapter.id === activeChapterId) ?? chapters[0]
  const fallbackTopic = activeChapter?.topics[0]
  const activeTopic = activeChapter?.topics.find((topic) => topic.id === activeTopicId) ?? fallbackTopic
  const activeChapterContent = activeChapter ? resolveLabLocaleContent(activeChapter.content, locale) : undefined

  const chapterIndex = activeChapter ? chapters.findIndex((chapter) => chapter.id === activeChapter.id) : -1
  const globalTopicIndex = activeTopic
    ? allTopics.findIndex((topic) => topic.chapterId === activeTopic.chapterId && topic.id === activeTopic.id)
    : -1
  const normalizedGlobalTopicIndex = Math.max(globalTopicIndex, 0)
  const previousTopic = useMemo(
    () => resolveTopicTarget(allTopics[normalizedGlobalTopicIndex - 1]),
    [allTopics, normalizedGlobalTopicIndex],
  )
  const nextTopic = useMemo(
    () => resolveTopicTarget(allTopics[normalizedGlobalTopicIndex + 1]),
    [allTopics, normalizedGlobalTopicIndex],
  )
  const activeTopicContent = activeTopic ? resolveLabLocaleContent(activeTopic.content, locale) : undefined
  const uiContent = resolveLabLocaleContent(labPresentationUiContent, locale)
  const activeTopicKey = activeTopic ? `${activeTopic.chapterId}:${activeTopic.id}` : ''
  const activeKeyPoints = activeTopicContent?.keyPoints ?? []
  const hasCheckpointContent = !!activeTopicContent?.body

  const navigateToTopicTarget = useCallback((target: TopicTarget | undefined) => {
    if (!target) return

    if (onTopicSelect) {
      onTopicSelect(target.chapterId, target.topicId)
      return
    }

    const href = getTopicHref?.(target.chapterId, target.topicId)

    if (href) {
      window.location.assign(href)
    }
  }, [getTopicHref, onTopicSelect])

  const openKeyPointDialog = useCallback((target: TopicTarget) => {
    setShownKeyPointTopicIds((current) => {
      const next = new Set(current)
      next.add(activeTopicKey)
      return next
    })
    setKeyPointDialogTarget(target)
    setIsKeyPointDialogOpen(true)
  }, [activeTopicKey])

  const continueFromKeyPoints = () => {
    const target = keyPointDialogTarget

    setIsKeyPointDialogOpen(false)
    setKeyPointDialogTarget(undefined)
    navigateToTopicTarget(target)
  }

  const buildTopicControl = useCallback((
    label: string,
    target: TopicTarget | undefined,
    direction: 'previous' | 'next',
  ) => {
    const disabled = !target
    const shouldShowKeyPointsBeforeNext =
      direction === 'next' && !!target && hasCheckpointContent && !shownKeyPointTopicIds.has(activeTopicKey)

    return {
      label,
      icon: direction === 'previous'
        ? <ChevronLeft aria-hidden="true" />
        : <ChevronRight aria-hidden="true" />,
      disabled,
      onSelect: () => {
        if (!target) return

        if (shouldShowKeyPointsBeforeNext) {
          openKeyPointDialog(target)
          return
        }

        navigateToTopicTarget(target)
      },
    }
  }, [
    activeTopicKey,
    hasCheckpointContent,
    navigateToTopicTarget,
    openKeyPointDialog,
    shownKeyPointTopicIds,
  ])

  const navigationControls = useMemo<PresentationNavigationControls | undefined>(
    () =>
      activeChapter && activeTopic
        ? {
            previous: buildTopicControl(uiContent.previousLabel, previousTopic, 'previous'),
            next: buildTopicControl(uiContent.nextLabel, nextTopic, 'next'),
          }
        : undefined,
    [activeChapter, activeTopic, nextTopic, previousTopic, buildTopicControl, uiContent.nextLabel, uiContent.previousLabel],
  )

  useEffect(() => {
    onNavigationControlsChange?.(navigationControls)
  }, [navigationControls, onNavigationControlsChange])

  useEffect(() => {
    return () => onNavigationControlsChange?.(undefined)
  }, [onNavigationControlsChange])

  if (!activeChapter || !activeTopic || !activeTopicContent) {
    return (
      <Card className={cn('rounded-lg border-border/90 bg-card/90 p-6 shadow-none', className)}>
        <p className="text-sm text-muted-foreground">{uiContent.emptyStateLabel}</p>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        'overflow-hidden rounded-lg border-border/90 bg-card/92 py-0 shadow-none backdrop-blur-md',
        className,
      )}
    >
      <div className="h-full min-w-0">
        <TopicContent
          topic={activeTopic}
          chapterIndex={Math.max(chapterIndex, 0)}
          chapterTitle={activeChapterContent?.title ?? ''}
          locale={locale}
        />
      </div>

      <Dialog
        open={isKeyPointDialogOpen}
        onOpenChange={(open) => {
          setIsKeyPointDialogOpen(open)

          if (!open) {
            setKeyPointDialogTarget(undefined)
          }
        }}
      >
        <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex min-w-0 items-center gap-2">
              <Hash className="size-4 text-primary" aria-hidden="true" />
              <span className="min-w-0 truncate">{activeTopicContent.title}</span>
            </DialogTitle>
            <DialogDescription>{uiContent.checkpointDescription}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <section className="rounded-md border border-border/80 bg-background/70 p-3">
              <h3 className="font-mono text-[10px] font-semibold uppercase leading-4 tracking-normal text-primary">
                {uiContent.coreIdeaLabel}
              </h3>
              <p className="mt-1 text-sm leading-6 text-foreground/86">{activeTopicContent.body}</p>
            </section>

            {activeKeyPoints.length > 0 ? (
              <section className="grid gap-2">
                <h3 className="font-mono text-[10px] font-semibold uppercase leading-4 tracking-normal text-primary">
                  {uiContent.keyPointsLabel}
                </h3>
                <ul className="grid gap-2">
                  {activeKeyPoints.map((point) => (
                    <li
                      key={point}
                      className="flex gap-3 rounded-md border border-border/80 bg-background/70 p-3 text-sm leading-6 text-muted-foreground"
                    >
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsKeyPointDialogOpen(false)}>
              {uiContent.stayLabel}
            </Button>
            <Button type="button" onClick={continueFromKeyPoints}>
              {uiContent.continueLabel}
              <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
