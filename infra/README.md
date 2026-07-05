# Terraform Infrastructure

Terraform owns Hiraya's AWS foundations. It is split into durable and disposable boundaries so the dev EKS platform can be rebuilt without destroying long-lived project resources.

## Stack map

| Stack | Path | Lifecycle | Owns |
|---|---|---|---|
| Project Bootstrap | `envs/dev/bootstrap/` | Durable | ECR, GitHub OIDC roles, state access, durable workload secrets |
| Platform Core | `envs/dev/platform-core/` | Disposable | VPC, EKS, node group, AWS IAM/IRSA prerequisites, public-domain prerequisites |
| Cluster Bootstrap | `envs/dev/cluster-bootstrap/` | Disposable/reproducible handoff | Argo CD install, AppProjects, root GitOps Application |
| Portfolio Stack | `portfolio/` | Durable | Public Portfolio and Hiraya Guide cloud resources |
| Modules | `modules/` | Reusable | Terraform building blocks |

The remote state S3 bucket is externally managed. Terraform uses it through stack-local `backend.hcl` files, but no active stack creates or destroys that bucket.

## Ownership rules

- `platform-core` must stay AWS/EKS foundation only; do not add Kubernetes or Helm resources there.
- `cluster-bootstrap` only performs the reproducible Argo CD handoff.
- Argo CD owns long-lived in-cluster resources from `gitops/platform/**` and `gitops/apps/**` after the handoff.
- Do not destroy `envs/dev/bootstrap/` during routine lab shutdown.
- The retired monolithic `infra/envs/dev/platform` stack should not be recreated unless a new ADR supersedes ADR-0007.

## Validate a stack

Use the Terraform stack commands in [`../docs/references/commands.md`](../docs/references/commands.md#terraform-stacks), then follow the relevant runbook for live deploy/destroy procedures.

## Read before changing infra

- Platform lifecycle: [`../docs/architecture/platform-lifecycle.md`](../docs/architecture/platform-lifecycle.md)
- GitOps ownership: [`../docs/architecture/gitops-ownership.md`](../docs/architecture/gitops-ownership.md)
- ADR-0007: [`../docs/adr/0007-gitops-owned-cluster-platform.md`](../docs/adr/0007-gitops-owned-cluster-platform.md)
- Infra deploy runbook: [`../docs/runbooks/platform/deploy-dev-platform.md`](../docs/runbooks/platform/deploy-dev-platform.md)
- Infra destroy runbook: [`../docs/runbooks/platform/destroy-dev-platform.md`](../docs/runbooks/platform/destroy-dev-platform.md)
- Infra PR plan validation: [`../docs/runbooks/platform/validate-infra-pr-plan.md`](../docs/runbooks/platform/validate-infra-pr-plan.md)
- Command reference: [`../docs/references/commands.md`](../docs/references/commands.md)
