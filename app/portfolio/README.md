# Hiraya Portfolio

Durable public portfolio app planned in `docs/plan/portfolio-bedrock-KB.md`.

## Frontend

The frontend lives in `app/portfolio/frontend` and is intentionally lean while the Guide API is wired:

- React + Vite SPA.
- Tailwind CSS v4 through `@tailwindcss/vite`.
- shadcn registry config aligned with the lazycicd pattern.
- prompt-kit registry alias for chat primitives: `@prompt-kit` -> `https://prompt-kit.com/c/{name}.json`.
- Browser-scoped Bedrock session handling via the API response `sessionId`.
- Relative API call to `POST /api/guide/chat` for future CloudFront `/api/*` routing.

Useful commands from the repository root:

```sh
pnpm run portfolio:frontend:build
pnpm run portfolio:frontend:lint
pnpm run portfolio:frontend:test
pnpm run portfolio:static
```

To add more prompt-kit components later:

```sh
pnpm --filter @hiraya/portfolio-frontend exec shadcn add "https://prompt-kit.com/c/<component>.json"
```
