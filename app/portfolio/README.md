# Hiraya Portfolio

The Hiraya Portfolio is the durable public explanation experience for the project. It includes a React/Vite frontend and the same-origin Hiraya Guide API.

## Read first

- Portfolio architecture: [`../../docs/architecture/portfolio-stack.md`](../../docs/architecture/portfolio-stack.md)
- Curated Hiraya Guide knowledge: [`../../docs/portfolio/README.md`](../../docs/portfolio/README.md)
- Portfolio first-deploy runbook: [`../../docs/runbooks/portfolio/first-deploy.md`](../../docs/runbooks/portfolio/first-deploy.md)
- Portfolio ADRs: [`../../docs/adr/0008-durable-portfolio-stack.md`](../../docs/adr/0008-durable-portfolio-stack.md), [`../../docs/adr/0009-desktop-first-hiraya-content-evidence-experience.md`](../../docs/adr/0009-desktop-first-hiraya-content-evidence-experience.md), [`../../docs/adr/0010-hiraya-portfolio-i18n-hybrid-localization.md`](../../docs/adr/0010-hiraya-portfolio-i18n-hybrid-localization.md)

## Local surfaces

| Path | Purpose |
|---|---|
| `frontend/` | Public Portfolio SPA |
| `guide-api/` | Same-origin Guide API used by local dev and Lambda packaging |

Frontend stack highlights:

- React + Vite SPA.
- Tailwind CSS v4 through `@tailwindcss/vite`.
- shadcn and prompt-kit component registries.
- Relative `POST /api/guide/chat` call for same-origin routing.

Guide API contract:

- `GET /api/health`
- `POST /api/guide/chat`

## Validation

Run validation from the repository root with the Portfolio commands in [`../../docs/references/commands.md`](../../docs/references/commands.md#portfolio).
