import { useNavigate } from "@tanstack/react-router"
import {
  Activity,
  BadgeCheck,
  Boxes,
  CircleDollarSign,
  Cloud,
  Eye,
  FileText,
  GitBranch,
  HeartPulse,
  Network,
  RefreshCw,
  ShieldCheck,
  Terminal,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { useCallback, useMemo, useState, type ReactNode } from "react"

import { GlobalDock } from "@/components/app/navigation/global-dock"
import { AppPageShell } from "@/components/app/layout/app-page-shell"
import {
  ExpandableActionBar,
  type ExpandableActionBarItem,
} from "@/components/motion/expandable-action-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { defaultLabLocale, type LabLocaleKey } from "@/content/labContentTypes"
import { cn } from "@/lib/utils"

type HirayaPageId = "brief" | "architecture" | "cost-analysis" | "sdlc-pipeline" | "well-architected"

type HirayaPageProps = {
  activePageId?: string
}

type HirayaNavItem = {
  id: HirayaPageId
  label: string
  shortLabel: string
  eyebrow: string
  title: string
  description: string
  icon: LucideIcon
}

const hirayaPages: HirayaNavItem[] = [
  {
    id: "brief",
    label: "Brief",
    shortLabel: "Brief",
    eyebrow: "Project overview",
    title: "Project overview",
    description: "What Hiraya proves, the operating principles, and the delivery shape of the system.",
    icon: FileText,
  },
  {
    id: "architecture",
    label: "Architecture",
    shortLabel: "Arch",
    eyebrow: "Architecture design",
    title: "Architecture design",
    description: "AWS topology, cluster boundaries, delivery chain, and runtime responsibility map.",
    icon: Network,
  },
  {
    id: "cost-analysis",
    label: "Cost analysis",
    shortLabel: "Cost",
    eyebrow: "Hardware and requirement breakdown",
    title: "Cost analysis",
    description: "Baseline hardware assumptions, environment requirements, and monthly cost posture.",
    icon: CircleDollarSign,
  },
  {
    id: "sdlc-pipeline",
    label: "SDLC pipeline",
    shortLabel: "SDLC",
    eyebrow: "CI/CD pipeline",
    title: "SDLC CI/CD pipeline",
    description: "Commit-to-cluster workflow with test, security, artifact, and GitOps gates.",
    icon: GitBranch,
  },
  {
    id: "well-architected",
    label: "AWS WAF",
    shortLabel: "WAF",
    eyebrow: "AWS Well-Architected Framework",
    title: "AWS Well-Architected echo",
    description: "How design decisions answer the AWS Well-Architected pillars.",
    icon: ShieldCheck,
  },
]

const hirayaPageIds = new Set(hirayaPages.map((page) => page.id))
const firstHirayaPage = hirayaPages[0]

function resolveHirayaPageId(pageId: string | undefined): HirayaPageId {
  return hirayaPageIds.has(pageId as HirayaPageId) ? (pageId as HirayaPageId) : firstHirayaPage.id
}

function getHirayaHref(pageId: HirayaPageId) {
  return `/hiraya/${pageId}`
}

function SectionFrame({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn("w-full min-w-0 border border-border bg-card/88 shadow-sm", className)}>
      {children}
    </section>
  )
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <div className="border-b border-border bg-muted/35 px-5 py-4">
      <p className="font-mono text-[10px] font-semibold uppercase leading-none tracking-normal text-muted-foreground">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-semibold tracking-normal text-foreground">{title}</h2>
      {description ? (
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}

function MetricTile({
  label,
  value,
  note,
}: {
  label: string
  value: string
  note: string
}) {
  return (
    <div className="border border-border bg-background/70 p-4">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tracking-normal text-foreground">{value}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{note}</p>
    </div>
  )
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <Badge
      variant="outline"
      className="rounded-full bg-background/75 px-2.5 py-1 font-mono text-[10px] uppercase tracking-normal"
    >
      {children}
    </Badge>
  )
}

function PillarCard({
  index,
  icon: Icon,
  title,
  text,
}: {
  index: string
  icon: LucideIcon
  title: string
  text: string
}) {
  return (
    <div className="group border border-border bg-card p-5 transition-colors hover:border-primary/65">
      <div className="mb-5 flex items-start justify-between gap-4">
        <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span className="font-mono text-xs text-muted-foreground/70">{index}</span>
      </div>
      <h3 className="text-base font-semibold tracking-normal text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  )
}

function Hero({ activePage }: { activePage: HirayaNavItem }) {
  const Icon = activePage.icon

  return (
    <section className="border-l-4 border-primary py-4 pl-6 sm:pl-8">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-normal">
          PROJECT_REPORT_01
        </Badge>
        <Badge
          variant="outline"
          className="rounded-full bg-card/75 px-2.5 py-1 font-mono text-[10px] uppercase tracking-normal"
        >
          STATUS: DEPLOYED_PROD
        </Badge>
        <Badge
          variant="secondary"
          className="rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-normal"
        >
          {activePage.eyebrow}
        </Badge>
      </div>
      <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="max-w-5xl text-4xl font-semibold tracking-normal text-foreground sm:text-5xl lg:text-6xl">
            Hiraya: Resilient Microservices on AWS
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
            A cloud-native e-commerce architecture grounded in GitOps, IaC, and end-to-end
            observability. Engineered for high availability and automated recovery cycles.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button className="rounded-full" size="lg">
            <Terminal className="size-4" aria-hidden="true" />
            Launch console
          </Button>
          <Button className="rounded-full" variant="outline" size="lg">
            <Icon className="size-4" aria-hidden="true" />
            {activePage.title}
          </Button>
        </div>
      </div>
    </section>
  )
}

function BriefPage() {
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <PillarCard
          index="01"
          icon={RefreshCw}
          title="Rebuildable"
          text="Terraform-driven environment parity keeps clusters disposable and restorable in minutes."
        />
        <PillarCard
          index="02"
          icon={BadgeCheck}
          title="Verifiable"
          text="Compliance checks, tests, and policy-as-code run in the pull request workflow."
        />
        <PillarCard
          index="03"
          icon={Eye}
          title="Observable"
          text="Prometheus and Grafana expose latency, traffic, errors, saturation, and release health."
        />
        <PillarCard
          index="04"
          icon={HeartPulse}
          title="Recoverable"
          text="Kubernetes probes, rolling updates, and autoscaling provide practical recovery loops."
        />
      </div>

      <SectionFrame>
        <SectionHeader
          eyebrow="Technical domain mapping"
          title="What the brief needs to prove"
          description="The Stitch reference centers the page on a compact project report. This version keeps that report shape and makes each project promise traceable to an implementation domain."
        />
        <div className="grid gap-4 p-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            ["Cloud platform", "Multi-AZ VPC, EKS, ALB ingress, Aurora storage, and flow logs.", ["AWS EKS", "VPC Flow Logs"]],
            ["Infrastructure", "Declarative Terraform modules for immutable resource provisioning and state.", ["Terraform OSS", "S3 Backend"]],
            ["CI/CD and GitOps", "GitHub Actions produces verified artifacts; Argo CD syncs declared state.", ["Argo CD", "Helm Charts"]],
            ["Observability", "Golden signals and deployment health are visible before, during, and after release.", ["Prometheus", "Grafana OSS"]],
          ].map(([title, text, tags]) => (
            <div key={title as string} className="border border-border bg-background/70 p-5">
              <h3 className="font-semibold tracking-normal text-foreground">{title as string}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text as string}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(tags as string[]).map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionFrame>
    </div>
  )
}

function ArchitecturePage() {
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <SectionFrame className="lg:col-span-8">
        <SectionHeader
          eyebrow="Service mesh topography"
          title="Runtime topology"
          description="A visible translation of the Stitch topology panel: ingress enters the VPC edge, routes to the EKS cluster, and persists against managed data services."
        />
        <div className="relative min-h-[420px] overflow-hidden p-5">
          <div className="absolute inset-0 grid-overlay opacity-55" />
          <svg className="absolute inset-0 size-full text-primary/55" aria-hidden="true">
            <line x1="22%" x2="50%" y1="28%" y2="50%" stroke="currentColor" strokeWidth="1" />
            <line x1="78%" x2="50%" y1="28%" y2="50%" stroke="currentColor" strokeWidth="1" />
            <line x1="50%" x2="50%" y1="50%" y2="78%" stroke="currentColor" strokeWidth="1" />
          </svg>
          <TopologyNode className="left-[8%] top-[18%]" label="VPC_INGRESS" title="ALB.01" />
          <TopologyNode className="right-[8%] top-[18%]" label="EDGE_POLICY" title="WAF + TLS" />
          <TopologyNode
            className="left-1/2 top-1/2 w-44 -translate-x-1/2 -translate-y-1/2 border-2 border-primary"
            label="CORE_CLUSTER"
            title="AWS EKS"
            badge="99.9% uptime target"
          />
          <TopologyNode className="bottom-[13%] left-[18%]" label="OBSERVABILITY" title="Prom/Grafana" />
          <TopologyNode className="bottom-[13%] right-[18%]" label="STORAGE" title="Aurora RDS" />
        </div>
      </SectionFrame>

      <SectionFrame className="lg:col-span-4">
        <SectionHeader eyebrow="Runtime responsibilities" title="Boundary map" />
        <div className="grid gap-3 p-5">
          {[
            ["Networking", "Private subnets, ingress routing, WAF policy, NAT egress."],
            ["Compute", "Managed EKS node groups sized for baseline and burst."],
            ["Data", "Aurora storage, backups, encryption, and least-privilege access."],
            ["Telemetry", "Metrics, traces, logs, alerts, and release annotations."],
          ].map(([title, text]) => (
            <div key={title} className="border border-border bg-background/70 p-4">
              <h3 className="text-sm font-semibold tracking-normal">{title}</h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </SectionFrame>
    </div>
  )
}

function TopologyNode({
  className,
  label,
  title,
  badge,
}: {
  className?: string
  label: string
  title: string
  badge?: string
}) {
  return (
    <div
      className={cn(
        "absolute z-10 flex min-h-24 w-36 flex-col items-center justify-center border border-primary/35 bg-card/88 p-3 text-center shadow-sm backdrop-blur",
        className,
      )}
    >
      <span className="font-mono text-[10px] font-semibold uppercase tracking-normal text-primary">{label}</span>
      <span className="mt-1 text-sm font-semibold tracking-normal text-foreground">{title}</span>
      {badge ? <Tag>{badge}</Tag> : null}
    </div>
  )
}

function CostAnalysisPage() {
  return (
    <div className="grid min-w-0 gap-6">
      <div className="grid min-w-0 gap-4 md:grid-cols-4">
        <MetricTile label="Monthly baseline" value="$486" note="Lean production estimate before traffic spikes." />
        <MetricTile label="Node group" value="3-10" note="t3.medium managed nodes with autoscaling headroom." />
        <MetricTile label="Availability" value="3 AZ" note="Sydney region spread for application and data tiers." />
        <MetricTile label="Environments" value="2+1" note="Dev and staging parity with production observability." />
      </div>

      <SectionFrame>
        <SectionHeader
          eyebrow="Hardware, requirements, cost breakdown"
          title="Cost posture by layer"
          description="The goal is an honest portfolio-grade estimate: enough infrastructure to demonstrate resilience without pretending every production enterprise control is free."
        />
        <div className="max-w-full overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-border bg-muted/35 font-mono text-[10px] uppercase tracking-normal text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-semibold">Layer</th>
                <th className="px-5 py-3 font-semibold">Requirement</th>
                <th className="px-5 py-3 font-semibold">Primary services</th>
                <th className="px-5 py-3 text-right font-semibold">Estimate</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Compute", "EKS managed nodes, autoscaling, rolling deploy capacity", "EKS, EC2, ECR", "$210"],
                ["Network", "Multi-AZ routing, private subnets, controlled egress", "VPC, ALB, NAT", "$128"],
                ["Data", "Managed relational storage, backups, encryption", "Aurora, S3", "$96"],
                ["Telemetry", "Metrics retention, dashboards, alert routing", "CloudWatch, Prometheus", "$52"],
              ].map(([layer, requirement, services, estimate]) => (
                <tr key={layer} className="border-b border-border/70">
                  <td className="px-5 py-4 font-semibold text-foreground">{layer}</td>
                  <td className="px-5 py-4 text-muted-foreground">{requirement}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      {services.split(", ").map((service) => (
                        <Tag key={service}>{service}</Tag>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right font-mono font-semibold text-foreground">{estimate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionFrame>
    </div>
  )
}

function SdlcPipelinePage() {
  const steps = [
    ["01", "Code commit", "GitHub webhook opens the CI loop with traceable change metadata.", Cloud],
    ["02", "Build and test", "Docker build, unit tests, integration checks, and coverage threshold.", Zap],
    ["03", "Security scan", "Trivy image scan, dependency review, and policy-as-code guardrails.", ShieldCheck],
    ["04", "Artifact registry", "Versioned image tags and immutable release candidates in ECR.", Boxes],
    ["05", "Argo CD sync", "Git-to-cluster reconciliation applies the declared Helm release.", GitBranch],
    ["06", "Observe release", "Deployment health, golden signals, and rollback readiness are reviewed.", Activity],
  ] as const

  return (
    <SectionFrame>
      <SectionHeader
        eyebrow="SDLC CI/CD pipeline"
        title="GitOps delivery chain"
        description="The pipeline keeps the Stitch page's delivery-chain idea, expanded into explicit SDLC gates from commit to observed runtime."
      />
      <div className="grid gap-4 p-5 lg:grid-cols-3">
        {steps.map(([number, title, text, Icon]) => (
          <div key={number} className="relative border border-border bg-background/70 p-5">
            <div className="mb-5 flex items-start justify-between gap-4">
              <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="font-mono text-xs text-muted-foreground">{number}</span>
            </div>
            <h3 className="font-semibold tracking-normal text-foreground">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-border bg-foreground p-5 text-background">
        <div className="mb-4 flex items-center gap-2">
          <span className="size-3 rounded-full bg-destructive" />
          <span className="size-3 rounded-full bg-chart-4" />
          <span className="size-3 rounded-full bg-chart-2" />
          <span className="ml-3 font-mono text-xs text-background/65">infra/main.tf - release substrate</span>
        </div>
        <pre className="overflow-x-auto font-mono text-xs leading-6 text-background/80 sm:text-sm">{`module "eks_cluster" {
  source          = "./modules/aws-eks"
  cluster_name    = "hiraya-prod-01"
  cluster_version = "1.27"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  managed_node_groups = {
    primary = {
      instance_types = ["t3.medium"]
      min_size       = 3
      max_size       = 10
    }
  }
}`}</pre>
      </div>
    </SectionFrame>
  )
}

function WellArchitectedPage() {
  const pillars = [
    ["Operational excellence", "GitOps, release annotations, dashboards, and runbooks make changes reviewable and reversible."],
    ["Security", "Least-privilege IAM, image scanning, WAF policy, private subnets, and encrypted persistence."],
    ["Reliability", "Multi-AZ design, health probes, managed node groups, autoscaling, backups, and rollback gates."],
    ["Performance efficiency", "Right-sized node groups, horizontal scaling, CDN-ready ingress, and telemetry-led tuning."],
    ["Cost optimization", "Environment tiering, small baseline capacity, autoscaling ceilings, and tagged cost layers."],
    ["Sustainability", "Elastic capacity, scheduled non-prod reductions, and feedback loops for overprovisioned services."],
  ] as const

  return (
    <SectionFrame>
      <SectionHeader
        eyebrow="AWS Well-Architected Framework"
        title="Design-decision echo"
        description="Each Hiraya decision should map back to an AWS Well-Architected concern so the portfolio reads as engineering judgment, not just tool assembly."
      />
      <div className="grid gap-4 p-5 md:grid-cols-2">
        {pillars.map(([title, text]) => (
          <div key={title} className="border border-border bg-background/70 p-5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="size-4" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-semibold tracking-normal text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionFrame>
  )
}

function HirayaPageContent({ pageId }: { pageId: HirayaPageId }) {
  switch (pageId) {
    case "architecture":
      return <ArchitecturePage />
    case "cost-analysis":
      return <CostAnalysisPage />
    case "sdlc-pipeline":
      return <SdlcPipelinePage />
    case "well-architected":
      return <WellArchitectedPage />
    case "brief":
    default:
      return <BriefPage />
  }
}

function HirayaActionBar({ activePageId }: { activePageId: HirayaPageId }) {
  const navigate = useNavigate()

  const navigateToPage = useCallback(
    (pageId: HirayaPageId) => {
      void navigate({ to: getHirayaHref(pageId) })
    },
    [navigate],
  )

  const actionItems = useMemo<ExpandableActionBarItem[]>(
    () =>
      hirayaPages.map((page) => {
        const Icon = page.icon

        return {
          id: page.id,
          label: page.shortLabel,
          icon: <Icon aria-hidden="true" />,
          active: page.id === activePageId,
          onClick: () => navigateToPage(page.id),
        }
      }),
    [activePageId, navigateToPage],
  )

  return (
    <div className="relative h-[38px] w-[194px] shrink-0">
      <ExpandableActionBar
        items={actionItems}
        activeId={activePageId}
        size="sm"
        className="absolute right-0 top-0 origin-right"
        classNames={{
          track: "min-h-[38px] rounded-xl border-border/70 bg-card/92 px-1 py-0.5 shadow-xl",
          item: "group h-8 min-w-8 px-2 text-muted-foreground hover:text-foreground disabled:text-muted-foreground/45 [&_svg]:size-3.5",
          label: "font-mono text-[11px] tracking-normal text-muted-foreground",
          shortcut: "font-mono text-[10px] tracking-normal text-muted-foreground/70",
        }}
      />
    </div>
  )
}

export function HirayaPage({ activePageId }: HirayaPageProps) {
  const [locale, setLocale] = useState<LabLocaleKey>(defaultLabLocale)
  const resolvedPageId = resolveHirayaPageId(activePageId)
  const activePage = hirayaPages.find((page) => page.id === resolvedPageId) ?? firstHirayaPage

  return (
    <AppPageShell
      dock={
        <>
          <HirayaActionBar activePageId={resolvedPageId} />
          <GlobalDock locale={locale} onLocaleChange={setLocale} isHirayaActive />
        </>
      }
      contentClassName="mx-auto flex min-h-svh w-full max-w-[1680px] flex-col gap-8 px-4 py-24 sm:px-6 lg:px-8"
    >
      <Hero activePage={activePage} />
      <HirayaPageContent pageId={resolvedPageId} />
    </AppPageShell>
  )
}
