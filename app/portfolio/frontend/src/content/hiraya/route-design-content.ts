import type { AppLocale } from '@/i18n/locales'

import { exposureBoundaryContent, type ExposureBoundaryContent } from './architectureExposureBoundaries'
import { architectureOwnershipContent, type ArchitectureOwnershipContent } from './architectureOwnership'
import {
  architectureRuntimeInteractionsContent,
  type ArchitectureRuntimeInteractionsContent,
} from './architectureRuntimeInteractions'
import { briefPlatformProofMapContent, type BriefPlatformProofMapContent } from './briefPlatformProofMap'
import { getBriefProofPathOverviewContent, type BriefProofPathCard } from './briefProofPathOverview'
import { costCapacityTradeoffLedgerContent, type CostCapacityTradeoffLedgerContent } from './costTradeoffLedger'
import { getHirayaEvidenceAssets, type HirayaEvidenceAsset } from './evidence-assets'
import { sdlcAuthorityFlowContent, type SdlcAuthorityFlowContent } from './sdlcAuthorityFlow'
import { sdlcDeliveryGuardrails, type SdlcDeliveryGuardrail } from './sdlcDeliveryGuardrails'
import { getWafMaturityJudgmentContent, type WafMaturityJudgmentContent } from './wafMaturityJudgment'

export type HirayaRouteDesignContent = {
  briefProofPathOverview: readonly BriefProofPathCard[]
  briefPlatformProofMap: BriefPlatformProofMapContent
  architectureOwnership: ArchitectureOwnershipContent
  architectureExposureBoundaries: ExposureBoundaryContent
  architectureRuntimeInteractions: ArchitectureRuntimeInteractionsContent
  costCapacityTradeoffLedger: CostCapacityTradeoffLedgerContent
  sdlcAuthorityFlow: SdlcAuthorityFlowContent
  sdlcDeliveryGuardrails: readonly SdlcDeliveryGuardrail[]
  wafMaturityJudgment: WafMaturityJudgmentContent
  evidenceAssets: readonly HirayaEvidenceAsset[]
}

export function getHirayaRouteDesignContent(locale: AppLocale): HirayaRouteDesignContent {
  return {
    briefProofPathOverview: getBriefProofPathOverviewContent(locale),
    briefPlatformProofMap: briefPlatformProofMapContent,
    architectureOwnership: architectureOwnershipContent,
    architectureExposureBoundaries: exposureBoundaryContent,
    architectureRuntimeInteractions: architectureRuntimeInteractionsContent,
    costCapacityTradeoffLedger: costCapacityTradeoffLedgerContent,
    sdlcAuthorityFlow: sdlcAuthorityFlowContent,
    sdlcDeliveryGuardrails,
    wafMaturityJudgment: getWafMaturityJudgmentContent(locale),
    evidenceAssets: getHirayaEvidenceAssets(locale),
  }
}
