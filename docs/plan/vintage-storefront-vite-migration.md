# Vintage Storefront React/Vite Replacement Plan

Status: implementation
Last updated: 2026-06-26

## Design decision

This work is an in-place **full frontend replacement**, not an incremental migration from the original CRA app and not a parallel frontend rollout. The old frontend remains only in git history for rollback. The React/Vite rewrite is now the frontend implementation at `app/microservices/frontend`.

The replacement must keep the existing service and deployment contract so it can move through the current CI/CD and GitOps path without Terraform, EKS, service catalog, or public routing changes. Compatibility is preserved at the edges: package identity, container behavior, same-origin `/api` access, public route names, and browser/API contract tests.

Runtime behavior must be driven by the actual Storefront APIs. Mock data and fixtures are allowed in tests, and curated fallback content may be used for images or empty/error presentation, but production code should not silently replace failed API calls with a static storefront as the primary data source.

The replacement also migrates the demo product data to the **Hiraya Furugi Catalog**. That makes this more than a static frontend swap: shared contract fixtures, local database seed data, GitOps restore data, and product image URL handling must move together so local Compose, browser tests, and the deployed dev database all expose the same catalog.

## Resolved decisions

- Replace the existing `app/microservices/frontend` implementation in place with the React/Vite rewrite stack from `/Users/noid/hub/dev/hiraya-fe`.
- Keep the main `hiraya` monorepo as the source of truth. Treat `hiraya-fe` as the staging source only, not an ongoing app.
- Keep existing platform identity: service name, package name, ECR repository, Kubernetes objects, GitOps manifest path, and public hostname stay the same.
- Keep legacy account routes as the public route contract: `/login`, `/register`, `/profile`, and `/orders`.
- Wire the replacement UI to the existing Storefront API through adapter modules under `src/api/*`.
- Enable authenticated checkout through the existing `POST /api/orders` endpoint.
- Keep `Vintage Storefront` as the domain context and use `Hiraya Furugi` as the customer-facing brand.
- Treat the frontend/browser/API contract tests as the replacement acceptance gate.
- Migrate the demo product data to the Hiraya Furugi Catalog instead of preserving the old five-item catalog.
- Make product image URLs data-owned through the existing `product_images` table instead of hardcoded product-service name matching.
- Reset and reseed the deployed dev database for the catalog migration instead of carrying old demo rows forward with an idempotent migration.
- Use the copied app's `fallbackProducts` list as the starting source for the migrated Hiraya Furugi Catalog, then rename it to catalog content because runtime API failures should not use fallback products.
- Surface product API failures in the browser instead of silently falling back to static products.
- Support two Docker Compose frontend modes: production-like nginx for deploy parity and a Vite dev profile/service for hot reload.
- Implement `/profile` as an authenticated read-only account summary backed by `/api/auth/me`; do not add profile editing in this replacement slice.
- After successful `/register`, sign the customer in immediately using the returned token instead of forcing a second login step.
- When checkout sends a logged-out customer to auth, successful login/register returns to `/cart` with cart state preserved.
- Document server-side order ownership authorization as a known backend limitation; do not expand this replacement slice to derive `userId` from bearer tokens server-side.
- Serve only the migrated Hiraya Furugi product/editorial image filenames plus a real placeholder image; do not keep legacy filename aliases after the catalog reset.
- Add product-detail quantity selection with inventory capping before adding to cart.
- Normalize the migrated product API `brand` value to `Hiraya Furugi`.
- Seed a valid demo customer account and one sample order for Docker Compose checkout/order-history QA.
- Add a real Docker Compose smoke check against the local gateway and database as a separate local/pre-merge command first, not as an immediate required `app-baseline` CI step.
- Treat checkout as pending order creation only; do not imply payment collection in UI copy or acceptance criteria.
- For deployed dev reseed, reset only the Vintage app database/PVC/restore path; do not destroy or recreate Terraform/EKS platform layers for this frontend/catalog replacement.
- Patch the existing `vintage_full.sql` dump-style restore files for this migration instead of restructuring restore SQL generation.
- Add the Vite hot-reload frontend as a profiled service in the existing `app/microservices/docker-compose.yml`, not a separate Compose file.
- Keep product/editorial image assets as static frontend-container files under `public/product-images` for this replacement; do not move them to S3/CloudFront now.
- Use native architecture for local Docker Compose on Apple Silicon; keep Dockerfiles compatible with the linux/amd64 CI/ECR target instead of forcing amd64 for everyday local development.
- Rename `product-fallbacks.ts` to a catalog-oriented module, such as `hiraya-furugi-catalog.ts`, so static catalog content is not confused with runtime API fallback behavior.
- Keep automated post-deploy public smoke read-only; login/checkout mutation coverage belongs in local Compose smoke and manual dev QA.
- Drive category filter options from `GET /api/products/categories` instead of deriving them only from the loaded product list.
- Keep product search/sort client-side over the loaded demo catalog for this replacement slice; do not extend backend sort-direction behavior now.

