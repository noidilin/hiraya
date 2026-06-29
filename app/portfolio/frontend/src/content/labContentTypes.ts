export const labLocaleKeys = ['en', 'zhTW'] as const

export type LabLocaleKey = (typeof labLocaleKeys)[number]

export const defaultLabLocale: LabLocaleKey = 'en'

export type LabLocaleContent = {
  title: string
  summary: string
  body: string
  keyPoints?: readonly string[]
}

export type LabChapterLocaleContent = Pick<LabLocaleContent, 'title' | 'summary'>

export type LabVisualLocaleContent = {
  title: string
  summary: string
  ariaLabel: string
}

export type LabPresentationUiLocaleContent = {
  chapterLabel: string
  slideLabel: string
  coreIdeaLabel: string
  keyPointsLabel: string
  sourceReferenceLabel: string
  sourceReferenceAriaLabel: string
  stage2BadgeLabel: string
  visualPlaceholderLabel: string
  visualLoadingLabel: string
}

export type LabLocalizedContent<TContent extends object> = {
  en: TContent
} & Partial<Record<Exclude<LabLocaleKey, 'en'>, Partial<TContent>>>

export const isLabLocaleKey = (locale: string): locale is LabLocaleKey =>
  labLocaleKeys.some((localeKey) => localeKey === locale)

export function resolveLabLocaleContent<TContent extends object>(
  content: LabLocalizedContent<TContent>,
  locale: LabLocaleKey = defaultLabLocale,
): TContent {
  if (locale === defaultLabLocale) {
    return content.en
  }

  return {
    ...content.en,
    ...(content[locale] ?? {}),
  }
}

export type LabVisualSlotKey =
  | 'delivery-loop-comparison'
  | 'trusted-pipeline-path'
  | 'ai-assisted-change-funnel'
  | 'six-stage-loop'
  | 'benefit-evidence-path'
  | 'simple-vs-production-reality'
  | 'chapter-takeaway'
  | 'system-skill-map'
  | 'architecture-to-pipeline-mapping'
  | 'coupled-validation-model'
  | 'affected-service-graph'
  | 'operating-model-comparison'
  | 'artifact-to-runtime-map'
  | 'permission-lanes'
  | 'speed-trust-balance'
  | 'release-operations-loop'
  | 'evidence-chain'
  | 'qualitative-checklist'
  | 'system-fit-frame'
  | 'tradeoff-frame'
  | 'release-health-frame'
  | 'duration-breakdown'
  | 'delivery-recovery-metrics'
  | 'trust-efficiency-metrics'
  | 'security-audit-confidence'
  | 'metric-constellation'
  | 'ai-delivery-loop-orbit'
  | 'ai-architecture-review'
  | 'optimization-assistant-panel'
  | 'responsibility-authority-map'
  | 'security-evidence-gates'
  | 'suggestion-evidence-decision'
  | 'ai-accelerator-takeaway'

export type LabTopic = {
  id: string
  chapterId: string
  sourceDoc: string
  sourceHeadings: readonly string[]
  content: LabLocalizedContent<LabLocaleContent>
  visualSlot: LabVisualSlotKey
  stage2Notes: string
}

export type LabChapter = {
  id: string
  sourceDoc: string
  content: LabLocalizedContent<LabChapterLocaleContent>
  topics: readonly LabTopic[]
}

export type LabTopicRef = {
  chapterId: string
  topicId: string
  index: number
  previous?: {
    chapterId: string
    topicId: string
  }
  next?: {
    chapterId: string
    topicId: string
  }
}
