# Hiraya Portfolio

Durable public portfolio app described in `docs/plan/portfolio-bedrock-KB.md`. The code is deploy-ready; the AWS Portfolio Stack still needs first approved apply.

## Frontend

The frontend lives in `app/portfolio/frontend` and is intentionally lean while the Guide API is wired:

- React + Vite SPA.
- Tailwind CSS v4 through `@tailwindcss/vite`.
- shadcn registry config aligned with the lazycicd pattern.
- prompt-kit registry alias for chat primitives: `@prompt-kit` -> `https://prompt-kit.com/c/{name}.json`.
- Browser-scoped Bedrock session handling via the API response `sessionId`.
- Relative API call to `POST /api/guide/chat` for CloudFront `/api/*` routing.

## Guide API

The Guide API lives in `app/portfolio/guide-api` and provides the same-origin contract used locally and by the Lambda package:

- `GET /api/health` returns `{ "ok": true, "service": "hiraya-guide-api" }`.
- `POST /api/guide/chat` accepts `{ "message": string, "sessionId"?: string }`.
- Chat responses return `answered`, `refused`, `not_ready`, or `error` with normalized citation objects.
- The local dev server defaults to port `3001`, matching the frontend Vite `/api` proxy target.

Useful commands from the repository root:

```sh
pnpm run portfolio:frontend:build
pnpm run portfolio:frontend:lint
pnpm run portfolio:frontend:test
pnpm run portfolio:guide-api:build
pnpm run portfolio:guide-api:test
pnpm run portfolio:guide-api:package
pnpm run portfolio:guide-api:dev
pnpm run portfolio:static
```

To add more prompt-kit components later:

```sh
pnpm --filter @hiraya/portfolio-frontend exec shadcn add "https://prompt-kit.com/c/<component>.json"
```
