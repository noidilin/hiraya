import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, MonitorPlay, PlayCircle } from 'lucide-react'
import {
  Carousel,
  CarouselContent,
  CarouselIndicator,
  CarouselItem,
} from '@/components/motion-primitives/carousel'
import { getHirayaEvidenceAsset, type HirayaEvidenceAsset, type HirayaEvidenceDisplayAsset } from '@/content/hiraya/evidence-assets'
import type { HirayaRouteDesignContent } from '@/content/hiraya/route-design-content'
import type { HirayaEvidenceItem, HirayaMediaSlot, HirayaPageContent } from '@/content/hiraya/types'

import { ArchitectureExposureBoundaryMatrix } from './architecture-exposure-boundary-matrix'
import { ArchitectureOwnershipExplorer } from './architecture-ownership-explorer'
import { ArchitectureRuntimeInteractionExplorer } from './architecture-runtime-interaction-explorer'
import { BriefPlatformProofMap } from './brief-platform-proof-map'
import { BriefProofPathOverview } from './brief-proof-path-overview'
import { CostCapacityTradeoffLedger } from './cost-capacity-tradeoff-ledger'
import { SdlcDeliveryGuardrailBoard } from './sdlc-delivery-guardrail-board'
import { SdlcAuthorityFlow } from './sdlc-authority-flow'
import { WafMaturityJudgmentBoard } from './waf-maturity-judgment-board'
import { HirayaMetricGrid } from './hiraya-metric-grid'

type EvidenceCarouselRequest = {
  evidenceId: HirayaEvidenceItem['id']
  previewLines: readonly string[]
}

type EvidenceCarouselSlide = {
  evidence: HirayaEvidenceAsset
  asset: HirayaEvidenceDisplayAsset
  assetIndex: number
  assetCount: number
  previewLines: readonly string[]
}

function getYouTubeEmbedUrl(slot: HirayaMediaSlot): string | undefined {
  if (slot.externalEmbedId) {
    return `https://www.youtube-nocookie.com/embed/${slot.externalEmbedId}`
  }

  if (!slot.externalUrl) {
    return undefined
  }

  try {
    const url = new URL(slot.externalUrl)
    if (url.hostname === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0]
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : undefined
    }

    if (url.hostname.endsWith('youtube.com')) {
      const id = url.searchParams.get('v') ?? url.pathname.split('/').filter(Boolean).at(-1)
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : undefined
    }
  } catch {
    return undefined
  }

  return undefined
}

function getEvidenceSlides(cards: readonly EvidenceCarouselRequest[], evidenceAssets: readonly HirayaEvidenceAsset[]): EvidenceCarouselSlide[] {
  return cards.flatMap((card) => {
    const evidence = getHirayaEvidenceAsset(card.evidenceId, evidenceAssets)

    if (!evidence) {
      return []
    }

    return evidence.assets.map((asset, index) => ({
      evidence,
      asset,
      assetIndex: index,
      assetCount: evidence.assets.length,
      previewLines: card.previewLines,
    }))
  })
}

