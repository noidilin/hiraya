import type { AppLocale } from '@/i18n/locales'

import { exposureBoundaryContentEn } from './architectureExposureBoundaries.en'
import { exposureBoundaryContentZhTW } from './architectureExposureBoundaries.zh-TW'
import type { HirayaRouteId } from './types'

export type ExposureBoundaryClassId =
  | 'public-user-entry'
  | 'public-demo-ops-surface'
  | 'private-service'
  | 'private-data'
  | 'internal-platform-service'

export type ExposureBoundaryRow = {
  id: string
  surface: string
  exposureClass: ExposureBoundaryClassId
  entryMechanism: string
  boundaryReason: string
  devTradeoff: string
}

export type ExposureBoundaryGroup = {
  id: ExposureBoundaryClassId
  label: string
  summary: string
  rows: readonly ExposureBoundaryRow[]
}

export type ExposureBoundaryChrome = {
  eyebrow: string
  filterEyebrow: string
  filterLabel: string
  allSurfacesLabel: string
  captionAllLabel: string
  columns: {
    surface: string
    entryMechanism: string
    boundaryReason: string
    devTradeoff: string
    exposureClass: string
  }
}

export type ExposureBoundaryContent = {
  routeId: Extract<HirayaRouteId, 'arch'>
  title: string
  summary: string
  chrome: ExposureBoundaryChrome
  defaultOpenGroupId: ExposureBoundaryClassId
  groups: readonly ExposureBoundaryGroup[]
}

export function getExposureBoundaryContent(locale: AppLocale): ExposureBoundaryContent {
  return locale === 'zh-TW' ? exposureBoundaryContentZhTW : exposureBoundaryContentEn
}