## Deployment impact

No Terraform or EKS platform shape change is expected. The deployed dev catalog migration should reset only Vintage app database state, not Project Bootstrap, Platform Core, Cluster Platform, or Cluster Bootstrap. The replacement must keep the existing Kubernetes `Deployment`, `Service`, `HTTPRoute`, ECR repository, service catalog entry, and image-promotion flow:

- service name: `frontend`
- package name: `frontend`
- workspace path: `app/microservices/frontend`
- ECR repository: `hiraya-frontend`
- manifest path: `gitops/apps/vintage/k8s/frontend/deployment.yml`
- public hostname: `hiraya.noidilin.dev`
- same-origin API base: `/api`

The deployment changes are limited to the frontend container build, local runtime assumptions, and demo catalog seed/restore data:

- CRA output `build/` becomes Vite output `dist/`.
- CRA env arg `REACT_APP_API_URL` becomes `VITE_API_URL`.
- Local dev needs a Vite `/api` proxy to the gateway/backend.
- The container still serves static files through nginx and proxies `/api/` to `http://gateway:3001`.
- Docker Compose remains the canonical local full-stack runtime through `pnpm run docker:up` from the repository root.
- Product seed data must be updated in both local Compose initialization and GitOps dev restore assets, without changing Terraform or Kubernetes routing shape.

## Current findings

