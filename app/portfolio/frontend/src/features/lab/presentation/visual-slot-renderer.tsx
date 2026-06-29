import { lazy, Suspense, type ComponentType, type LazyExoticComponent, type ReactNode } from 'react'

import {
  defaultLabLocale,
  resolveLabLocaleContent,
  type LabLocaleKey,
  type LabVisualSlotKey,
} from '@/content/labContentTypes'
import { labPresentationUiContent, labVisualSlotContent } from '@/content/labVisualContent'
import { cn } from '@/lib/utils'

import { VisualPlaceholder } from './visual-placeholder'

type VisualComponent = LazyExoticComponent<ComponentType<{ className?: string }>>

type VisualSlotRendererProps = {
  visualSlot: LabVisualSlotKey
  stage2Notes?: string
  locale?: LabLocaleKey
  footer?: ReactNode
}

const AiAcceleratorTakeawaySlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd/33-ai-accelerator-takeaway')).AiAcceleratorTakeawaySlideVisual,
}))
const BenefitEvidencePathSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd/05-benefit-evidence-path')).BenefitEvidencePathSlideVisual,
}))
const ChapterTakeawaySlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd/07-chapter-takeaway')).ChapterTakeawaySlideVisual,
}))
const DeliveryRecoveryMetricsSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd/23-delivery-recovery-metrics')).DeliveryRecoveryMetricsSlideVisual,
}))
const DurationBreakdownSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd/22-duration-breakdown')).DurationBreakdownSlideVisual,
}))
const MetricConstellationSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd/26-metric-constellation')).MetricConstellationSlideVisual,
}))
const EvidenceChainSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd/17-evidence-chain')).EvidenceChainSlideVisual,
}))
const ReleaseHealthFrameSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd/21-release-health-frame')).ReleaseHealthFrameSlideVisual,
}))
const SecurityAuditConfidenceSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd/25-security-audit-confidence')).SecurityAuditConfidenceSlideVisual,
}))
const SecurityEvidenceGatesSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd/31-security-evidence-gates')).SecurityEvidenceGatesSlideVisual,
}))
const SuggestionEvidenceDecisionSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd/32-suggestion-evidence-decision')).SuggestionEvidenceDecisionSlideVisual,
}))
const TrustEfficiencyMetricsSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd/24-trust-efficiency-metrics')).TrustEfficiencyMetricsSlideVisual,
}))
const AiDeliveryLoopOrbitSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd/27-ai-delivery-loop-orbit')).AiDeliveryLoopOrbitSlideVisual,
}))
const DeliveryLoopComparisonSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd/01-delivery-loop-comparison')).DeliveryLoopComparisonSlideVisual,
}))
const ReleaseOperationsLoopSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd/16-release-operations-loop')).ReleaseOperationsLoopSlideVisual,
}))
const SimpleVsProductionRealitySlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd/06-simple-vs-production-reality')).SimpleVsProductionRealitySlideVisual,
}))
const SixStageLoopSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd/04-six-stage-loop')).SixStageLoopSlideVisual,
}))
const TrustedPipelinePathSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd/02-trusted-pipeline-path')).TrustedPipelinePathSlideVisual,
}))
const AffectedServiceGraphSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd/11-affected-service-graph')).AffectedServiceGraphSlideVisual,
}))
const AiArchitectureReviewSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd/28-ai-architecture-review')).AiArchitectureReviewSlideVisual,
}))
const ArchitectureToPipelineMappingSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd/09-architecture-to-pipeline-mapping')).ArchitectureToPipelineMappingSlideVisual,
}))
const ArtifactToRuntimeMapSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd/13-artifact-to-runtime-map')).ArtifactToRuntimeMapSlideVisual,
}))
const CoupledValidationModelSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd/10-coupled-validation-model')).CoupledValidationModelSlideVisual,
}))
const OperatingModelComparisonSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd/12-operating-model-comparison')).OperatingModelComparisonSlideVisual,
}))
const PermissionLanesSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd/14-permission-lanes')).PermissionLanesSlideVisual,
}))
const QualitativeChecklistSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd/18-qualitative-checklist')).QualitativeChecklistSlideVisual,
}))
const ResponsibilityAuthorityMapSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd/30-responsibility-authority-map')).ResponsibilityAuthorityMapSlideVisual,
}))
const SystemFitFrameSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd/19-system-fit-frame')).SystemFitFrameSlideVisual,
}))
const SystemSkillMapSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd/08-system-skill-map')).SystemSkillMapSlideVisual,
}))
const AiAssistedChangeFunnelSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd/03-ai-assisted-change-funnel')).AiAssistedChangeFunnelSlideVisual,
}))
const OptimizationAssistantPanelSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd/29-optimization-assistant-panel')).OptimizationAssistantPanelSlideVisual,
}))
const SpeedTrustBalanceSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd/15-speed-trust-balance')).SpeedTrustBalanceSlideVisual,
}))
const TradeoffFrameSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd/20-tradeoff-frame')).TradeoffFrameSlideVisual,
}))

