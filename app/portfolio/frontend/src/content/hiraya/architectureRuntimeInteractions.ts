import type { AppLocale } from '@/i18n/locales'

import { architectureRuntimeInteractionsContentEn } from './architectureRuntimeInteractions.en'
import { architectureRuntimeInteractionsContentZhTW } from './architectureRuntimeInteractions.zh-TW'
import type { HirayaRouteId } from './types'

export type ArchitectureRuntimeTabId = 'request-paths' | 'service-boundaries' | 'secret-materialization'

export type ArchitectureRuntimeFact = {
  label: string
  value: string
  note: string
}

export type RuntimePathStage = {
  id: string
  label: string
  boundary: 'public-internet' | 'public-edge' | 'application-runtime' | 'private-data'
  mechanism: string
  description: string
}

export type RuntimeRequestExample = {
  id: string
  label: string
  path: string
  stages: readonly string[]
  claim: string
}

export type RuntimeServiceBoundary = {
  id: string
  name: string
  status: 'active' | 'legacy' | 'data' | 'platform-support'
  responsibility: string
  kubernetesType: string
  port?: string
  exposure: string
  participatesIn: readonly string[]
  notes?: string
}

export type SecretMaterializationStep = {
  id: string
  label: string
  owner: string
  mechanism: string
  explanation: string
  sourceRef?: string
}

export type ArchitectureRuntimeChrome = {
  eyebrow: string
  tabs: Record<Exclude<ArchitectureRuntimeTabId, 'service-boundaries'>, string>
  statusLabels: Record<RuntimeServiceBoundary['status'], string>
  serviceBoundaryDefaultContext: string
  frontendBoundaryContext: string
  kubernetesLabel: string
  portLabel: string
  exposureLabel: string
  notApplicableLabel: string
  requestGraphEyebrow: string
  requestGraphKicker: string
  requestGraphTitle: string
  requestGraphDescription: string
  secretGraphEyebrow: string
  secretGraphKicker: string
  secretGraphTitle: string
  secretGraphDescription: string
  nonClaimsEyebrow: string
  nonClaimsTitle: string
}

export type ArchitectureRuntimeInteractionsContent = {
  routeId: Extract<HirayaRouteId, 'arch'>
  title: string
  summary: string
  chrome: ArchitectureRuntimeChrome
  defaultTabId: ArchitectureRuntimeTabId
  facts: readonly ArchitectureRuntimeFact[]
  requestPaths: {
    title: string
    summary: string
    stages: readonly RuntimePathStage[]
    examples: readonly RuntimeRequestExample[]
  }
  serviceBoundaries: {
    title: string
    summary: string
    services: readonly RuntimeServiceBoundary[]
  }
  secretMaterialization: {
    title: string
    summary: string
    steps: readonly SecretMaterializationStep[]
    nonClaims: readonly string[]
  }
}

export function getArchitectureRuntimeInteractionsContent(locale: AppLocale): ArchitectureRuntimeInteractionsContent {
  return locale === 'zh-TW' ? architectureRuntimeInteractionsContentZhTW : architectureRuntimeInteractionsContentEn
}
