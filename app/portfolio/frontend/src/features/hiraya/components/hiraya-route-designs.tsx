import type { ComponentProps, ReactNode } from 'react'
import { CheckCircle2, Play, ShieldCheck } from 'lucide-react'

import { architectureOwnershipContent } from '@/content/hiraya/architectureOwnership'
import { getHirayaEvidenceAsset } from '@/content/hiraya/evidence-assets'
import { exposureBoundaryContent } from '@/content/hiraya/exposureBoundaries'
import { sdlcAuthorityFlowContent } from '@/content/hiraya/sdlcAuthorityFlow'
import type {
  HirayaContentSection,
  HirayaEvidenceItem,
  HirayaPageContent,
  HirayaProofPoint,
  HirayaWellArchitectedPillar,
} from '@/content/hiraya/types'
import { cn } from '@/lib/utils'

import { ArchitectureOwnershipExplorer } from './architecture-ownership-explorer'
import { ExposureBoundaryMatrix } from './exposure-boundary-matrix'
import { HirayaContentTableView } from './hiraya-content-table'
import { SdlcAuthorityFlow } from './sdlc-authority-flow'
import { HirayaMetricGrid } from './hiraya-metric-grid'
import { HirayaSectionFrame, HirayaSectionHeader, HirayaTag } from './hiraya-section'

function findSection(page: HirayaPageContent, id: string) {
  return page.sections.find((section) => section.id === id)
}

function RoutePanel({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <HirayaSectionFrame className={className}>
      <HirayaSectionHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="p-5">{children}</div>
    </HirayaSectionFrame>
  )
}

function TextNode({
  code,
  title,
  body,
  tone = 'default',
}: {
  code: string
  title: string
  body: string
  tone?: 'default' | 'primary' | 'success' | 'warning'
}) {
  return (
    <article
      className={cn(
        'min-w-0 border bg-background/78 p-4',
        tone === 'primary' && 'border-primary/45 bg-primary/10',
        tone === 'success' && 'border-emerald-500/30 bg-emerald-500/10',
        tone === 'warning' && 'border-amber-500/35 bg-amber-500/10',
        tone === 'default' && 'border-border',
      )}
    >
      <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">{code}</p>
      <h3 className="mt-2 text-base font-semibold tracking-normal text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </article>
  )
}

function EvidenceRevealCard({
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
    <article
      tabIndex={0}
      className="group relative min-h-44 overflow-hidden border border-border bg-background/78 p-4 outline-none transition-colors hover:border-primary/55 focus-visible:border-primary/70 focus-visible:ring-2 focus-visible:ring-ring/30"
    >
      <div className="flex h-full flex-col justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">{evidenceId}</p>
          <h3 className="mt-2 text-base font-semibold tracking-normal text-foreground">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{summary}</p>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-normal text-primary">hover/focus for screenshot evidence</p>
      </div>

      <div className="pointer-events-none absolute inset-3 z-10 translate-y-2 border border-primary/35 bg-card/98 p-4 opacity-0 shadow-2xl transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100">
        {resolvedImageSrc ? (
          <img src={resolvedImageSrc} alt={asset?.alt ?? ''} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full content-between gap-3">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-primary">
                {asset ? `${asset.status} ${asset.kind} · ${asset.preferredUse}` : 'screenshot preview surface'}
              </p>
              {asset?.caption ? <p className="mt-2 text-xs leading-5 text-muted-foreground">{asset.caption}</p> : null}
              <div className="mt-3 grid gap-2">
                {previewLines.map((line) => (
                  <div key={line} className="flex items-center gap-2 text-xs leading-5 text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-primary" />
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-1 font-mono text-[9px] uppercase tracking-normal text-muted-foreground">
              <span className="h-2 w-3/4 bg-muted" />
              <span className="h-2 w-1/2 bg-muted" />
              <span className="h-2 w-2/3 bg-muted" />
            </div>
          </div>
        )}
      </div>
    </article>
  )
}

function EvidenceRevealGrid({
  title,
  description,
  cards,
}: {
  title: string
  description: string
  cards: Array<ComponentProps<typeof EvidenceRevealCard>>
}) {
  return (
    <RoutePanel eyebrow="Evidence" title={title} description={description}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <EvidenceRevealCard key={card.evidenceId} {...card} />
        ))}
      </div>
    </RoutePanel>
  )
}

