# GitHub Actions Workflow Reference

Stable map of workflow files and their primary responsibility. See workflow YAML for exact triggers and permissions.

| Workflow | Purpose |
|---|---|
| `.github/workflows/app-pr-baseline.yml` | Required no-AWS PR baseline for Vintage Storefront/app changes |
| `.github/workflows/image-ci.yml` | Build and push service images, then create GitOps image-tag promotion PRs |
| `.github/workflows/deploy-smoke.yml` | Read-only public smoke after GitOps changes land on `main` |
| `.github/workflows/service-image-dev-rollback.yml` | Manual rollback of one dev service to an existing ECR image tag |
| `.github/workflows/infra-ci.yml` | Terraform validation/plan path for infra PRs |
| `.github/workflows/infra-deploy.yml` | Approved deployment/recreation of dev infra stacks |
| `.github/workflows/infra-destroy.yml` | Approved destroy of disposable dev platform resources |
| `.github/workflows/portfolio-pr-baseline.yml` | Portfolio app/API PR baseline |
| `.github/workflows/portfolio-deploy.yml` | Portfolio app/API deploy path |
| `.github/workflows/portfolio-infra-deploy.yml` | Durable Portfolio Stack infra deploy path |
| `.github/workflows/weekly-permission-audit.md` | Agentic workflow source for weekly permission audit |
| `.github/workflows/weekly-permission-audit.lock.yml` | Compiled workflow generated from the agentic workflow source |

## Related automation sources

| Path | Purpose |
|---|---|
| `.github/scripts/src/` | TypeScript source for workflow helper scripts |
| `.github/scripts/dist/` | Compiled Node runtime files used by workflows |
| `.github/scripts/*.test.mjs` | Node test suites for workflow helpers |
| `.github/utils/services.json` | App service catalog: packages, images, paths, build contexts, manifest targets |

## Validation commands

Use the script/helper, Vintage Storefront, and Portfolio command groups in [`commands.md`](commands.md).

Use [`../architecture/delivery-flow.md`](../architecture/delivery-flow.md) for the high-level delivery path.
