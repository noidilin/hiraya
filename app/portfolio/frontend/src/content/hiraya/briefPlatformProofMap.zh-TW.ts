import { briefPlatformProofMapContentEn } from './briefPlatformProofMap.en'
import type { BriefPlatformProofMapContent, BriefProofMapLensId, BriefProofMapNodeId, BriefProofMapZoneId } from './briefPlatformProofMap'

const zoneCopy: Record<BriefProofMapZoneId, Pick<BriefPlatformProofMapContent['zones'][number], 'label' | 'shortLabel' | 'summary' | 'posture'>> = {
  'source-delivery': {
    label: 'Source 與交付權責',
    shortLabel: 'Source',
    summary: '變更先被提出、檢查與批准，才進入 cloud 或 cluster state。',
    posture: 'reviewed change authority',
  },
  'project-bootstrap': {
    label: 'Project Bootstrap',
    shortLabel: 'Bootstrap',
    summary: '保留能跨 EKS 重建存活的小型 durable layer：state、federation、artifacts 與 external secrets。',
    posture: 'retained foundations',
  },
  'platform-proof': {
    label: 'Platform、runtime behavior 與 proof surfaces',
    shortLabel: 'Platform proof',
    summary: '用同一條高階路徑把 AWS networking、EKS controllers、精簡 workload behavior 與 proof surfaces 放在一起。',
    posture: 'AWS ↔ EKS ↔ proof',
  },
}

