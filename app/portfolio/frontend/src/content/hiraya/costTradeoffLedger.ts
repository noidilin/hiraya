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

export type CostCapacityTradeoffLedgerContent = {
  routeId: Extract<HirayaRouteId, 'cost'>
  title: string
  summary: string
  tabs: {
    tradeoffAnalysis: string
    estimateDetails: string
    capacityDecision: string
  }
  tradeoffs: readonly CostTradeoffItem[]
  estimateRows: readonly CostEstimateRow[]
  capacity: CostCapacitySnapshot
}

export const costTradeoffClassLabels: Record<CostTradeoffClass, string> = {
  'fixed-floor': 'fixed floor',
  'runtime-capacity': 'runtime capacity',
  'savings-lever': 'savings lever',
  'governance-lever': 'governance lever',
  'public-edge': 'public edge',
}

export const costCapacityTradeoffLedgerContent: CostCapacityTradeoffLedgerContent = {
  routeId: 'cost',
  title: 'Capacity Trade-off Ledger',
  summary:
    'Hiraya pays for managed Kubernetes, private-subnet egress, and public HTTPS proof; saves with Spot capacity, shared ingress, and rebuildability; and keeps pod-density risk visible before adding more platform features.',
  tabs: {
    tradeoffAnalysis: 'Trade-off analysis',
    estimateDetails: 'Estimate details',
    capacityDecision: 'Capacity decision',
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
    {
      item: 'EKS Control Plane',
      assumption: '1 cluster, about 730 hours/month',
      monthlyEstimate: 'About 73 USD',
      justification: 'Fixed core cost for EKS and GitOps demonstration.',
      category: 'fixed-floor',
    },
    {
      item: 'EC2 Spot Worker Nodes',
      assumption: '3 x t3.medium Spot',
      monthlyEstimate: 'About 35-45 USD',
      justification: 'Enough resources for microservices and observability at reduced compute cost.',
      category: 'runtime-capacity',
    },
    {
      item: 'EBS Volumes',
      assumption: 'Node disks plus PostgreSQL PVC',
      monthlyEstimate: 'About 6-8 USD',
      justification: 'Runtime storage and dev database persistence.',
      category: 'runtime-capacity',
    },
    {
      item: 'NAT Gateway',
      assumption: 'Single NAT Gateway plus light processing',
      monthlyEstimate: 'About 45-55+ USD',
      justification: 'Private node egress for image pulls, packages, and AWS APIs.',
      category: 'fixed-floor',
    },
    {
      item: 'ALB / Gateway Ingress',
      assumption: '1 shared ALB with low traffic',
      monthlyEstimate: 'About 18-25 USD',
      justification: 'Shared ingress for storefront, Argo CD, and Grafana.',
      category: 'public-edge',
    },
    {
      item: 'Route 53 / ACM',
      assumption: '1 hosted zone and few DNS queries',
      monthlyEstimate: 'About 0.5-1 USD',
      justification: 'Real HTTPS domain demo; public ACM certs add no extra charge.',
      category: 'public-edge',
    },
    {
      item: 'Secrets Manager',
      assumption: 'Small number of app and admin secrets',
      monthlyEstimate: 'About 1-2 USD',
      justification: 'Keeps credentials out of Git and Terraform outputs.',
      category: 'fixed-floor',
    },
    {
      item: 'ECR',
      assumption: 'Multiple small image repositories',
      monthlyEstimate: 'About 1-3 USD',
      justification: 'Stores deployable artifacts and rollback targets.',
      category: 'fixed-floor',
    },
  ],
  capacity: {
    nodeCount: 3,
    podLimitPerNode: 17,
    totalPodSlots: 51,
    currentRunningPods: 42,
    remainingPodSlots: 9,
    cpuMemoryPressureSummary:
      'CPU and memory pressure are not the meaningful pressure signal right now; pod/IP density on t3.medium nodes is.',
    currentTerraformSizing: {
      desiredSize: 3,
      minSize: 2,
      maxSize: 3,
      instanceTypes: ['t3.medium'],
      capacityType: 'SPOT',
    },
    recommendedNextDecision: [
      'Keep three t3.medium Spot nodes for the current functional testing setup.',
      'Consider minSize = 3 so scale-down to two nodes cannot strand pods.',
      'Consider maxSize = 4 for Spot replacement or short-term rollout headroom.',
      'Move to t3.large, prefix delegation, Karpenter/Cluster Autoscaler, or workload request tuning if the add-on footprint grows.',
    ],
    sourceRefs: ['infra/envs/dev/platform-core/terraform.tfvars', 'docs/adr/0006-dev-eks-node-instance-size.md'],
  },
}
