import type { BriefProofPathCard } from './briefProofPathOverview'

export const briefProofPathOverviewContentZhTW = [
  {
    id: 'design-goals',
    label: '設計目標',
    value: '4',
    note: '可重建、可驗證、可觀測、可回復。',
    detailTitle: '系統需要讓四個承諾變得可見',
    detailSummary:
      'Brief route 將 Hiraya 定位為一套工程系統：重要變更都應該能被重建、檢查、觀測與回復。',
    detailBullets: [
      'Rebuildability：Terraform 建置 AWS foundation、EKS、bootstrap resources、IRSA 與 secrets integration。',
      'Verifiability：GitHub Actions 驗證 pull requests、建置 images、render manifests，並記錄 deployment evidence。',
      'Observability：Prometheus 與 Grafana 提供 service health 與 release feedback。',
      'Recoverability：Rollback 透過 GitOps manifest changes 執行，而不是手動修改 cluster。',
    ],
    sourceRefs: ['app/portfolio/frontend/docs/presentation-en.md#1', 'docs/evidence-checklist.md'],
  },
  {
    id: 'primary-runtime',
    label: '主要 Runtime',
    value: 'EKS',
    note: '部署於 AWS 的 Kubernetes，並採用 private workload placement。',
    detailTitle: 'Runtime proof 不只是 hosted frontend',
    detailSummary:
      '平台透過 AWS foundation、private EKS workloads、shared HTTPS ingress、externalized secrets 與 observable service health 形成 runtime proof。',
    detailBullets: [
      'AWS foundation：VPC、private subnets、NAT Gateway、S3 Gateway Endpoint、ALB、Route 53 與 ACM。',
      'Runtime boundary：public traffic 經 shared ingress 進入，backend services 保持 private ClusterIP services。',
      'Secrets 與 operations：AWS Secrets Manager、External Secrets Operator、Prometheus 與 Grafana 支撐 runtime proof，且不暴露 secret values。',
    ],
    evidenceRefs: ['p0-public-ingress', 'p1-secrets', 'p1-grafana'],
    sourceRefs: ['app/portfolio/frontend/docs/presentation-en.md#2', 'docs/evidence-checklist.md'],
  },
  {
    id: 'delivery-model',
    label: '交付模型',
    value: 'GitOps',
    note: 'Argo CD 從 Git 收斂 application 與 platform 的期望狀態。',
    detailTitle: '交付系統是最強的 portfolio proof',
    detailSummary:
      'CI 產生 evidence 與 artifacts，reviewed Git 接受 desired state，Argo CD 收斂 runtime，而不是讓 CI 直接修改 cluster。',
    detailBullets: [
      'PR validation 在使用 cloud write authority 前，先檢查 application、Docker、GitOps render 與 infrastructure evidence。',
      'Image publishing 建立 SHA-tagged artifacts 到 ECR，並開出 manifest promotion PR。',
      'Argo CD 同步 accepted GitOps state，Kubernetes rollout workloads，smoke tests 驗證 public path。',
    ],
    evidenceRefs: ['p0-cicd-delivery-flow', 'p1-rollback-path'],
    sourceRefs: ['app/portfolio/frontend/docs/presentation-en.md#4', 'docs/evidence-checklist.md'],
  },
  {
    id: 'proof-path',
    label: 'Proof path',
    value: 'Evidence-led',
    note: '媒體支援 platform claim，但不是預設說明本身。',
    detailTitle: '為什麼 Hiraya 讀起來是 platform demonstration',
    detailSummary:
      '預設說明應該在截圖之前就能成立：Hiraya 是 dev-only、可重建的平台，並用 evidence media 證明 delivery 與 runtime claims。',
    detailBullets: [
      'Dev platform，而非 production 包裝：專案展示真實決策，但不過度宣稱 production readiness。',
      'Delivery proof：端到端影片應展示 validation、image publishing、promotion、Argo CD sync、rollout 與 smoke verification。',
      'Runtime proof：public HTTPS endpoints、private services、shared ingress、secrets integration 與 Grafana dashboards 展示 cloud-native boundaries。',
    ],
    evidenceRefs: ['p0-cicd-delivery-flow', 'p0-public-ingress', 'p1-secrets', 'p1-grafana'],
    sourceRefs: ['app/portfolio/frontend/docs/presentation-en.md#1', 'docs/evidence-checklist.md'],
  },
] as const satisfies readonly BriefProofPathCard[]