const nodeCopy: Record<BriefProofMapNodeId, Pick<BriefPlatformProofMapContent['nodes'][number], 'label' | 'detail' | 'posture'>> = {
  'repo-change': {
    label: 'Repository change',
    detail: 'Application、GitOps 或 infrastructure intent 先從可 review 的 source 開始，而不是 console mutation。',
    posture: 'reviewable source',
  },
  'github-actions': {
    label: 'GitHub Actions',
    detail: '以 scoped authority 執行 validation、image CI、promotion、infra apply/destroy 與 deployment smoke evidence。',
    posture: 'automation boundary',
  },
  'validation-evidence': {
    label: 'Validation evidence',
    detail: 'Pull request 與 workflow checks 先建立 proof，才使用 privileged cloud write paths。',
    posture: 'pre-change proof',
  },
  'manifest-pr': {
    label: 'Manifest promotion PR',
    detail: 'Image CI 提出 GitOps manifest change；reviewed Git 仍然是 accepted desired-state gate。',
    posture: 'review gate',
  },
  'accepted-gitops': {
    label: 'Accepted GitOps state',
    detail: 'Desired runtime state 先在 Git 被接受，Argo CD 才 reconcile cluster。',
    posture: 'desired state',
  },
  'infra-approval': {
    label: 'Infrastructure approval',
    detail: 'Terraform apply/destroy 與一般 application delivery 分離，並放在 environment-gated authority 後。',
    posture: 'high-permission gate',
  },
  'terraform-state': {
    label: 'Terraform state access',
    detail: 'Remote state 與 bootstrap permissions 足夠 durable，能一致地重建 disposable platform。',
    posture: 'durable',
  },
  'oidc-roles': {
    label: 'GitHub OIDC roles',
    detail: 'Federated CI roles 避免 long-lived cloud credentials，同時保留 scoped automation 能力。',
    posture: 'durable trust',
  },
  'ecr-repositories': {
    label: 'ECR repositories',
    detail: 'Durable artifact storage 位於 disposable EKS runtime 外；rollout 時 nodes 從 ECR pull images。',
    posture: 'durable artifacts',
  },
  'secrets-manager': {
    label: 'Secrets Manager',
    detail: 'Externalized secret sources 跨 cluster rebuild 存活，並由 controller intent materialize 成 Kubernetes Secrets。',
    posture: 'durable secret source',
  },
  'platform-core': {
    label: 'Platform Core',
    detail: 'Terraform-owned cloud substrate：VPC、subnets、EKS、IAM、IRSA、Route 53/ACM prerequisites 與 worker capacity。',
    posture: 'cloud substrate',
  },
  'vpc-network': {
    label: 'VPC network',
    detail: 'Public subnets 承載 load-balancing entry points，private subnets 承載 EKS nodes；NAT 與 S3 Gateway Endpoint 支援受控 egress。',
    posture: 'public/private split',
  },
  'eks-node-group': {
    label: 'EKS node group',
    detail: 'Managed worker nodes 跑在 private subnets，從 ECR pull workload images，並透過 scoped node 與 IRSA policies 取得 AWS access。',
    posture: 'private compute',
  },
  'cluster-bootstrap': {
    label: 'Cluster Bootstrap',
    detail: 'Terraform/Helm handoff 安裝 Argo CD、AppProjects 與 root app，讓 GitOps 接手。',
    posture: 'bootstrap handoff',
  },
  argocd: {
    label: 'Argo CD',
    detail: 'Pull accepted Git desired state 並 reconcile platform 與 workload resources；它不會從 ECR pull images。',
    posture: 'GitOps reconciler',
  },
  'cluster-platform': {
    label: 'Cluster Platform',
    detail: 'Shared add-ons 提供 EKS-to-AWS bridge：Gateway API、AWS Load Balancer Controller、ExternalDNS、External Secrets Operator、monitoring 與 storage。',
    posture: 'shared capabilities',
  },
  'aws-network-bridge': {
    label: 'AWS controllers',
    detail: 'AWS Load Balancer Controller 將 Gateway/Service intent 轉成 ALB resources；ExternalDNS 寫入 Route 53 records；IRSA scope service accounts 的 AWS API calls。',
    posture: 'controller bridge',
  },
  'public-edge': {
    label: 'Public Edge',
    detail: 'Platform Core 準備 Route 53 與 ACM prerequisites；GitOps Gateway/HTTPRoute intent 加上 AWS controllers，將選定 HTTPS paths 發布到 EKS workloads。',
    posture: 'public boundary',
  },
  'prometheus-metrics': {
    label: 'Prometheus metrics',
    detail: 'Cluster monitoring 記錄 selected gateway/workload 與 platform signals，讓 Grafana 能呈現 release feedback。',
    posture: 'monitoring backend',
  },
  'aws-service-bridges': {
    label: 'AWS service bridges',
    detail: 'EKS 透過明確機制連到 durable AWS services：ECR image pulls、Secrets Manager reads、Route 53 updates 與 ALB reconciliation。',
    posture: 'explicit integrations',
  },
  'portfolio-visitor': {
    label: 'Portfolio Visitor',
    detail: 'Reviewer 或 visitor 透過 HTTPS 驗證 public Storefront behavior，但不取得 operational access。',
    posture: 'public client',
  },
  'storefront-endpoint': {
    label: 'hiraya.noidilin.dev',
    detail: 'Public Storefront endpoint 證明 selected route、DNS、TLS、ingress 與 workload path 可被連到。',
    posture: 'public proof',
  },
  'vintage-workload': {
    label: 'Vintage workload',
    detail: '證明平台確實執行 real application path 的精簡節點。內部 microservice details 在 Brief 先摘要，Architecture route 再展開。',
    posture: 'application behavior',
  },
  'private-runtime': {
    label: 'Private services',
    detail: 'Gateway、auth、product 與 orders 被摘要成 private runtime cluster，而不是複製完整 topology。',
    posture: 'private runtime',
  },
  'runtime-state': {
    label: 'Runtime state',
    detail: 'vintage-postgres 與 materialized runtime dependencies 證明 workload 有 state 與 backing services，但 Brief 不把 service internals 當焦點。',
    posture: 'private data',
  },
  'vintage-secrets': {
    label: 'vintage-secrets',
    detail: '由 External Secrets Operator 從 AWS Secrets Manager materialize 的 Kubernetes Secret；portfolio 不暴露 values。',
    posture: 'materialized reference',
  },
  'operations-evidence': {
    label: 'Ops evidence',
    detail: 'Argo CD app health 與 Grafana dashboards 是 dev/demo operations surfaces，不是 customer-facing Storefront paths。',
    posture: 'health + dashboards',
  },
  'smoke-evidence': {
    label: 'Smoke evidence',
    detail: 'Smoke checks 在 rollout 後證明 public path，並把 delivery automation 連到 observable runtime behavior。',
    posture: 'release proof',
  },
}

