import { hirayaSourceDoc, type HirayaEvidenceItem, type HirayaPageContent } from './types'

export const hirayaEvidenceItemsZhTW = [
  {
    id: 'p0-cicd-delivery-flow',
    priority: 'P0',
    title: '完整 CI/CD 交付流程',
    suggestedFormat: 'video',
    portfolioValue: '證明平台能在不手動修改 cluster 的情況下，完成驗證、建置、發布、promotion、部署與變更確認。',
    checklistSource: 'docs/evidence-checklist.md',
  },
  {
    id: 'p0-argocd-app-of-apps',
    priority: 'P0',
    title: 'Argo CD App-of-Apps 健康狀態',
    suggestedFormat: 'short-video',
    portfolioValue: '透過 Synced / Healthy applications 與 resource trees，呈現 GitOps 對 platform add-ons 與 Vintage workloads 的管理權。',
    checklistSource: 'docs/evidence-checklist.md',
  },
  {
    id: 'p0-infra-approval-gate',
    priority: 'P0',
    title: '含核准關卡的 Infrastructure 部署',
    suggestedFormat: 'video',
    portfolioValue: '展示高影響 Terraform apply 具備 gate、可審查，且與一般 application release automation 分離。',
    checklistSource: 'docs/evidence-checklist.md',
  },
  {
    id: 'p0-public-ingress',
    priority: 'P0',
    title: 'Public endpoint、DNS、TLS 與 ALB ingress',
    suggestedFormat: 'short-video',
    portfolioValue: '證明 public path 會經過 Route 53、HTTPS、ALB/Gateway API、frontend 與 API smoke checks。',
    checklistSource: 'docs/evidence-checklist.md',
  },
  {
    id: 'p1-rollback-path',
    priority: 'P1',
    title: '透過 GitOps PR 執行 Rollback',
    suggestedFormat: 'video',
    portfolioValue: '呈現 recovery 走同一個已審查的 GitOps control plane，而不是手動 kubectl patch。',
    checklistSource: 'docs/evidence-checklist.md',
  },
  {
    id: 'p1-secrets',
    priority: 'P1',
    title: 'Secrets Manager 與 External Secrets',
    suggestedFormat: 'screenshot',
    portfolioValue: '證明 credentials 已外部化，並在 runtime materialize，避免將 secret values commit 到 Git。',
    checklistSource: 'docs/evidence-checklist.md',
  },
  {
    id: 'p1-grafana',
    priority: 'P1',
    title: 'Grafana 可觀測性 Dashboard',
    suggestedFormat: 'short-video',
    portfolioValue: '展示 observability 能用於 service health 與 release feedback，而不只是安裝工具。',
    checklistSource: 'docs/evidence-checklist.md',
  },
  {
    id: 'p1-private-workloads',
    priority: 'P1',
    title: 'EKS private workload 架構',
    suggestedFormat: 'screenshot',
    portfolioValue: '呈現 private node placement、ClusterIP services、shared public ingress、Gateway/HTTPRoute resources 與受控 egress。',
    checklistSource: 'docs/evidence-checklist.md',
  },
  {
    id: 'p2-deploy-smoke',
    priority: 'P2',
    title: '部署 Smoke Test 證據',
    suggestedFormat: 'screenshot',
    portfolioValue: '確認 deployment success 以 public service availability、API response、DNS resolution 與 Argo CD health 衡量。',
    checklistSource: 'docs/evidence-checklist.md',
  },
  {
    id: 'p2-cost-destroy-workflow',
    priority: 'P2',
    title: '成本控管與 Destroy Workflow',
    suggestedFormat: 'short-video',
    portfolioValue: '展示 Dev platform 被刻意設計為可銷毀，且 cost governance 是 operating model 的一部分。',
    checklistSource: 'docs/evidence-checklist.md',
  },
] as const satisfies readonly HirayaEvidenceItem[]

