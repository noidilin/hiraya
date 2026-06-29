import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router'

import { HirayaPage } from '@/features/hiraya/pages/hiraya-page'
import { KineticLabPage } from '@/features/lab/pages/kinetic-lab-page'
import { VisualReferenceGallery } from '@/features/lab/pages/visual-reference-gallery'
import {
  findLabChapter,
  findLabTopic,
  firstLabTopic,
  getFirstTopicForChapter,
} from '@/content/labChapters'

const rootRoute = createRootRoute()

const firstTopicParams = {
  chapterId: firstLabTopic.chapterId,
  topicId: firstLabTopic.topicId,
}

const topicRoutePath = '/chapters/$chapterId/topics/$topicId'

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({
      to: topicRoutePath,
      params: firstTopicParams,
      replace: true,
    })
  },
})

const visualsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/visuals',
  component: VisualsRoute,
})

const hirayaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/hiraya',
  beforeLoad: () => {
    throw redirect({
      to: '/hiraya/$pageId',
      params: { pageId: 'brief' },
      replace: true,
    })
  },
})

const hirayaPageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/hiraya/$pageId',
  component: HirayaRoute,
})

const chapterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chapters/$chapterId',
  beforeLoad: ({ params }) => {
    const firstTopic = getFirstTopicForChapter(params.chapterId)

    throw redirect({
      to: topicRoutePath,
      params: firstTopic
        ? {
            chapterId: firstTopic.chapterId,
            topicId: firstTopic.id,
          }
        : firstTopicParams,
      replace: true,
    })
  },
})

const topicRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: topicRoutePath,
  beforeLoad: ({ params }) => {
    const chapter = findLabChapter(params.chapterId)

    if (!chapter) {
      throw redirect({
        to: topicRoutePath,
        params: firstTopicParams,
        replace: true,
      })
    }

    const topic = findLabTopic(params.chapterId, params.topicId)

    if (!topic) {
      const firstTopic = chapter.topics[0]

      throw redirect({
        to: topicRoutePath,
        params: {
          chapterId: chapter.id,
          topicId: firstTopic.id,
        },
        replace: true,
      })
    }
  },
  component: TopicRoute,
})

function TopicRoute() {
  const { chapterId, topicId } = topicRoute.useParams()

  return <KineticLabPage activeChapterId={chapterId} activeTopicId={topicId} />
}

function VisualsRoute() {
  return <VisualReferenceGallery />
}

function HirayaRoute() {
  const { pageId } = hirayaPageRoute.useParams()

  return <HirayaPage activePageId={pageId} />
}

const routeTree = rootRoute.addChildren([
  indexRoute,
  visualsRoute,
  hirayaRoute,
  hirayaPageRoute,
  chapterRoute,
  topicRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
