# Vintage Storefront React/Vite Migration Plan

Status: planning
Last updated: 2026-06-24

## Resolved decisions

- Replace the existing `app/microservices/frontend` implementation in place with the React/Vite implementation from `/Users/noid/hub/dev/hiraya-fe`.
- Keep the main `hiraya` monorepo as the source of truth after import. Treat `hiraya-fe` as the staging prototype only.
- Keep legacy account routes as the public route contract: `/login`, `/register`, `/profile`, and `/orders`.
- Enable the new authenticated checkout flow through `POST /api/orders`.
- Keep `Vintage Storefront` as the domain context and use `Hiraya Furugi` as the customer-facing brand.

## Deployment impact

No Terraform or EKS platform shape change is expected. The migration should keep the existing Kubernetes `Deployment`, `Service`, `HTTPRoute`, ECR repository, service catalog entry, and image-promotion flow:

- service name: `frontend`
- package name: `frontend`
- workspace path: `app/microservices/frontend`
- ECR repository: `hiraya-frontend`
- manifest path: `gitops/k8s/frontend/deployment.yml`
- public hostname: `hiraya.noidilin.dev`
- same-origin API base: `/api`

The main deployment changes are inside the frontend container build:

- CRA output `build/` becomes Vite output `dist/`.
- CRA env arg `REACT_APP_API_URL` becomes `VITE_API_URL`.
- Local dev needs a Vite `/api` proxy to the gateway.
- The container still serves static files through nginx and proxies `/api/` to `http://gateway:3001`.

## Current findings

- `hiraya-fe` currently builds, typechecks, and lints successfully with `pnpm exec tsc -b --pretty false`, `pnpm exec eslint .`, and `pnpm run build`.
- Vite emits `dist/` and currently warns that the main JS chunk is larger than 500 kB. This is not a migration blocker, but should be tracked as a later code-splitting task.
- The main repo root is the only pnpm workspace; the imported package must keep name `frontend` so root scripts and service detection continue to work.
- Existing root scripts expect `frontend` to provide `start`, `build`, `typecheck`, `lint`, and `test`.
- Existing Playwright config starts the frontend on port `3000`; Vite must keep that port for browser tests and local parity.
- Existing browser tests expect legacy route names and checkout-disabled behavior. They must be updated for legacy routes plus enabled checkout.
- Existing backend product image URLs still point at legacy filenames such as `/product-images/1970s-prairie-midi-dress.jpg`; the imported public assets must preserve those files or backend mapping must change.

## Phase 0 — Prepare safe import

1. Confirm both repos' dirty working trees and preserve user changes before copying files.
2. Capture the exact `hiraya-fe` commit or local diff used as the import source.
3. Do not touch Terraform, EKS manifests, or AWS resources in this phase.
4. Keep the old frontend available in git history for rollback by revert.

Acceptance:

- Import source is identified.
- No infrastructure state or manifests are changed before the app baseline is adapted.

## Phase 1 — Replace the workspace package in place

1. Replace CRA/MUI app files under `app/microservices/frontend` with the Vite app files:
   - `src/`
   - `public/`
   - `index.html`
   - `vite.config.ts`
   - `components.json`
   - TypeScript and ESLint configs
2. Keep package identity compatible with the monorepo:
   - `name: "frontend"`
   - Node 24 engine range
   - scripts: `start`, `dev`, `build`, `typecheck`, `lint`, `test`, `preview`
3. Add a `start` script that runs Vite on `0.0.0.0:3000` for Playwright and local root scripts.
4. Merge dependencies into the root lockfile through the root pnpm workspace.
5. Remove old CRA-only dependencies and files after tests are ported.

Acceptance:

- `pnpm --filter frontend build` runs the Vite build.
- `pnpm --filter frontend typecheck` runs `tsc -b --pretty false`.
- `pnpm --filter frontend lint` runs ESLint.
- Root workspace install is lockfile-clean.

## Phase 2 — Preserve legacy route contract

1. Adapt the TanStack Router tree to expose legacy routes:
   - `/login` renders the login mode.
   - `/register` renders the signup mode.
   - `/profile` renders an authenticated account/profile view.
   - `/orders` remains authenticated order history.
2. Update navigation links to use legacy account routes.
3. Decide what to do with `/auth`; recommended behavior is a redirect to `/login` so prototype links do not 404.
4. Reintroduce protected-route behavior for `/profile` and `/orders`: unauthenticated users go to `/login` while cart state is preserved.

Acceptance:

- Direct loads of `/`, `/products`, `/products/:id`, `/cart`, `/login`, `/register`, `/profile`, and `/orders` are intentional and tested.
- Existing external links to legacy account routes do not break.

## Phase 3 — Wire Vite to existing API and container runtime

1. Keep API requests behind `src/api/*`; do not scatter `fetch` calls into route components.
2. Keep `VITE_API_URL` defaulting to `/api`.
3. Add Vite dev proxy for local backend use:
   - `/api` -> `http://localhost:3001`
4. Update frontend Dockerfile:
   - install from the root workspace lockfile.
   - build with `VITE_API_URL=/api`.
   - copy `/workspace/app/microservices/frontend/dist` into nginx html root.
