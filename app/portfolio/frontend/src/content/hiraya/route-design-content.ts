import type { AppLocale } from '@/i18n/locales'

import { getExposureBoundaryContent, type ExposureBoundaryContent } from './architectureExposureBoundaries'
import { getArchitectureOwnershipContent, type ArchitectureOwnershipContent } from './architectureOwnership'
import {
  getArchitectureRuntimeInteractionsContent,
  type ArchitectureRuntimeInteractionsContent,
} from './architectureRuntimeInteractions'
import { getBriefPlatformProofMapContent, type BriefPlatformProofMapContent } from './briefPlatformProofMap'
import { getBriefProofPathOverviewContent, type BriefProofPathCard } from './briefProofPathOverview'
import { getCostCapacityTradeoffLedgerContent, type CostCapacityTradeoffLedgerContent } from './costTradeoffLedger'
import { getHirayaEvidenceAssets, type HirayaEvidenceAsset } from './evidence-assets'
import { getSdlcAuthorityFlowContent, type SdlcAuthorityFlowContent } from './sdlcAuthorityFlow'
import { getSdlcDeliveryGuardrailContent, type SdlcDeliveryGuardrailBoardContent } from './sdlcDeliveryGuardrails'
import { getWafMaturityJudgmentContent, type WafMaturityJudgmentContent } from './wafMaturityJudgment'

export type HirayaRouteDesignContent = {
  briefProofPathOverview: readonly BriefProofPathCard[]
  briefPlatformProofMap: BriefPlatformProofMapContent
  architectureOwnership: ArchitectureOwnershipContent
  architectureExposureBoundaries: ExposureBoundaryContent
  architectureRuntimeInteractions: ArchitectureRuntimeInteractionsContent
  costCapacityTradeoffLedger: CostCapacityTradeoffLedgerContent
  sdlcAuthorityFlow: SdlcAuthorityFlowContent
  sdlcDeliveryGuardrails: SdlcDeliveryGuardrailBoardContent
  wafMaturityJudgment: WafMaturityJudgmentContent
  evidenceAssets: readonly HirayaEvidenceAsset[]
}

export function getHirayaRouteDesignContent(locale: AppLocale): HirayaRouteDesignContent {
  return {
    briefProofPathOverview: getBriefProofPathOverviewContent(locale),
    briefPlatformProofMap: getBriefPlatformProofMapContent(locale),
    architectureOwnership: getArchitectureOwnershipContent(locale),
    architectureExposureBoundaries: getExposureBoundaryContent(locale),
    architectureRuntimeInteractions: getArchitectureRuntimeInteractionsContent(locale),
    costCapacityTradeoffLedger: getCostCapacityTradeoffLedgerContent(locale),
    sdlcAuthorityFlow: getSdlcAuthorityFlowContent(locale),
    sdlcDeliveryGuardrails: getSdlcDeliveryGuardrailContent(locale),
    wafMaturityJudgment: getWafMaturityJudgmentContent(locale),
    evidenceAssets: getHirayaEvidenceAssets(locale),
  }
}
