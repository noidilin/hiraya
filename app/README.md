# Hiraya Applications

This directory contains the two application surfaces in Hiraya.

| Path | Surface | Lifecycle |
|---|---|---|
| [`microservices/`](microservices/) | Vintage Storefront demo commerce workload | Runs on the disposable dev EKS platform and local Docker Compose |
| [`portfolio/`](portfolio/) | Hiraya Portfolio and Hiraya Guide | Runs on the durable Portfolio Stack |

## Where to go next

- Vintage Storefront local orientation: [`microservices/README.md`](microservices/README.md)
- Portfolio local orientation: [`portfolio/README.md`](portfolio/README.md)
- Runtime architecture: [`../docs/architecture/runtime-flow.md`](../docs/architecture/runtime-flow.md)
- Portfolio architecture: [`../docs/architecture/portfolio-stack.md`](../docs/architecture/portfolio-stack.md)
- Command reference: [`../docs/references/commands.md`](../docs/references/commands.md)
- Task router: [`../docs/INDEX.md`](../docs/INDEX.md)

Deploy, destroy, and rollback procedures live in [`../docs/runbooks/`](../docs/runbooks/), not in this app directory.