- The replacement files have been copied into `app/microservices/frontend`; the remaining work is to adapt them to the monorepo, actual API contract, container runtime, catalog data, and test baseline.
- Phase 1 package re-anchoring is implemented: the frontend package is named `frontend`, exposes the root workspace script contract, uses the root lockfile, and no longer keeps a nested `pnpm-lock.yaml`.
- Existing Playwright config starts the frontend on port `3000`; Vite now keeps that port for `start`, `dev`, and `preview` scripts.
- Vite now defaults local dev `/api` traffic through a proxy to `http://localhost:3001`; later Compose work should adapt the container dev profile to target the `gateway` service name.
- Phase 4 Docker runtime is implemented: the frontend image builds from the root workspace with `VITE_API_URL=/api`, nginx serves the Vite `dist/` output with SPA fallback and `/api/` proxying to the Compose gateway, default Compose exposes the production-like frontend at `http://localhost:3000`, and the `frontend-dev` profile runs Vite hot reload against `http://gateway:3001` without forcing a local platform architecture.
- Existing browser tests must be updated for the new UI while preserving legacy route names and enabling checkout.
- Phase 2 legacy account routing is implemented: `/login`, `/register`, `/profile`, and `/orders` are intentional routes; `/auth` redirects to `/login`; account navigation points at `/profile`; unauthenticated `/profile` and `/orders` redirect to `/login` with a return path. `/profile` is a read-only account summary backed by the current authenticated identity data.
- Product API hooks now load products and category filters through the Storefront API client, and product API failures surface explicit unavailable states instead of silently rendering static catalog products.
- Phase 3A catalog data migration is implemented: shared contract fixtures, local seed SQL, product image rows, and GitOps restore SQL describe the Hiraya Furugi Catalog with stable product IDs and normalized `Hiraya Furugi` brand values.
- Product service image URLs are read from primary `product_images` rows and fall back only to `/product-images/placeholder.jpg`; the previous hardcoded legacy filename matching has been removed from active product-service queries.
- Phase 3A seeded demo order-history path is implemented: the active orders service defaults omitted legacy `userId` requests to the seeded demo customer ID, shared order fixtures use that same user ID and Hiraya Furugi product IDs, and protected `/orders` browser coverage exercises the order-history adapter through `/api/orders/my-orders`.
- Product-detail cart flow is implemented: detail pages default quantity to one, cap quantity controls by product inventory, pass selected quantity into the persisted cart store, and browser coverage verifies inventory capping plus reload persistence.
- Phase 5 checkout flow is implemented: logged-out checkout preserves the persisted cart and returns to `/cart` after login or registration, logged-in checkout posts a pending `/api/orders` payload with `userId`, line items, and shipping address, order confirmation uses the created pending order/last-order state without payment-collected copy, and tests document the current server-side order ownership limitation.
- Phase 6 no-AWS baseline coverage now includes frontend unit assertions for no refresh-token auth dependency, cart localStorage persistence, and inventory capping, plus browser coverage for the product API failure state so static catalog content does not mask a broken Storefront API.
- Phase 4A local full-stack smoke is implemented as `pnpm run app:smoke:compose`: it resets Compose volumes, starts the production-like stack, verifies the frontend shell, product envelope, frontend-served product image URLs, demo login, seeded order history, and pending checkout order creation, then tears the stack and volumes down. The Compose `orders` service now points `PRODUCTS_SERVICE_URL` at `http://product-service:3003` so order history and checkout product lookups work inside the Compose network.
- Phase 7 CI/CD and GitOps compatibility coverage is implemented: repository tests now assert the replacement keeps the single existing `frontend` service catalog entry, changed-service detection maps frontend paths to `hiraya-frontend`, GitOps render keeps the existing Deployment/Service/HTTPRoute shape, and the public deploy smoke remains GET-only/read-only.

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
   - `/profile` renders an authenticated read-only account summary.
   - `/orders` remains authenticated order history.
2. Update navigation links to use legacy account routes.
3. Redirect `/auth` to `/login` so rewrite-source links do not 404, but do not make `/auth` the new public contract.
4. Reintroduce protected-route behavior for `/profile` and `/orders`: unauthenticated users go to `/login` while cart state is preserved.
5. Keep `/profile` scoped to data already available from `/api/auth/me`: name, email, role, links to cart/orders, and sign out.

Acceptance:

- Direct loads of `/`, `/products`, `/products/:id`, `/cart`, `/login`, `/register`, `/profile`, `/orders`, `/order-confirmed`, and `/manifesto` are intentional and tested.
- Existing external links to legacy account routes do not break.
- `/profile` does not depend on unsupported profile update endpoints.
- Auth redirects preserve the intended return path, especially checkout returning to `/cart` after login/register.

## Phase 3 — Wire the replacement UI to the actual Storefront API

1. Keep API requests behind `src/api/*`; do not scatter `fetch` calls into route components.
2. Keep `VITE_API_URL` defaulting to `/api`.
3. Add Vite dev proxy for local backend use:
   - `/api` -> `http://localhost:3001`
4. Implement adapters for the existing backend envelope and wire shapes:
   - `GET /api/products`
   - `GET /api/products/:id`
   - `GET /api/products/categories` for category filter options
   - login/register endpoints used by the current auth service, with register storing the returned token and authenticated user
   - `POST /api/orders`
   - `GET /api/orders/my-orders?userId=<id>`
5. Keep adapter normalization in `src/api/*` and domain/UI calculations outside raw route components.
6. Keep product search/sort calculations client-side over the loaded demo catalog; backend query behavior can be expanded later if needed.
7. Do not introduce dependencies on unsupported endpoints such as `/api/auth/refresh` or `GET /api/orders/:id`.
8. Do not let product fallback data mask API regressions in tests or production behavior; failed product API calls should surface an error/degraded state instead of rendering fallback products as if the API succeeded.
9. Update product image handling in the same PR as the catalog migration: API image URLs come from `product_images`, shared fixtures use migrated filenames, and the frontend container serves those migrated files plus `placeholder.jpg`.

