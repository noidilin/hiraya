# Ownership Boundaries

This page is the high-level ownership map for Hiraya. Use [`../../CONTEXT.md`](../../CONTEXT.md) for exact canonical wording.

## Boundary summary

| Boundary | Owns | Does not own | Primary repo entry point |
|---|---|---|---|
| Project Bootstrap | Durable state access, GitHub OIDC roles, ECR repositories, durable workload secrets | Disposable EKS cluster and in-cluster resources | `infra/envs/dev/bootstrap/` |
| Platform Core | Disposable AWS/EKS foundation: VPC, EKS, node group, AWS IAM/IRSA prerequisites, public-domain prerequisites | Argo CD app-of-apps and long-lived in-cluster add-ons | `infra/envs/dev/platform-core/` |
| Cluster Bootstrap | Reproducible handoff into GitOps: Argo CD install, AppProjects, root Application | Long-lived Cluster Platform add-ons and workload manifests | `infra/envs/dev/cluster-bootstrap/` |
| Cluster Platform | Shared in-cluster capabilities: namespaces, storage, edge controllers, external secrets, monitoring | AWS foundation resources and app source code | `gitops/platform/` |
| Public Edge | Public HTTPS exposure, DNS publication, certificates, Gateway/route publication mechanisms | Private service implementation and data stores | `gitops/platform/edge/` plus controller add-ons |
| Application Runtime | Vintage Storefront services, private service composition, runtime data components | CI/CD authority, AWS foundation, Portfolio Stack | `app/microservices/`, `gitops/apps/vintage/` |
| Portfolio Stack | Durable public Hiraya Portfolio and Hiraya Guide hosting path | Disposable EKS cluster lifecycle | `app/portfolio/`, `infra/portfolio/` |
| CI/CD Authority | GitHub Actions image build, validation, promotion PRs, deploy/destroy workflows | Runtime reconciliation after GitOps handoff | `.github/workflows/`, `.github/scripts/` |

## How agents should use this page

1. Identify the boundary that owns the change.
2. Read the boundary's README or source directory.
3. Read the architecture page for the relevant flow.
4. Use runbooks only when performing an operation.
5. Avoid moving responsibilities between boundaries without checking ADRs first.

## Related docs

- [Platform lifecycle](platform-lifecycle.md)
- [GitOps ownership](gitops-ownership.md)
- [Runtime flow](runtime-flow.md)
- [Portfolio stack](portfolio-stack.md)
