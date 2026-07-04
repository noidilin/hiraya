import { useState, type ComponentProps } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Carousel,
  CarouselContent,
  CarouselIndicator,
  CarouselItem,
} from '@/components/motion-primitives/carousel'
import { architectureOwnershipContent } from '@/content/hiraya/architectureOwnership'
import { architectureRuntimeInteractionsContent } from '@/content/hiraya/architectureRuntimeInteractions'
import { briefPlatformProofMapContent } from '@/content/hiraya/briefPlatformProofMap'
import { getBriefProofPathOverviewContent } from '@/content/hiraya/briefProofPathOverview'
import { costCapacityTradeoffLedgerContent } from '@/content/hiraya/costTradeoffLedger'
import { getHirayaEvidenceAsset } from '@/content/hiraya/evidence-assets'
import { exposureBoundaryContent } from '@/content/hiraya/exposureBoundaries'
import { sdlcAuthorityFlowContent } from '@/content/hiraya/sdlcAuthorityFlow'
import { sdlcDeliveryGuardrails } from '@/content/hiraya/sdlcDeliveryGuardrails'
import { wafMaturityJudgmentContent } from '@/content/hiraya/wafMaturityJudgment'
import type { HirayaEvidenceItem, HirayaPageContent } from '@/content/hiraya/types'
import { normalizeAppLocale } from '@/i18n/locales'

import { ArchitectureOwnershipExplorer } from './architecture-ownership-explorer'
import { ArchitectureRuntimeInteractionExplorer } from './architecture-runtime-interaction-explorer'
import { BriefPlatformProofMap } from './brief-platform-proof-map'
import { BriefProofPathOverview } from './brief-proof-path-overview'
import { CostCapacityTradeoffLedger } from './cost-capacity-tradeoff-ledger'
import { ExposureBoundaryMatrix } from './exposure-boundary-matrix'
import { SdlcDeliveryGuardrailBoard } from './sdlc-delivery-guardrail-board'
import { SdlcAuthorityFlow } from './sdlc-authority-flow'
import { WafMaturityJudgmentBoard } from './waf-maturity-judgment-board'
import { HirayaMediaSlotGrid } from './hiraya-media-slot'
import { HirayaMetricGrid } from './hiraya-metric-grid'

