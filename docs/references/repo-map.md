# Repository Map

High-level path map for agents. Prefer this reference over duplicating path lists in every README.

## Root

| Path | Purpose |
|---|---|
| `AGENTS.md` | Agent instructions, current goal, safety notes |
| `README.md` | Short project overview and root command entry points |
| `CONTEXT.md` | Canonical Hiraya terminology and domain language |
| `package.json` | Root pnpm command surface |
| `pnpm-workspace.yaml` | Workspace package layout |

## Application

| Path | Purpose |
|---|---|
| `app/microservices/` | Vintage Storefront source, backend services, local Compose stack |
| `app/microservices/docker-compose.yml` | Local production-like and dev Compose modes |
| `app/portfolio/frontend/` | Hiraya Portfolio SPA |
| `app/portfolio/guide-api/` | Hiraya Guide same-origin API |

## Infrastructure

| Path | Purpose |
|---|---|
| `infra/envs/dev/bootstrap/` | Durable Project Bootstrap stack |
| `infra/envs/dev/platform-core/` | Disposable Platform Core stack |
| `infra/envs/dev/cluster-bootstrap/` | Argo CD and root GitOps handoff stack |
| `infra/modules/` | Reusable Terraform modules |
| `infra/portfolio/` | Durable Portfolio Stack |

## GitOps

| Path | Purpose |
|---|---|
| `gitops/clusters/dev/root/` | Root app-of-apps for the dev cluster |
| `gitops/platform/` | Cluster Platform add-ons and configuration |
| `gitops/apps/vintage/` | Vintage Storefront Kubernetes desired state |

## Documentation

| Path | Purpose |
|---|---|
| `docs/INDEX.md` | Task-based documentation router |
| `docs/architecture/` | Current architecture explanations |
| `docs/runbooks/` | Procedures and troubleshooting |
| `docs/adr/` | Decision records |
| `docs/references/` | Lookup tables for commands, paths, workflows, env vars |
| `docs/portfolio/` | Curated Hiraya Guide knowledge source |
| `docs/reports/` | Canonical JSON report/control data |

## Automation

| Path | Purpose |
|---|---|
| `.github/workflows/` | GitHub Actions workflows |
| `.github/scripts/` | Workflow helper scripts and tests |
| `.github/utils/services.json` | Service/image/path ownership catalog |