function SectionBulletNodes({ section }: { section: HirayaContentSection }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {section.bullets?.map((bullet, index) => (
        <TextNode key={bullet} code={String(index + 1).padStart(2, '0')} title={bullet.split(':')[0] ?? section.title} body={bullet} />
      ))}
    </div>
  )
}

function BriefProofBoard({ proofPoints }: { proofPoints: readonly HirayaProofPoint[] }) {
  return (
    <RoutePanel
      eyebrow="Portfolio reading path"
      title="Make the proof visible before the visitor asks for screenshots"
      description="The non-hover state should explain the engineering claim. Hover and focus states are reserved for captured evidence only."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {proofPoints.map((proofPoint) => (
          <TextNode key={proofPoint.id} code={proofPoint.id} title={proofPoint.title} body={proofPoint.summary} tone="primary" />
        ))}
      </div>
    </RoutePanel>
  )
}

function BriefRouteDesign({ page }: { page: HirayaPageContent }) {
  const principles = findSection(page, 'operating-principles')
  const scope = findSection(page, 'platform-scope')

  return (
    <div className="grid gap-6">
      {page.metrics ? <HirayaMetricGrid metrics={page.metrics} /> : null}
      {page.proofPoints ? <BriefProofBoard proofPoints={page.proofPoints} /> : null}
      {principles ? (
        <RoutePanel eyebrow={principles.eyebrow} title={principles.title} description={principles.body}>
          <SectionBulletNodes section={principles} />
        </RoutePanel>
      ) : null}
      {scope ? (
        <RoutePanel eyebrow={scope.eyebrow} title={scope.title} description="A compact text inventory replaces broad media placeholders.">
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <SectionBulletNodes section={scope} />
            <div className="grid content-start gap-3 border border-border bg-muted/30 p-4">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">stack vocabulary</p>
              <div className="flex flex-wrap gap-2">
                {scope.tags?.map((tag) => <HirayaTag key={tag}>{tag}</HirayaTag>)}
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                The brief route should act as the executive map: what was built, which decisions matter, and where the deeper proof lives.
              </p>
            </div>
          </div>
        </RoutePanel>
      ) : null}
    </div>
  )
}