function EvidenceCarouselCard({ slide }: { slide: EvidenceCarouselSlide }) {
  const { t } = useTranslation()
  const { evidence, asset, assetIndex, assetCount, previewLines } = slide
  const assetSrc = asset.status === 'ready' ? asset.src : undefined
  const statusLabel = `${t(`hiraya.evidence.status.${asset.status}`)} ${t(`hiraya.evidence.kind.${asset.kind}`)} · ${assetIndex + 1}/${assetCount}`
  const frameLabel = t(`hiraya.evidence.frame.${asset.kind}`)
  const mediaAlt = asset.alt ?? `${evidence.title}: ${asset.title}`

  return (
    <article className="grid min-w-0 gap-4 lg:grid-cols-[minmax(10rem,0.24fr)_minmax(0,0.76fr)] lg:items-stretch">
      <div className="grid min-w-0 content-start gap-3 lg:py-3 lg:pr-2">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-primary">{evidence.evidenceId}</p>
          <h3 className="mt-2 text-lg font-semibold tracking-normal text-foreground">{asset.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{asset.caption}</p>
        </div>
        <p className="border-l-2 border-primary pl-3 text-xs leading-5 text-muted-foreground">{evidence.caption}</p>
        <div className="grid gap-2">
          {previewLines.map((line) => (
            <div key={line} className="flex items-center gap-2 text-xs leading-5 text-muted-foreground">
              <span className="size-1.5 shrink-0 rounded-full bg-primary" />
              <span>{line}</span>
            </div>
          ))}
        </div>
        <p className="w-fit border border-border bg-card px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">
          {statusLabel}
        </p>
      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-primary/25 bg-card shadow-2xl shadow-primary/10">
        <div className="flex items-center gap-1.5 border-b border-border bg-muted/60 px-3 py-2">
          <span className="size-2 rounded-full bg-red-400/80" />
          <span className="size-2 rounded-full bg-amber-400/80" />
          <span className="size-2 rounded-full bg-emerald-400/80" />
          <span className="ml-2 truncate font-mono text-[9px] uppercase tracking-normal text-muted-foreground">
            {frameLabel}
          </span>
        </div>
        <div className="bg-background" style={{ aspectRatio: asset.aspectRatio ?? (asset.kind === 'video' ? '16 / 9' : '1935 / 1352') }}>
          {assetSrc && asset.kind === 'screenshot' ? (
            <img src={assetSrc} alt={mediaAlt} loading="lazy" className="h-full w-full object-contain" />
          ) : assetSrc && asset.kind === 'video' ? (
            <video controls playsInline preload="metadata" className="h-full w-full bg-black object-contain" aria-label={mediaAlt}>
              <source src={assetSrc} type={asset.mimeType ?? 'video/mp4'} />
            </video>
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
  evidenceAssets,
}: {
  title: string
  description: string
  cards: readonly EvidenceCarouselRequest[]
  evidenceAssets: readonly HirayaEvidenceAsset[]
}) {
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)
  const slides = getEvidenceSlides(cards, evidenceAssets)
  const activeSlide = slides[activeIndex] ?? slides[0]

  if (!slides.length) {
    return null
  }

  return (
    <section className="min-w-0 overflow-hidden border-l-4 border-primary/70 py-4 pl-6 sm:pl-8">
      <Carousel index={activeIndex} onIndexChange={setActiveIndex} className="mx-auto w-full max-w-full" disableDrag={false}>
        <div className="grid min-w-0 max-w-full gap-5 overflow-hidden">
          <div className="grid min-w-0 max-w-full gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
            <header className="max-w-5xl">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary/80">{t('hiraya.evidence.eyebrow')}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">{title}</h2>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">{description}</p>
            </header>
            <div className="flex min-w-0 max-w-full flex-wrap items-center gap-3 xl:justify-end">
              <p className="inline-flex h-9 min-w-0 max-w-full items-center truncate rounded-xl border border-border bg-card/75 px-3 font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">
                {activeIndex + 1}/{slides.length} · {activeSlide?.evidence.evidenceId} · {activeSlide ? `${activeSlide.assetIndex + 1}/${activeSlide.assetCount}` : '0/0'}
              </p>
              <div className="inline-flex h-9 items-center gap-3 rounded-xl border border-border bg-card/75 px-1.5 shadow-sm">
                <button
                  type="button"
                  aria-label={t('hiraya.evidence.previous')}
                  disabled={activeIndex === 0}
                  onClick={() => setActiveIndex((index) => Math.max(0, index - 1))}
                  className="grid size-7 place-items-center rounded-[10px] bg-transparent text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground disabled:opacity-30"
                >
                  <ChevronLeft className="size-3.5" aria-hidden="true" />
                </button>
                <CarouselIndicator className="static w-auto" classNameButton="size-1.5 data-[active=true]:bg-primary/80" />
                <button
                  type="button"
                  aria-label={t('hiraya.evidence.next')}
                  disabled={activeIndex + 1 === slides.length}
                  onClick={() => setActiveIndex((index) => Math.min(slides.length - 1, index + 1))}
                  className="grid size-7 place-items-center rounded-[10px] bg-transparent text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground disabled:opacity-30"
                >
                  <ChevronRight className="size-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
          <CarouselContent className="min-w-0 max-w-full items-stretch py-1">
            {slides.map((slide) => (
              <CarouselItem key={`${slide.evidence.evidenceId}:${slide.asset.id}`} className="basis-full max-w-full px-1">
                <div className="p-1">
                  <EvidenceCarouselCard slide={slide} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>
      </Carousel>
    </section>
  )
}

function BriefVideoEvidence({
  slots,
}: {
  slots?: readonly HirayaMediaSlot[]
}) {
  const { t } = useTranslation()
  const videoSlot = slots?.find((slot) => slot.type === 'intro-video')
  const youtubeEmbedUrl = videoSlot ? getYouTubeEmbedUrl(videoSlot) : undefined
  const proofStages = t('hiraya.evidence.briefVideo.stages', { returnObjects: true }) as string[]
  const statusLabel = videoSlot
    ? `${t(`hiraya.mediaSlots.status.${videoSlot.status}`)} · ${t('hiraya.evidence.briefVideo.youtubeBadge')}`
    : t('hiraya.evidence.briefVideo.youtubeBadge')

  if (!videoSlot) {
    return null
  }

  return (
    <section className="border-l-4 border-primary/70 py-4 pl-6 sm:pl-8">
      <div className="grid gap-5">
        <header className="max-w-5xl">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary/80">{t('hiraya.evidence.eyebrow')}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">{videoSlot.title}</h2>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">{videoSlot.description}</p>
        </header>

        <article className="grid gap-5 lg:grid-cols-[minmax(16rem,0.34fr)_minmax(0,0.66fr)] lg:items-stretch">
          <div className="grid content-start gap-4 lg:py-3 lg:pr-4">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-primary">{videoSlot.id}</p>
              <h3 className="mt-2 text-lg font-semibold tracking-normal text-foreground">
                {t('hiraya.evidence.briefVideo.title')}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {t('hiraya.evidence.briefVideo.fallbackCaption')}
              </p>
            </div>

            <div className="grid gap-2">
              {proofStages.map((stage) => (
                <div key={stage} className="flex items-center gap-2 text-xs leading-5 text-muted-foreground">
                  <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{stage}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {videoSlot.evidenceRefs?.map((ref) => (
                <span
                  key={ref}
                  className="rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground"
                >
                  {ref}
                </span>
              ))}
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-normal text-primary">
                {statusLabel}
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-primary/25 bg-card shadow-2xl shadow-primary/10">
            <div className="flex items-center gap-1.5 border-b border-border bg-muted/60 px-3 py-2">
              <span className="size-2 rounded-full bg-red-400/80" />
              <span className="size-2 rounded-full bg-amber-400/80" />
              <span className="size-2 rounded-full bg-emerald-400/80" />
              <span className="ml-2 truncate font-mono text-[9px] uppercase tracking-normal text-muted-foreground">
                {t('hiraya.evidence.briefVideo.frameLabel')}
              </span>
            </div>
            <div className="aspect-video bg-background">
              {youtubeEmbedUrl ? (
                <iframe
                  src={youtubeEmbedUrl}
                  title={videoSlot.title}
                  className="h-full w-full bg-black"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                />
              ) : (
                <div className="relative grid h-full place-items-center overflow-hidden p-6 text-center">
                  <div className="absolute inset-0 grid-overlay opacity-45" />
                  <div className="relative z-10 grid max-w-md justify-items-center gap-4">
                    <span className="grid size-16 place-items-center rounded-full border border-primary/30 bg-primary/10 text-primary shadow-lg shadow-primary/10">
                      <PlayCircle className="size-8" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-primary/80">
                        {t('hiraya.evidence.briefVideo.missingTitle')}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {t('hiraya.evidence.briefVideo.missingDescription')}
                      </p>
                      <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs leading-5 text-amber-800 dark:text-amber-200">
                        {t('hiraya.evidence.briefVideo.workInProgressNotice')}
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-normal text-muted-foreground">
                        <MonitorPlay className="size-3" aria-hidden="true" />
                        {t('hiraya.evidence.briefVideo.walkthroughBadge')}
                      </span>
                      <span className="rounded-full border border-border bg-card/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-normal text-muted-foreground">
                        {t('hiraya.evidence.briefVideo.routeAnchorBadge')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}

function BriefRouteDesign({ page, content }: { page: HirayaPageContent; content: HirayaRouteDesignContent }) {
  return (
    <div className="grid gap-6">
      <BriefProofPathOverview cards={content.briefProofPathOverview} />
      <BriefPlatformProofMap content={content.briefPlatformProofMap} />
      <BriefVideoEvidence slots={page.mediaSlots} />
    </div>
  )
}

function ArchitectureRouteDesign({ page, content }: { page: HirayaPageContent; content: HirayaRouteDesignContent }) {
  const { t } = useTranslation()
  const previews = t('hiraya.evidence.carousels.architecture.previews', { returnObjects: true }) as Record<string, string[]>

  return (
    <div className="grid gap-6">
      {page.metrics ? <HirayaMetricGrid metrics={page.metrics} /> : null}
      <ArchitectureOwnershipExplorer content={content.architectureOwnership} />
      <ArchitectureExposureBoundaryMatrix content={content.architectureExposureBoundaries} />
      <ArchitectureRuntimeInteractionExplorer content={content.architectureRuntimeInteractions} />
      <EvidenceCarousel
        title={t('hiraya.evidence.carousels.architecture.title')}
        description={t('hiraya.evidence.carousels.architecture.description')}
        evidenceAssets={content.evidenceAssets}
        cards={[
          {
            evidenceId: 'p0-public-ingress',
            previewLines: previews.publicIngress,
          },
          {
            evidenceId: 'p0-argocd-app-of-apps',
            previewLines: previews.appOfApps,
          },
        ]}
      />
    </div>
  )
}

function CostRouteDesign({ page, content }: { page: HirayaPageContent; content: HirayaRouteDesignContent }) {
  const { t } = useTranslation()
  const previews = t('hiraya.evidence.carousels.cost.previews', { returnObjects: true }) as Record<string, string[]>

  return (
    <div className="grid gap-6">
      {page.metrics ? <HirayaMetricGrid metrics={page.metrics} /> : null}
      <CostCapacityTradeoffLedger
        title={content.costCapacityTradeoffLedger.title}
        summary={content.costCapacityTradeoffLedger.summary}
        tabs={content.costCapacityTradeoffLedger.tabs}
        chrome={content.costCapacityTradeoffLedger.chrome}
        tradeoffs={content.costCapacityTradeoffLedger.tradeoffs}
        estimateRows={content.costCapacityTradeoffLedger.estimateRows}
        capacity={content.costCapacityTradeoffLedger.capacity}
      />
      <EvidenceCarousel
        title={t('hiraya.evidence.carousels.cost.title')}
        description={t('hiraya.evidence.carousels.cost.description')}
        evidenceAssets={content.evidenceAssets}
        cards={[
          {
            evidenceId: 'p2-cost-destroy-workflow',
            previewLines: previews.destroyWorkflow,
          },
        ]}
      />
    </div>
  )
}

function SdlcRouteDesign({ page, content }: { page: HirayaPageContent; content: HirayaRouteDesignContent }) {
  const { t } = useTranslation()
  const previews = t('hiraya.evidence.carousels.sdlc.previews', { returnObjects: true }) as Record<string, string[]>

  return (
    <div className="grid min-w-0 gap-6 overflow-hidden">
      {page.metrics ? <HirayaMetricGrid metrics={page.metrics} /> : null}
      <SdlcAuthorityFlow content={content.sdlcAuthorityFlow} />
      <SdlcDeliveryGuardrailBoard content={content.sdlcDeliveryGuardrails} authorityFlow={content.sdlcAuthorityFlow} />
      <EvidenceCarousel
        title={t('hiraya.evidence.carousels.sdlc.title')}
        description={t('hiraya.evidence.carousels.sdlc.description')}
        evidenceAssets={content.evidenceAssets}
        cards={[
          {
            evidenceId: 'p0-cicd-delivery-flow',
            previewLines: previews.deliveryFlow,
          },
          {
            evidenceId: 'p1-rollback-path',
            previewLines: previews.rollbackPath,
          },
          {
            evidenceId: 'p0-infra-approval-gate',
            previewLines: previews.infraApproval,
          },
        ]}
      />
    </div>
  )
}

function WafRouteDesign({ page, content }: { page: HirayaPageContent; content: HirayaRouteDesignContent }) {
  const { t } = useTranslation()
  const previews = t('hiraya.evidence.carousels.waf.previews', { returnObjects: true }) as Record<string, string[]>

  return (
    <div className="grid gap-6">
      {page.metrics ? <HirayaMetricGrid metrics={page.metrics} /> : null}
      <WafMaturityJudgmentBoard content={content.wafMaturityJudgment} />
      <EvidenceCarousel
        title={content.wafMaturityJudgment.chrome.evidenceCarouselTitle}
        description={content.wafMaturityJudgment.chrome.evidenceCarouselDescription}
        evidenceAssets={content.evidenceAssets}
        cards={[
          {
            evidenceId: 'p1-secrets',
            previewLines: previews.secrets,
          },
          {
            evidenceId: 'p1-grafana',
            previewLines: previews.grafana,
          },
          {
            evidenceId: 'p2-cost-destroy-workflow',
            previewLines: previews.destroyWorkflow,
          },
        ]}
      />
    </div>
  )
}

export function HirayaRouteDesign({ page, content }: { page: HirayaPageContent; content: HirayaRouteDesignContent }) {
  switch (page.id) {
    case 'brief':
      return <BriefRouteDesign page={page} content={content} />
    case 'arch':
      return <ArchitectureRouteDesign page={page} content={content} />
    case 'cost':
      return <CostRouteDesign page={page} content={content} />
    case 'sdlc':
      return <SdlcRouteDesign page={page} content={content} />
    case 'waf':
      return <WafRouteDesign page={page} content={content} />
    default:
      return null
  }
}
