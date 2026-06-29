import type { ComponentType } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AiAssistanceOrbit } from '@/features/lab/visuals/ai-assistance-orbit'
import { ComparisonFrame } from '@/features/lab/visuals/comparison-frame'
import { ConceptScene } from '@/features/lab/visuals/concept-scene'
import { EvidenceChain } from '@/features/lab/visuals/evidence-chain'
import { FlowNodeReference } from '@/features/lab/visuals/flow'
import { MetricConstellation } from '@/features/lab/visuals/metric-constellation'
import { PipelineFlowGraph } from '@/features/lab/visuals/pipeline-flow-graph'
import { PresentationShell } from '@/features/lab/visuals/presentation-shell'
import {
  AffectedServiceGraphPrimitive,
  AiAcceleratorTakeawayPrimitive,
  AiArchitectureReviewPrimitive,
  AiBoundaryPrimitive,
  DurationBreakdownPrimitive,
  EvidenceChainPrimitive,
  OptimizationAssistantPrimitive,
  PermissionLanesPrimitive,
  SecurityEvidenceGatesPrimitive,
  SixStageLoopPrimitive,
} from '@/features/lab/visuals/primitive-kit'
import { ResponsibilityLanes } from '@/features/lab/visuals/responsibility-lanes'
import { SkillSystemMap } from '@/features/lab/visuals/skill-system-map'
import { StatusTokensPanel } from '@/features/lab/visuals/status-tokens-panel'
import { TrustFunnel } from '@/features/lab/visuals/trust-funnel'
import { BackgroundField } from '@/components/app/layout/background-field'

type VisualReference = {
  id: string
  name: string
  source: string
  category: string
  Component: ComponentType<{ className?: string }>
  wide?: boolean
}

const visualReferences: VisualReference[] = [
  {
    id: 'presentation-shell',
    name: 'Presentation Shell',
    source: 'visuals/presentation-shell',
    category: 'Frame',
    Component: PresentationShell,
    wide: true,
  },
  {
    id: 'concept-scene',
    name: 'Concept Scene',
    source: 'visuals/concept-scene',
    category: 'Frame',
    Component: ConceptScene,
  },
  {
    id: 'comparison-frame',
    name: 'Comparison Frame',
    source: 'visuals/comparison-frame',
    category: 'Compare',
    Component: ComparisonFrame,
    wide: true,
  },
  {
    id: 'pipeline-flow-graph',
    name: 'Pipeline Flow Graph',
    source: 'visuals/pipeline-flow-graph',
    category: 'Flow',
    Component: PipelineFlowGraph,
    wide: true,
  },
  {
    id: 'flow-node-kit',
    name: 'Flow Node Kit',
    source: 'visuals/flow/flow-node-kit',
    category: 'Flow',
    Component: FlowNodeReference,
    wide: true,
  },
  {
    id: 'skill-system-map',
    name: 'Skill System Map',
    source: 'visuals/skill-system-map',
    category: 'Map',
    Component: SkillSystemMap,
    wide: true,
  },
  {
    id: 'evidence-chain',
    name: 'Evidence Chain',
    source: 'visuals/evidence-chain',
    category: 'Evidence',
    Component: EvidenceChain,
    wide: true,
  },
  {
    id: 'metric-constellation',
    name: 'Metric Constellation',
    source: 'visuals/metric-constellation',
    category: 'Metrics',
    Component: MetricConstellation,
  },
  {
    id: 'trust-funnel',
    name: 'Trust Funnel',
    source: 'visuals/trust-funnel',
    category: 'Trust',
    Component: TrustFunnel,
  },
  {
    id: 'responsibility-lanes',
    name: 'Responsibility Lanes',
    source: 'visuals/responsibility-lanes',
    category: 'Ownership',
    Component: ResponsibilityLanes,
    wide: true,
  },
  {
    id: 'status-tokens-panel',
    name: 'Status Tokens Panel',
    source: 'visuals/status-tokens-panel',
    category: 'Status',
    Component: StatusTokensPanel,
  },
  {
    id: 'ai-assistance-orbit',
    name: 'AI Assistance Orbit',
    source: 'visuals/ai-assistance-orbit',
    category: 'AI',
    Component: AiAssistanceOrbit,
  },
  {
    id: 'six-stage-loop-primitive',
    name: 'Six Stage Loop Primitive',
    source: 'visuals/primitive-kit',
    category: 'Primitive',
    Component: SixStageLoopPrimitive,
  },
  {
    id: 'evidence-chain-primitive',
    name: 'Evidence Chain Primitive',
    source: 'visuals/primitive-kit',
    category: 'Primitive',
    Component: EvidenceChainPrimitive,
    wide: true,
  },
  {
    id: 'permission-lanes-primitive',
    name: 'Permission Lanes Primitive',
    source: 'visuals/primitive-kit',
    category: 'Primitive',
    Component: PermissionLanesPrimitive,
    wide: true,
  },
  {
    id: 'affected-service-graph-primitive',
    name: 'Affected Service Graph Primitive',
    source: 'visuals/primitive-kit',
    category: 'Primitive',
    Component: AffectedServiceGraphPrimitive,
  },
  {
    id: 'duration-breakdown-primitive',
    name: 'Duration Breakdown Primitive',
    source: 'visuals/primitive-kit',
    category: 'Primitive',
    Component: DurationBreakdownPrimitive,
    wide: true,
  },
  {
    id: 'ai-boundary-primitive',
    name: 'AI Boundary Primitive',
    source: 'visuals/primitive-kit',
    category: 'Primitive',
    Component: AiBoundaryPrimitive,
    wide: true,
  },
  {
    id: 'ai-architecture-review-primitive',
    name: 'AI Architecture Review Primitive',
    source: 'visuals/primitive-kit',
    category: 'Primitive',
    Component: AiArchitectureReviewPrimitive,
    wide: true,
  },
  {
    id: 'optimization-assistant-primitive',
    name: 'Optimization Assistant Primitive',
    source: 'visuals/primitive-kit',
    category: 'Primitive',
    Component: OptimizationAssistantPrimitive,
    wide: true,
  },
  {
    id: 'security-evidence-gates-primitive',
    name: 'Security Evidence Gates Primitive',
    source: 'visuals/primitive-kit',
    category: 'Primitive',
    Component: SecurityEvidenceGatesPrimitive,
    wide: true,
  },
  {
    id: 'ai-accelerator-takeaway-primitive',
    name: 'AI Accelerator Takeaway Primitive',
    source: 'visuals/primitive-kit',
    category: 'Primitive',
    Component: AiAcceleratorTakeawayPrimitive,
    wide: true,
  },
]

