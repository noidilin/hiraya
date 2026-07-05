# Hiraya DevOps Portfolio

Hiraya is a DevOps portfolio project demonstrating ownership design, AWS/EKS architecture, GitOps delivery, CI/CD automation, observability, and an AI-assisted operations narrative.

For non-trivial work, start with [`docs/INDEX.md`](docs/INDEX.md). It routes agents to the smallest useful reading set by task.

## Major systems

| System | Purpose | Entry point |
|---|---|---|
| Vintage Storefront | Disposable EKS-hosted demo commerce workload | [`app/microservices/`](app/microservices/) |
| Hiraya Portfolio | Durable public project explanation experience | [`app/portfolio/`](app/portfolio/) |
| AWS/EKS infrastructure | Terraform-managed durable and disposable cloud boundaries | [`infra/`](infra/) |
| GitOps desired state | Argo CD app-of-apps, Cluster Platform add-ons, and app manifests | [`gitops/`](gitops/) |
| CI/CD automation | GitHub Actions workflows and helper scripts | [`.github/workflows/`](.github/workflows/) |
| Documentation | Architecture, runbooks, ADRs, references, and curated Guide knowledge | [`docs/`](docs/) |

## Documentation map

- Task router: [`docs/INDEX.md`](docs/INDEX.md)
- Canonical language: [`CONTEXT.md`](CONTEXT.md)
- Current architecture: [`docs/architecture/`](docs/architecture/)
- Operational procedures: [`docs/runbooks/`](docs/runbooks/)
- Historical decisions: [`docs/adr/`](docs/adr/)
- Command/path/workflow references: [`docs/references/`](docs/references/)

## Workspace quickstart

The repository root is the only pnpm workspace. Setup and validation commands are maintained in [`docs/references/commands.md`](docs/references/commands.md).

Use boundary READMEs for local orientation and runbooks for deploy/destroy/rollback procedures.
