import type { AppLocale } from '@/i18n/locales'

import { architectureOwnershipContentEn } from './architectureOwnership.en'
import { architectureOwnershipContentZhTW } from './architectureOwnership.zh-TW'
import type { HirayaRouteId } from './types'

export type ArchitectureOwnershipBoundaryId =
  | 'delivery-authority'
  | 'aws-foundation'
  | 'cluster-platform'
  | 'public-edge'
  | 'application-runtime'
  | 'observation'

export type ArchitectureOwnershipInternalLayer = {
  id: string
  label: string
  brief: string
}

export type ArchitectureOwnershipBoundary = {
  id: ArchitectureOwnershipBoundaryId
  label: string
  shortLabel: string
  primaryOwner: string
  supportingMechanisms: readonly string[]
  layers: readonly ArchitectureOwnershipInternalLayer[]
  responsibility: string
  decision: string
  doesNotOwn: readonly string[]
}

export type ArchitectureOwnershipConnector = {
  from: ArchitectureOwnershipBoundaryId
  to: ArchitectureOwnershipBoundaryId
  label: string
}

export type ArchitectureOwnershipChrome = {
  eyebrow: string
  boundaryStackLabel: string
  ownerLabel: string
  selectedBoundaryLabel: string
  primaryOwnerLabel: string
  responsibilityLabel: string
  designDecisionLabel: string
  ownedLayersLabel: string
  supportingMechanismsLabel: string
  doesNotOwnLabel: string
  boundaryStackAriaSuffix: string
}

export type ArchitectureOwnershipContent = {
  routeId: Extract<HirayaRouteId, 'arch'>
  title: string
  summary: string
  chrome: ArchitectureOwnershipChrome
  boundaries: readonly ArchitectureOwnershipBoundary[]
  connectors: readonly ArchitectureOwnershipConnector[]
}

export function getArchitectureOwnershipContent(locale: AppLocale): ArchitectureOwnershipContent {
  return locale === 'zh-TW' ? architectureOwnershipContentZhTW : architectureOwnershipContentEn
}