const edgeLabels: Record<string, string | undefined> = {
  'repo-actions': 'triggers',
  'actions-validation': 'checks',
  'actions-ecr': 'image push',
  'manifest-accepted': 'reviewed',
  'accepted-argocd': 'pulls Git',
  'workload-smoke': 'smoke',
  'infra-oidc': 'OIDC trust',
  'state-core': 'state-backed',
  'approval-core': 'apply',
  'core-vpc': 'network',
  'vpc-nodes': 'nodes',
  'nodes-workload': 'runs pods',
  'core-bootstrap': 'cluster ready',
  'bootstrap-argocd': 'root app',
  'argocd-platform': 'add-ons',
  'platform-controllers': 'controllers',
  'controllers-edge': 'ALB',
  'controllers-services': 'APIs',
  'service-bridges-secrets': 'materializes',
  'public-storefront': 'HTTPS',
  'visitor-storefront': 'opens URL',
  'storefront-workload': 'routes',
  'private-state': 'private data',
  'secrets-private': 'env refs',
  'cluster-prometheus': 'metrics',
  'workload-metrics': 'signals',
  'prometheus-ops': 'dashboards',
  'smoke-public': 'public proof',
}

const lensCopy: Record<BriefProofMapLensId, Pick<BriefPlatformProofMapContent['lenses'][number], 'label' | 'summary' | 'claim'>> = {
  'visitor-request': {
    label: 'Visitor request 證據',
    summary: '追蹤 public HTTPS 如何經 AWS networking 進入精簡 workload proof。',
    claim: '只有 Storefront path 是 public；backend behavior 留在 platform boundary 之後。',
  },
  'delivery-gitops': {
    label: 'Delivery/GitOps 證據',
    summary: '展示 CI artifact creation、reviewed Git desired state、Argo CD rollout 與 smoke evidence。',
    claim: 'CI 負責提出與發布；reviewed Git 與 Argo CD 擁有 accepted runtime state。',
  },
  'rebuild-destroy': {
    label: 'Rebuild/destroy 證據',
    summary: '分離 retained bootstrap、disposable AWS/EKS，以及 controller-managed service bridges。',
    claim: '昂貴 runtime 是 disposable；durable foundations 保留重建能力。',
  },
  'operations-evidence': {
    label: 'Operations evidence 證據',
    summary: '串起 monitoring、GitOps health、smoke checks 與 public proof surfaces。',
    claim: 'Observability 與 GitOps health 支撐 platform claim，但不取代整體說明。',
  },
}

export const briefPlatformProofMapContentZhTW = {
  eyebrow: 'Platform Proof Map',
  title: '從 source authority 到 public proof 的一張地圖',
  summary:
    'Brief route 用這張 graph 說明 Hiraya 為什麼是可重建的 dev-platform demonstration，而不是 static page 或孤立的 app demo。',
  mapClaim:
    'Reviewed source changes 可以變成 artifacts、accepted GitOps desired state、EKS workloads、public HTTPS behavior 與 observable evidence；預設故事不需要 manual cluster mutation。',
  zones: briefPlatformProofMapContentEn.zones.map((zone) => ({
    ...zone,
    ...zoneCopy[zone.id],
  })),
  nodes: briefPlatformProofMapContentEn.nodes.map((node) => ({
    ...node,
    ...nodeCopy[node.id],
  })),
  edges: briefPlatformProofMapContentEn.edges.map((edge) => ({
    ...edge,
    label: edgeLabels[edge.id],
  })),
  lenses: briefPlatformProofMapContentEn.lenses.map((lens) => ({
    ...lens,
    ...lensCopy[lens.id],
  })),
} satisfies BriefPlatformProofMapContent