Acceptance:

- Browser calls remain same-origin under `/api` in local, container, and EKS deployments.
- Frontend API/unit tests prove envelope success/failure handling, auth token injection, token clearing, product/category normalization, order creation, and order history adapters.
- Browser tests can intercept/mock the documented Storefront endpoints and assert request payloads.
- Browser tests include at least one product API failure scenario proving the UI does not silently render fallback products.

## Phase 3A — Migrate the demo catalog data

1. Treat the copied `app/microservices/frontend/src/data/product-fallbacks.ts` content as the starting source of truth for the target Hiraya Furugi Catalog rows, then rename the module to catalog-oriented language such as `hiraya-furugi-catalog.ts`:
   - product IDs
   - names
   - descriptions
   - prices and compare prices
   - categories
   - brand values normalized to `Hiraya Furugi`
   - inventory counts
   - image URLs through `asset-manifest.ts`
2. Keep product/editorial images static in the frontend container for this replacement:
   - store assets under `app/microservices/frontend/public/product-images`.
   - do not add S3, CloudFront, Terraform, or asset-sync scope in this slice.
   - include all filenames referenced by the migrated catalog and editorial content.
   - include a real `placeholder.jpg` for missing primary product images.
3. Make product image URLs data-owned:
   - update product-service list/detail queries to read the primary image from `product_images`.
   - keep `/product-images/placeholder.jpg` as the explicit fallback only when no primary image exists.
   - do not keep old legacy product image filenames as aliases once the catalog is reset/reseeded.
   - remove the current hardcoded product name-to-image `CASE` mapping from active queries.
4. Update local Compose seed data:
   - `app/microservices/database/init/20-init-schema.sql`
   - `app/microservices/database/quick-seed.sql`
5. Patch the existing dump-style deployed dev restore data in place:
   - `gitops/apps/vintage/k8s/database/vintage_full.sql`
   - matching source copy under `app/microservices/database/vintage_full.sql`
   - keep this as a targeted patch, not a restore-system restructure, unless the dump format blocks a reliable reset/reseed.
6. Update shared contract fixtures and schemas under `app/microservices/shared` so Playwright and backend contract tests use the migrated catalog derived from the renamed Hiraya Furugi catalog module.
7. Keep product IDs stable across seed SQL, shared fixtures, browser tests, and fallback data.
8. Seed a valid demo customer account for local and dev QA:
   - use `demo@hirayavintage.test` as the customer email.
   - use the existing documented test password from the Storefront API contract.
   - store only a bcrypt hash in SQL seed data.
   - do not seed a usable admin login unless a supported admin feature is added.
9. Seed one sample order for the demo customer:
   - reference migrated Hiraya Furugi product IDs.
   - keep order/user IDs stable across SQL seed data and shared contract fixtures.
   - keep checkout-created orders separate from the seeded order; checkout should still create a new row.
   - align local and GitOps `orders.user_id` schema with the active orders service's string-based `userId` behavior while still seeding UUID-shaped customer IDs.
10. For deployed dev, reset and reseed only the Vintage app database rather than preserving old demo rows:
   - document the PVC/database reset step in the rollout notes.
   - ensure the GitOps restore asset contains the migrated catalog before the reset.
   - do not destroy/recreate Project Bootstrap, Platform Core, Cluster Platform, or Cluster Bootstrap for this app/data replacement.
   - do not add a long-lived catalog migration job unless the reset path proves insufficient.

Acceptance:

