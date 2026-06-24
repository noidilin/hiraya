# Vintage Storefront React/Vite Replacement Plan

Status: implementation
Last updated: 2026-06-24

## Design decision

This work is an in-place **full frontend replacement**, not an incremental migration from the original CRA app and not a parallel frontend rollout. The old frontend remains only in git history for rollback. The React/Vite rewrite is now the frontend implementation at `app/microservices/frontend`.

The replacement must keep the existing service and deployment contract so it can move through the current CI/CD and GitOps path without Terraform, EKS, service catalog, or public routing changes. Compatibility is preserved at the edges: package identity, container behavior, same-origin `/api` access, public route names, and browser/API contract tests.

Runtime behavior must be driven by the actual Storefront APIs. Mock data and fixtures are allowed in tests, and curated fallback content may be used for images or empty/error presentation, but production code should not silently replace failed API calls with a static storefront as the primary data source.

## Resolved decisions

- Replace the existing `app/microservices/frontend` implementation in place with the React/Vite rewrite stack from `/Users/noid/hub/dev/hiraya-fe`.
- Keep the main `hiraya` monorepo as the source of truth. Treat `hiraya-fe` as the staging source only, not an ongoing app.
- Keep existing platform identity: service name, package name, ECR repository, Kubernetes objects, GitOps manifest path, and public hostname stay the same.
- Keep legacy account routes as the public route contract: `/login`, `/register`, `/profile`, and `/orders`.
- Wire the replacement UI to the existing Storefront API through adapter modules under `src/api/*`.
- Enable authenticated checkout through the existing `POST /api/orders` endpoint.
- Keep `Vintage Storefront` as the domain context and use `Hiraya Furugi` as the customer-facing brand.
- Treat the frontend/browser/API contract tests as the replacement acceptance gate.

## Deployment impact

No Terraform or EKS platform shape change is expected. The replacement must keep the existing Kubernetes `Deployment`, `Service`, `HTTPRoute`, ECR repository, service catalog entry, and image-promotion flow:

- service name: `frontend`
- package name: `frontend`
- workspace path: `app/microservices/frontend`
- ECR repository: `hiraya-frontend`
- manifest path: `gitops/k8s/frontend/deployment.yml`
- public hostname: `hiraya.noidilin.dev`
- same-origin API base: `/api`

The deployment changes are limited to the frontend container build and local runtime assumptions:

- CRA output `build/` becomes Vite output `dist/`.
- CRA env arg `REACT_APP_API_URL` becomes `VITE_API_URL`.
- Local dev needs a Vite `/api` proxy to the gateway/backend.
- The container still serves static files through nginx and proxies `/api/` to `http://gateway:3001`.

## Current findings

- The replacement files have been copied into `app/microservices/frontend`; the remaining work is to adapt them to the monorepo, actual API contract, container runtime, and test baseline.
- The main repo root is the only pnpm workspace; the replacement package must use `name: "frontend"` so root scripts and service detection continue to work.
- Existing root scripts expect `frontend` to provide `start`, `build`, `typecheck`, `lint`, and `test`.
- Existing Playwright config starts the frontend on port `3000`; Vite must keep that port for browser tests and local parity.
- The Vite dev server must proxy `/api` to the existing backend/gateway during local development.
- Existing browser tests must be updated for the new UI while preserving legacy route names and enabling checkout.
- Existing backend product image URLs still point at legacy filenames such as `/product-images/1970s-prairie-midi-dress.jpg`; the replacement public assets must preserve those files or backend mapping and fixtures must change in the same PR.

## Phase 0 — Confirm replacement baseline

1. Confirm the current dirty working tree and preserve user changes before modifying copied frontend files.
2. Capture the exact `hiraya-fe` commit or local diff used as the replacement source.
3. Confirm that the old CRA frontend is no longer an implementation dependency and is available only through git history.
4. Do not touch Terraform, EKS manifests, AWS resources, or GitOps routing in this phase.

Acceptance:

- Replacement source is identified.
- The working tree changes are understood before further edits.
- No infrastructure state or manifests are changed before the app baseline is adapted.

## Phase 1 — Align the replacement package with the monorepo

1. Keep the React/Vite app files under `app/microservices/frontend`:
   - `src/`
   - `public/`
   - `index.html`
   - `vite.config.ts`
   - `components.json`
   - TypeScript and ESLint configs
2. Restore package identity compatible with the monorepo:
   - `name: "frontend"`
   - Node 24 engine range
   - scripts: `start`, `dev`, `build`, `typecheck`, `lint`, `test`, `preview`
3. Add a `start` script that runs Vite on `0.0.0.0:3000` for Playwright and root scripts.
4. Merge dependencies into the root lockfile through the root pnpm workspace; remove any nested package lockfile if it is not part of the workspace model.
5. Remove old CRA-only dependencies, files, and scripts after tests are ported.

Acceptance:

