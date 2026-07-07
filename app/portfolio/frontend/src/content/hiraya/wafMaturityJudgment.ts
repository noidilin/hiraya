import type { AppLocale } from '@/i18n/locales'

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

export type WafMaturityStateCopy = {
  label: string
  shortLabel: string
  description: string
}

export type WafMaturityJudgmentChrome = {
  selectedPillarLabel: string
  priorityLabel: string
  evidenceSupportLabel: string
  pillarSwitcherLabel: string
  detailPanelAriaSuffix: string
  evidenceCarouselTitle: string
  evidenceCarouselDescription: string
}

export type WafMaturityJudgmentContent = {
  routeId: Extract<HirayaRouteId, 'waf'>
  eyebrow: string
  title: string
  summary: string
  stateCopy: Record<WafMaturityState, WafMaturityStateCopy>
  chrome: WafMaturityJudgmentChrome
  pillars: readonly WafMaturityPillar[]
}

const wafMaturityJudgmentContentEn: WafMaturityJudgmentContent = {
  routeId: 'waf',
  eyebrow: 'Well-Architected Maturity Judgment',
  title: 'Separate proven strengths, accepted dev trade-offs, and hardening path',
  summary:
    'Hiraya uses the six pillars as a judgment board: each row shows what is demonstrably strong now, which limitation is intentionally accepted for a disposable dev platform, and what would need hardening before production.',
  stateCopy: {
    'strong-now': {
      label: 'Strong now',
      shortLabel: 'Strong',
      description: 'Implemented capability with visible project evidence.',
    },
    'dev-tradeoff': {
      label: 'Dev trade-off',
      shortLabel: 'Trade-off',
      description: 'Intentional limitation accepted for a disposable dev platform.',
    },
    'harden-next': {
      label: 'Harden next',
      shortLabel: 'Harden',
      description: 'Production hardening direction, not an implemented claim.',
    },
  },
  chrome: {
    selectedPillarLabel: 'Selected pillar',
    priorityLabel: 'Priority',
    evidenceSupportLabel: 'Evidence support',
    pillarSwitcherLabel: 'Well-Architected pillar switcher',
    detailPanelAriaSuffix: 'maturity details',
    evidenceCarouselTitle: 'Evidence behind the Well-Architected review',
    evidenceCarouselDescription: 'The pillar review stays judgment-led while captures support one implementation claim at a time.',
  },
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
          evidenceRefs: ['p0-public-ingress'],
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
          evidenceRefs: ['p0-public-ingress'],
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


const wafZhTWText = {
  eyebrow: 'Well-Architected 成熟度判斷',
  title: '區分已被證明的強項、可接受的 dev 取捨，以及下一步強化路徑',
  summary:
    'Hiraya 把六大支柱當成判斷板：每一列都說明目前有證據支持的強項、作為可拋棄 dev 平台刻意接受的限制，以及進入 production 前需要補強的方向。',
  stateCopy: {
    'strong-now': {
      label: '目前強項',
      shortLabel: '強項',
      description: '已有實作能力，並能用專案證據說明。',
    },
    'dev-tradeoff': {
      label: 'Dev 取捨',
      shortLabel: '取捨',
      description: '為可拋棄 dev 平台刻意接受的限制。',
    },
    'harden-next': {
      label: '下一步強化',
      shortLabel: '強化',
      description: 'production 強化方向，不宣稱已經完成。',
    },
  },
  chrome: {
    selectedPillarLabel: '目前支柱',
    priorityLabel: '優先事項',
    evidenceSupportLabel: '證據支撐',
    pillarSwitcherLabel: 'Well-Architected 支柱切換器',
    detailPanelAriaSuffix: '成熟度細節',
    evidenceCarouselTitle: 'Well-Architected review 背後的證據',
    evidenceCarouselDescription: '支柱 review 維持以判斷為主，截圖與影片則一次支撐一個 implementation claim。',
  },
} satisfies Pick<WafMaturityJudgmentContent, 'eyebrow' | 'title' | 'summary' | 'stateCopy' | 'chrome'>

const wafPillarZhTW = {
  'operational-excellence': {
    title: '卓越營運',
    stance: '當變更可審查、由 GitOps 接管、可觀測，並能透過可重複 workflow 復原時，營運能力最強。',
    switcherSummary: '變更如何被操作、驗證與復原。',
    priorityRecommendation: '擴充 incident signals',
  },
  security: {
    title: '安全性',
    stance: 'Hiraya 在縮小自動化憑證範圍、集中 public ingress，並讓 secrets 留在 Git 之外時，安全性最強。',
    switcherSummary: '如何控制存取、暴露面與 secrets。',
    priorityRecommendation: '收緊 privileged access',
  },
  reliability: {
    title: '可靠性',
    stance: '目前可靠性著重於可重建、GitOps 修正、dev persistence 與已驗證 rollback，而不是高可用宣稱。',
    switcherSummary: '平台如何重建、reconcile 與 rollback。',
    priorityRecommendation: '加入 workload resilience',
  },
  'performance-efficiency': {
    title: '效能效率',
    stance: '當 service boundaries、shared ingress 與 metrics 讓未來 right-sizing 可被檢視時，效能成熟度最強。',
    switcherSummary: 'service shape 與 metrics 如何支援 right-sizing。',
    priorityRecommendation: '加入 resource signals',
  },
  'cost-optimization': {
    title: '成本最佳化',
    stance: '當平台支出被視為明確架構取捨，而且 dev runtime 保持可銷毀時，成本成熟度最強。',
    switcherSummary: '支出如何被合理化、限制與治理。',
    priorityRecommendation: '驗證實際支出',
  },
  sustainability: {
    title: '永續性',
    stance: '永續性被定位為避免閒置 dev 資源、減少重複基礎設施，並在需要證明時能容易重建平台。',
    switcherSummary: '如何降低閒置資源與重複基礎設施。',
    priorityRecommendation: '自動化清理',
  },
} satisfies Record<WafMaturityPillar['id'], Pick<WafMaturityPillar, 'title' | 'stance' | 'switcherSummary' | 'priorityRecommendation'>>

const wafItemZhTW: Record<string, Pick<WafMaturityItem, 'title' | 'summary'>> = {
  'ops-gitops-delivery-loop': {
    title: '可審查的 delivery loop',
    summary: 'Terraform、GitHub Actions、Argo CD、smoke tests 與 rollback workflows，讓一般變更與復原路徑都可被看見。',
  },
  'ops-dev-evidence-scope': {
    title: '證據優先，而非完整營運平台',
    summary: '目前營運敘事強調 GitOps health、smoke checks 與 Grafana，而不是完整 incident automation 或 log ingestion。',
  },
  'ops-harden-incident-signals': {
    title: '擴充營運訊號',
    summary: '在宣稱 production operations maturity 前，重新導入 deliberate log ingestion、alert routing、runbooks 與更強的 incident evidence。',
  },
  'security-identity-boundaries': {
    title: '有範圍的 cloud 與 runtime identity',
    summary: 'GitHub OIDC、分離的 automation roles、IRSA、Secrets Manager 與 External Secrets 降低長期憑證暴露。',
  },
  'security-private-backends': {
    title: '私有 backend boundary',
    summary: 'Storefront 透過 shared public edge 進入，而 backend services 與 PostgreSQL 留在 private Kubernetes services 後方。',
  },
  'security-public-admin-dev': {
    title: '公開的 dev admin surfaces',
    summary: 'Argo CD 與 Grafana 可能為 demo visibility 而 publicly routable，搭配產生式 credentials；這是 dev posture，不是 production access design。',
  },
  'security-advisory-scans': {
    title: '建議性 vulnerability scans',
    summary: 'Trivy findings 先在 image path 提供可見性，再逐步提升為 blocking release gates。',
  },
  'security-harden-access': {
    title: '收緊 privileged access',
    summary: '限制 EKS API public CIDRs 或把 privileged workflows 移到 private runners，加入更強的 admin access controls，並 codify 更細的 RBAC。',
  },
  'security-harden-secrets': {
    title: '自動化 secret assurance',
    summary: '加入 secret rotation 與 CloudTrail audit evidence，之後再考慮讓 supply-chain scans 成為 blocking。',
  },
  'reliability-rebuild-gitops': {
    title: '可重建且可 reconcile 的 runtime',
    summary: 'Terraform 重建 disposable platform layers，Argo CD 則把 accepted Git state reconcile 回 Kubernetes。',
  },
  'reliability-rollback-proof': {
    title: '已審查的 rollback path',
    summary: 'Rollback 透過 manifest PR review 與 GitOps convergence，把 workloads 回到選定的 ECR image tags。',
  },
  'reliability-dev-availability': {
    title: 'Dev availability floor',
    summary: '平台展示 multi-AZ placement 與 persistence，但低 replicas 與 in-cluster PostgreSQL 讓 availability 保持在 dev proof 範圍。',
  },
  'reliability-harden-workloads': {
    title: '加入 workload resilience controls',
    summary: '為 production posture 加入 readiness/liveness probes、PodDisruptionBudgets、resource requests/limits、HPA、replicas 與 managed database options。',
  },
  'performance-service-shape': {
    title: '可檢視的 service paths',
    summary: 'Service decomposition、gateway aggregation、same-origin proxying 與 public smoke checks 讓 request behavior 清楚可讀。',
  },
  'performance-observation-baseline': {
    title: 'Metrics baseline',
    summary: 'Prometheus 與 Grafana 提供觀察 request、latency、error 與 pod resource behavior 的起點。',
  },
  'performance-dev-sizing': {
    title: '為展示而 right-sized',
    summary: 't3.medium Spot node group 顧及成本並受 pod density 限制；它不是 production throughput baseline。',
  },
  'performance-harden-autoscaling': {
    title: '用 metrics 做 scaling decisions',
    summary: '擴充 ServiceMonitor coverage、加入 resource requests/limits、導入 autoscaling，並從 dashboard data 進行 right-size。',
  },
  'cost-explicit-ledger': {
    title: '明確的平台成本選擇',
    summary: 'Spot workers、shared ingress、S3 Gateway Endpoint 與 destroy workflows，讓 cost control 成為 architecture story 的一部分。',
  },
  'cost-fixed-floors': {
    title: '接受固定成本底線',
    summary: 'EKS control plane、NAT Gateway、ALB、Route 53、Secrets Manager 與 ECR 是為了證明真實平台行為而刻意支付。',
  },
  'cost-harden-governance': {
    title: '持續驗證支出',
    summary: '使用 Cost Explorer、AWS Budgets、right-sizing recommendations 與 lifecycle policies，讓 dev cost model 可被問責。',
  },
  'sustainability-disposable-runtime': {
    title: '可銷毀的 runtime model',
    summary: 'Disposable Platform Core 與 Cluster Bootstrap layers 可以被拆除，同時 durable bootstrap resources 保留重建能力。',
  },
  'sustainability-shared-resources': {
    title: 'Shared resource footprint',
    summary: 'Shared ingress、受限制的 node count 與 reusable artifacts，避免 dev demonstration 產生不必要的重複基礎設施。',
  },
  'sustainability-dev-proof-spend': {
    title: '證明有時需要 live infrastructure',
    summary: '真實 EKS/GitOps platform 會比 static portfolio page 消耗更多資源，因此 sustainability 取決於 shutdown discipline。',
  },
  'sustainability-harden-cleanup': {
    title: '自動化 cleanup 與 right-sizing',
    summary: '加入 ECR lifecycle enforcement、budget guardrails 與 metrics-based right-sizing，讓重複 demos 不會累積浪費。',
  },
}

function localizeWafItems(items: readonly WafMaturityItem[]): readonly WafMaturityItem[] {
  return items.map((item) => ({
    ...item,
    ...wafItemZhTW[item.id],
  }))
}

const wafMaturityJudgmentContentZhTW: WafMaturityJudgmentContent = {
  ...wafMaturityJudgmentContentEn,
  ...wafZhTWText,
  pillars: wafMaturityJudgmentContentEn.pillars.map((pillar) => ({
    ...pillar,
    ...wafPillarZhTW[pillar.id],
    strongNow: localizeWafItems(pillar.strongNow),
    devTradeoffs: localizeWafItems(pillar.devTradeoffs),
    hardenNext: localizeWafItems(pillar.hardenNext),
  })),
}

export function getWafMaturityJudgmentContent(locale: AppLocale): WafMaturityJudgmentContent {
  return locale === 'zh-TW' ? wafMaturityJudgmentContentZhTW : wafMaturityJudgmentContentEn
}

export const wafMaturityJudgmentContent = wafMaturityJudgmentContentEn
