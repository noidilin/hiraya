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
  default: (await import('@/features/lab/slides/cicd')).AiAcceleratorTakeawaySlideVisual,
}))
const BenefitEvidencePathSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd')).BenefitEvidencePathSlideVisual,
}))
const ChapterTakeawaySlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd')).ChapterTakeawaySlideVisual,
}))
const DeliveryRecoveryMetricsSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd')).DeliveryRecoveryMetricsSlideVisual,
}))
const DurationBreakdownSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd')).DurationBreakdownSlideVisual,
}))
const MetricConstellationSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd')).MetricConstellationSlideVisual,
}))
const EvidenceChainSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd')).EvidenceChainSlideVisual,
}))
const ReleaseHealthFrameSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd')).ReleaseHealthFrameSlideVisual,
}))
const SecurityAuditConfidenceSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd')).SecurityAuditConfidenceSlideVisual,
}))
const SecurityEvidenceGatesSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd')).SecurityEvidenceGatesSlideVisual,
}))
const SuggestionEvidenceDecisionSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd')).SuggestionEvidenceDecisionSlideVisual,
}))
const TrustEfficiencyMetricsSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd')).TrustEfficiencyMetricsSlideVisual,
}))
const AiDeliveryLoopOrbitSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd')).AiDeliveryLoopOrbitSlideVisual,
}))
const DeliveryLoopComparisonSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd')).DeliveryLoopComparisonSlideVisual,
}))
const ReleaseOperationsLoopSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd')).ReleaseOperationsLoopSlideVisual,
}))
const SimpleVsProductionRealitySlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd')).SimpleVsProductionRealitySlideVisual,
}))
const SixStageLoopSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd')).SixStageLoopSlideVisual,
}))
const TrustedPipelinePathSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd')).TrustedPipelinePathSlideVisual,
}))
const AffectedServiceGraphSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd')).AffectedServiceGraphSlideVisual,
}))
const AiArchitectureReviewSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd')).AiArchitectureReviewSlideVisual,
}))
const ArchitectureToPipelineMappingSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd')).ArchitectureToPipelineMappingSlideVisual,
}))
const ArtifactToRuntimeMapSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd')).ArtifactToRuntimeMapSlideVisual,
}))
const CoupledValidationModelSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd')).CoupledValidationModelSlideVisual,
}))
const OperatingModelComparisonSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd')).OperatingModelComparisonSlideVisual,
}))
const PermissionLanesSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd')).PermissionLanesSlideVisual,
}))
const QualitativeChecklistSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd')).QualitativeChecklistSlideVisual,
}))
const ResponsibilityAuthorityMapSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd')).ResponsibilityAuthorityMapSlideVisual,
}))
const SystemFitFrameSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd')).SystemFitFrameSlideVisual,
}))
const SystemSkillMapSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd')).SystemSkillMapSlideVisual,
}))
const AiAssistedChangeFunnelSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd')).AiAssistedChangeFunnelSlideVisual,
}))
const OptimizationAssistantPanelSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd')).OptimizationAssistantPanelSlideVisual,
}))
const SpeedTrustBalanceSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd')).SpeedTrustBalanceSlideVisual,
}))
const TradeoffFrameSlideVisual = lazy(async () => ({
  default: (await import('@/features/lab/slides/cicd')).TradeoffFrameSlideVisual,
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
