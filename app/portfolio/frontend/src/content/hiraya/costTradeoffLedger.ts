import type { AppLocale } from '@/i18n/locales'

import type { HirayaRouteId } from './types'

export type CostTradeoffClass =
  | 'fixed-floor'
  | 'runtime-capacity'
  | 'savings-lever'
  | 'governance-lever'
  | 'public-edge'

export type CostTradeoffItem = {
  id: string
  label: string
  monthlyEstimate?: string
  tradeoffClass: CostTradeoffClass
  acceptedBenefit: string
  savingsMechanism?: string
  remainingRisk: string
  sourceRefs: readonly string[]
}

export type CostEstimateRow = {
  item: string
  assumption: string
  monthlyEstimate: string
  justification: string
  category: CostTradeoffClass
}

export type CostCapacitySnapshot = {
  nodeCount: number
  podLimitPerNode: number
  totalPodSlots: number
  currentRunningPods: number
  remainingPodSlots: number
  cpuMemoryPressureSummary: string
  currentTerraformSizing: {
    desiredSize: number
    minSize: number
    maxSize: number
    instanceTypes: readonly string[]
    capacityType: 'SPOT' | 'ON_DEMAND'
  }
  recommendedNextDecision: readonly string[]
  sourceRefs: readonly string[]
}

export type CostCapacityTradeoffLedgerChrome = {
  eyebrow: string
  tabs: Record<'tradeoffAnalysis' | 'estimateDetails' | 'capacityDecision', { meta: string }>
  classLabels: Record<CostTradeoffClass, string>
  tradeoffAriaSuffix: string
  acceptedBenefitLabel: string
  savingsMechanismLabel: string
  noDirectSavingsClaim: string
  tableCaption: string
  tableColumns: {
    item: string
    category: string
    assumption: string
    monthlyEstimate: string
    justification: string
  }
  capacity: {
    decisionEyebrow: string
    decisionTitle: string
    decisionDescription: string
    demandLabel: string
    currentWorkloadLabel: string
    twoNodesLabel: string
    insufficientLabel: string
    threeNodesLabel: string
    fitsWithSpareSlotsLabel: string
    slotsUsedAriaLabel: string
    slotsUsedAriaText: string
    slotsUsedSummaryLabel: string
    sizingLogicLabel: string
    currentTerraformTitle: string
    terraformSizingPrefix: string
    capacityWord: string
    gapTitle: string
    gapDescription: string
  }
}

export type CostCapacityTradeoffLedgerContent = {
  routeId: Extract<HirayaRouteId, 'cost'>
  title: string
  summary: string
  tabs: {
    tradeoffAnalysis: { label: string }
    estimateDetails: { label: string }
    capacityDecision: { label: string }
  }
  chrome: CostCapacityTradeoffLedgerChrome
  tradeoffs: readonly CostTradeoffItem[]
  estimateRows: readonly CostEstimateRow[]
  capacity: CostCapacitySnapshot
}

