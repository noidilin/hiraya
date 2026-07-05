# Architecture Decision Records

ADRs record why Hiraya made important architecture and delivery decisions. They are historical decision records, not the primary current-state architecture docs.

For current system explanations, start with [`../architecture/`](../architecture/). For documentation maintenance rules, see [`../references/documentation-guidelines.md`](../references/documentation-guidelines.md#adr-policy).

## How to read ADRs

- Read architecture docs first when you need to understand how Hiraya works now.
- Read ADRs when you need decision rationale, trade-offs, or supersession history.
- Do not rewrite accepted ADRs as living docs; add a short status note or create a superseding ADR.
- ADR numbers are unique and monotonic by filename. The next ADR number should be `0012`.

## ADR index

| ADR | Status | Decision | Current architecture / reference |
|---|---|---|---|
| [0001](0001-eks-network-redesign.md) | Accepted; ownership seam superseded by 0007 | Private-node dev EKS network with shared public edge | [Platform lifecycle](../architecture/platform-lifecycle.md), [Boundaries](../architecture/boundaries.md) |
| [0002](0002-aiops-cloudwatch-metrics-via-adot.md) | Accepted; in-cluster ownership refined by 0007 | AIOps uses CloudWatch metrics/logs through ADOT instead of public Prometheus | [Boundaries](../architecture/boundaries.md) |
| [0003](0003-vintage-storefront-order-api-owner.md) | Accepted | `orders` service owns active Vintage Storefront order API | [Runtime flow](../architecture/runtime-flow.md) |
| [0004](0004-vintage-storefront-api-response-envelope.md) | Accepted | Storefront APIs use a minimal success/error envelope | [Runtime flow](../architecture/runtime-flow.md) |
| [0005](0005-root-pnpm-workspace.md) | Accepted | Repository root is the single pnpm workspace | [Command reference](../references/commands.md) |
| [0006](0006-dev-eks-node-instance-size.md) | Accepted; amended by later cost/capacity update inside ADR | Dev EKS node sizing trade-off | [Platform lifecycle](../architecture/platform-lifecycle.md) |
| [0007](0007-gitops-owned-cluster-platform.md) | Accepted; implemented | Terraform owns AWS/EKS foundations; Argo CD owns Cluster Platform and apps | [GitOps ownership](../architecture/gitops-ownership.md), [Platform lifecycle](../architecture/platform-lifecycle.md) |
| [0008](0008-durable-portfolio-stack.md) | Accepted | Hiraya Portfolio runs in a durable non-EKS Portfolio Stack | [Portfolio stack](../architecture/portfolio-stack.md) |
| [0009](0009-desktop-first-hiraya-content-evidence-experience.md) | Accepted | `/hiraya` portfolio routes favor desktop evidence-rich presentation | [Portfolio stack](../architecture/portfolio-stack.md) |
| [0010](0010-hiraya-portfolio-i18n-hybrid-localization.md) | Accepted | Hiraya portfolio uses typed localized content plus i18next chrome | [Portfolio stack](../architecture/portfolio-stack.md) |
| [0011](0011-vintage-storefront-in-place-vite-migration.md) | Accepted | Replace Vintage frontend in place instead of adding a parallel service | [Runtime flow](../architecture/runtime-flow.md) |

## Numbering note

`0011-vintage-storefront-in-place-vite-migration.md` was assigned during the documentation-structure cleanup to remove the prior ADR number collision. Reserve `0012` for the next new ADR.