export function VisualReferenceGallery() {
  return (
    <>
      <BackgroundField />
      <main className="mx-auto grid w-full max-w-[1680px] gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 border-b border-border/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <Badge
              variant="outline"
              className="rounded-sm border-primary/30 bg-accent px-2 font-mono text-[10px] font-semibold uppercase tracking-normal text-primary"
            >
              Visual References
            </Badge>
            <h1 className="mt-3 text-2xl font-semibold leading-tight tracking-normal text-foreground sm:text-3xl">
              Lab Visual Component References
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Reusable primitives and reference components from `src/features/lab/visuals/`.
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="w-fit rounded-sm">
            <Link to="/">
              <ArrowLeft aria-hidden="true" className="size-4" />
              Deck
            </Link>
          </Button>
        </header>

        <section
          aria-label="Visual reference previews"
          className="grid auto-rows-fr gap-4 lg:grid-cols-2 xl:grid-cols-3"
        >
          {visualReferences.map((reference) => {
            const Preview = reference.Component

            return (
              <article
                key={reference.id}
                aria-labelledby={`${reference.id}-title`}
                className={[
                  'grid min-w-0 gap-3 rounded-lg border border-border/80 bg-card/65 p-3 shadow-none ring-1 ring-border/45 backdrop-blur-md',
                  reference.wide ? 'xl:col-span-2' : '',
                ].join(' ')}
              >
                <header className="flex min-w-0 items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h2 id={`${reference.id}-title`} className="truncate text-sm font-semibold leading-5">
                      {reference.name}
                    </h2>
                    <p className="truncate font-mono text-[10px] leading-4 text-muted-foreground">
                      {reference.source}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="h-6 shrink-0 rounded-sm border-border bg-background px-2 font-mono text-[9px] font-semibold uppercase tracking-normal text-muted-foreground"
                  >
                    {reference.category}
                  </Badge>
                </header>
                <div className="min-h-[14rem] min-w-0">
                  <Preview className="h-full min-h-[14rem]" />
                </div>
              </article>
            )
          })}
        </section>
      </main>
    </>
  )
}