5. Update Docker Compose frontend build args from `REACT_APP_API_URL` to `VITE_API_URL`.
6. Keep nginx SPA fallback and `/api/` proxy to `http://gateway:3001`.
7. Preserve legacy product image filenames in `public/product-images/` or update backend image mapping and contract fixtures in the same PR.

Acceptance:

- `docker compose -f app/microservices/docker-compose.yml build frontend` succeeds on linux/amd64.
- Browser calls remain same-origin under `/api` in local, container, and EKS deployments.
- No `/api/auth/refresh` or `GET /api/orders/:id` dependency is introduced.

## Phase 4 — Enable checkout safely

1. Keep client-side cart state in Zustand/localStorage.
2. Keep checkout client-side gated by authenticated user state.
3. Submit orders through existing `POST /api/orders` with:
   - `userId`
   - `items: { productId, quantity }[]`
   - `shippingAddress`
4. Keep order confirmation driven by the created order response or local last-order state.
5. Do not claim server-side per-token order authorization yet; the current orders service still accepts `userId` and does not validate the bearer token.

Acceptance:

- Logged-out checkout preserves cart and sends the user to sign in.
- Logged-in checkout posts the expected payload and reaches `/order-confirmed`.
- Order history uses `/api/orders/my-orders?userId=<id>` through the adapter layer.

## Phase 5 — Restore the no-AWS app baseline

1. Add Vitest/jsdom frontend tests for the imported app.
2. Minimum unit coverage:
   - API envelope success/failure handling.
   - bearer token injection and token clearing.
   - no refresh-token flow.
   - product wire normalization.
   - order creation/list adapters.
   - cart persistence and inventory capping.
   - auth route mode behavior for `/login` and `/register`.
3. Update Playwright browser tests to match the new UI while preserving legacy route expectations.
4. Add checkout browser coverage with mocked Storefront APIs:
   - product detail -> cart.
   - sign in.
   - fill shipping form.
   - `POST /api/orders` request payload assertion.
   - order confirmation display.
5. Keep browser tests using `@hiraya/storefront-contracts` fixtures and paths.

Acceptance:

- `pnpm run app:test:frontend` passes.
- `pnpm run app:test:browser` passes locally.
- `pnpm run app:baseline` passes without AWS credentials.

## Phase 6 — Validate CI/CD and GitOps compatibility

1. Run service catalog validation and changed-service detection:
   - `pnpm run app:catalog`
   - `pnpm run services:changed -- --all`
2. Run GitOps render assertions:
   - `pnpm run app:gitops`
3. Run static checks:
   - `pnpm run storefront:static`
4. Run Docker build-only equivalent locally for frontend.
5. Verify the service catalog still selects only `frontend` for frontend path changes.

Acceptance:

- `.github/utils/services.json` does not need a new service entry.
- `gitops/k8s/frontend/deployment.yml` remains structurally unchanged except image tag changes made by the existing promotion flow.
- PR build-only image gate can build `hiraya-frontend` from the root context.

## Phase 7 — Merge and deploy

1. Open a PR containing the in-place replacement, route compatibility, test updates, Docker updates, and docs.
2. Require `app-baseline` to pass.
3. On merge to `main`, let `image-ci` build and push the `hiraya-frontend` image.
4. Let the existing manifest promotion workflow update the GitOps image tag.
5. Let Argo CD sync the existing frontend Deployment.
6. Run public deploy smoke against `/` and `/api/products`.
7. Manually QA:
   - `/`
   - `/products`
   - `/products/:id`
   - `/cart`
   - `/login`
   - `/register`
   - `/profile`
   - `/orders`
   - `/order-confirmed`

Acceptance:

- Public shell loads at `https://hiraya.noidilin.dev`.
- `/api/products` still returns a non-empty success envelope.
- Checkout works in dev against the deployed backend, or any backend limitation is documented as a known issue.

## Rollback plan

Because the migration keeps the existing frontend service identity, rollback is application-level:

1. Revert the migration PR and let image CI build the previous app again, or
2. Use the existing service image rollback workflow to promote the last known good `hiraya-frontend` image tag.

No Terraform destroy/recreate should be needed for this migration.

## Risks

- Route compatibility: `hiraya-fe` currently uses `/auth`, but the migration must preserve `/login`, `/register`, and `/profile`.
- Test churn: old browser tests assert old headings and checkout-disabled copy; these must become contract-focused rather than copy-heavy where possible.
- Product image mismatch: backend returns legacy filenames while `hiraya-fe` generated a new asset set.
- Order authorization: checkout is client-gated, but the orders backend does not yet enforce bearer-token ownership.
- Build output mismatch: Docker must copy Vite `dist/`, not CRA `build/`.
- Chunk size: Vite currently warns about a large JS chunk; defer code-splitting unless it affects deploy smoke or user experience.

## Documentation follow-up

Consider recording an ADR for the in-place service replacement if the team wants future readers to understand why the migration did not introduce a parallel frontend service or canary HTTPRoute.
