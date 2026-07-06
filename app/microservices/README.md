# Vintage Storefront

The Vintage Storefront is Hiraya's demo commerce workload. It lives under `app/microservices/`, runs locally through Docker Compose, and deploys to EKS through images plus GitOps manifests.

## Read first

- Runtime explanation: [`../../docs/architecture/runtime-flow.md`](../../docs/architecture/runtime-flow.md)
- GitOps ownership: [`../../docs/architecture/gitops-ownership.md`](../../docs/architecture/gitops-ownership.md)
- Command reference: [`../../docs/references/commands.md`](../../docs/references/commands.md)
- Service catalog source of truth: [`../../.github/utils/services.json`](../../.github/utils/services.json)
- Service runbooks: [`../../docs/runbooks/services/`](../../docs/runbooks/services/)

## Local development

All commands run from the repository root. The root is the only pnpm workspace.

Default local Storefront URL: `http://localhost:3000`. Use the Docker Compose commands in [`../../docs/references/commands.md`](../../docs/references/commands.md#docker-compose) for production-like local mode or Vite hot reload mode.

## Validation

Use the Vintage Storefront commands in [`../../docs/references/commands.md`](../../docs/references/commands.md#vintage-storefront). `app:baseline` is the main no-AWS app gate reused by PR checks; `app:smoke:compose` proves the local full stack from a clean Compose database state.

## Deployment ownership

- Service images are built and pushed by GitHub Actions.
- Image metadata and path ownership come from `.github/utils/services.json`.
- Kubernetes desired state lives in `gitops/apps/vintage/`.
- Argo CD reconciles the app after Cluster Bootstrap hands control to GitOps.

Use runbooks for operational procedures instead of copying commands here:

- Deploy/recreate platform: [`../../docs/runbooks/platform/deploy-dev-platform.md`](../../docs/runbooks/platform/deploy-dev-platform.md)
- Destroy disposable platform: [`../../docs/runbooks/platform/destroy-dev-platform.md`](../../docs/runbooks/platform/destroy-dev-platform.md)
- Roll back service image: [`../../docs/runbooks/services/rollback-dev-service-image.md`](../../docs/runbooks/services/rollback-dev-service-image.md)