function EvidenceCarouselCard({
  evidenceId,
  title,
  summary,
  previewLines,
  imageSrc,
}: {
  evidenceId: HirayaEvidenceItem['id']
  title: string
  summary: string
  previewLines: readonly string[]
  imageSrc?: string
}) {
  const asset = getHirayaEvidenceAsset(evidenceId)
  const resolvedImageSrc = imageSrc ?? asset?.src

  return (
    <article className="grid gap-5 lg:grid-cols-[minmax(16rem,0.36fr)_minmax(0,0.64fr)] lg:items-stretch">
      <div className="grid content-start gap-4 lg:py-3 lg:pr-4">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-primary">{evidenceId}</p>
          <h3 className="mt-2 text-lg font-semibold tracking-normal text-foreground">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{summary}</p>
        </div>
        {asset?.caption ? <p className="border-l-2 border-primary pl-3 text-xs leading-5 text-muted-foreground">{asset.caption}</p> : null}
        <div className="grid gap-2">
          {previewLines.map((line) => (
            <div key={line} className="flex items-center gap-2 text-xs leading-5 text-muted-foreground">
              <span className="size-1.5 shrink-0 rounded-full bg-primary" />
              <span>{line}</span>
            </div>
          ))}
        </div>
        <p className="w-fit border border-border bg-card px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">
          {asset ? `${asset.status} ${asset.kind}` : 'screenshot evidence'}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-primary/25 bg-card shadow-2xl shadow-primary/10">
        <div className="flex items-center gap-1.5 border-b border-border bg-muted/60 px-3 py-2">
          <span className="size-2 rounded-full bg-red-400/80" />
          <span className="size-2 rounded-full bg-amber-400/80" />
          <span className="size-2 rounded-full bg-emerald-400/80" />
          <span className="ml-2 truncate font-mono text-[9px] uppercase tracking-normal text-muted-foreground">MacBook Pro 14-inch capture frame · 1512 × 982</span>
        </div>
        <div className="aspect-[1512/982] bg-background">
          {resolvedImageSrc ? (
            <img src={resolvedImageSrc} alt={asset?.alt ?? title} loading="lazy" className="h-full w-full object-contain" />
          ) : (
            <div className="grid h-full content-between gap-4 p-5">
              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="h-3 w-36 bg-primary/35" />
                  <span className="h-3 w-24 bg-muted" />
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <span className="h-16 border border-border bg-muted/50" />
                  <span className="h-16 border border-border bg-muted/50" />
                  <span className="h-16 border border-border bg-muted/50" />
                </div>
              </div>
              <div className="grid gap-2">
                <span className="h-3 w-5/6 bg-muted" />
                <span className="h-3 w-2/3 bg-muted" />
                <span className="h-3 w-3/4 bg-muted" />
              </div>
              <div className="grid gap-2 sm:grid-cols-[1fr_0.62fr]">
                <span className="h-28 border border-primary/25 bg-primary/10" />
                <span className="h-28 border border-border bg-muted/40" />
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

function EvidenceCarousel({
  title,
  description,
  cards,
}: {
  title: string
  description: string
  cards: Array<ComponentProps<typeof EvidenceCarouselCard>>
}) {
  const [activeIndex, setActiveIndex] = useState(0)

  const activeCard = cards[activeIndex] ?? cards[0]

  return (
    <section className="border-l-4 border-primary/70 py-4 pl-6 sm:pl-8">
      <Carousel index={activeIndex} onIndexChange={setActiveIndex} className="mx-auto w-full" disableDrag={false}>
        <div className="grid gap-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <header className="max-w-5xl">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary/80">Evidence</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">{title}</h2>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">{description}</p>
            </header>
            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <p className="rounded-full border border-border bg-card/75 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">
                {activeIndex + 1}/{cards.length} · {activeCard?.evidenceId}
              </p>
              <div className="flex items-center gap-3 rounded-full border border-border bg-card/75 px-2 py-1 shadow-sm">
                <button
                  type="button"
                  aria-label="Previous evidence"
                  disabled={activeIndex === 0}
                  onClick={() => setActiveIndex((index) => Math.max(0, index - 1))}
                  className="rounded-full bg-transparent p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground disabled:opacity-30"
                >
                  <ChevronLeft className="size-3.5" aria-hidden="true" />
                </button>
                <CarouselIndicator className="static w-auto" classNameButton="size-1.5 data-[active=true]:bg-primary/80" />
                <button
                  type="button"
                  aria-label="Next evidence"
                  disabled={activeIndex + 1 === cards.length}
                  onClick={() => setActiveIndex((index) => Math.min(cards.length - 1, index + 1))}
                  className="rounded-full bg-transparent p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground disabled:opacity-30"
                >
                  <ChevronRight className="size-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
          <CarouselContent className="items-stretch py-1">
            {cards.map((card) => (
              <CarouselItem key={card.evidenceId} className="basis-full px-1">
                <div className="p-1">
                  <EvidenceCarouselCard {...card} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>
      </Carousel>
    </section>
  )
}

function BriefRouteDesign({ page }: { page: HirayaPageContent }) {
  const { i18n } = useTranslation()
  const locale = normalizeAppLocale(i18n.resolvedLanguage) ?? 'en'
  const overviewCards = getBriefProofPathOverviewContent(locale)

  return (
    <div className="grid gap-6">
      <BriefProofPathOverview cards={overviewCards} />
      <BriefPlatformProofMap content={briefPlatformProofMapContent} />
      {page.mediaSlots ? <HirayaMediaSlotGrid slots={page.mediaSlots} /> : null}
    </div>
  )
}

function ArchitectureRouteDesign({ page }: { page: HirayaPageContent }) {
  return (
    <div className="grid gap-6">
      {page.metrics ? <HirayaMetricGrid metrics={page.metrics} /> : null}
      <ArchitectureOwnershipExplorer content={architectureOwnershipContent} />
      <ExposureBoundaryMatrix content={exposureBoundaryContent} />
      <ArchitectureRuntimeInteractionExplorer content={architectureRuntimeInteractionsContent} />
      <EvidenceCarousel
        title="Evidence behind the architecture decisions"
        description="Each capture anchors one architecture claim without turning the page into a detached screenshot gallery."
        cards={[
          {
            evidenceId: 'p0-public-ingress',
            title: 'Ingress, DNS, and TLS',
            summary: 'Route 53, ALB target health, Gateway/HTTPRoute status, certificate, and storefront smoke evidence.',
            previewLines: ['Route 53 records', 'ALB target group health', 'Browser TLS and /api smoke test'],
          },
          {
            evidenceId: 'p0-argocd-app-of-apps',
            title: 'GitOps resource tree',
            summary: 'Argo CD root application, child app health, and owned Kubernetes resources.',
            previewLines: ['Root app Synced/Healthy', 'Platform child applications', 'Vintage resource tree'],
          },
          {
            evidenceId: 'p1-private-workloads',
            title: 'Private workload boundary',
            summary: 'Private subnets, ClusterIP services, security groups, and controlled egress evidence.',
            previewLines: ['Private node group subnets', 'ClusterIP services', 'NAT and route table evidence'],
          },
        ]}
      />
    </div>
  )
}

function CostRouteDesign({ page }: { page: HirayaPageContent }) {
  return (
    <div className="grid gap-6">
      {page.metrics ? <HirayaMetricGrid metrics={page.metrics} /> : null}
      <CostCapacityTradeoffLedger
        title={costCapacityTradeoffLedgerContent.title}
        summary={costCapacityTradeoffLedgerContent.summary}
        tradeoffs={costCapacityTradeoffLedgerContent.tradeoffs}
        estimateRows={costCapacityTradeoffLedgerContent.estimateRows}
        capacity={costCapacityTradeoffLedgerContent.capacity}
      />
      <EvidenceCarousel
        title="Evidence behind the cost decisions"
        description="Financial proof stays close to the trade-off analysis, one operational capture at a time."
        cards={[
          {
            evidenceId: 'p2-cost-destroy-workflow',
            title: 'Destroy workflow as governance',
            summary: 'Typed confirmation, GitOps prune, PVC/EBS cleanup, platform destroy, and console cleanup proof.',
            previewLines: ['Destroy workflow run', 'Terraform destroy logs', 'AWS console cleanup check'],
          },
          {
            evidenceId: 'p1-private-workloads',
            title: 'Capacity and node group evidence',
            summary: 'kubectl node/pod density and managed node group sizing evidence.',
            previewLines: ['kubectl pod density', 'Managed node group sizing', 'Scheduling headroom'],
          },
        ]}
      />
    </div>
  )
}

function SdlcRouteDesign({ page }: { page: HirayaPageContent }) {
  return (
    <div className="grid gap-6">
      {page.metrics ? <HirayaMetricGrid metrics={page.metrics} /> : null}
      <SdlcAuthorityFlow content={sdlcAuthorityFlowContent} />
      <SdlcDeliveryGuardrailBoard guardrails={sdlcDeliveryGuardrails} authorityFlow={sdlcAuthorityFlowContent} />
      <EvidenceCarousel
        title="Evidence behind the delivery loop"
        description="Pipeline captures sit beside the SDLC model so each delivery stage has concrete proof."
        cards={[
          {
            evidenceId: 'p0-cicd-delivery-flow',
            title: 'End-to-end delivery',
            summary: 'PR checks, image publishing, promotion PR, Argo CD sync, rollout, and smoke verification.',
            previewLines: ['GitHub Actions checks', 'ECR image push + scan', 'Argo CD sync + smoke test'],
          },
          {
            evidenceId: 'p1-rollback-path',
            title: 'Rollback through GitOps',
            summary: 'Rollback uses an image-tag manifest PR and Argo CD reconciliation instead of manual patching.',
            previewLines: ['Target image verification', 'Rollback PR diff', 'Post-rollback smoke test'],
          },
          {
            evidenceId: 'p0-infra-approval-gate',
            title: 'Infrastructure approval gate',
            summary: 'High-permission Terraform operations are separated from normal application delivery.',
            previewLines: ['Terraform plan', 'Environment approval', 'Platform smoke result'],
          },
        ]}
      />
    </div>
  )
}

function WafRouteDesign() {
  return (
    <div className="grid gap-6">
      <WafMaturityJudgmentBoard content={wafMaturityJudgmentContent} />
      <EvidenceCarousel
        title="Evidence behind the Well-Architected review"
        description="The pillar review stays judgment-led while captures support one implementation claim at a time."
        cards={[
          {
            evidenceId: 'p1-secrets',
            title: 'Security evidence',
            summary: 'Secrets Manager, ExternalSecret readiness, and Kubernetes secret materialization without exposing values.',
            previewLines: ['Secrets Manager list', 'ExternalSecret Ready', 'No secret values shown'],
          },
          {
            evidenceId: 'p1-grafana',
            title: 'Operations evidence',
            summary: 'Grafana dashboard and Prometheus-backed service health for release feedback.',
            previewLines: ['Request rate', 'Response time', 'Pod CPU/memory'],
          },
          {
            evidenceId: 'p2-cost-destroy-workflow',
            title: 'Cost governance evidence',
            summary: 'Destroyable dev environment and cleanup proof for non-production spend control.',
            previewLines: ['Destroy workflow', 'PVC/EBS cleanup', 'EKS/VPC/ALB removed'],
          },
        ]}
      />
    </div>
  )
}

export function HirayaRouteDesign({ page }: { page: HirayaPageContent }) {
  switch (page.id) {
    case 'brief':
      return <BriefRouteDesign page={page} />
    case 'arch':
      return <ArchitectureRouteDesign page={page} />
    case 'cost':
      return <CostRouteDesign page={page} />
    case 'sdlc':
      return <SdlcRouteDesign page={page} />
    case 'waf':
      return <WafRouteDesign />
    default:
      return null
  }
}
