import type { HirayaEvidenceItem, HirayaRouteId } from './types'

export type WafMaturityState = 'strong-now' | 'dev-tradeoff' | 'harden-next'

export type WafMaturityItem = {
  id: string
  state: WafMaturityState
  title: string
  summary: string
  evidenceRefs?: readonly HirayaEvidenceItem['id'][]
  sourceRefs: readonly string[]
}

export type WafMaturityPillar = {
  id:
    | 'operational-excellence'
    | 'security'
    | 'reliability'
    | 'performance-efficiency'
    | 'cost-optimization'
    | 'sustainability'
  title: string
  stance: string
  switcherSummary: string
  priorityRecommendation: string
  strongNow: readonly WafMaturityItem[]
  devTradeoffs: readonly WafMaturityItem[]
  hardenNext: readonly WafMaturityItem[]
  tools: readonly string[]
}

export type WafMaturityJudgmentContent = {
  routeId: Extract<HirayaRouteId, 'waf'>
  eyebrow: string
  title: string
  summary: string
  pillars: readonly WafMaturityPillar[]
}

export const wafMaturityJudgmentContent: WafMaturityJudgmentContent = {
  routeId: 'waf',
  eyebrow: 'Well-Architected Maturity Judgment',
  title: 'Separate proven strengths, accepted dev trade-offs, and hardening path',
  summary:
    'Hiraya uses the six pillars as a judgment board: each row shows what is demonstrably strong now, which limitation is intentionally accepted for a disposable dev platform, and what would need hardening before production.',
  pillars: [
    {
      id: 'operational-excellence',
      title: 'Operational Excellence',
      stance:
        'Operations are strongest where changes are reviewable, GitOps-owned, observable, and recoverable through repeatable workflows.',
      switcherSummary: 'How changes are operated, verified, and recovered.',
      priorityRecommendation: 'Expand incident signals',
      strongNow: [
        {
          id: 'ops-gitops-delivery-loop',
          state: 'strong-now',
          title: 'Reviewable delivery loop',
          summary:
            'Terraform, GitHub Actions, Argo CD, smoke tests, and rollback workflows make normal change and recovery paths visible.',
          evidenceRefs: ['p0-cicd-delivery-flow', 'p0-argocd-app-of-apps', 'p1-rollback-path'],
          sourceRefs: ['docs/portfolio/ARCHITECTURE.md', 'app/portfolio/frontend/docs/presentation-en.md'],
        },
      ],
      devTradeoffs: [
        {
          id: 'ops-dev-evidence-scope',
          state: 'dev-tradeoff',
          title: 'Evidence first, not full ops platform',
          summary:
            'The current operations story emphasizes GitOps health, smoke checks, and Grafana rather than full incident automation or log ingestion.',
          sourceRefs: ['docs/portfolio/ARCHITECTURE.md', 'docs/portfolio/DECISIONS.md'],
        },
      ],
      hardenNext: [
        {
          id: 'ops-harden-incident-signals',
          state: 'harden-next',
          title: 'Expand operational signals',
          summary:
            'Reintroduce deliberate log ingestion, alert routing, runbooks, and stronger incident evidence before claiming production operations maturity.',
          evidenceRefs: ['p1-grafana'],
          sourceRefs: ['docs/portfolio/ARCHITECTURE.md'],
        },
      ],
      tools: ['Terraform', 'GitHub Actions', 'Argo CD', 'Prometheus', 'Grafana'],
    },
    {
      id: 'security',
      title: 'Security',
      stance:
        'Security is strongest where Hiraya narrows automation credentials, centralizes public ingress, and keeps secrets outside Git.',
      switcherSummary: 'How access, exposure, and secrets are controlled.',
      priorityRecommendation: 'Tighten privileged access',
      strongNow: [
        {
          id: 'security-identity-boundaries',
          state: 'strong-now',
          title: 'Scoped cloud and runtime identity',
          summary:
            'GitHub OIDC, separated automation roles, IRSA, Secrets Manager, and External Secrets reduce long-lived credential exposure.',
          evidenceRefs: ['p1-secrets'],
          sourceRefs: ['docs/portfolio/SECURITY_GATES.md', 'app/portfolio/frontend/docs/presentation-en.md'],
        },
        {
          id: 'security-private-backends',
          state: 'strong-now',
          title: 'Private backend boundary',
          summary:
            'The Storefront enters through the shared public edge while backend services and PostgreSQL stay behind private Kubernetes services.',
          evidenceRefs: ['p0-public-ingress', 'p1-private-workloads'],
          sourceRefs: ['docs/portfolio/ARCHITECTURE.md'],
        },
      ],
      devTradeoffs: [
        {
          id: 'security-public-admin-dev',
          state: 'dev-tradeoff',
          title: 'Public dev admin surfaces',
          summary:
            'Argo CD and Grafana may be publicly routable for demo visibility with generated credentials; this is documented as dev posture, not production access design.',
          sourceRefs: ['docs/portfolio/SECURITY_GATES.md', 'docs/portfolio/ARCHITECTURE.md'],
        },
        {
          id: 'security-advisory-scans',
          state: 'dev-tradeoff',
          title: 'Advisory vulnerability scans',
          summary:
            'Trivy findings provide visibility in the image path before being promoted to blocking release gates.',
          sourceRefs: ['docs/portfolio/SECURITY_GATES.md'],
        },
      ],
      hardenNext: [
        {
          id: 'security-harden-access',
          state: 'harden-next',
          title: 'Tighten privileged access',
          summary:
            'Restrict EKS API public CIDRs or move privileged workflows to private runners, add stronger admin access controls, and codify finer RBAC.',
          sourceRefs: ['docs/portfolio/SECURITY_GATES.md', 'docs/portfolio/ARCHITECTURE.md'],
        },
        {
          id: 'security-harden-secrets',
          state: 'harden-next',
          title: 'Automate secret assurance',
          summary:
            'Add secret rotation and CloudTrail audit evidence, then consider making supply-chain scans blocking.',
          evidenceRefs: ['p1-secrets'],
          sourceRefs: ['docs/portfolio/SECURITY_GATES.md'],
        },
      ],
      tools: ['IAM', 'OIDC', 'IRSA', 'Secrets Manager', 'External Secrets', 'ACM', 'ECR scanning'],
    },
    {
      id: 'reliability',
      title: 'Reliability',
      stance:
        'Reliability is currently about reproducible rebuilds, GitOps correction, dev persistence, and verified rollback rather than high-availability claims.',
      switcherSummary: 'How the platform rebuilds, reconciles, and rolls back.',
      priorityRecommendation: 'Add workload resilience',
      strongNow: [
        {
          id: 'reliability-rebuild-gitops',
          state: 'strong-now',
          title: 'Rebuildable and reconcilable runtime',
          summary:
            'Terraform rebuilds disposable platform layers while Argo CD reconciles accepted Git state back into Kubernetes.',
          evidenceRefs: ['p0-argocd-app-of-apps', 'p0-infra-approval-gate'],
          sourceRefs: ['docs/portfolio/ARCHITECTURE.md', 'docs/portfolio/DECISIONS.md'],
        },
        {
          id: 'reliability-rollback-proof',
          state: 'strong-now',
          title: 'Reviewed rollback path',
          summary:
            'Rollback returns workloads to selected ECR image tags through manifest PR review and GitOps convergence.',
          evidenceRefs: ['p1-rollback-path'],
          sourceRefs: ['app/portfolio/frontend/docs/presentation-en.md'],
        },
      ],
      devTradeoffs: [
        {
          id: 'reliability-dev-availability',
          state: 'dev-tradeoff',
          title: 'Dev availability floor',
          summary:
            'The platform demonstrates multi-AZ placement and persistence, but low replicas and in-cluster PostgreSQL keep availability scoped to dev proof.',
          sourceRefs: ['docs/portfolio/ARCHITECTURE.md', 'app/portfolio/frontend/docs/presentation-en.md'],
        },
      ],
      hardenNext: [
        {
          id: 'reliability-harden-workloads',
          state: 'harden-next',
          title: 'Add workload resilience controls',
          summary:
            'Add readiness/liveness probes, PodDisruptionBudgets, resource requests/limits, HPA, replicas, and managed database options for production posture.',
          sourceRefs: ['docs/portfolio/ARCHITECTURE.md', 'app/portfolio/frontend/docs/presentation-en.md'],
        },
      ],
      tools: ['EKS managed node group', 'Argo CD', 'EBS CSI', 'GitHub Actions smoke tests'],
    },
    {
      id: 'performance-efficiency',
      title: 'Performance Efficiency',
      stance:
        'Performance maturity is strongest where service boundaries, shared ingress, and metrics make future right-sizing inspectable.',
      switcherSummary: 'How service shape and metrics support right-sizing.',
      priorityRecommendation: 'Add resource signals',
      strongNow: [
        {
          id: 'performance-service-shape',
          state: 'strong-now',
          title: 'Inspectable service paths',
          summary:
            'Service decomposition, gateway aggregation, same-origin proxying, and public smoke checks make request behavior legible.',
          evidenceRefs: ['p0-public-ingress', 'p2-deploy-smoke'],
          sourceRefs: ['docs/portfolio/ARCHITECTURE.md', 'app/portfolio/frontend/docs/presentation-en.md'],
        },
        {
          id: 'performance-observation-baseline',
          state: 'strong-now',
          title: 'Metrics baseline',
          summary:
            'Prometheus and Grafana provide a starting point for observing request, latency, error, and pod resource behavior.',
          evidenceRefs: ['p1-grafana'],
          sourceRefs: ['docs/portfolio/ARCHITECTURE.md'],
        },
      ],
      devTradeoffs: [
        {
          id: 'performance-dev-sizing',
          state: 'dev-tradeoff',
          title: 'Right-sized for demonstration',
          summary:
            'The t3.medium Spot node group is cost-conscious and pod-density constrained; it is not a production throughput baseline.',
          sourceRefs: ['app/portfolio/frontend/docs/presentation-en.md', 'docs/portfolio/DECISIONS.md'],
        },
      ],
      hardenNext: [
        {
          id: 'performance-harden-autoscaling',
          state: 'harden-next',
          title: 'Use metrics for scaling decisions',
          summary:
            'Extend ServiceMonitor coverage, add resource requests/limits, introduce autoscaling, and right-size from dashboard data.',
          evidenceRefs: ['p1-grafana'],
          sourceRefs: ['app/portfolio/frontend/docs/presentation-en.md'],
        },
      ],
      tools: ['Gateway API', 'ALB', 'Prometheus', 'Grafana', 'EKS'],
    },
    {
      id: 'cost-optimization',
      title: 'Cost Optimization',
      stance:
        'Cost maturity is strongest where platform spend is treated as an explicit trade-off and the dev runtime remains destroyable.',
      switcherSummary: 'How spend is justified, bounded, and governed.',
      priorityRecommendation: 'Validate actual spend',
      strongNow: [
        {
          id: 'cost-explicit-ledger',
          state: 'strong-now',
          title: 'Explicit platform cost choices',
          summary:
            'Spot workers, shared ingress, S3 Gateway Endpoint, and destroy workflows make cost control part of the architecture story.',
          evidenceRefs: ['p2-cost-destroy-workflow'],
          sourceRefs: ['app/portfolio/frontend/docs/presentation-en.md', 'docs/portfolio/DECISIONS.md'],
        },
      ],
      devTradeoffs: [
        {
          id: 'cost-fixed-floors',
          state: 'dev-tradeoff',
          title: 'Accepted fixed cost floor',
          summary:
            'EKS control plane, NAT Gateway, ALB, Route 53, Secrets Manager, and ECR are deliberately paid for to prove real platform behavior.',
          sourceRefs: ['app/portfolio/frontend/docs/presentation-en.md'],
        },
      ],
      hardenNext: [
        {
          id: 'cost-harden-governance',
          state: 'harden-next',
          title: 'Validate spend continuously',
          summary:
            'Use Cost Explorer, AWS Budgets, right-sizing recommendations, and lifecycle policies to keep the dev cost model accountable.',
          evidenceRefs: ['p2-cost-destroy-workflow'],
          sourceRefs: ['app/portfolio/frontend/docs/presentation-en.md', 'docs/evidence-checklist.md'],
        },
      ],
      tools: ['EC2 Spot', 'NAT Gateway', 'ALB', 'S3 Gateway Endpoint', 'Terraform destroy'],
    },
    {
      id: 'sustainability',
      title: 'Sustainability',
      stance:
        'Sustainability is framed as avoiding idle dev resources, reducing duplication, and making the platform easy to rebuild when proof is needed.',
      switcherSummary: 'How idle resources and duplicate infrastructure are reduced.',
      priorityRecommendation: 'Automate cleanup',
      strongNow: [
        {
          id: 'sustainability-disposable-runtime',
          state: 'strong-now',
          title: 'Destroyable runtime model',
          summary:
            'Disposable Platform Core and Cluster Bootstrap layers can be torn down while durable bootstrap resources preserve rebuild capability.',
          evidenceRefs: ['p2-cost-destroy-workflow'],
          sourceRefs: ['docs/portfolio/ARCHITECTURE.md', 'docs/portfolio/DECISIONS.md'],
        },
        {
          id: 'sustainability-shared-resources',
          state: 'strong-now',
          title: 'Shared resource footprint',
          summary:
            'Shared ingress, bounded node count, and reusable artifacts avoid unnecessary duplicate infrastructure for the dev demonstration.',
          sourceRefs: ['app/portfolio/frontend/docs/presentation-en.md'],
        },
      ],
      devTradeoffs: [
        {
          id: 'sustainability-dev-proof-spend',
          state: 'dev-tradeoff',
          title: 'Proof sometimes requires live infrastructure',
          summary:
            'A real EKS/GitOps platform consumes more than a static portfolio page, so sustainability depends on shutdown discipline.',
          sourceRefs: ['docs/portfolio/DECISIONS.md', 'app/portfolio/frontend/docs/presentation-en.md'],
        },
      ],
      hardenNext: [
        {
          id: 'sustainability-harden-cleanup',
          state: 'harden-next',
          title: 'Automate cleanup and right-sizing',
          summary:
            'Add ECR lifecycle enforcement, budget guardrails, and metrics-based right-sizing so repeated demos do not accumulate waste.',
          evidenceRefs: ['p2-cost-destroy-workflow', 'p1-grafana'],
          sourceRefs: ['docs/evidence-checklist.md', 'app/portfolio/frontend/docs/presentation-en.md'],
        },
      ],
      tools: ['Terraform', 'ECR lifecycle', 'EC2 Spot', 'Prometheus', 'Grafana'],
    },
  ],
}
