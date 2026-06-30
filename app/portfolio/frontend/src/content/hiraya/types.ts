export const hirayaSourceDoc = 'app/portfolio/frontend/docs/presentation-en.md'

export const hirayaRouteIds = ['brief', 'arch', 'cost', 'sdlc', 'waf'] as const

export type HirayaRouteId = (typeof hirayaRouteIds)[number]

export type HirayaRouteAlias =
  | HirayaRouteId
  | 'architecture'
  | 'cost-analysis'
  | 'sdlc-pipeline'
  | 'well-architected'

export type HirayaContentTable = {
  columns: readonly string[]
  rows: readonly (readonly string[])[]
}

export type HirayaContentSection = {
  id: string
  eyebrow?: string
  title: string
  body?: string
  bullets?: readonly string[]
  tags?: readonly string[]
  table?: HirayaContentTable
}

export type HirayaMetric = {
  label: string
  value: string
  note: string
}

export type HirayaProofPoint = {
  id: string
  title: string
  summary: string
  evidenceRefs?: readonly string[]
}

export type HirayaMediaSlot = {
  id: string
  type: 'intro-video' | 'screenshot-hover' | 'diagram-frame'
  status: 'planned' | 'placeholder' | 'ready'
  title: string
  description: string
  evidenceRefs?: readonly string[]
}

export type HirayaEvidenceItem = {
  id: string
  priority: 'P0' | 'P1' | 'P2'
  title: string
  suggestedFormat: 'screenshot' | 'short-video' | 'video'
  portfolioValue: string
  checklistSource: 'docs/evidence-checklist.md'
}

export type HirayaFlowStep = {
  id: string
  title: string
  summary: string
  evidence?: readonly string[]
}

export type HirayaWellArchitectedPillar = {
  id: string
  title: string
  stance: string
  highlights: readonly string[]
  futureHardening?: readonly string[]
  tools: readonly string[]
}

export type HirayaPageContent = {
  id: HirayaRouteId
  sourceDoc: typeof hirayaSourceDoc
  sourceSection: string
  navLabel: string
  shortLabel: string
  eyebrow: string
  title: string
  summary: string
  thesis: string
  metrics?: readonly HirayaMetric[]
  proofPoints?: readonly HirayaProofPoint[]
  mediaSlots?: readonly HirayaMediaSlot[]
  sections: readonly HirayaContentSection[]
  flow?: readonly HirayaFlowStep[]
  pillars?: readonly HirayaWellArchitectedPillar[]
}