- `GET /api/products` returns the Hiraya Furugi Catalog through the gateway in Docker Compose.
- `GET /api/products/:id` works for every product ID used by shared fixtures and browser tests.
- Product image URLs returned by the API come from `product_images`, not hardcoded backend name matching, and resolve to migrated image files served by the frontend container.
- `/product-images/placeholder.jpg` exists and is used only for missing primary images.
- Legacy product image filenames are not required after the reset/reseed because no seeded API rows reference them.
- Local Compose, shared contract fixtures, and patched GitOps dump-style restore data describe the same product names, IDs, categories, prices, inventory, normalized `Hiraya Furugi` brand value, and image URLs as the renamed Hiraya Furugi catalog module.
- Docker Compose exposes a known demo customer login and one existing order for checkout and order-history QA.
- No Terraform or EKS platform shape change is needed; the Vintage app database reset/reseed step is documented.

## Phase 4 — Update container and local runtime

1. Restore/update the frontend Dockerfile:
   - build from the root workspace context and lockfile.
   - build with `VITE_API_URL=/api`.
   - copy `/workspace/app/microservices/frontend/dist` into the nginx html root.
2. Restore/update `nginx.conf` with SPA fallback and `/api/` proxy to `http://gateway:3001`.
3. Update the default Docker Compose `frontend` service as the production-like local path:
   - build arg `REACT_APP_API_URL` becomes `VITE_API_URL`.
   - service remains available at `http://localhost:3000`.
   - service validates nginx static serving, SPA fallback, and gateway proxy behavior.
4. Add a Compose dev profile/service for frontend iteration in the existing `app/microservices/docker-compose.yml`:
   - add a profiled `frontend-dev` service rather than a separate Compose file.
   - run Vite on `0.0.0.0:3000` with bind-mounted frontend source.
   - proxy `/api` to the Compose `gateway` service, not a host-only backend.
   - keep the root workspace install/lockfile model; do not introduce a nested package-manager workflow.
5. Keep container output linux/amd64-compatible for CI/ECR while allowing normal local Compose builds to use native Apple Silicon architecture unless explicitly overridden.

Acceptance:

- `docker compose -f app/microservices/docker-compose.yml build frontend` succeeds for the expected CI target platform.
- `pnpm run docker:up` starts the production-like full stack at `http://localhost:3000`.
- The production-like frontend container serves the Vite SPA and proxies `/api/` to the gateway service.
- A documented Compose dev command/profile starts the same backend stack with Vite hot reload for frontend development.

## Phase 4A — Add local Compose full-stack smoke

1. Add a no-AWS Compose smoke command, for example `pnpm run app:smoke:compose`.
2. The smoke should start from a clean or documented database state and verify through the gateway/front door:
   - `/` serves the frontend shell.
   - `/api/products` returns a non-empty Hiraya Furugi Catalog success envelope.
   - product image URLs from the API resolve from the frontend container.
   - demo login succeeds for the seeded demo customer.
   - `/api/orders/my-orders?userId=<seeded-demo-user-id>` returns the seeded order.
   - checkout can create a new order against real services.
3. The smoke must tear down containers/volumes according to the documented local reset path.

Acceptance:

- A developer can run one documented command from the repository root to prove the Compose stack works end-to-end without AWS credentials.
- Smoke failures identify whether the break is frontend serving, gateway routing, auth, products, orders, seed data, or image assets.

## Phase 5 — Enable cart and checkout safely

1. Keep client-side cart state in Zustand/localStorage.
2. Add product-detail quantity selection before add-to-cart:
   - default quantity is `1`.
   - quantity cannot go below `1` or above current product inventory.
   - adding to cart respects existing cart quantity and inventory caps.
3. Keep checkout client-side gated by authenticated user state.
4. Submit pending orders through existing `POST /api/orders` with:
   - `userId`
   - `items: { productId, quantity }[]`
   - `shippingAddress`
5. Keep order confirmation driven by the created pending order response or local last-order state; avoid payment-collected language because the backend has no payment endpoint.
6. Do not claim server-side per-token order authorization yet; the current orders service still accepts `userId` and does not validate the bearer token. Document this explicitly as a known backend limitation for a later security slice.

Acceptance:

- Product detail quantity selection is capped by inventory and adds the selected quantity to the cart.
- Logged-out checkout preserves cart and sends the user to sign in, then successful auth returns to `/cart`.
- Logged-in checkout posts the expected pending-order payload and reaches `/order-confirmed` without implying payment collection.
- Order history uses `/api/orders/my-orders?userId=<id>` through the adapter layer.

## Phase 6 — Restore the no-AWS app baseline

1. Add Vitest/jsdom frontend tests for the replacement app.
2. Minimum unit coverage:
   - API envelope success/failure handling.
   - bearer token injection and token clearing.
   - no refresh-token flow.
   - product wire normalization.
   - order creation/list adapters.
   - cart persistence, product-detail quantity selection, and inventory capping.
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
- `pnpm run app:smoke:compose` passes locally against real Docker Compose services as a separate local/pre-merge check.
- `pnpm run app:baseline` passes without AWS credentials and does not initially include the Compose smoke.

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
- `gitops/apps/vintage/k8s/frontend/deployment.yml` remains structurally unchanged except image tag changes made by the existing promotion flow.
- PR build-only image gate can build `hiraya-frontend` from the root context.

## Phase 8 — Merge and deploy

1. Open a PR containing the in-place replacement, route compatibility, actual API wiring, test updates, Docker updates, and docs.
2. Require `app-baseline` to pass.
3. On merge to `main`, let `image-ci` build and push the `hiraya-frontend` image.
4. Let the existing manifest promotion workflow update the GitOps image tag.
5. Let Argo CD sync the existing frontend Deployment.
6. Run read-only public deploy smoke against `/` and `/api/products`; do not make the automated deployed smoke create orders.
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
   - `/manifesto`

Acceptance:

- Public shell loads at `https://hiraya.noidilin.dev`.
- `/api/products` returns a non-empty Hiraya Furugi Catalog success envelope.
- Manual dev QA confirms checkout works against the deployed backend, or any backend limitation is documented as a known issue.

## Rollback plan

Because the replacement also changes demo catalog data, rollback must keep app code and database seed state together:

1. Revert the replacement PR and let image CI build the previous app/backend images again, or use the existing service image rollback workflow for the affected images.
2. Reset/reseed the Vintage app database back to the seed/restore data that matches the rolled-back app/API contract.
3. Verify `/`, `/api/products`, product images, login, cart, and `/orders` after the reseed.

No Terraform destroy/recreate should be needed for this replacement or rollback.

## Risks

- Route compatibility: the rewrite source used `/auth`, but the replacement must preserve `/login`, `/register`, and `/profile`.
- Test churn: old browser tests assert old headings and checkout-disabled copy; these must become contract-focused rather than copy-heavy where possible.
- Product image/data drift: backend seed data, `product_images`, shared fixtures, and frontend assets must stay aligned after the catalog migration.
- Static fallback masking: fallback products can hide broken API wiring unless product hooks and tests surface actual API failures.
- Order authorization: checkout is client-gated, but the orders backend does not yet enforce bearer-token ownership. This is intentionally documented as a known backend limitation rather than fixed in this replacement slice.
- Build output mismatch: Docker must copy Vite `dist/`, not CRA `build/`.
- Chunk size: Vite may warn about a large JS chunk; defer code-splitting unless it affects deploy smoke or user experience.

## Documentation follow-up

Update supporting docs in the replacement PR:

- `app/microservices/frontend/reference/storefront-api-contract.md` for Vite env naming, migrated catalog fixtures, category usage, pending-order checkout, and unsupported endpoint boundaries.
- `app/microservices/database/README.md` for the Hiraya Furugi Catalog, seeded demo login, seeded order, image asset filenames, and local reset/reseed behavior.
- `app/microservices/README.md` and root `README.md` for production-like Compose, Vite hot-reload Compose profile, and `app:smoke:compose`.
- Any rollout/runbook note needed to reset only Vintage app database state in deployed dev.

Consider recording an ADR for the in-place frontend replacement if the team wants future readers to understand why the work did not introduce a parallel frontend service, canary HTTPRoute, or Terraform/EKS changes.