function ArchitectureRouteDesign({ page }: { page: HirayaPageContent }) {
  const network = findSection(page, 'network-architecture')
  const ingress = findSection(page, 'ingress-path')
  const services = findSection(page, 'microservices')
  const ops = findSection(page, 'secrets-observability')

  return (
    <div className="grid gap-6">
      <ArchitectureOwnershipExplorer content={architectureOwnershipContent} />
      <ExposureBoundaryMatrix content={exposureBoundaryContent} />
      {page.metrics ? <HirayaMetricGrid metrics={page.metrics} /> : null}
      {network?.table ? (
        <RoutePanel eyebrow={network.eyebrow} title={network.title} description={network.body}>
          <HirayaContentTableView table={network.table} />
        </RoutePanel>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        {ingress ? (
          <RoutePanel eyebrow={ingress.eyebrow} title={ingress.title} description={ingress.body}>
            <SectionBulletNodes section={ingress} />
          </RoutePanel>
        ) : null}
        {ops ? (
          <RoutePanel eyebrow={ops.eyebrow} title={ops.title}>
            <SectionBulletNodes section={ops} />
          </RoutePanel>
        ) : null}
      </div>
      {services?.table ? (
        <RoutePanel eyebrow={services.eyebrow} title={services.title}>
          <HirayaContentTableView table={services.table} />
        </RoutePanel>
      ) : null}
      <EvidenceRevealGrid
        title="Screenshots stay behind hover states"
        description="Architecture remains readable as text; console screenshots appear only when the visitor asks for proof."
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

function CostBar({ label, value, note, percent }: { label: string; value: string; note: string; percent: number }) {
  return (
    <div className="grid gap-2 border border-border bg-background/78 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-foreground">{label}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{note}</p>
        </div>
        <span className="font-mono text-xs font-semibold text-primary">{value}</span>
      </div>
      <div className="h-2 overflow-hidden bg-muted">
        <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

function CostRouteDesign({ page }: { page: HirayaPageContent }) {
  const runtime = findSection(page, 'runtime-selection')
  const capacity = findSection(page, 'capacity-risk')
  const decision = findSection(page, 'capacity-decision')
  const drivers = findSection(page, 'cost-drivers')
  const estimate = findSection(page, 'monthly-estimate')

  return (
    <div className="grid gap-6">
      {page.metrics ? <HirayaMetricGrid metrics={page.metrics} /> : null}
      <RoutePanel eyebrow="Cost model" title="Make the trade-off visible instead of cheap-sounding" description={page.thesis}>
        <div className="grid gap-4 lg:grid-cols-2">
          <CostBar label="EKS control plane" value="~$73" note="The fixed platform cost that proves managed Kubernetes." percent={100} />
          <CostBar label="NAT Gateway" value="~$45-55+" note="Private-node egress convenience with a visible monthly floor." percent={72} />
          <CostBar label="Spot workers" value="~$35-45" note="Lower compute spend, but pod density and replacement headroom matter." percent={58} />
          <CostBar label="Shared ALB edge" value="~$18-25" note="One ingress path avoids one LoadBalancer per service." percent={34} />
        </div>
      </RoutePanel>
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        {capacity?.table ? (
          <RoutePanel eyebrow={capacity.eyebrow} title={capacity.title} description={capacity.body}>
            <div className="mb-5 border border-amber-500/30 bg-amber-500/10 p-4">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-amber-700 dark:text-amber-300">pod slots</p>
              <div className="mt-3 h-3 overflow-hidden bg-background">
                <div className="h-full bg-amber-500" style={{ width: '82.35%' }} />
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">42 of 51 pod slots are already used; two t3.medium nodes would not fit the current workload.</p>
            </div>
            <HirayaContentTableView table={capacity.table} />
          </RoutePanel>
        ) : null}
        {decision ? (
          <RoutePanel eyebrow={decision.eyebrow} title={decision.title}>
            <SectionBulletNodes section={decision} />
          </RoutePanel>
        ) : null}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        {runtime ? (
          <RoutePanel eyebrow={runtime.eyebrow} title={runtime.title}>
            <SectionBulletNodes section={runtime} />
          </RoutePanel>
        ) : null}
        {drivers ? (
          <RoutePanel eyebrow={drivers.eyebrow} title={drivers.title} description={drivers.body}>
            <SectionBulletNodes section={drivers} />
          </RoutePanel>
        ) : null}
      </div>
      {estimate?.table ? (
        <RoutePanel eyebrow={estimate.eyebrow} title={estimate.title} description={estimate.body}>
          <HirayaContentTableView table={estimate.table} />
        </RoutePanel>
      ) : null}
      <EvidenceRevealGrid
        title="Cost proof without always-on console imagery"
        description="Financial screenshots appear as evidence overlays, while the default page remains an analysis board."
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
  const rules = findSection(page, 'core-decisions')
  const layers = findSection(page, 'infrastructure-layers')
  const video = page.mediaSlots?.find((slot) => slot.id === 'delivery-video-embed')

  return (
    <div className="grid gap-6">
      <SdlcAuthorityFlow content={sdlcAuthorityFlowContent} />
      {video ? (
        <RoutePanel eyebrow="Single demo video" title={video.title} description={video.description}>
          <div className="grid gap-4 border border-primary/35 bg-primary/10 p-5 lg:grid-cols-[auto_1fr_auto] lg:items-center">
            <span className="grid size-14 place-items-center rounded-full bg-primary text-primary-foreground">
              <Play className="size-7" aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold text-foreground">One recording should carry the complete delivery proof.</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Use the authority flow above to decompose the video into validation, artifact, promotion, reconciliation, infrastructure, and rollback decisions.</p>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {video.evidenceRefs?.map((ref) => <HirayaTag key={ref}>{ref}</HirayaTag>)}
            </div>
          </div>
        </RoutePanel>
      ) : null}
      {rules ? (
        <RoutePanel eyebrow={rules.eyebrow} title={rules.title}>
          <SectionBulletNodes section={rules} />
        </RoutePanel>
      ) : null}
      {layers?.table ? (
        <RoutePanel eyebrow={layers.eyebrow} title={layers.title} description={layers.body}>
          <HirayaContentTableView table={layers.table} />
        </RoutePanel>
      ) : null}
      <EvidenceRevealGrid
        title="Pipeline screenshots are hover proof, not the default component"
        description="Each delivery stage can reveal its concrete workflow evidence without turning the page into a gallery."
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

function PillarReviewCard({ pillar }: { pillar: HirayaWellArchitectedPillar }) {
  return (
    <article className="group grid gap-4 border border-border bg-background/78 p-5 transition-colors hover:border-primary/55">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">{pillar.id}</p>
          <h3 className="mt-1 text-lg font-semibold tracking-normal text-foreground">{pillar.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{pillar.stance}</p>
        </div>
      </div>
      <div className="grid gap-2">
        {pillar.highlights.map((highlight) => (
          <div key={highlight} className="flex gap-2 text-sm leading-6 text-muted-foreground">
            <CheckCircle2 className="mt-1 size-3.5 shrink-0 text-primary" aria-hidden="true" />
            <span>{highlight}</span>
          </div>
        ))}
      </div>
      {pillar.futureHardening ? (
        <div className="border border-dashed border-border bg-card/55 p-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">future hardening</p>
          <ul className="mt-2 grid gap-1">
            {pillar.futureHardening.map((item) => <li key={item} className="text-xs leading-5 text-muted-foreground">{item}</li>)}
          </ul>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {pillar.tools.map((tool) => <HirayaTag key={tool}>{tool}</HirayaTag>)}
      </div>
    </article>
  )
}

function WafRouteDesign({ page }: { page: HirayaPageContent }) {
  const purpose = findSection(page, 'pillar-purpose')

  return (
    <div className="grid gap-6">
      {purpose ? (
        <RoutePanel eyebrow={purpose.eyebrow} title={purpose.title} description={purpose.body}>
          <div className="grid gap-4 md:grid-cols-3">
            <TextNode code="strong-now" title="What is strong now" body="Reviewable IaC, GitOps convergence, OIDC, IRSA, externalized secrets, and observable service health." tone="success" />
            <TextNode code="dev-tradeoff" title="Intentional dev trade-offs" body="Public demo surfaces, single NAT, Spot nodes, low replica counts, and non-blocking advisory scans keep the environment affordable and demonstrable." tone="warning" />
            <TextNode code="harden-next" title="Production hardening path" body="Restrict access, rotate secrets, scale replicas, add autoscaling, enforce gates, and use evidence to right-size." tone="primary" />
          </div>
        </RoutePanel>
      ) : null}
      {page.pillars ? (
        <RoutePanel eyebrow="Six-pillar review" title="Translate implementation details into engineering judgment" description={page.thesis}>
          <div className="grid gap-4 xl:grid-cols-2">
            {page.pillars.map((pillar) => <PillarReviewCard key={pillar.id} pillar={pillar} />)}
          </div>
        </RoutePanel>
      ) : null}
      <EvidenceRevealGrid
        title="Pillar evidence appears only when inspecting a claim"
        description="The framework stays text-led; screenshots support the claim on hover/focus."
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
      return <WafRouteDesign page={page} />
    default:
      return null
  }
}
