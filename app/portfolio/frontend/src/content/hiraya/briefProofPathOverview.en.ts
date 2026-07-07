import type { BriefProofPathCard } from './briefProofPathOverview'

export const briefProofPathOverviewContentEn = [
  {
    id: 'design-goals',
    label: 'Design goals',
    value: '4',
    note: 'Rebuildability, verifiability, observability, and recoverability.',
    detailTitle: 'Four engineering promises made visible',
    detailSummary:
      'Hiraya is framed as an engineering system: important changes are rebuildable, checked, observable, and recoverable.',
    detailBullets: [
      'Rebuildability: Terraform provisions AWS foundation, EKS, bootstrap resources, IRSA, and secrets integration.',
      'Verifiability: GitHub Actions validates pull requests, builds images, renders manifests, and records deployment evidence.',
      'Observability: Prometheus and Grafana provide service health and release feedback.',
      'Recoverability: rollback is performed through GitOps manifest changes rather than manual cluster mutation.',
    ],
    sourceRefs: ['app/portfolio/frontend/docs/presentation-en.md#1', 'docs/evidence-checklist.md'],
  },
  {
    id: 'primary-runtime',
    label: 'Primary runtime',
    value: 'EKS',
    note: 'Kubernetes deployment on AWS with private workload placement.',
    detailTitle: 'Runtime proof is more than a hosted frontend',
    detailSummary:
      'The platform runs through AWS foundation, private EKS workloads, shared HTTPS ingress, externalized secrets, and observable service health.',
    detailBullets: [
      'AWS foundation: VPC, private subnets, NAT Gateway, S3 Gateway Endpoint, ALB, Route 53, and ACM.',
      'Runtime boundary: public traffic enters through shared ingress while backend services remain private ClusterIP services.',
      'Secrets and operations: AWS Secrets Manager, External Secrets Operator, Prometheus, and Grafana support runtime proof without exposing secret values.',
    ],
    evidenceRefs: ['p0-public-ingress', 'p1-secrets', 'p1-grafana'],
    sourceRefs: ['app/portfolio/frontend/docs/presentation-en.md#2', 'docs/evidence-checklist.md'],
  },
  {
    id: 'delivery-model',
    label: 'Delivery model',
    value: 'GitOps',
    note: 'Argo CD reconciles the desired application and platform state from Git.',
    detailTitle: 'The delivery system is the strongest proof',
    detailSummary:
      'CI creates evidence and artifacts, reviewed Git accepts desired state, and Argo CD converges the runtime instead of allowing direct CI-to-cluster mutation.',
    detailBullets: [
      'PR validation checks application, Docker, GitOps render, and infrastructure evidence before cloud write authority is used.',
      'Image publishing creates SHA-tagged artifacts in ECR and opens a manifest promotion PR.',
      'Argo CD synchronizes the accepted GitOps state, Kubernetes rolls out workloads, and smoke tests verify the public path.',
    ],
    evidenceRefs: ['p0-cicd-delivery-flow', 'p1-rollback-path'],
    sourceRefs: ['app/portfolio/frontend/docs/presentation-en.md#4', 'docs/evidence-checklist.md'],
  },
  {
    id: 'proof-path',
    label: 'Proof path',
    value: 'Evidence-led',
    note: 'Media supports the platform claim; the architecture story comes first.',
    detailTitle: 'Why Hiraya reads as a platform demonstration',
    detailSummary:
      'The explanation stands before the screenshots: Hiraya is a dev-only, rebuildable platform that uses evidence media to prove delivery and runtime claims.',
    detailBullets: [
      'Dev platform, not production theater: the project demonstrates real decisions without overclaiming production readiness.',
      'Delivery proof: the end-to-end video covers validation, image publishing, promotion, Argo CD sync, rollout, and smoke verification.',
      'Runtime proof: public HTTPS endpoints, private services, shared ingress, secrets integration, and Grafana dashboards show cloud-native boundaries.',
    ],
    evidenceRefs: ['p0-cicd-delivery-flow', 'p0-public-ingress', 'p1-secrets', 'p1-grafana'],
    sourceRefs: ['app/portfolio/frontend/docs/presentation-en.md#1', 'docs/evidence-checklist.md'],
  },
] as const satisfies readonly BriefProofPathCard[]