export const costCapacityTradeoffLedgerContentEn: CostCapacityTradeoffLedgerContent = {
  routeId: 'cost',
  title: 'Capacity Trade-off Ledger',
  summary:
    'Hiraya pays for managed Kubernetes, private-subnet egress, and public HTTPS proof; saves with Spot capacity, shared ingress, and rebuildability; and keeps pod-density risk visible before adding more platform features.',
  tabs: {
    tradeoffAnalysis: { label: 'Trade-off analysis' },
    estimateDetails: { label: 'Estimate details' },
    capacityDecision: { label: 'Capacity decision' },
  },
  chrome: {
    eyebrow: 'Cost explanation model',
    tabs: {
      tradeoffAnalysis: { meta: 'why it exists' },
      estimateDetails: { meta: 'monthly view' },
      capacityDecision: { meta: 'pod headroom' },
    },
    classLabels: {
      'fixed-floor': 'fixed floor',
      'runtime-capacity': 'runtime capacity',
      'savings-lever': 'savings lever',
      'governance-lever': 'governance lever',
      'public-edge': 'public edge',
    },
    tradeoffAriaSuffix: 'trade-off',
    acceptedBenefitLabel: 'accepted benefit',
    savingsMechanismLabel: 'saved / avoided',
    noDirectSavingsClaim: 'No direct savings claim; this is an accepted platform cost.',
    tableCaption: 'Capacity trade-off ledger monthly estimate details',
    tableColumns: {
      item: 'Cost item',
      category: 'Category',
      assumption: 'Estimate assumption',
      monthlyEstimate: 'Monthly estimate',
      justification: 'Justification',
    },
    capacity: {
      decisionEyebrow: 'node count decision',
      decisionTitle: 'Keep three t3.medium Spot nodes',
      decisionDescription:
        'The decision is driven by pod slots, not CPU or memory. The current workload needs 42 running pods; two nodes only provide 34 slots, while three nodes provide 51.',
      demandLabel: 'demand',
      currentWorkloadLabel: 'current running workload',
      twoNodesLabel: '2 nodes',
      insufficientLabel: 'insufficient for current pods',
      threeNodesLabel: '3 nodes',
      fitsWithSpareSlotsLabel: 'fits with 9 spare slots',
      slotsUsedAriaLabel: 'Pod slots used',
      slotsUsedAriaText: '42 of 51 pod slots used',
      slotsUsedSummaryLabel: 'pod slots used',
      sizingLogicLabel: 'sizing logic',
      currentTerraformTitle: 'Current Terraform',
      terraformSizingPrefix: 'desired / min / max =',
      capacityWord: 'capacity',
      gapTitle: 'Gap to keep visible',
      gapDescription:
        'Desired size already targets three nodes, but minSize is still 2 and maxSize is still 3. That means scale-down can remove the only safe pod-density floor, and there is no fourth-node buffer for Spot replacement or rollout overlap.',
    },
  },
  tradeoffs: [
    {
      id: 'eks-control-plane',
      label: 'EKS control plane',
      monthlyEstimate: 'About 73 USD',
      tradeoffClass: 'fixed-floor',
      acceptedBenefit: 'Proves Hiraya runs on a real managed Kubernetes control plane instead of a local-only demo.',
      remainingRisk: 'This cost exists even when application traffic is near zero, so the environment must stay intentionally dev-scoped and destroyable.',
      sourceRefs: ['infra/modules/eks/main.tf', 'app/portfolio/frontend/src/content/hiraya/en.ts'],
    },
    {
      id: 'nat-gateway',
      label: 'NAT Gateway',
      monthlyEstimate: 'About 45-55+ USD',
      tradeoffClass: 'fixed-floor',
      acceptedBenefit: 'Keeps worker nodes in private subnets while still allowing outbound pulls, package downloads, and AWS API access.',
      savingsMechanism: 'S3 Gateway Endpoint reduces NAT dependency for S3-bound traffic.',
      remainingRisk: 'The single NAT Gateway is a visible monthly floor and a dev-stage availability trade-off, not a production HA egress design.',
      sourceRefs: ['infra/modules/vpc/main.tf', 'app/portfolio/frontend/src/content/hiraya/en.ts'],
    },
    {
      id: 'spot-workers',
      label: 'Spot worker nodes',
      monthlyEstimate: 'About 35-45 USD',
      tradeoffClass: 'runtime-capacity',
      acceptedBenefit: 'Three t3.medium Spot nodes currently fit the Vintage services plus platform add-ons at lower compute cost.',
      savingsMechanism: 'Spot capacity avoids paying on-demand rates for a disposable dev platform.',
      remainingRisk: 'Spot replacement and t3.medium pod density need explicit headroom; two nodes would not fit the current workload.',
      sourceRefs: ['infra/envs/dev/platform-core/terraform.tfvars', 'docs/adr/0006-dev-eks-node-instance-size.md'],
    },
    {
      id: 'shared-alb-edge',
      label: 'Shared ALB edge',
      monthlyEstimate: 'About 18-25 USD',
      tradeoffClass: 'public-edge',
      acceptedBenefit: 'Provides real public HTTPS proof for storefront, Argo CD, and Grafana through one edge path.',
      savingsMechanism: 'One shared ingress avoids creating a separate LoadBalancer for every service.',
      remainingRisk: 'The shared edge must stay clearly routed and protected because multiple proof surfaces depend on it.',
      sourceRefs: ['app/portfolio/frontend/src/content/hiraya/en.ts', 'docs/evidence-checklist.md'],
    },
    {
      id: 's3-gateway-endpoint',
      label: 'S3 Gateway Endpoint',
      tradeoffClass: 'savings-lever',
      acceptedBenefit: 'Keeps S3 access private to the VPC route-table path and reduces unnecessary NAT traversal.',
      savingsMechanism: 'Avoids sending S3 traffic through the NAT Gateway where endpoint routing is enough.',
      remainingRisk: 'Only S3 is optimized this way; other AWS APIs still need normal private egress or future interface endpoint decisions.',
      sourceRefs: ['infra/modules/vpc/main.tf'],
    },
    {
      id: 'destroy-workflow',
      label: 'Destroy workflow',
      tradeoffClass: 'governance-lever',
      acceptedBenefit: 'Makes cost control part of the operating model for a disposable dev platform.',
      savingsMechanism: 'Spend is controlled by rebuildability and intentional teardown rather than pretending the platform is production-always-on.',
      remainingRisk: 'Destroyability must preserve enough evidence and runbook clarity so teardown does not hide architecture proof.',
      sourceRefs: ['docs/evidence-checklist.md', '.github/workflows'],
    },
  ],
  estimateRows: [
    { item: 'EKS Control Plane', assumption: '1 cluster, about 730 hours/month', monthlyEstimate: 'About 73 USD', justification: 'Fixed core cost for EKS and GitOps demonstration.', category: 'fixed-floor' },
    { item: 'EC2 Spot Worker Nodes', assumption: '3 x t3.medium Spot', monthlyEstimate: 'About 35-45 USD', justification: 'Enough resources for microservices and observability at reduced compute cost.', category: 'runtime-capacity' },
    { item: 'EBS Volumes', assumption: 'Node disks plus PostgreSQL PVC', monthlyEstimate: 'About 6-8 USD', justification: 'Runtime storage and dev database persistence.', category: 'runtime-capacity' },
    { item: 'NAT Gateway', assumption: 'Single NAT Gateway plus light processing', monthlyEstimate: 'About 45-55+ USD', justification: 'Private node egress for image pulls, packages, and AWS APIs.', category: 'fixed-floor' },
    { item: 'ALB / Gateway Ingress', assumption: '1 shared ALB with low traffic', monthlyEstimate: 'About 18-25 USD', justification: 'Shared ingress for storefront, Argo CD, and Grafana.', category: 'public-edge' },
    { item: 'Route 53 / ACM', assumption: '1 hosted zone and few DNS queries', monthlyEstimate: 'About 0.5-1 USD', justification: 'Real HTTPS domain demo; public ACM certs add no extra charge.', category: 'public-edge' },
    { item: 'Secrets Manager', assumption: 'Small number of app and admin secrets', monthlyEstimate: 'About 1-2 USD', justification: 'Keeps credentials out of Git and Terraform outputs.', category: 'fixed-floor' },
    { item: 'ECR', assumption: 'Multiple small image repositories', monthlyEstimate: 'About 1-3 USD', justification: 'Stores deployable artifacts and rollback targets.', category: 'fixed-floor' },
  ],
  capacity: {
    nodeCount: 3,
    podLimitPerNode: 17,
    totalPodSlots: 51,
    currentRunningPods: 42,
    remainingPodSlots: 9,
    cpuMemoryPressureSummary:
      'CPU and memory pressure are not the meaningful pressure signal right now; pod/IP density on t3.medium nodes is.',
    currentTerraformSizing: { desiredSize: 3, minSize: 2, maxSize: 3, instanceTypes: ['t3.medium'], capacityType: 'SPOT' },
    recommendedNextDecision: [
      'Keep three t3.medium Spot nodes for the current functional testing setup.',
      'Consider minSize = 3 so scale-down to two nodes cannot strand pods.',
      'Consider maxSize = 4 for Spot replacement or short-term rollout headroom.',
      'Move to t3.large, prefix delegation, Karpenter/Cluster Autoscaler, or workload request tuning if the add-on footprint grows.',
    ],
    sourceRefs: ['infra/envs/dev/platform-core/terraform.tfvars', 'docs/adr/0006-dev-eks-node-instance-size.md'],
  },
}

