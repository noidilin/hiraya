import { hirayaSourceDoc, type HirayaEvidenceItem, type HirayaPageContent } from './types'

export const hirayaEvidenceItemsEn = [
  {
    id: 'p0-cicd-delivery-flow',
    priority: 'P0',
    title: 'Complete CI/CD delivery flow',
    suggestedFormat: 'video',
    portfolioValue: 'Proves the platform can validate, build, publish, promote, deploy, and verify a change without manual cluster mutation.',
    checklistSource: 'docs/evidence-checklist.md',
  },
  {
    id: 'p0-argocd-app-of-apps',
    priority: 'P0',
    title: 'Argo CD App-of-Apps health',
    suggestedFormat: 'short-video',
    portfolioValue: 'Shows GitOps ownership of platform add-ons and Vintage workloads through Synced / Healthy applications and resource trees.',
    checklistSource: 'docs/evidence-checklist.md',
  },
  {
    id: 'p0-infra-approval-gate',
    priority: 'P0',
    title: 'Infrastructure deploy with approval gate',
    suggestedFormat: 'video',
    portfolioValue: 'Shows that high-impact Terraform applies are gated, reviewable, and separated from normal application release automation.',
    checklistSource: 'docs/evidence-checklist.md',
  },
  {
    id: 'p0-public-ingress',
    priority: 'P0',
    title: 'Public endpoint, DNS, TLS, and ALB ingress',
    suggestedFormat: 'short-video',
    portfolioValue: 'Proves the public path through Route 53, HTTPS, ALB/Gateway API, frontend, and API smoke checks.',
    checklistSource: 'docs/evidence-checklist.md',
  },
  {
    id: 'p1-rollback-path',
    priority: 'P1',
    title: 'Rollback through GitOps PR',
    suggestedFormat: 'video',
    portfolioValue: 'Shows recovery uses the same reviewed GitOps control plane rather than manual kubectl patching.',
    checklistSource: 'docs/evidence-checklist.md',
  },
  {
    id: 'p1-secrets',
    priority: 'P1',
    title: 'Secrets Manager and External Secrets',
    suggestedFormat: 'screenshot',
    portfolioValue: 'Proves credentials are externalized and materialized at runtime without committing secret values to Git.',
    checklistSource: 'docs/evidence-checklist.md',
  },
  {
    id: 'p1-grafana',
    priority: 'P1',
    title: 'Grafana observability dashboard',
    suggestedFormat: 'short-video',
    portfolioValue: 'Shows observability is usable for service health and release feedback, not merely installed as a tool.',
    checklistSource: 'docs/evidence-checklist.md',
  },
  {
    id: 'p1-private-workloads',
    priority: 'P1',
    title: 'EKS private workload architecture',
    suggestedFormat: 'screenshot',
    portfolioValue: 'Shows private node placement, ClusterIP services, shared public ingress, Gateway/HTTPRoute resources, and controlled egress.',
    checklistSource: 'docs/evidence-checklist.md',
  },
  {
    id: 'p2-deploy-smoke',
    priority: 'P2',
    title: 'Deploy smoke test evidence',
    suggestedFormat: 'screenshot',
    portfolioValue: 'Confirms deployment success is measured by public service availability, API response, DNS resolution, and Argo CD health.',
    checklistSource: 'docs/evidence-checklist.md',
  },
  {
    id: 'p2-cost-destroy-workflow',
    priority: 'P2',
    title: 'Cost control and destroy workflow',
    suggestedFormat: 'short-video',
    portfolioValue: 'Shows the dev platform is intentionally destroyable and that cost governance is part of the operating model.',
    checklistSource: 'docs/evidence-checklist.md',
  },
] as const satisfies readonly HirayaEvidenceItem[]

