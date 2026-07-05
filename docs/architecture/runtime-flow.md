# Runtime Flow

This page orients agents around the Vintage Storefront runtime path without becoming a complete Kubernetes topology dump.

## Runtime concept

The Vintage Storefront is the customer-facing demo commerce workload. It runs inside the disposable Hiraya EKS Project and is exposed through the shared Public Edge.

At a high level:

```text
Browser
  -> Public Edge
  -> Storefront shell
  -> Gateway/API path
  -> backend services
  -> runtime data components
```

## Source entry points

| Area | Path |
|---|---|
| App source and local Compose stack | `app/microservices/` |
| GitOps workload manifests | `gitops/apps/vintage/` |
| Service/image/path ownership catalog | `.github/utils/services.json` |
| Backend/API contract baseline | `app/microservices/shared/` plus backend packages |
| Public smoke script | `.github/scripts/storefront-public-smoke.mjs` |
| Compose smoke script | `.github/scripts/storefront-compose-smoke.mjs` |

## Validation entry points

Use the Vintage Storefront commands in [`../references/commands.md#vintage-storefront`](../references/commands.md#vintage-storefront).

## Documentation boundaries

- This page owns runtime explanation.
- `app/microservices/README.md` owns local app quickstart details.
- `docs/runbooks/services/` owns operational service procedures such as rollback.
- `gitops/README.md` and [gitops-ownership.md](gitops-ownership.md) own manifest/reconciliation orientation.
