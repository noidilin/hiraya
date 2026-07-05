# Portfolio Stack

The Hiraya Portfolio is the durable public explanation experience. It is separate from the disposable dev EKS platform so visitors can still access project explanations when the lab cluster is destroyed.

## High-level shape

```text
Portfolio Visitor
  -> public Portfolio frontend
  -> same-origin /api/* route
  -> Hiraya Guide API
  -> curated project knowledge / Bedrock-backed guide path
```

## Repo entry points

| Area | Path |
|---|---|
| Portfolio app overview | `app/portfolio/README.md` |
| Frontend source | `app/portfolio/frontend/` |
| Guide API source | `app/portfolio/guide-api/` |
| Durable AWS stack | `infra/portfolio/` |
| Curated Guide knowledge | `docs/portfolio/` |
| Portfolio runbook | `docs/runbooks/portfolio/first-deploy.md` |
| Portfolio ADRs | `docs/adr/0008-durable-portfolio-stack.md`, `0009`, `0010` |

## Content rule

Portfolio content should help HR and technical reviewers quickly understand Hiraya's abilities. Prefer evidence-backed architectural decision making over generic marketing copy.

## Validation

Use the Portfolio commands in [`../references/commands.md#portfolio`](../references/commands.md#portfolio).

## Related docs

- Portfolio overview: [`../../app/portfolio/README.md`](../../app/portfolio/README.md)
- Curated Guide knowledge: [`../portfolio/README.md`](../portfolio/README.md)
- First deploy runbook: [`../runbooks/portfolio/first-deploy.md`](../runbooks/portfolio/first-deploy.md)