export const hirayaPagesEn = [
  {
    id: 'brief',
    sourceDoc: hirayaSourceDoc,
    sourceSection: '1. Solution Overview and Design Principles',
    navLabel: 'Brief',
    shortLabel: 'Brief',
    eyebrow: 'Solution overview',
    title: 'Rebuildable DevOps Platform for Hiraya',
    summary:
      'Hiraya demonstrates a second-hand vintage e-commerce system on AWS using EKS, Terraform, GitHub Actions, Argo CD, and Prometheus/Grafana.',
    thesis:
      'The project is a portfolio-grade dev environment that proves cloud platform design, infrastructure as code, CI/CD, GitOps, and observability through a rebuildable microservice system.',
    proofPoints: [
      {
        id: 'dev-platform-scope',
        title: 'Dev platform, not production theater',
        summary:
          'The site should clearly frame Hiraya as a dev-only, rebuildable AWS/EKS platform built to demonstrate real platform engineering decisions without overclaiming production readiness.',
      },
      {
        id: 'delivery-platform-proof',
        title: 'The portfolio proof is the delivery system',
        summary:
          'The strongest evidence is the path from PR validation to image publishing, manifest promotion, Argo CD sync, rollout, and smoke verification.',
        evidenceRefs: ['p0-cicd-delivery-flow'],
      },
      {
        id: 'runtime-proof',
        title: 'The runtime proves cloud-native boundaries',
        summary:
          'Public HTTPS endpoints, private ClusterIP services, shared ingress, Secrets Manager integration, and Grafana dashboards show this is more than a static frontend.',
        evidenceRefs: ['p0-public-ingress', 'p1-secrets', 'p1-grafana'],
      },
    ],
    mediaSlots: [
      {
        id: 'overview-youtube-introduction',
        type: 'intro-video',
        status: 'planned',
        title: 'Embedded project walkthrough video',
        description:
          'A short YouTube introduction can sit near the top of the brief route and explain the whole Hiraya platform before visitors inspect individual route details.',
        evidenceRefs: ['p0-cicd-delivery-flow', 'p0-argocd-app-of-apps', 'p0-infra-approval-gate'],
      },
      {
        id: 'overview-evidence-hover-cards',
        type: 'screenshot-hover',
        status: 'planned',
        title: 'Hover evidence cards',
        description:
          'Key info cards can reveal screenshots from docs/evidence-checklist.md on hover or focus, keeping the page readable while making claims inspectable.',
        evidenceRefs: ['p0-cicd-delivery-flow', 'p0-public-ingress', 'p1-grafana'],
      },
    ],
    metrics: [
      {
        label: 'Design goals',
        value: '4',
        note: 'Rebuildability, verifiability, observability, and recoverability.',
      },
      {
        label: 'Primary runtime',
        value: 'EKS',
        note: 'Kubernetes deployment on AWS with private workload placement.',
      },
      {
        label: 'Delivery model',
        value: 'GitOps',
        note: 'Argo CD reconciles the desired application and platform state from Git.',
      },
    ],
    sections: [
      {
        id: 'operating-principles',
        eyebrow: 'Design principles',
        title: 'Four promises the system needs to make visible',
        body:
          'The route should make the architecture legible as an engineering system, not a list of tools. Every page should show how a change can be rebuilt, checked, observed, and recovered.',
        bullets: [
          'Rebuildability: Terraform provisions AWS foundation, EKS, bootstrap resources, IRSA, and secrets integration.',
          'Verifiability: GitHub Actions validates pull requests, builds images, renders manifests, and records deployment evidence.',
          'Observability: Prometheus and Grafana provide service health and release feedback.',
          'Recoverability: rollback is performed through GitOps manifest changes rather than manual cluster mutation.',
        ],
      },
      {
        id: 'platform-scope',
        eyebrow: 'Scope',
        title: 'What the demo platform contains',
        bullets: [
          'AWS foundation: VPC, private subnets, NAT Gateway, S3 Gateway Endpoint, ALB, Route 53, and ACM.',
          'Infrastructure as Code: Terraform separates long-lived bootstrap, platform core, and cluster handoff concerns.',
          'CI/CD pipeline: GitHub Actions validates, builds, pushes ECR images, promotes manifests, handles infrastructure workflows, and creates rollback PRs.',
          'GitOps deployment: Argo CD owns platform add-ons and workload manifests from Git.',
          'Observability: kube-prometheus-stack supplies Prometheus, Grafana, Alertmanager, and a Vintage dashboard.',
        ],
        tags: ['AWS EKS', 'Terraform', 'GitHub Actions', 'Argo CD', 'Prometheus', 'Grafana'],
      },
    ],
  },
  {
    id: 'arch',
    sourceDoc: hirayaSourceDoc,
    sourceSection: '2. Overall Architecture Design',
    navLabel: 'Architecture',
    shortLabel: 'Arch',
    eyebrow: 'Overall architecture',
    title: 'Public Edge, Private Workloads, GitOps Runtime',
    summary:
      'The architecture combines a public HTTPS edge with private EKS workloads, GitOps-managed manifests, externalized secrets, and internal observability surfaces.',
    thesis:
      'Hiraya should read as a real cloud platform boundary: the public internet reaches only the shared ingress path, while services, data, secrets, and monitoring remain behind controlled Kubernetes and AWS layers.',
    mediaSlots: [
      {
        id: 'architecture-diagram-frame',
        type: 'diagram-frame',
        status: 'placeholder',
        title: 'AWS/EKS architecture diagram frame',
        description:
          'Reserve a large responsive frame for the final architecture diagram showing Route 53, ALB/Gateway API, EKS private workloads, Secrets Manager, ECR, Argo CD, Prometheus, and Grafana. The diagram can be produced separately later.',
        evidenceRefs: ['p0-public-ingress', 'p1-private-workloads'],
      },
      {
        id: 'ingress-screenshot-hover',
        type: 'screenshot-hover',
        status: 'planned',
        title: 'Ingress, DNS, and TLS screenshots',
        description:
          'Network and ingress cards can reveal screenshots of Route 53 records, ALB target health, browser certificate status, Gateway/HTTPRoute resources, and public endpoint smoke tests.',
        evidenceRefs: ['p0-public-ingress'],
      },
      {
        id: 'gitops-resource-tree-hover',
        type: 'screenshot-hover',
        status: 'planned',
        title: 'Argo CD resource-tree screenshots',
        description:
          'Microservice and platform cards can reveal Argo CD App-of-Apps screenshots showing Synced/Healthy child applications and owned Kubernetes resources.',
        evidenceRefs: ['p0-argocd-app-of-apps'],
      },
    ],
    metrics: [
      {
        label: 'Region',
        value: 'ap-northeast-1',
        note: 'Tokyo region deployment for the dev environment.',
      },
      {
        label: 'Availability zones',
        value: '3',
        note: 'Public and private subnets span 1a, 1c, and 1d.',
      },
      {
        label: 'Public endpoints',
        value: '3',
        note: 'Storefront, Argo CD, and Grafana share the Gateway/ALB edge.',
      },
    ],
    sections: [
      {
        id: 'network-architecture',
        eyebrow: 'AWS network',
        title: 'Dedicated VPC with public edge and private workload subnets',
        body:
          'The VPC uses public subnets for ALB and NAT placement, and private subnets for EKS nodes and pods. A single NAT Gateway supports dev-stage outbound access, while an S3 Gateway Endpoint reduces dependency on NAT for S3 traffic.',
        table: {
          columns: ['Item', 'Design'],
          rows: [
            ['VPC', 'devops-hiraya-dev-vpc'],
            ['CIDR', '10.1.0.0/16'],
            ['Availability Zones', 'ap-northeast-1a, ap-northeast-1c, ap-northeast-1d'],
            ['Public edge subnets', '10.1.1.0/24, 10.1.2.0/24, 10.1.3.0/24'],
            ['Private workload subnets', '10.1.11.0/24, 10.1.12.0/24, 10.1.13.0/24'],
            ['Outbound egress', 'Single NAT Gateway'],
            ['Private AWS access optimization', 'S3 Gateway VPC Endpoint'],
          ],
        },
      },
      {
        id: 'ingress-path',
        eyebrow: 'Ingress',
        title: 'Shared HTTPS entry path',
        body:
          'External traffic is centralized through one shared ALB and Gateway API route layer instead of exposing each service independently.',
        bullets: [
          'User -> Route 53 -> ALB -> Gateway API Gateway -> HTTPRoute -> Frontend Service -> Nginx -> Gateway -> Backend Services.',
          'AWS Load Balancer Controller creates the ALB from Gateway API resources.',
          'ExternalDNS manages Route 53 records from HTTPRoute hostnames.',
          'ACM provides certificates for hiraya.noidilin.dev and *.hiraya.noidilin.dev.',
        ],
        tags: ['Route 53', 'ALB', 'Gateway API', 'ExternalDNS', 'ACM'],
      },
      {
        id: 'microservices',
        eyebrow: 'Kubernetes boundary',
        title: 'Vintage namespace service map',
        table: {
          columns: ['Component', 'Kubernetes type', 'Port', 'Exposure', 'Intent'],
          rows: [
            ['frontend', 'Deployment + Service + HTTPRoute', '3000 -> 80', 'Public via Gateway', 'Storefront and nginx /api proxy'],
            ['gateway', 'Deployment + Service', '3001', 'Private', 'API aggregation layer'],
            ['auth', 'Deployment + Service', '3002', 'Private', 'Login, registration, and authentication'],
            ['product-service', 'Deployment + Service', '3003', 'Private', 'Catalog and browsing API'],
            ['orders', 'Deployment + Service', '3005', 'Private', 'Main order API owner'],
            ['order-service', 'Deployment + Service', '3004', 'Private', 'Legacy service boundary'],
            ['user-service', 'Deployment + Service', '3006', 'Private', 'User profile/data service'],
            ['vintage-postgres', 'StatefulSet + Headless Service', '5432', 'Private', 'Internal Kubernetes dev database'],
          ],
        },
      },
      {
        id: 'secrets-observability',
        eyebrow: 'Operations',
        title: 'Secrets and observability are separated from app code',
        bullets: [
          'External Secrets Operator materializes application and platform credentials from AWS Secrets Manager.',
          'Vintage runtime secrets live under /hiraya/dev/apps/vintage.',
          'Argo CD and Grafana admin credentials live under platform-specific Secrets Manager paths.',
          'Prometheus remains ClusterIP, while Grafana is exposed for demo visibility through the shared edge.',
        ],
        tags: ['AWS Secrets Manager', 'External Secrets Operator', 'Prometheus', 'Grafana'],
      },
    ],
  },
  {
    id: 'cost',
    sourceDoc: hirayaSourceDoc,
    sourceSection: '3. Hardware and Cost Estimate',
    navLabel: 'Cost',
    shortLabel: 'Cost',
    eyebrow: 'Hardware and cost',
    title: 'Lean EKS Capacity with Explicit Trade-offs',
    summary:
      'The current dev cluster uses three t3.medium Spot nodes and is functional, but pod density is already the main constraint.',
    thesis:
      'The cost story should be honest: this is not the cheapest possible AWS demo, but it is a reasonable Kubernetes/GitOps platform whose major costs and capacity risks are visible.',
    mediaSlots: [
      {
        id: 'cost-screenshot-hover',
        type: 'screenshot-hover',
        status: 'planned',
        title: 'Cost and destroy evidence screenshots',
        description:
          'Cost cards can reveal Cost Explorer, AWS Budgets, Terraform destroy workflow, or AWS console cleanup screenshots when those assets are captured.',
        evidenceRefs: ['p2-cost-destroy-workflow'],
      },
      {
        id: 'capacity-screenshot-hover',
        type: 'screenshot-hover',
        status: 'planned',
        title: 'EKS capacity screenshots',
        description:
          'Capacity cards can reveal kubectl node/pod density output, node group settings, and workload scheduling evidence without requiring those screenshots before layout implementation.',
        evidenceRefs: ['p1-private-workloads'],
      },
    ],
    metrics: [
      {
        label: 'Cluster',
        value: 'EKS 1.34',
        note: 'devops-hiraya-dev-eks in ap-northeast-1.',
      },
      {
        label: 'Node group',
        value: '3 x t3.medium',
        note: 'Spot managed node group, 30 GiB disk per node.',
      },
      {
        label: 'Pod slots',
        value: '42 / 51',
        note: 'Three nodes are enough, but two nodes would not fit the current workload.',
      },
      {
        label: '24/7 estimate',
        value: '$180-215',
        note: 'Rough monthly range before traffic/data-transfer variance; actuals should be checked in Cost Explorer.',
      },
    ],
    sections: [
      {
        id: 'runtime-selection',
        eyebrow: 'Compute',
        title: 'Validated dev runtime configuration',
        bullets: [
          'Region: ap-northeast-1.',
          'EKS cluster: devops-hiraya-dev-eks.',
          'Kubernetes version: 1.34.',
          'Managed node group: devops-hiraya-dev-node-group.',
          'Instance type: t3.medium Spot.',
          'Node count: desired 3, min 2, max 3 in the current baseline.',
          'Allocatable resources per node: about 1930m CPU, 3.2 GiB memory, and 17 pods.',
          'EBS CSI Driver is enabled through an EKS add-on and IRSA.',
        ],
      },
      {
        id: 'capacity-risk',
        eyebrow: 'Capacity',
        title: 'Pod density is the practical constraint',
        body:
          'CPU and memory pressure are currently low, and there is no MemoryPressure, DiskPressure, or PIDPressure. The meaningful risk is pod/IP density on t3.medium nodes.',
        table: {
          columns: ['Metric', 'Value'],
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
        eyebrow: 'Decision',
        title: 'Recommended baseline adjustment',
        bullets: [
          'Keep three t3.medium nodes for the current functional testing setup.',
          'Set node group minSize to 3 so a scale-down to two nodes cannot strand pods.',
          'Set node group maxSize to 4 for Spot replacement or short-term deployment headroom.',
          'Move to t3.large or a higher pod-density instance family if more controllers, monitoring components, or replicas are added.',
        ],
      },
      {
        id: 'cost-drivers',
        eyebrow: 'Cost drivers',
        title: 'The main spend is fixed platform infrastructure',
        body:
          'The monthly estimate is dominated by infrastructure required to demonstrate a real EKS/GitOps platform, not by application traffic.',
        bullets: [
          'EKS control plane is the largest fixed cost and exists even when workload traffic is low.',
          'NAT Gateway is a deliberate private-subnet trade-off; it keeps workers private while still allowing outbound pulls and API calls.',
          'A shared ALB keeps ingress cost lower than one LoadBalancer per service.',
          'Spot workers reduce compute cost, but pod density and Spot replacement need explicit headroom.',
          'The destroy workflow is part of cost governance because the environment is intentionally dev-only and rebuildable.',
        ],
      },
      {
        id: 'monthly-estimate',
        eyebrow: 'Cost model',
        title: 'Rough 24/7 monthly estimate',
        body:
          'Actual cost should be validated with AWS Pricing Calculator, Cost Explorer UnblendedCost, AWS Budgets, and right-sizing recommendations.',
        table: {
          columns: ['Cost item', 'Estimate assumption', 'Monthly estimate', 'Justification'],
          rows: [
            ['EKS Control Plane', '1 cluster, about 730 hours/month', 'About 73 USD', 'Fixed core cost for EKS and GitOps demonstration'],
            ['EC2 Spot Worker Nodes', '3 x t3.medium Spot', 'About 35-45 USD', 'Enough resources for microservices and observability at reduced compute cost'],
            ['EBS Volumes', 'Node disks plus PostgreSQL PVC', 'About 6-8 USD', 'Runtime storage and dev database persistence'],
            ['NAT Gateway', 'Single NAT Gateway plus light processing', 'About 45-55+ USD', 'Private node egress for image pulls, packages, and AWS APIs'],
            ['ALB / Gateway Ingress', '1 shared ALB with low traffic', 'About 18-25 USD', 'Shared ingress for storefront, Argo CD, and Grafana'],
            ['Route 53 / ACM', '1 hosted zone and few DNS queries', 'About 0.5-1 USD', 'Real HTTPS domain demo; public ACM certs add no extra charge'],
            ['Secrets Manager', 'Small number of app and admin secrets', 'About 1-2 USD', 'Keeps credentials out of Git and Terraform outputs'],
            ['ECR', 'Multiple small image repositories', 'About 1-3 USD', 'Stores deployable artifacts and rollback targets'],
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
    eyebrow: 'CI/CD process',
    title: 'From Pull Request Evidence to GitOps Deployment',
    summary:
      'Hiraya separates validation, artifact publishing, manifest promotion, infrastructure delivery, and rollback into clear control paths.',
    thesis:
      'The route should show that CI does not directly become deployment authority. CI creates evidence and proposed desired-state changes; Argo CD converges the cluster after reviewed Git changes.',
    mediaSlots: [
      {
        id: 'delivery-video-embed',
        type: 'intro-video',
        status: 'planned',
        title: 'End-to-end delivery walkthrough video',
        description:
          'The SDLC route can embed or link the primary CI/CD delivery recording, then use the flow cards below to break the video into reviewable stages.',
        evidenceRefs: ['p0-cicd-delivery-flow'],
      },
      {
        id: 'pipeline-evidence-hover',
        type: 'screenshot-hover',
        status: 'planned',
        title: 'Pipeline evidence hover states',
        description:
          'Each delivery-stage card can reveal screenshots for PR checks, ECR image push, Trivy scan, promotion PR, Argo CD sync, rollout, and smoke verification.',
        evidenceRefs: ['p0-cicd-delivery-flow', 'p1-rollback-path', 'p2-deploy-smoke'],
      },
    ],
    sections: [
      {
        id: 'core-decisions',
        eyebrow: 'Delivery rules',
        title: 'Five delivery decisions anchor the process',
        bullets: [
          'Validate first, authorize later: PR checks run without cloud write permissions.',
          'Produce artifacts before deployment: images are immutable and tagged by commit SHA.',
          'Git is the deployment contract: CI proposes manifest changes, Argo CD applies them after merge.',
          'Infrastructure changes are controlled: high-impact Terraform applies require manual triggers, approval, and plan evidence.',
          'Rollback follows the same path: rollback is a manifest PR that points workloads back to a selected ECR image tag.',
        ],
      },
      {
        id: 'infrastructure-layers',
        eyebrow: 'Control planes',
        title: 'Separate infrastructure and workload ownership layers',
        body:
          'The implementation should show that normal application release automation and high-permission infrastructure automation are intentionally separated.',
        table: {
          columns: ['Layer', 'Owner / executor', 'Responsibility', 'Lifecycle'],
          rows: [
            ['Project bootstrap', 'Terraform / reviewed setup', 'Remote state access, GitHub OIDC roles, ECR, and long-lived runtime secrets', 'Long-lived'],
            ['Platform core', 'Environment-gated Terraform apply', 'VPC, EKS, node group, ACM/DNS primitives, AWS-side IRSA roles, and admin secrets', 'Rebuildable'],
            ['Cluster bootstrap handoff', 'Environment-gated Terraform apply', 'Argo CD installation, AppProjects, and root application handoff', 'Recreated after platform core rebuild'],
            ['Cluster platform', 'Argo CD', 'Controllers, CRDs, namespaces, shared gateway, and monitoring', 'Continuous GitOps sync'],
            ['GitOps application', 'Argo CD', 'Vintage Storefront workload manifests and image tag desired state', 'Continuous GitOps sync'],
          ],
        },
      },
    ],
    flow: [
      {
        id: 'pull-request-validation',
        title: 'Pull request validation',
        summary:
          'Low-privilege PR workflows classify change scope, run app checks, validate rendered manifests, build Docker images without pushing, and produce infrastructure static checks.',
        evidence: ['Test results', 'Docker buildability', 'GitOps render output', 'Terraform plan evidence for trusted PRs'],
      },
      {
        id: 'image-publishing',
        title: 'Image publishing',
        summary:
          'After merge to protected main, GitHub Actions reruns baseline validation, assumes AWS through OIDC, builds only affected services, pushes SHA-tagged images to ECR, and opens a manifest promotion PR.',
        evidence: ['Commit SHA image tags', 'ECR push records', 'Vulnerability scan reports', 'Promotion PR diff'],
      },
      {
        id: 'gitops-sync',
        title: 'GitOps synchronization',
        summary:
          'After the promotion PR merges, Argo CD detects the desired-state change, synchronizes platform and workload manifests, and lets Kubernetes perform rollouts through stable Service and HTTPRoute names.',
        evidence: ['Argo CD sync status', 'Application health', 'Kubernetes rollout status', 'Public smoke test'],
      },
      {
        id: 'infrastructure-delivery',
        title: 'Infrastructure delivery',
        summary:
          'VPC, EKS, IAM, DNS, ACM, IRSA, admin secrets, and Argo CD handoff are delivered through environment-gated Terraform workflows instead of normal app promotion.',
        evidence: ['Terraform plan', 'Environment approval', 'Apply logs', 'Platform smoke tests'],
      },
      {
        id: 'rollback',
        title: 'Rollback',
        summary:
          'Rollback verifies the target ECR artifact, creates a manifest diff, validates the render, opens a rollback PR, and lets Argo CD converge runtime state after merge.',
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
    title: 'Six-Pillar Reading of Hiraya',
    summary:
      'The Well-Architected mapping explains why the design choices matter and where the dev environment should harden next.',
    thesis:
      'The WAF route should translate implementation details into engineering judgment: what is strong now, what is an intentional dev trade-off, and what should improve before production.',
    mediaSlots: [
      {
        id: 'pillar-evidence-hover',
        type: 'screenshot-hover',
        status: 'planned',
        title: 'Pillar cards with evidence previews',
        description:
          'Each Well-Architected pillar card can reveal one or two concrete screenshots on hover, connecting framework language to implementation evidence instead of leaving it as abstract claims.',
        evidenceRefs: ['p0-cicd-delivery-flow', 'p0-infra-approval-gate', 'p1-secrets', 'p1-grafana', 'p2-cost-destroy-workflow'],
      },
    ],
    sections: [
      {
        id: 'pillar-purpose',
        eyebrow: 'Framing',
        title: 'Use the framework as a design review lens',
        body:
          'Hiraya uses the AWS Well-Architected Framework to show trade-offs across operations, security, reliability, performance, cost, and sustainability rather than presenting every tool as automatically production-ready.',
      },
    ],
    pillars: [
      {
        id: 'operational-excellence',
        title: 'Operational Excellence',
        stance:
          'Terraform, GitHub Actions, Argo CD, Prometheus, and Grafana make platform changes reviewable, synchronized, monitored, and recoverable.',
        highlights: [
          'Terraform separates bootstrap, platform core, and Argo CD handoff layers.',
          'GitHub Actions handles PR validation, image promotion, infrastructure plan/apply/destroy, and rollback workflows.',
          'Argo CD continuously converges cluster state back to the GitOps desired state.',
          'Smoke tests and rollback workflows make verification and recovery demonstrable.',
        ],
        tools: ['Terraform', 'GitHub Actions', 'EKS', 'ECR', 'Argo CD', 'Route 53', 'ExternalDNS', 'Prometheus', 'Grafana'],
      },
      {
        id: 'security',
        title: 'Security',
        stance:
          'The security model favors private workload placement, centralized public ingress, short-lived CI credentials, scoped AWS identities, and externalized secrets.',
        highlights: [
          'Workers and services run in private subnets and stay behind ClusterIP services.',
          'Gateway routes, ALB, ACM, Route 53, and ExternalDNS centralize public exposure.',
          'GitHub Actions uses OIDC instead of long-lived AWS access keys.',
          'IRSA scopes AWS access for Kubernetes service accounts.',
          'Secrets Manager and External Secrets Operator keep app and admin passwords out of Git.',
        ],
        futureHardening: [
          'Automate secret rotation and include CloudTrail audit evidence.',
          'Restrict EKS API public CIDRs or move privileged actions to a private self-hosted runner.',
          'Upgrade Trivy scans from advisory checks to blocking gates.',
        ],
        tools: ['IAM', 'OIDC', 'IRSA', 'AWS Secrets Manager', 'External Secrets Operator', 'ACM', 'ALB', 'Route 53', 'ECR image scanning'],
      },
      {
        id: 'reliability',
        title: 'Reliability',
        stance:
          'Reliability is currently driven by rebuildable infrastructure, GitOps self-healing, persistent dev data, and post-deployment smoke tests.',
        highlights: [
          'Managed node group spans three private subnets.',
          'Argo CD automated sync can correct non-Git drift.',
          'StatefulSet and EBS PVC demonstrate persistent storage.',
          'Destroy workflows include PVC/EBS cleanup to reduce teardown residue.',
          'Rollback returns workloads to selected ECR image tags through PR review.',
        ],
        futureHardening: ['Add replicas, readiness/liveness probes, PodDisruptionBudgets, resource requests/limits, and HPA for critical services.'],
        tools: ['EKS managed node group', 'EBS CSI', 'Argo CD', 'GitHub Actions deploy smoke'],
      },
      {
        id: 'performance-efficiency',
        title: 'Performance Efficiency',
        stance:
          'The architecture uses service decomposition, a shared ingress layer, gateway aggregation, and metrics as the basis for future right-sizing.',
        highlights: [
          'Microservice boundaries clarify ownership and image pipeline scope.',
          'Gateway aggregation keeps the frontend from coupling directly to every backend service.',
          'The nginx same-origin /api proxy reduces browser CORS and routing complexity.',
          'Prometheus and Grafana provide the performance observation baseline.',
        ],
        futureHardening: [
          'Extend ServiceMonitor coverage to all active backend services.',
          'Add resource requests/limits so scheduling and autoscaling decisions are accurate.',
          'Use dashboard data for right-sizing decisions.',
        ],
        tools: ['EKS', 'Prometheus', 'Grafana', 'kube-prometheus-stack', 'Gateway API', 'ALB'],
      },
      {
        id: 'cost-optimization',
        title: 'Cost Optimization',
        stance:
          'The dev platform controls cost through Spot capacity, shared ingress, long-lived bootstrap separation, and a destroyable platform core.',
        highlights: [
          'Spot managed node group reduces compute cost.',
          'Shared ALB/Gateway avoids one LoadBalancer per service.',
          'S3 Gateway Endpoint reduces NAT dependency for S3 traffic.',
          'Destroy workflows are part of cost governance for demo environments.',
        ],
        tools: ['EKS', 'EC2 Spot managed node group', 'NAT Gateway', 'ALB', 'ECR', 'AWS Secrets Manager', 'Terraform destroy workflow'],
      },
      {
        id: 'sustainability',
        title: 'Sustainability',
        stance:
          'Sustainability means avoiding idle cloud resources, limiting repeated builds, and making the environment easy to shut down and rebuild.',
        highlights: [
          'Rebuildable IaC reduces the need to keep all resources running indefinitely.',
          'Shared ingress reduces duplicate load balancers.',
          'Spot capacity and max node count limit dev compute expansion.',
          'Observability can support future right-sizing.',
          'ECR lifecycle policies can clean up old images later.',
        ],
        tools: ['EKS', 'EC2 Spot', 'ECR lifecycle', 'Prometheus', 'Grafana', 'Terraform'],
      },
    ],
  },
] as const satisfies readonly HirayaPageContent[]