export const costCapacityTradeoffLedgerContentZhTW: CostCapacityTradeoffLedgerContent = {
  ...costCapacityTradeoffLedgerContentEn,
  title: '容量取捨帳本',
  summary:
    'Hiraya 為 managed Kubernetes、private-subnet egress 與 public HTTPS proof 付出固定成本；透過 Spot capacity、shared ingress 與可重建性節省支出；並在加入更多平台能力前，讓 pod-density risk 保持可見。',
  tabs: {
    tradeoffAnalysis: { label: '取捨分析' },
    estimateDetails: { label: '估算細節' },
    capacityDecision: { label: '容量決策' },
  },
  chrome: {
    eyebrow: '成本說明模型',
    tabs: {
      tradeoffAnalysis: { meta: '為何存在' },
      estimateDetails: { meta: '月費視角' },
      capacityDecision: { meta: 'Pod headroom' },
    },
    classLabels: {
      'fixed-floor': '固定底線成本',
      'runtime-capacity': 'Runtime 容量',
      'savings-lever': '節省槓桿',
      'governance-lever': '治理槓桿',
      'public-edge': 'Public edge',
    },
    tradeoffAriaSuffix: '取捨',
    acceptedBenefitLabel: '接受此成本換來的能力',
    savingsMechanismLabel: '節省／避免的成本',
    noDirectSavingsClaim: '沒有直接節省宣稱；這是被接受的平台成本。',
    tableCaption: '容量取捨帳本的月費估算細節',
    tableColumns: {
      item: '成本項目',
      category: '分類',
      assumption: '估算假設',
      monthlyEstimate: '預估月費',
      justification: '支出合理性',
    },
    capacity: {
      decisionEyebrow: '節點數決策',
      decisionTitle: '維持三台 t3.medium Spot 節點',
      decisionDescription:
        '此決策由 Pod slot 驅動，而不是 CPU 或記憶體。目前 workload 需要 42 個 running pods；兩台節點只提供 34 個 slots，三台節點則提供 51 個。',
      demandLabel: '需求',
      currentWorkloadLabel: '目前 running workload',
      twoNodesLabel: '2 nodes',
      insufficientLabel: '不足以承載目前 pods',
      threeNodesLabel: '3 nodes',
      fitsWithSpareSlotsLabel: '可承載並保留 9 個 slots',
      slotsUsedAriaLabel: '已使用 Pod slots',
      slotsUsedAriaText: '已使用 42 / 51 個 pod slots',
      slotsUsedSummaryLabel: 'pod slots 已使用',
      sizingLogicLabel: 'Sizing 邏輯',
      currentTerraformTitle: '目前 Terraform 設定',
      terraformSizingPrefix: 'desired / min / max =',
      capacityWord: 'capacity',
      gapTitle: '需要持續看見的缺口',
      gapDescription:
        'Desired size 已經指向三台節點，但 minSize 仍是 2、maxSize 仍是 3。這代表 scale-down 可能移除唯一安全的 pod-density floor，而且沒有第四台節點可作為 Spot replacement 或 rollout overlap 的緩衝。',
    },
  },
  tradeoffs: [
    {
      ...costCapacityTradeoffLedgerContentEn.tradeoffs[0],
      label: 'EKS control plane',
      acceptedBenefit: '證明 Hiraya 跑在真實 managed Kubernetes control plane，而不是只能在本機展示的 demo。',
      remainingRisk: '即使 application traffic 接近零，這筆成本仍會存在；因此環境必須刻意維持 dev scope 且可銷毀。',
    },
    {
      ...costCapacityTradeoffLedgerContentEn.tradeoffs[1],
      acceptedBenefit: '讓 worker nodes 留在 private subnets，同時仍能進行 outbound image pulls、package downloads 與 AWS API access。',
      savingsMechanism: 'S3 Gateway Endpoint 降低 S3-bound traffic 對 NAT 的依賴。',
      remainingRisk: 'Single NAT Gateway 是可見的月費底線，也是 dev 階段的可用性取捨，不是 production HA egress design。',
    },
    {
      ...costCapacityTradeoffLedgerContentEn.tradeoffs[2],
      label: 'Spot worker nodes',
      acceptedBenefit: '三台 t3.medium Spot nodes 目前能以較低 compute cost 承載 Vintage services 與 platform add-ons。',
      savingsMechanism: 'Spot capacity 避免為 disposable dev platform 支付 on-demand rates。',
      remainingRisk: 'Spot replacement 與 t3.medium pod density 需要明確 headroom；兩台節點無法承載目前 workload。',
    },
    {
      ...costCapacityTradeoffLedgerContentEn.tradeoffs[3],
      label: 'Shared ALB edge',
      acceptedBenefit: '透過單一 edge path 為 storefront、Argo CD 與 Grafana 提供真實 public HTTPS proof。',
      savingsMechanism: 'Shared ingress 避免每個 service 都建立獨立 LoadBalancer。',
      remainingRisk: '多個 proof surfaces 依賴 shared edge，因此 route 與保護邊界必須保持清楚。',
    },
    {
      ...costCapacityTradeoffLedgerContentEn.tradeoffs[4],
      acceptedBenefit: '讓 S3 access 維持在 VPC route-table path 內，並減少不必要的 NAT traversal。',
      savingsMechanism: '當 endpoint routing 已足夠時，避免把 S3 traffic 送 through NAT Gateway。',
      remainingRisk: '目前只有 S3 以此方式最佳化；其他 AWS APIs 仍需要正常 private egress，或未來再決定 interface endpoints。',
    },
    {
      ...costCapacityTradeoffLedgerContentEn.tradeoffs[5],
      label: 'Destroy workflow',
      acceptedBenefit: '讓 cost control 成為 disposable dev platform 的 operating model 一部分。',
      savingsMechanism: '透過可重建性與刻意 teardown 控制支出，而不是假裝平台是 production-always-on。',
      remainingRisk: 'Destroyability 必須保留足夠 evidence 與 runbook clarity，避免 teardown 把 architecture proof 一起藏掉。',
    },
  ],
  estimateRows: [
    { ...costCapacityTradeoffLedgerContentEn.estimateRows[0], assumption: '1 個 cluster，約 730 小時/月', justification: 'EKS 與 GitOps demonstration 的固定核心成本。' },
    { ...costCapacityTradeoffLedgerContentEn.estimateRows[1], assumption: '3 x t3.medium Spot', justification: '以較低 compute cost 提供 microservices 與 observability 所需資源。' },
    { ...costCapacityTradeoffLedgerContentEn.estimateRows[2], assumption: 'Node disks 加上 PostgreSQL PVC', justification: 'Runtime storage 與 dev database persistence。' },
    { ...costCapacityTradeoffLedgerContentEn.estimateRows[3], assumption: 'Single NAT Gateway 加少量 processing', justification: 'Private node egress 用於 image pulls、packages 與 AWS APIs。' },
    { ...costCapacityTradeoffLedgerContentEn.estimateRows[4], assumption: '1 shared ALB，低流量', justification: 'Storefront、Argo CD 與 Grafana 共用 ingress。' },
    { ...costCapacityTradeoffLedgerContentEn.estimateRows[5], assumption: '1 hosted zone 與少量 DNS queries', justification: '真實 HTTPS domain demo；public ACM certs 不另外收費。' },
    { ...costCapacityTradeoffLedgerContentEn.estimateRows[6], assumption: '少量 app 與 admin secrets', justification: '避免 credentials 進入 Git 與 Terraform outputs。' },
    { ...costCapacityTradeoffLedgerContentEn.estimateRows[7], assumption: '多個小型 image repositories', justification: '保存 deployable artifacts 與 rollback targets。' },
  ],
  capacity: {
    ...costCapacityTradeoffLedgerContentEn.capacity,
    cpuMemoryPressureSummary:
      'CPU 與記憶體目前不是最有意義的壓力訊號；t3.medium nodes 上的 Pod/IP density 才是。',
    recommendedNextDecision: [
      '目前 functional testing setup 維持三台 t3.medium Spot nodes。',
      '考慮將 minSize 設為 3，避免 scale-down 到兩台節點後造成 pods 無處可排。',
      '考慮將 maxSize 設為 4，為 Spot replacement 或短期 rollout headroom 保留空間。',
      '若 add-on footprint 持續成長，再移往 t3.large、prefix delegation、Karpenter/Cluster Autoscaler，或調整 workload requests。',
    ],
  },
}

export const costCapacityTradeoffLedgerContent = costCapacityTradeoffLedgerContentEn

export function getCostCapacityTradeoffLedgerContent(locale: AppLocale): CostCapacityTradeoffLedgerContent {
  return locale === 'zh-TW' ? costCapacityTradeoffLedgerContentZhTW : costCapacityTradeoffLedgerContentEn
}
