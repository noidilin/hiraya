import type { ProductIconId } from '@/components/app/product-icon-types'
import type { AppLocale } from '@/i18n/locales'

import { briefPlatformProofMapContentEn } from './briefPlatformProofMap.en'
import { briefPlatformProofMapContentZhTW } from './briefPlatformProofMap.zh-TW'
import type { HirayaEvidenceItem, HirayaRouteId } from './types'

export type BriefProofMapZoneId =
  | 'source-delivery'
  | 'project-bootstrap'
  | 'platform-proof'

export type BriefProofMapNodeId = string

export type BriefProofMapLensId =
  | 'visitor-request'
  | 'delivery-gitops'
  | 'rebuild-destroy'
  | 'operations-evidence'

export type BriefProofMapNodeKind =
  | 'actor'
  | 'stage'
  | 'artifact'
  | 'system'
  | 'environment'
  | 'evidence'
  | 'gate'

export type BriefProofMapNodeRole = 'authority' | 'runtime' | 'proof'

export type BriefProofMapToolIcon = ProductIconId

export type BriefProofMapZone = {
  id: BriefProofMapZoneId
  label: string
  shortLabel: string
  summary: string
  posture: string
  position: { x: number; y: number }
  size: { width: number; height: number }
}

export type BriefProofMapNode = {
  id: BriefProofMapNodeId
  zoneId: BriefProofMapZoneId
  label: string
  detail: string
  code?: string
  kind: BriefProofMapNodeKind
  role: BriefProofMapNodeRole
  posture: string
  toolIcon?: BriefProofMapToolIcon
  position: { x: number; y: number }
  sourceRefs: readonly string[]
}

export type BriefProofMapEdge = {
  id: string
  source: BriefProofMapNodeId
  target: BriefProofMapNodeId
  label?: string
  lensIds: readonly BriefProofMapLensId[]
}

export type BriefProofMapLens = {
  id: BriefProofMapLensId
  label: string
  summary: string
  claim: string
  highlightedNodeIds: readonly BriefProofMapNodeId[]
  evidenceRefs?: readonly HirayaEvidenceItem['id'][]
  nextRoute?: Extract<HirayaRouteId, 'arch' | 'sdlc' | 'cost' | 'waf'>
}

export type BriefPlatformProofMapContent = {
  eyebrow: string
  title: string
  summary: string
  mapClaim: string
  zones: readonly BriefProofMapZone[]
  nodes: readonly BriefProofMapNode[]
  edges: readonly BriefProofMapEdge[]
  lenses: readonly BriefProofMapLens[]
}

export function getBriefPlatformProofMapContent(locale: AppLocale): BriefPlatformProofMapContent {
  return locale === 'zh-TW' ? briefPlatformProofMapContentZhTW : briefPlatformProofMapContentEn
}
