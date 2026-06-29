import type { AppLocale } from '@/i18n/locales'

import { hirayaEvidenceItemsEn, hirayaPagesEn } from './en'
import { hirayaEvidenceItemsZhTW, hirayaPagesZhTW } from './zh-TW'
import {
  hirayaRouteIds,
  type HirayaEvidenceItem,
  type HirayaPageContent,
  type HirayaRouteAlias,
  type HirayaRouteId,
} from './types'

export const hirayaRouteAliases: Record<HirayaRouteAlias, HirayaRouteId> = {
  brief: 'brief',
  arch: 'arch',
  architecture: 'arch',
  cost: 'cost',
  'cost-analysis': 'cost',
  sdlc: 'sdlc',
  'sdlc-pipeline': 'sdlc',
  waf: 'waf',
  'well-architected': 'waf',
}

export const defaultHirayaRouteId: HirayaRouteId = 'brief'

export function getHirayaPages(locale: AppLocale): readonly HirayaPageContent[] {
  return locale === 'zh-TW' ? hirayaPagesZhTW : hirayaPagesEn
}

export function getHirayaEvidenceItems(locale: AppLocale): readonly HirayaEvidenceItem[] {
  return locale === 'zh-TW' ? hirayaEvidenceItemsZhTW : hirayaEvidenceItemsEn
}

export function resolveHirayaRouteId(routeId: string | undefined): HirayaRouteId {
  return hirayaRouteAliases[(routeId ?? defaultHirayaRouteId) as HirayaRouteAlias] ?? defaultHirayaRouteId
}

export function findHirayaPage(routeId: string | undefined, locale: AppLocale): HirayaPageContent {
  const pages = getHirayaPages(locale)
  const resolvedRouteId = resolveHirayaRouteId(routeId)

  return pages.find((page) => page.id === resolvedRouteId) ?? pages[0]
}

export { hirayaRouteIds }
export type * from './types'
