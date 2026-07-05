# Architecture Documentation

These docs explain the current Hiraya system. They are for understanding boundaries and flows before editing code, Terraform, GitOps, or workflows.

Architecture docs should describe **how the system works now** and link to runbooks for exact procedures.

## Current architecture map

| Topic | Read |
|---|---|
| Ownership boundaries and responsibility zones | [boundaries.md](boundaries.md) |
| Disposable vs durable platform lifecycle | [platform-lifecycle.md](platform-lifecycle.md) |
| CI/CD, image promotion, and GitOps delivery path | [delivery-flow.md](delivery-flow.md) |
| Argo CD, Kustomize, Helm, and Cluster Platform ownership | [gitops-ownership.md](gitops-ownership.md) |
| Vintage Storefront request/runtime path | [runtime-flow.md](runtime-flow.md) |
| Durable Hiraya Portfolio and Guide API stack | [portfolio-stack.md](portfolio-stack.md) |

## Related source-of-truth docs

- Canonical terminology: [`../../CONTEXT.md`](../../CONTEXT.md)
- Historical decisions: [`../adr/`](../adr/)
- Operational procedures: [`../runbooks/`](../runbooks/)
- Commands and repo paths: [`../references/`](../references/)

## Maintenance rule

If a paragraph starts to become a checklist of commands, move it to a runbook. If a paragraph explains why a decision was made, link to or create an ADR. If a paragraph is just a stable lookup table, move it to `docs/references/`. See [`../references/documentation-guidelines.md`](../references/documentation-guidelines.md) for the full governance rules.
