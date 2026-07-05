import type { HirayaRouteId } from './types'

export type ArchitectureOwnershipBoundaryId =
  | 'delivery-authority'
  | 'aws-foundation'
  | 'cluster-platform'
  | 'public-edge'
  | 'application-runtime'
  | 'observation'

export type ArchitectureOwnershipInternalLayer = {
  id: string
  label: string
  brief: string
}

export type ArchitectureOwnershipBoundary = {
  id: ArchitectureOwnershipBoundaryId
  label: string
  shortLabel: string
  primaryOwner: string
  supportingMechanisms: readonly string[]
  layers: readonly ArchitectureOwnershipInternalLayer[]
  responsibility: string
  decision: string
  doesNotOwn: readonly string[]
}

export type ArchitectureOwnershipConnector = {
  from: ArchitectureOwnershipBoundaryId
  to: ArchitectureOwnershipBoundaryId
  label: string
}

export type ArchitectureOwnershipContent = {
  routeId: Extract<HirayaRouteId, 'arch'>
  title: string
  summary: string
  boundaries: readonly ArchitectureOwnershipBoundary[]
  connectors: readonly ArchitectureOwnershipConnector[]
}

export const architectureOwnershipContent: ArchitectureOwnershipContent = {
  routeId: 'arch',
  title: 'Architecture as ownership design',
  summary: '',
  boundaries: [
    {
      id: 'delivery-authority',
      label: 'Delivery Authority',
      shortLabel: 'Authority',
      primaryOwner: 'GitHub Actions + human review',
      supportingMechanisms: [
        'protected branches',
        'pull request checks',
        'environment approvals',
        'OIDC federation',
        'promotion pull requests',
      ],
      layers: [
        {
          id: 'protected-git-branches',
          label: 'Protected Git branches',
          brief: 'Define where accepted desired state can enter.',
        },
        {
          id: 'pull-request-checks',
          label: 'Pull request checks',
          brief: 'Create validation evidence before merge.',
        },
        {
          id: 'image-publishing-workflow',
          label: 'Image publishing workflow',
          brief: 'Turns accepted code into tagged artifacts.',
        },
        {
          id: 'manifest-promotion-pr',
          label: 'Manifest promotion PR',
          brief: 'Proposes runtime desired-state changes.',
        },
        {
          id: 'infrastructure-approval-gate',
          label: 'Infrastructure approval gate',
          brief: 'Separates high-permission applies from normal delivery.',
        },
      ],
      responsibility:
        'Control how application and infrastructure changes are proposed, validated, approved, and handed to the owning runtime or cloud boundary.',
      decision:
        'CI creates evidence and proposed desired-state changes; it does not directly become unrestricted runtime authority.',
      doesNotOwn: ['cluster runtime convergence', 'public route exposure', 'workload business behavior', 'cloud resources after apply'],
    },
    {
      id: 'aws-foundation',
      label: 'AWS Foundation',
      shortLabel: 'AWS',
      primaryOwner: 'Terraform platform-core',
      supportingMechanisms: [
        'AWS managed services',
        'remote Terraform state',
        'IAM and IRSA policies',
        'environment-gated infrastructure workflow',
      ],
      layers: [
        {
          id: 'terraform-platform-core',
          label: 'Terraform platform-core',
          brief: 'Expresses rebuildable cloud intent.',
        },
        {
          id: 'eks-control-plane',
          label: 'EKS control plane',
          brief: 'Provides managed Kubernetes substrate.',
        },
        {
          id: 'managed-node-group',
          label: 'Managed node group',
          brief: 'Supplies disposable worker capacity.',
        },
        {
          id: 'vpc-subnets-nat',
          label: 'VPC / subnets / NAT',
          brief: 'Defines network placement and egress boundary.',
        },
        {
          id: 'iam-irsa',
          label: 'IAM / IRSA',
          brief: 'Scopes AWS access for automation and service accounts.',
        },
        {
          id: 'ecr-secrets-manager',
          label: 'ECR / Secrets Manager',
          brief: 'Holds artifacts and externalized secret sources.',
        },
      ],
      responsibility: 'Provide the AWS substrate that other ownership boundaries depend on.',
      decision:
        'Keep the dev platform rebuildable while separating durable bootstrap concerns from the disposable platform core.',
      doesNotOwn: ['application image contents', 'Kubernetes workload desired state', 'service rollout health', 'public visitor behavior'],
    },
    {
      id: 'cluster-platform',
      label: 'Cluster Platform',
      shortLabel: 'Cluster',
      primaryOwner: 'Argo CD platform applications',
      supportingMechanisms: [
        'App-of-Apps root application',
        'Argo CD platform Applications',
        'Kubernetes controllers',
        'Helm/Kustomize manifests',
        'namespace-level platform resources',
        'sync-wave ordering',
      ],
      layers: [
        {
          id: 'argocd-platform-apps',
          label: 'Argo CD apps',
          brief: 'Keep shared platform capabilities reconciled from Git.',
        },
        {
          id: 'platform-namespaces',
          label: 'Platform namespaces',
          brief: 'Create shared operational and route-admission boundaries.',
        },
        {
          id: 'gateway-api-crds',
          label: 'Gateway API CRDs',
          brief: 'Define the cluster routing vocabulary.',
        },
        {
          id: 'aws-load-balancer-controller',
          label: 'AWS LBC',
          brief: 'Translates Gateway intent into ALB and target groups.',
        },
        {
          id: 'external-dns',
          label: 'ExternalDNS',
          brief: 'Publishes approved route hostnames into Route 53.',
        },
        {
          id: 'external-secrets',
          label: 'External Secrets',
          brief: 'Materializes allowlisted AWS secrets into Kubernetes.',
        },
        {
          id: 'cert-storage-monitoring',
          label: 'Certs / storage / metrics',
          brief: 'Provides cert-manager, gp3 storage, Prometheus, and Grafana capability.',
        },
      ],
      responsibility: 'Provide shared in-cluster capabilities that make workloads reachable, observable, and operable.',
      decision: 'Platform add-ons are GitOps-managed instead of being manually installed after cluster creation.',
      doesNotOwn: [
        'AWS substrate provisioning',
        'application release approval',
        'public exposure policy as a portfolio concept',
        'business service behavior',
      ],
    },
    {
      id: 'public-edge',
      label: 'Public Edge',
      shortLabel: 'Edge',
      primaryOwner: 'Shared Gateway + service-owned routes',
      supportingMechanisms: [
        'Route 53',
        'ACM',
        'shared ALB',
        'Gateway API',
        'namespace route admission',
        'service-owned HTTPRoutes',
        'ExternalDNS',
      ],
      layers: [
        {
          id: 'public-dns-names',
          label: 'Public DNS',
          brief: 'Defines reachable hostnames.',
        },
        {
          id: 'acm-certificate',
          label: 'ACM cert',
          brief: 'Terminates trusted HTTPS.',
        },
        {
          id: 'shared-alb',
          label: 'Shared ALB',
          brief: 'Centralizes public ingress.',
        },
        {
          id: 'shared-gateway',
          label: 'Shared Gateway',
          brief: 'Accepts routes from approved public namespaces.',
        },
        {
          id: 'service-owned-routes',
          label: 'Service HTTPRoutes',
          brief: 'Lets Vintage, Grafana, and Argo CD access own route intent.',
        },
      ],
      responsibility:
        'Control the shared public HTTPS boundary and route-admission policy while letting each service owner declare its own public route.',
      decision:
        'Use one shared Gateway with namespace admission instead of independent public LoadBalancers or a central team owning every HTTPRoute.',
      doesNotOwn: ['private backend service logic', 'image publishing', 'secret source values', 'service-specific route intent'],
    },
    {
      id: 'application-runtime',
      label: 'Application Runtime',
      shortLabel: 'Runtime',
      primaryOwner: 'Argo CD workload application + Kubernetes controllers',
      supportingMechanisms: [
        'Deployments',
        'Services',
        'StatefulSet',
        'ConfigMaps/Secrets materialized into Kubernetes',
        'rollout controllers',
      ],
      layers: [
        {
          id: 'vintage-workload-manifests',
          label: 'Vintage workload manifests',
          brief: 'Declare desired runtime state.',
        },
        {
          id: 'frontend-deployment',
          label: 'Frontend deployment',
          brief: 'Serves storefront and same-origin API proxy.',
        },
        {
          id: 'gateway-backend-services',
          label: 'Gateway/backend services',
          brief: 'Run private API boundaries.',
        },
        {
          id: 'clusterip-services',
          label: 'ClusterIP services',
          brief: 'Keep internal service-to-service access private.',
        },
        {
          id: 'postgresql-statefulset-pvc',
          label: 'PostgreSQL StatefulSet/PVC',
          brief: 'Provides disposable dev data persistence.',
        },
        {
          id: 'kubernetes-rollout-control',
          label: 'Kubernetes rollout control',
          brief: 'Converges pods toward declared state.',
        },
      ],
      responsibility: 'Run Hiraya workloads behind the public edge while keeping service internals private.',
      decision: 'Separate public storefront exposure from private backend execution and keep runtime state GitOps-owned.',
      doesNotOwn: ['cloud foundation creation', 'public DNS/certificate ownership', 'CI approval policy', 'observability interpretation'],
    },
    {
      id: 'observation',
      label: 'Observation',
      shortLabel: 'Observe',
      primaryOwner: 'Operational feedback surfaces',
      supportingMechanisms: ['Prometheus', 'Grafana', 'smoke tests', 'Kubernetes health signals', 'release evidence'],
      layers: [
        {
          id: 'prometheus-metrics',
          label: 'Prometheus metrics',
          brief: 'Collect service and cluster signals.',
        },
        {
          id: 'grafana-dashboard',
          label: 'Grafana dashboard',
          brief: 'Translates metrics into inspectable service health.',
        },
        {
          id: 'smoke-checks',
          label: 'Smoke checks',
          brief: 'Verify public behavior after delivery.',
        },
        {
          id: 'argocd-health-state',
          label: 'Argo CD health state',
          brief: 'Reports convergence and sync status.',
        },
        {
          id: 'release-evidence',
          label: 'Release evidence',
          brief: 'Connects runtime result back to delivery decisions.',
        },
      ],
      responsibility:
        'Explain whether runtime and release decisions are working through feedback and verification signals.',
      decision: 'Make observability part of the portfolio explanation rather than merely installing monitoring tools.',
      doesNotOwn: ['workload deployment authority', 'AWS infrastructure provisioning', 'public route publication', 'business feature decisions'],
    },
  ],
  connectors: [
    {
      from: 'delivery-authority',
      to: 'aws-foundation',
      label: 'proposes / approves change',
    },
    {
      from: 'aws-foundation',
      to: 'cluster-platform',
      label: 'provides cloud substrate',
    },
    {
      from: 'cluster-platform',
      to: 'public-edge',
      label: 'enables cluster capabilities',
    },
    {
      from: 'public-edge',
      to: 'application-runtime',
      label: 'exposes selected routes',
    },
    {
      from: 'application-runtime',
      to: 'observation',
      label: 'emits runtime signals',
    },
  ],
}
