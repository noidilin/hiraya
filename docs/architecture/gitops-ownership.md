# GitOps Ownership

This page explains what GitOps owns after Terraform completes the cluster handoff.

## Ownership model

```text
Terraform Platform Core
  creates AWS/EKS foundation

Terraform Cluster Bootstrap
  installs Argo CD and root Application

Argo CD root app
  reads gitops/clusters/dev/root
  creates child Applications

Child Applications
  reconcile gitops/platform/** and gitops/apps/**
```

## Repo entry points

| Path | Purpose |
|---|---|
| `gitops/clusters/dev/root/` | Root app-of-apps desired state for the dev cluster |
| `gitops/platform/` | Shared Cluster Platform add-ons and config |
| `gitops/apps/vintage/` | Vintage Storefront workload manifests |
| `infra/envs/dev/cluster-bootstrap/` | Argo CD installation, AppProjects, and root handoff |

## Ownership rule

After Cluster Bootstrap, Argo CD owns long-lived in-cluster desired state. Do not add Kubernetes or Helm ownership back into `platform-core`.

## Validation

Use the GitOps render command listed under [`../references/commands.md#vintage-storefront`](../references/commands.md#vintage-storefront). It validates the Vintage app render plus selected platform Helm/Kustomize renders without requiring live cluster credentials.

## Related docs

- Decision: [`../adr/0007-gitops-owned-cluster-platform.md`](../adr/0007-gitops-owned-cluster-platform.md)
- Repo map: [`../references/repo-map.md`](../references/repo-map.md)
- GitOps directory README: [`../../gitops/README.md`](../../gitops/README.md)