- `pnpm --filter frontend build` runs the Vite build.
- `pnpm --filter frontend typecheck` runs `tsc -b --pretty false`.
- `pnpm --filter frontend lint` runs ESLint.
- `pnpm --filter frontend test` runs the frontend unit test suite.
- Root workspace install is lockfile-clean.

## Phase 2 — Preserve the public route contract

1. Adapt the TanStack Router tree to expose legacy routes:
   - `/login` renders the login mode.
   - `/register` renders the signup mode.
   - `/profile` renders an authenticated account/profile view.
   - `/orders` remains authenticated order history.
2. Update navigation links to use legacy account routes.
3. Redirect `/auth` to `/login` so rewrite-source links do not 404, but do not make `/auth` the new public contract.
4. Reintroduce protected-route behavior for `/profile` and `/orders`: unauthenticated users go to `/login` while cart state is preserved.

Acceptance:

- Direct loads of `/`, `/products`, `/products/:id`, `/cart`, `/login`, `/register`, `/profile`, `/orders`, and `/order-confirmed` are intentional and tested.
- Existing external links to legacy account routes do not break.

## Phase 3 — Wire the replacement UI to the actual Storefront API

1. Keep API requests behind `src/api/*`; do not scatter `fetch` calls into route components.
2. Keep `VITE_API_URL` defaulting to `/api`.
3. Add Vite dev proxy for local backend use:
   - `/api` -> `http://localhost:3001`
4. Implement adapters for the existing backend envelope and wire shapes:
   - `GET /api/products`
   - `GET /api/products/:id`
   - `GET /api/products/categories`
   - login/register endpoints used by the current auth service
   - `POST /api/orders`
   - `GET /api/orders/my-orders?userId=<id>`
5. Keep adapter normalization in `src/api/*` and domain/UI calculations outside raw route components.
6. Do not introduce dependencies on unsupported endpoints such as `/api/auth/refresh` or `GET /api/orders/:id`.
7. Do not let product fallback data mask API regressions in tests; tests should be able to assert real API calls and failure behavior.
8. Preserve legacy product image filenames in `public/product-images/` or update backend image mapping and contract fixtures in the same PR.

Acceptance:

- Browser calls remain same-origin under `/api` in local, container, and EKS deployments.
- Frontend API/unit tests prove envelope success/failure handling, auth token injection, token clearing, product normalization, order creation, and order history adapters.
- Browser tests can intercept/mock the documented Storefront endpoints and assert request payloads.

## Phase 4 — Update container and local runtime

1. Restore/update the frontend Dockerfile:
   - build from the root workspace context and lockfile.
   - build with `VITE_API_URL=/api`.
   - copy `/workspace/app/microservices/frontend/dist` into the nginx html root.
2. Restore/update `nginx.conf` with SPA fallback and `/api/` proxy to `http://gateway:3001`.
3. Update Docker Compose frontend build args from `REACT_APP_API_URL` to `VITE_API_URL`.
4. Keep container output linux/amd64-compatible for CI/ECR while accounting for local Apple Silicon builds.

Acceptance:

- `docker compose -f app/microservices/docker-compose.yml build frontend` succeeds for the expected CI target platform.
- The container serves the Vite SPA and proxies `/api/` to the gateway service.

## Phase 5 — Enable checkout safely

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

## Phase 6 — Restore the no-AWS app baseline

1. Add Vitest/jsdom frontend tests for the replacement app.
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
6. Treat passing tests as the point where the replacement is considered complete enough for CI/CD validation.

Acceptance:

- `pnpm run app:test:frontend` passes.
- `pnpm run app:test:browser` passes locally.
- `pnpm run app:baseline` passes without AWS credentials.

## Phase 7 — Validate CI/CD and GitOps compatibility

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

## Phase 8 — Merge and deploy

1. Open a PR containing the in-place replacement, route compatibility, actual API wiring, test updates, Docker updates, and docs.
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

Because the replacement keeps the existing frontend service identity, rollback is application-level:

1. Revert the replacement PR and let image CI build the previous app again, or
2. Use the existing service image rollback workflow to promote the last known good `hiraya-frontend` image tag.

No Terraform destroy/recreate should be needed for this replacement.

## Risks

- Route compatibility: the rewrite source used `/auth`, but the replacement must preserve `/login`, `/register`, and `/profile`.
- Test churn: old browser tests assert old headings and checkout-disabled copy; these must become contract-focused rather than copy-heavy where possible.
- Product image mismatch: backend returns legacy filenames while the rewrite source generated a new asset set.
- Static fallback masking: fallback products can hide broken API wiring unless tests assert the actual API calls and error behavior.
- Order authorization: checkout is client-gated, but the orders backend does not yet enforce bearer-token ownership.
- Build output mismatch: Docker must copy Vite `dist/`, not CRA `build/`.
- Chunk size: Vite may warn about a large JS chunk; defer code-splitting unless it affects deploy smoke or user experience.

## Documentation follow-up

Consider recording an ADR for the in-place frontend replacement if the team wants future readers to understand why the work did not introduce a parallel frontend service, canary HTTPRoute, or Terraform/EKS changes.
