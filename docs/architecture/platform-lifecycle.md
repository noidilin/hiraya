# Platform Lifecycle

Hiraya separates durable setup from disposable dev runtime. This page explains the lifecycle; exact commands belong in runbooks.

## Lifecycle boundaries

```text
Project Bootstrap  ->  Platform Core  ->  Cluster Bootstrap  ->  GitOps sync
 durable               disposable         reproducible handoff   in-cluster desired state
```

## Durable resources

Project Bootstrap is kept across normal lab rebuilds and shutdowns.

Owned by `infra/envs/dev/bootstrap/`:

- Terraform state access prerequisites.
- GitHub OIDC roles for infra and image workflows.
- ECR repositories.
- Durable Vintage Storefront workload secrets.

Do not destroy this stack during routine dev platform shutdown.

## Disposable resources

Platform Core and Cluster Bootstrap are the normal rebuild/destroy surface for the dev EKS environment.

Owned by `infra/envs/dev/platform-core/`:

- VPC and networking.
- EKS cluster and managed node group.
- EKS OIDC provider and managed add-ons.
- AWS-only IAM/IRSA prerequisites for in-cluster controllers.
- Disposable admin secrets for Argo CD and Grafana.

Owned by `infra/envs/dev/cluster-bootstrap/`:

- Argo CD namespace and install.
- Argo CD projects.
- Root `hiraya-root` Application pointed at `gitops/clusters/dev/root`.

## GitOps handoff

After Cluster Bootstrap, Argo CD owns in-cluster desired state under `gitops/`.

Terraform should not be reintroduced as the owner of long-lived Cluster Platform add-ons unless ADR-0007 is superseded.

## Operational runbooks

- Bootstrap workflows: [`../runbooks/platform/bootstrap-infra-workflows.md`](../runbooks/platform/bootstrap-infra-workflows.md)
- Deploy/recreate dev platform: [`../runbooks/platform/deploy-dev-platform.md`](../runbooks/platform/deploy-dev-platform.md)
- Destroy disposable dev platform: [`../runbooks/platform/destroy-dev-platform.md`](../runbooks/platform/destroy-dev-platform.md)
- Validate infra PR plan: [`../runbooks/platform/validate-infra-pr-plan.md`](../runbooks/platform/validate-infra-pr-plan.md)

## Decision record

- [`../adr/0007-gitops-owned-cluster-platform.md`](../adr/0007-gitops-owned-cluster-platform.md)