const visualSlotComponents: Partial<Record<LabVisualSlotKey, VisualComponent>> = {
  'delivery-loop-comparison': DeliveryLoopComparisonSlideVisual,
  'trusted-pipeline-path': TrustedPipelinePathSlideVisual,
  'ai-assisted-change-funnel': AiAssistedChangeFunnelSlideVisual,
  'six-stage-loop': SixStageLoopSlideVisual,
  'benefit-evidence-path': BenefitEvidencePathSlideVisual,
  'simple-vs-production-reality': SimpleVsProductionRealitySlideVisual,
  'chapter-takeaway': ChapterTakeawaySlideVisual,
  'system-skill-map': SystemSkillMapSlideVisual,
  'architecture-to-pipeline-mapping': ArchitectureToPipelineMappingSlideVisual,
  'coupled-validation-model': CoupledValidationModelSlideVisual,
  'affected-service-graph': AffectedServiceGraphSlideVisual,
  'operating-model-comparison': OperatingModelComparisonSlideVisual,
  'artifact-to-runtime-map': ArtifactToRuntimeMapSlideVisual,
  'permission-lanes': PermissionLanesSlideVisual,
  'speed-trust-balance': SpeedTrustBalanceSlideVisual,
  'release-operations-loop': ReleaseOperationsLoopSlideVisual,
  'evidence-chain': EvidenceChainSlideVisual,
  'qualitative-checklist': QualitativeChecklistSlideVisual,
  'system-fit-frame': SystemFitFrameSlideVisual,
  'tradeoff-frame': TradeoffFrameSlideVisual,
  'release-health-frame': ReleaseHealthFrameSlideVisual,
  'duration-breakdown': DurationBreakdownSlideVisual,
  'delivery-recovery-metrics': DeliveryRecoveryMetricsSlideVisual,
  'trust-efficiency-metrics': TrustEfficiencyMetricsSlideVisual,
  'security-audit-confidence': SecurityAuditConfidenceSlideVisual,
  'metric-constellation': MetricConstellationSlideVisual,
  'ai-delivery-loop-orbit': AiDeliveryLoopOrbitSlideVisual,
  'ai-architecture-review': AiArchitectureReviewSlideVisual,
  'optimization-assistant-panel': OptimizationAssistantPanelSlideVisual,
  'responsibility-authority-map': ResponsibilityAuthorityMapSlideVisual,
  'security-evidence-gates': SecurityEvidenceGatesSlideVisual,
  'suggestion-evidence-decision': SuggestionEvidenceDecisionSlideVisual,
  'ai-accelerator-takeaway': AiAcceleratorTakeawaySlideVisual,
}

export function VisualSlotRenderer({
  visualSlot,
  stage2Notes,
  locale = defaultLabLocale,
  footer,
}: VisualSlotRendererProps) {
  const SlotComponent = visualSlotComponents[visualSlot]
  const visualContent = resolveLabLocaleContent(labVisualSlotContent[visualSlot], locale)
  const uiContent = resolveLabLocaleContent(labPresentationUiContent, locale)
  const visualShellClassName = 'min-h-[40rem] md:min-h-[34rem] md:h-[calc(100svh-12rem)] md:max-h-[56rem]'

  if (!SlotComponent) {
    return (
      <div className="relative min-w-0" aria-label={visualContent.ariaLabel}>
        <VisualPlaceholder
          visualSlot={visualSlot}
          stage2Notes={stage2Notes}
          locale={locale}
          visualContent={visualContent}
          className={visualShellClassName}
        />
        {footer ? <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20">{footer}</div> : null}
      </div>
    )
  }

  return (
    <div className="relative min-w-0" aria-label={visualContent.ariaLabel}>
      <Suspense
        fallback={
          <VisualPlaceholder
            visualSlot={visualSlot}
            stage2Notes={uiContent.visualLoadingLabel}
            locale={locale}
            visualContent={visualContent}
            className={visualShellClassName}
          />
        }
      >
        <SlotComponent className={cn(visualShellClassName)} />
      </Suspense>
      {footer ? <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20">{footer}</div> : null}
    </div>
  )
}
