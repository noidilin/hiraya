import type { AppLocale } from '@/i18n/locales'

import { briefProofPathOverviewContentEn } from './briefProofPathOverview.en'
import { briefProofPathOverviewContentZhTW } from './briefProofPathOverview.zh-TW'
import type { HirayaEvidenceItem } from './types'

export type BriefProofPathCardId = 'design-goals' | 'primary-runtime' | 'delivery-model' | 'proof-path'

export type BriefProofPathCard = {
  id: BriefProofPathCardId
  label: string
  value: string
  note: string
  detailTitle: string
  detailSummary: string
  detailBullets: readonly string[]
  evidenceRefs?: readonly HirayaEvidenceItem['id'][]
  sourceRefs: readonly string[]
}

export function getBriefProofPathOverviewContent(locale: AppLocale): readonly BriefProofPathCard[] {
  return locale === 'zh-TW' ? briefProofPathOverviewContentZhTW : briefProofPathOverviewContentEn
}
