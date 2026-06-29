import { useCallback, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { GlobalDock } from '@/components/app/navigation/global-dock'
import { AppPageShell } from '@/components/app/layout/app-page-shell'
import { LessonActionBar, LessonNavigator } from '@/features/lab/navigation/lesson-navigator'
import { PresentationViewer } from '@/features/lab/presentation/presentation-viewer'
import type { PresentationNavigationControls } from '@/features/lab/presentation/presentation-viewer'
import { firstLabTopic, labChapters } from '@/content/labChapters'
import { defaultLabLocale, type LabLocaleKey } from '@/content/labContentTypes'

type KineticLabPageProps = {
  activeChapterId?: string
  activeTopicId?: string
}

const topicRoutePath = '/chapters/$chapterId/topics/$topicId'

const getTopicHref = (chapterId: string, topicId: string) => `/chapters/${chapterId}/topics/${topicId}`

export function KineticLabPage({ activeChapterId, activeTopicId }: KineticLabPageProps) {
  const navigate = useNavigate()
  const [locale, setLocale] = useState<LabLocaleKey>(defaultLabLocale)
  const [lessonNavigation, setLessonNavigation] = useState<PresentationNavigationControls>()
  const resolvedChapterId = activeChapterId ?? firstLabTopic.chapterId
  const resolvedTopicId = activeTopicId ?? firstLabTopic.topicId

  const navigateToTopic = useCallback((chapterId: string, topicId: string) => {
    void navigate({
      to: topicRoutePath,
      params: { chapterId, topicId },
    })
  }, [navigate])

  return (
    <AppPageShell
      className="pb-0"
      dock={
        <>
          <LessonActionBar
            chapters={labChapters}
            activeChapterId={resolvedChapterId}
            activeTopicId={resolvedTopicId}
            controls={lessonNavigation}
          />
          <GlobalDock
            locale={locale}
            onLocaleChange={setLocale}
            isLessonsActive
            lessonsHref={getTopicHref(resolvedChapterId, resolvedTopicId)}
          />
        </>
      }
      contentClassName="mx-auto w-full max-w-[1680px] px-4 py-3 sm:px-6 lg:px-8"
    >
      <PresentationViewer
        chapters={labChapters}
        activeChapterId={resolvedChapterId}
        activeTopicId={resolvedTopicId}
        getTopicHref={getTopicHref}
        onTopicSelect={navigateToTopic}
        locale={locale}
        className="h-[calc(100svh-1.5rem)]"
        onNavigationControlsChange={setLessonNavigation}
      />
      <LessonNavigator
        chapters={labChapters}
        activeChapterId={resolvedChapterId}
        activeTopicId={resolvedTopicId}
        getTopicHref={getTopicHref}
        onTopicSelect={navigateToTopic}
        locale={locale}
      />
    </AppPageShell>
  )
}
