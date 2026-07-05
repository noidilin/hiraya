# GitOps

This directory is the desired-state source for Argo CD after Cluster Bootstrap installs the root Application.

## Directory map

| Path | Purpose |
|---|---|
| `clusters/dev/root/` | Root app-of-apps for the dev cluster |
| `clusters/dev/root/applications/` | Child Argo CD Applications for platform and app areas |
| `platform/` | Shared Cluster Platform add-ons and configuration |
| `apps/vintage/` | Vintage Storefront workload manifests |

## Ownership rule

Terraform Cluster Bootstrap installs Argo CD and points it at `gitops/clusters/dev/root`. After that handoff, Argo CD owns long-lived in-cluster desired state from this directory.

Do not move platform add-ons back into `infra/envs/dev/platform-core/` without superseding ADR-0007.

## Validate renders

Use the GitOps render command listed under [`../docs/references/commands.md#vintage-storefront`](../docs/references/commands.md#vintage-storefront).

## Related docs

- Architecture: [`../docs/architecture/gitops-ownership.md`](../docs/architecture/gitops-ownership.md)
- Platform lifecycle: [`../docs/architecture/platform-lifecycle.md`](../docs/architecture/platform-lifecycle.md)
- Decision record: [`../docs/adr/0007-gitops-owned-cluster-platform.md`](../docs/adr/0007-gitops-owned-cluster-platform.md)
- Repo map: [`../docs/references/repo-map.md`](../docs/references/repo-map.md)