export const hirayaPagesZhTW = [
  {
    id: 'brief',
    sourceDoc: hirayaSourceDoc,
    sourceSection: '1. Solution Overview and Design Principles',
    navLabel: '概覽',
    shortLabel: '概覽',
    eyebrow: '方案概覽',
    title: '可重建的 Hiraya DevOps 平台',
    summary:
      'Hiraya 在 AWS 上展示二手古著電商微服務系統，整合 EKS、Terraform、GitHub Actions、Argo CD 與 Prometheus/Grafana。',
    thesis:
      '這是一個 portfolio 等級的 Dev 環境，透過可重建的微服務系統證明 cloud platform design、IaC、CI/CD、GitOps 與 observability 的落地能力。',
    proofPoints: [
      {
        id: 'dev-platform-scope',
        title: 'Dev platform，而非 Production 包裝',
        summary:
          '頁面應清楚定位 Hiraya 是 dev-only、可重建的 AWS/EKS platform，用來展示真實 platform engineering 決策，而不是過度宣稱 production readiness。',
      },
      {
        id: 'delivery-platform-proof',
        title: 'Portfolio 核心證據是交付系統',
        summary:
          '最有力的證據是從 PR validation、image publishing、manifest promotion、Argo CD sync、rollout 到 smoke verification 的完整路徑。',
        evidenceRefs: ['p0-cicd-delivery-flow'],
      },
      {
        id: 'runtime-proof',
        title: 'Runtime 證明 cloud-native 邊界',
        summary:
          'Public HTTPS endpoints、private ClusterIP services、shared ingress、Secrets Manager integration 與 Grafana dashboards，顯示這不只是 static frontend。',
        evidenceRefs: ['p0-public-ingress', 'p1-secrets', 'p1-grafana'],
      },
    ],
    mediaSlots: [
      {
        id: 'overview-youtube-introduction',
        type: 'intro-video',
        status: 'planned',
        title: '嵌入式專案導覽影片',
        description:
          '可在概覽路線上方放置一段短 YouTube introduction，先說明整體 Hiraya platform，再讓訪客深入查看各路線細節。',
        evidenceRefs: ['p0-cicd-delivery-flow', 'p0-argocd-app-of-apps', 'p0-infra-approval-gate'],
      },
      {
        id: 'overview-evidence-hover-cards',
        type: 'screenshot-hover',
        status: 'planned',
        title: 'Hover 證據卡片',
        description:
          '關鍵資訊卡可在 hover 或 focus 時揭露 docs/evidence-checklist.md 的 screenshots，讓頁面保持易讀，同時使主張可被檢視。',
        evidenceRefs: ['p0-cicd-delivery-flow', 'p0-public-ingress', 'p1-grafana'],
      },
    ],
    metrics: [
      {
        label: '設計目標',
        value: '4',
        note: '可重建、可驗證、可觀測、可回復。',
      },
      {
        label: '主要 Runtime',
        value: 'EKS',
        note: '部署於 AWS 的 Kubernetes，並採用 private workload placement。',
      },
      {
        label: '交付模型',
        value: 'GitOps',
        note: 'Argo CD 從 Git 收斂 application 與 platform 的期望狀態。',
      },
    ],
    sections: [
      {
        id: 'operating-principles',
        eyebrow: '設計理念',
        title: '系統需要讓四個承諾變得可見',
        body:
          '此路線應讓架構看起來像一套工程系統，而不是工具清單。每個頁面都應呈現一次變更如何被重建、檢查、觀測與回復。',
        bullets: [
          'Rebuildability：Terraform 建置 AWS foundation、EKS、bootstrap resources、IRSA 與 secrets integration。',
          'Verifiability：GitHub Actions 驗證 pull requests、建置 images、render manifests，並記錄 deployment evidence。',
          'Observability：Prometheus 與 Grafana 提供 service health 與 release feedback。',
          'Recoverability：Rollback 透過 GitOps manifest changes 執行，而不是手動修改 cluster。',
        ],
      },
      {
        id: 'platform-scope',
        eyebrow: '範圍',
        title: 'Demo platform 包含的內容',
        bullets: [
          'AWS foundation：VPC、private subnets、NAT Gateway、S3 Gateway Endpoint、ALB、Route 53 與 ACM。',
          'Infrastructure as Code：Terraform 分離長期 bootstrap、platform core 與 cluster handoff 關注點。',
          'CI/CD pipeline：GitHub Actions 負責 validation、build、push ECR images、promote manifests、infra workflows 與 rollback PRs。',
          'GitOps deployment：Argo CD 管理 platform add-ons 與 workload manifests。',
          'Observability：kube-prometheus-stack 提供 Prometheus、Grafana、Alertmanager 與 Vintage dashboard。',
        ],
        tags: ['AWS EKS', 'Terraform', 'GitHub Actions', 'Argo CD', 'Prometheus', 'Grafana'],
      },
    ],
  },
  {
    id: 'arch',
    sourceDoc: hirayaSourceDoc,
    sourceSection: '2. Overall Architecture Design',
    navLabel: '架構',
    shortLabel: '架構',
    eyebrow: '整體架構',
    title: 'Public Edge、Private Workloads 與 GitOps Runtime',
    summary:
      '整體架構結合 public HTTPS edge、private EKS workloads、GitOps 管理的 manifests、外部化 secrets，以及保留在內部的 observability surfaces。',
    thesis:
      'Hiraya 應呈現真實 cloud platform boundary：公網只進入 shared ingress path，而 services、data、secrets 與 monitoring 保持在受控的 Kubernetes 與 AWS layers 之後。',
    mediaSlots: [
      {
        id: 'architecture-diagram-frame',
        type: 'diagram-frame',
        status: 'placeholder',
        title: 'AWS/EKS 架構圖框架',
        description:
          '預留大型 responsive frame 給最終架構圖，呈現 Route 53、ALB/Gateway API、EKS private workloads、Secrets Manager、ECR、Argo CD、Prometheus 與 Grafana。圖可於後續另行製作。',
        evidenceRefs: ['p0-public-ingress', 'p1-private-workloads'],
      },
      {
        id: 'ingress-screenshot-hover',
        type: 'screenshot-hover',
        status: 'planned',
        title: 'Ingress、DNS 與 TLS 截圖',
        description:
          'Network 與 ingress cards 可揭露 Route 53 records、ALB target health、browser certificate status、Gateway/HTTPRoute resources 與 public endpoint smoke tests 的 screenshots。',
        evidenceRefs: ['p0-public-ingress'],
      },
      {
        id: 'gitops-resource-tree-hover',
        type: 'screenshot-hover',
        status: 'planned',
        title: 'Argo CD resource-tree 截圖',
        description:
          'Microservice 與 platform cards 可揭露 Argo CD App-of-Apps screenshots，展示 Synced/Healthy child applications 與受管理的 Kubernetes resources。',
        evidenceRefs: ['p0-argocd-app-of-apps'],
      },
    ],
    metrics: [
      {
        label: 'Region',
        value: 'ap-northeast-1',
        note: 'Dev 環境部署於 Tokyo region。',
      },
      {
        label: 'Availability Zones',
        value: '3',
        note: 'Public 與 private subnets 橫跨 1a、1c、1d。',
      },
      {
        label: 'Public endpoints',
        value: '3',
        note: 'Storefront、Argo CD 與 Grafana 共用 Gateway/ALB edge。',
      },
    ],
    sections: [
      {
        id: 'network-architecture',
        eyebrow: 'AWS 網路',
        title: '專用 VPC，分離 public edge 與 private workload subnets',
        body:
          'VPC 使用 public subnets 放置 ALB 與 NAT，private subnets 放置 EKS nodes 與 pods。單一 NAT Gateway 支援 Dev 階段 outbound access，S3 Gateway Endpoint 則降低 S3 traffic 對 NAT 的依賴。',
        table: {
          columns: ['項目', '設計'],
          rows: [
            ['VPC', 'devops-hiraya-dev-vpc'],
            ['CIDR', '10.1.0.0/16'],
            ['Availability Zones', 'ap-northeast-1a, ap-northeast-1c, ap-northeast-1d'],
            ['Public edge subnets', '10.1.1.0/24, 10.1.2.0/24, 10.1.3.0/24'],
            ['Private workload subnets', '10.1.11.0/24, 10.1.12.0/24, 10.1.13.0/24'],
            ['Outbound egress', 'Single NAT Gateway'],
            ['AWS private access optimization', 'S3 Gateway VPC Endpoint'],
          ],
        },
      },
      {
        id: 'ingress-path',
        eyebrow: 'Ingress',
        title: '共享 HTTPS entry path',
        body:
          '外部流量集中經由單一 shared ALB 與 Gateway API route layer，而不是讓每個 service 獨立暴露。',
        bullets: [
          'User -> Route 53 -> ALB -> Gateway API Gateway -> HTTPRoute -> Frontend Service -> Nginx -> Gateway -> Backend Services。',
          'AWS Load Balancer Controller 依 Gateway API resources 建立 ALB。',
          'ExternalDNS 依 HTTPRoute hostnames 管理 Route 53 records。',
          'ACM 為 hiraya.noidilin.dev 與 *.hiraya.noidilin.dev 提供 certificates。',
        ],
        tags: ['Route 53', 'ALB', 'Gateway API', 'ExternalDNS', 'ACM'],
      },
      {
        id: 'microservices',
        eyebrow: 'Kubernetes 邊界',
        title: 'Vintage namespace service map',
        table: {
          columns: ['元件', 'Kubernetes 類型', 'Port', '對外性質', '設計意圖'],
          rows: [
            ['frontend', 'Deployment + Service + HTTPRoute', '3000 -> 80', 'Public via Gateway', 'Storefront 與 nginx /api proxy'],
            ['gateway', 'Deployment + Service', '3001', 'Private', 'API aggregation layer'],
            ['auth', 'Deployment + Service', '3002', 'Private', '登入、註冊與驗證'],
            ['product-service', 'Deployment + Service', '3003', 'Private', 'Catalog 與 browsing API'],
            ['orders', 'Deployment + Service', '3005', 'Private', '主要 order API owner'],
            ['order-service', 'Deployment + Service', '3004', 'Private', 'Legacy service boundary'],
            ['user-service', 'Deployment + Service', '3006', 'Private', 'User profile/data service'],
            ['vintage-postgres', 'StatefulSet + Headless Service', '5432', 'Private', 'Kubernetes 內部 dev database'],
          ],
        },
      },
      {
        id: 'secrets-observability',
        eyebrow: '維運',
        title: 'Secrets 與 observability 從 app code 分離',
        bullets: [
          'External Secrets Operator 從 AWS Secrets Manager materialize application 與 platform credentials。',
          'Vintage runtime secrets 位於 /hiraya/dev/apps/vintage。',
          'Argo CD 與 Grafana admin credentials 位於 platform-specific Secrets Manager paths。',
          'Prometheus 維持 ClusterIP，而 Grafana 為 demo visibility 透過 shared edge 暴露。',
        ],
        tags: ['AWS Secrets Manager', 'External Secrets Operator', 'Prometheus', 'Grafana'],
      },
    ],
  },
  {
    id: 'cost',
    sourceDoc: hirayaSourceDoc,
    sourceSection: '3. Hardware and Cost Estimate',
    navLabel: '成本',
    shortLabel: '成本',
    eyebrow: '硬體與成本',
    title: '精簡 EKS 容量與清楚的取捨',
    summary:
      '目前 Dev cluster 使用三台 t3.medium Spot nodes 並可正常運作，但 Pod density 已是主要限制。',
    thesis:
      '成本敘事必須誠實：這不是最低成本的 AWS demo，而是一個合理的 Kubernetes/GitOps platform，且主要 cost drivers 與 capacity risks 都能被看見。',
    mediaSlots: [
      {
        id: 'cost-screenshot-hover',
        type: 'screenshot-hover',
        status: 'planned',
        title: '成本與 destroy 證據 screenshots',
        description:
          'Cost cards 可在 assets 捕捉後揭露 Cost Explorer、AWS Budgets、Terraform destroy workflow 或 AWS console cleanup screenshots。',
        evidenceRefs: ['p2-cost-destroy-workflow'],
      },
      {
        id: 'capacity-screenshot-hover',
        type: 'screenshot-hover',
        status: 'planned',
        title: 'EKS 容量截圖',
        description:
          'Capacity cards 可揭露 kubectl node/pod density output、node group settings 與 workload scheduling evidence，不需要先完成 screenshots 才能實作版面。',
        evidenceRefs: ['p1-private-workloads'],
      },
    ],
    metrics: [
      {
        label: 'Cluster',
        value: 'EKS 1.34',
        note: 'devops-hiraya-dev-eks 位於 ap-northeast-1。',
      },
      {
        label: 'Node group',
        value: '3 x t3.medium',
        note: 'Spot managed node group，每個 node 30 GiB disk。',
      },
      {
        label: 'Pod slots',
        value: '42 / 51',
        note: '三台 nodes 足夠；兩台 nodes 無法容納目前 workload。',
      },
      {
        label: '24/7 estimate',
        value: '$180-215',
        note: '流量與 data-transfer 變動前的粗估月費；實際值應以 Cost Explorer 檢查。',
      },
    ],
    sections: [
      {
        id: 'runtime-selection',
        eyebrow: '運算',
        title: '已驗證的 Dev runtime configuration',
        bullets: [
          'Region: ap-northeast-1。',
          'EKS cluster: devops-hiraya-dev-eks。',
          'Kubernetes version: 1.34。',
          'Managed node group: devops-hiraya-dev-node-group。',
          'Instance type: t3.medium Spot。',
          'Node count: desired 3, min 2, max 3 in the current baseline。',
          'Allocatable resources per node：約 1930m CPU、3.2 GiB memory 與 17 pods。',
          'EBS CSI Driver 透過 EKS add-on 與 IRSA 啟用。',
        ],
      },
      {
        id: 'capacity-risk',
        eyebrow: '容量',
        title: 'Pod density 是實際限制',
        body:
          '目前 CPU 與 memory 壓力偏低，且沒有 MemoryPressure、DiskPressure 或 PIDPressure。真正的風險是 t3.medium nodes 的 pod/IP density。',
        table: {
          columns: ['指標', '數值'],
          rows: [
            ['Node count', '3'],
            ['Pod limit per node', '17'],
            ['Total cluster pod slots', '51'],
            ['Current running pods', '42'],
            ['Remaining pod slots', '9'],
          ],
        },
      },
      {
        id: 'capacity-decision',
        eyebrow: '決策',
        title: '建議的 baseline 調整',
        bullets: [
          '目前功能測試配置維持三台 t3.medium nodes。',
          '將 node group minSize 設為 3，避免 scale-down 到兩台 nodes 時造成 pods 無法排程。',
          '將 node group maxSize 設為 4，提供 Spot replacement 或短期部署餘裕。',
          '若增加更多 controllers、monitoring components 或 replicas，改用 t3.large 或 pod-density 較高的 instance family。',
        ],
      },
      {
        id: 'cost-drivers',
        eyebrow: '成本驅動',
        title: '主要支出來自固定 platform infrastructure',
        body:
          '月費估算主要由展示真實 EKS/GitOps platform 所需的 infrastructure 主導，而不是 application traffic。',
        bullets: [
          'EKS control plane 是最大固定成本，即使 workload traffic 很低仍會存在。',
          'NAT Gateway 是刻意接受的 private-subnet 取捨；讓 workers 保持 private，同時仍可 outbound pulls 與呼叫 APIs。',
          'Shared ALB 比每個 service 一個 LoadBalancer 更能降低 ingress cost。',
          'Spot workers 可降低 compute cost，但 pod density 與 Spot replacement 需要明確 headroom。',
          'Destroy workflow 是 cost governance 的一部分，因為此環境刻意維持 dev-only 且可重建。',
        ],
      },
      {
        id: 'monthly-estimate',
        eyebrow: '成本模型',
        title: '粗估 24/7 月成本',
        body:
          '實際成本應透過 AWS Pricing Calculator、Cost Explorer UnblendedCost、AWS Budgets 與 right-sizing recommendations 驗證。',
        table: {
          columns: ['成本項目', '估算假設', '預估月費', '合理性說明'],
          rows: [
            ['EKS Control Plane', '1 cluster, about 730 hours/month', 'About 73 USD', 'EKS 與 GitOps demo 的固定核心成本'],
            ['EC2 Spot Worker Nodes', '3 x t3.medium Spot', 'About 35-45 USD', '以較低 compute cost 提供 microservices 與 observability 所需資源'],
            ['EBS Volumes', 'Node disks plus PostgreSQL PVC', 'About 6-8 USD', 'Runtime storage 與 dev database persistence'],
            ['NAT Gateway', 'Single NAT Gateway plus light processing', 'About 45-55+ USD', 'Private node egress 用於 image pulls、packages 與 AWS APIs'],
            ['ALB / Gateway Ingress', '1 shared ALB with low traffic', 'About 18-25 USD', 'Storefront、Argo CD 與 Grafana 共用 ingress'],
            ['Route 53 / ACM', '1 hosted zone and few DNS queries', 'About 0.5-1 USD', '真實 HTTPS domain demo；public ACM certs 不另收費'],
            ['Secrets Manager', 'Small number of app and admin secrets', 'About 1-2 USD', '避免 credentials 進入 Git 與 Terraform outputs'],
            ['ECR', 'Multiple small image repositories', 'About 1-3 USD', '保存 deployable artifacts 與 rollback targets'],
          ],
        },
      },
    ],
  },
  {
    id: 'sdlc',
    sourceDoc: hirayaSourceDoc,
    sourceSection: '4. Full Software Development Lifecycle CI/CD Process Design',
    navLabel: 'SDLC',
    shortLabel: 'SDLC',
    eyebrow: 'CI/CD 流程',
    title: '從 Pull Request 證據到 GitOps 部署',
    summary:
      'Hiraya 將 validation、artifact publishing、manifest promotion、infrastructure delivery 與 rollback 分成責任清楚的控制路徑。',
    thesis:
      '此路線強調 CI 不直接取得部署權限；CI 產生證據與 proposed desired-state changes，reviewed Git changes 合併後再由 Argo CD 收斂 cluster。',
    mediaSlots: [
      {
        id: 'delivery-video-embed',
        type: 'intro-video',
        status: 'planned',
        title: '端到端交付導覽影片',
        description:
          'SDLC route 可嵌入或連結主要 CI/CD delivery recording，再用下方 flow cards 將影片拆成可審查階段。',
        evidenceRefs: ['p0-cicd-delivery-flow'],
      },
      {
        id: 'pipeline-evidence-hover',
        type: 'screenshot-hover',
        status: 'planned',
        title: 'Pipeline 證據 hover 狀態',
        description:
          '每個 delivery-stage card 可揭露 PR checks、ECR image push、Trivy scan、promotion PR、Argo CD sync、rollout 與 smoke verification 的 screenshots。',
        evidenceRefs: ['p0-cicd-delivery-flow', 'p1-rollback-path', 'p2-deploy-smoke'],
      },
    ],
    sections: [
      {
        id: 'core-decisions',
        eyebrow: '交付規則',
        title: '五個交付決策支撐整體流程',
        bullets: [
          '先驗證、後授權：PR checks 在沒有 cloud write permissions 的情況下執行。',
          '先產生 artifacts、再部署：images 維持 immutable，並以 commit SHA 標記。',
          'Git 是 deployment contract：CI 提出 manifest changes，merge 後由 Argo CD 套用。',
          'Infrastructure changes 必須受控：高影響 Terraform applies 需要 manual triggers、approval 與 plan evidence。',
          'Rollback 走同一路徑：rollback 是 manifest PR，將 workloads 指回指定 ECR image tag。',
        ],
      },
      {
        id: 'infrastructure-layers',
        eyebrow: '控制平面',
        title: '分離 Infrastructure 與 Workload ownership layers',
        body:
          '實作應呈現一般 application release automation 與高權限 infrastructure automation 是刻意分離的。',
        table: {
          columns: ['層級', 'Owner / executor', '責任', 'Lifecycle'],
          rows: [
            ['Project bootstrap', 'Terraform / reviewed setup', 'Remote state access、GitHub OIDC roles、ECR 與長期 runtime secrets', 'Long-lived'],
            ['Platform core', 'Environment-gated Terraform apply', 'VPC、EKS、node group、ACM/DNS primitives、AWS-side IRSA roles 與 admin secrets', 'Rebuildable'],
            ['Cluster bootstrap handoff', 'Environment-gated Terraform apply', 'Argo CD installation、AppProjects 與 root application handoff', 'Recreated after platform core rebuild'],
            ['Cluster platform', 'Argo CD', 'Controllers、CRDs、namespaces、shared gateway 與 monitoring', 'Continuous GitOps sync'],
            ['GitOps application', 'Argo CD', 'Vintage Storefront workload manifests 與 image tag desired state', 'Continuous GitOps sync'],
          ],
        },
      },
    ],
    flow: [
      {
        id: 'pull-request-validation',
        title: 'Pull Request 驗證',
        summary:
          '低權限 PR workflows 會分類變更範圍、執行 app checks、驗證 rendered manifests、只建置不推送 Docker images，並產生 infrastructure static checks。',
        evidence: ['測試結果', 'Docker buildability', 'GitOps render output', 'trusted PR 的 Terraform plan evidence'],
      },
      {
        id: 'image-publishing',
        title: 'Image 發布',
        summary:
          'Merge 到 protected main 後，GitHub Actions 重新執行 baseline validation，透過 OIDC Assume AWS，只建置受影響 services，將 SHA-tagged images 推送至 ECR，並開啟 manifest promotion PR。',
        evidence: ['Commit SHA image tags', 'ECR push records', '弱點掃描報告', 'Promotion PR diff'],
      },
      {
        id: 'gitops-sync',
        title: 'GitOps 同步',
        summary:
          'Promotion PR 合併後，Argo CD 偵測 desired-state change，同步 platform 與 workload manifests，並讓 Kubernetes 透過穩定的 Service 與 HTTPRoute names 執行 rollouts。',
        evidence: ['Argo CD sync status', 'Application health', 'Kubernetes rollout status', 'Public smoke test 證據'],
      },
      {
        id: 'infrastructure-delivery',
        title: 'Infrastructure 交付',
        summary:
          'VPC、EKS、IAM、DNS、ACM、IRSA、admin secrets 與 Argo CD handoff 透過 environment-gated Terraform workflows 交付，而不是走一般 app promotion。',
        evidence: ['Terraform plan', 'Environment approval', 'Apply logs', 'Platform smoke tests'],
      },
      {
        id: 'rollback',
        title: 'Rollback',
        summary:
          'Rollback 會驗證目標 ECR artifact、建立 manifest diff、驗證 render、開啟 rollback PR，並在 merge 後讓 Argo CD 收斂 runtime state。',
        evidence: ['Rollback reason', 'Target image tag', 'Manifest diff', 'Smoke test evidence'],
      },
    ],
  },
  {
    id: 'waf',
    sourceDoc: hirayaSourceDoc,
    sourceSection: '5. Mapping to the Six Pillars of the AWS Well-Architected Framework',
    navLabel: 'Well-Architected',
    shortLabel: 'WAF',
    eyebrow: 'AWS Well-Architected',
    title: '以六大支柱檢視 Hiraya',
    summary:
      'Well-Architected 對應說明每個設計選擇的重要性，以及 Dev 環境下一步應強化的位置。',
    thesis:
      'WAF 路線將 implementation details 轉換為 engineering judgment：目前強項、刻意接受的 Dev 取捨，以及進入 Production 前需要改善的項目。',
    mediaSlots: [
      {
        id: 'pillar-evidence-hover',
        type: 'screenshot-hover',
        status: 'planned',
        title: '含 evidence preview 的 Pillar cards',
        description:
          '每張 Well-Architected pillar card 可在 hover 時揭露一到兩張具體 screenshots，將 framework language 連回 implementation evidence，而不是停留在抽象主張。',
        evidenceRefs: ['p0-cicd-delivery-flow', 'p0-infra-approval-gate', 'p1-secrets', 'p1-grafana', 'p2-cost-destroy-workflow'],
      },
    ],
    sections: [
      {
        id: 'pillar-purpose',
        eyebrow: '檢視框架',
        title: '以 framework 作為 design review lens',
        body:
          'Hiraya 使用 AWS Well-Architected Framework 呈現 operations、security、reliability、performance、cost 與 sustainability 之間的取捨，而不是把每個工具都包裝成自動 production-ready。',
      },
    ],
    pillars: [
      {
        id: 'operational-excellence',
        title: '卓越營運',
        stance:
          'Terraform、GitHub Actions、Argo CD、Prometheus 與 Grafana 讓 platform changes 可審查、可同步、可監控且可回復。',
        highlights: [
          'Terraform 分離 bootstrap、platform core 與 Argo CD handoff layers。',
          'GitHub Actions 負責 PR validation、image promotion、infrastructure plan/apply/destroy 與 rollback workflows。',
          'Argo CD 持續將 cluster state 收斂回 GitOps desired state。',
          'Smoke tests 與 rollback workflows 讓驗證與 recovery 可展示。',
        ],
        tools: ['Terraform', 'GitHub Actions', 'EKS', 'ECR', 'Argo CD', 'Route 53', 'ExternalDNS', 'Prometheus', 'Grafana'],
      },
      {
        id: 'security',
        title: '安全性',
        stance:
          'Security model 偏向 private workload placement、集中 public ingress、短期 CI credentials、scoped AWS identities 與 externalized secrets。',
        highlights: [
          'Workers 與 services 執行於 private subnets，並維持在 ClusterIP services 之後。',
          'Gateway routes、ALB、ACM、Route 53 與 ExternalDNS 集中管理 public exposure。',
          'GitHub Actions 使用 OIDC，而不是長期 AWS access keys。',
          'IRSA 為 Kubernetes service accounts 限縮 AWS access。',
          'Secrets Manager 與 External Secrets Operator 讓 app/admin passwords 不進入 Git。',
        ],
        futureHardening: [
          '自動化 secret rotation，並納入 CloudTrail audit evidence。',
          '限制 EKS API public CIDRs，或將 privileged actions 移至 private self-hosted runner。',
          '將 Trivy scans 從 advisory checks 升級為 blocking gates。',
        ],
        tools: ['IAM', 'OIDC', 'IRSA', 'AWS Secrets Manager', 'External Secrets Operator', 'ACM', 'ALB', 'Route 53', 'ECR image scanning'],
      },
      {
        id: 'reliability',
        title: '可靠性',
        stance:
          '目前可靠性主要來自可重建 infrastructure、GitOps self-healing、persistent dev data 與 post-deployment smoke tests。',
        highlights: [
          'Managed node group 橫跨三個 private subnets。',
          'Argo CD automated sync 可修正非 Git 來源的 drift。',
          'StatefulSet 與 EBS PVC 展示 persistent storage。',
          'Destroy workflows 包含 PVC/EBS cleanup，降低 teardown residue。',
          'Rollback 透過 PR review 將 workloads 回到指定 ECR image tags。',
        ],
        futureHardening: ['為 critical services 增加 replicas、readiness/liveness probes、PodDisruptionBudgets、resource requests/limits 與 HPA。'],
        tools: ['EKS managed node group', 'EBS CSI', 'Argo CD', 'GitHub Actions deploy smoke'],
      },
      {
        id: 'performance-efficiency',
        title: '效能效率',
        stance:
          '此架構以 service decomposition、shared ingress layer、gateway aggregation 與 metrics 作為後續 right-sizing 的基礎。',
        highlights: [
          'Microservice boundaries 讓 ownership 與 image pipeline scope 更清楚。',
          'Gateway aggregation 避免 frontend 直接耦合每個 backend service。',
          'Nginx same-origin /api proxy 降低 browser CORS 與 routing complexity。',
          'Prometheus 與 Grafana 提供 performance observation baseline。',
        ],
        futureHardening: [
          '將 ServiceMonitor coverage 擴展到所有 active backend services。',
          '加入 resource requests/limits，讓 scheduling 與 autoscaling decisions 更準確。',
          '使用 dashboard data 進行 right-sizing decisions。',
        ],
        tools: ['EKS', 'Prometheus', 'Grafana', 'kube-prometheus-stack', 'Gateway API', 'ALB'],
      },
      {
        id: 'cost-optimization',
        title: '成本最佳化',
        stance:
          'Dev platform 透過 Spot capacity、shared ingress、long-lived bootstrap separation 與 destroyable platform core 控制成本。',
        highlights: [
          'Spot managed node group 降低 compute cost。',
          'Shared ALB/Gateway 避免每個 service 建立一個 LoadBalancer。',
          'S3 Gateway Endpoint 降低 S3 traffic 對 NAT 的依賴。',
          'Destroy workflows 是 demo environments 的 cost governance 一部分。',
        ],
        tools: ['EKS', 'EC2 Spot managed node group', 'NAT Gateway', 'ALB', 'ECR', 'AWS Secrets Manager', 'Terraform destroy workflow'],
      },
      {
        id: 'sustainability',
        title: '永續性',
        stance:
          'Sustainability 在此代表避免 idle cloud resources、限制重複 builds，並讓環境容易 shutdown 與 rebuild。',
        highlights: [
          '可重建 IaC 降低長期保留所有 resources 的必要性。',
          'Shared ingress 減少重複 load balancers。',
          'Spot capacity 與 max node count 限制 dev compute 擴張。',
          'Observability 可支援後續 right-sizing。',
          'ECR lifecycle policies 未來可清理 old images。',
        ],
        tools: ['EKS', 'EC2 Spot', 'ECR lifecycle', 'Prometheus', 'Grafana', 'Terraform'],
      },
    ],
  },
] as const satisfies readonly HirayaPageContent[]
