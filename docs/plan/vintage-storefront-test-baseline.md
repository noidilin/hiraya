# Vintage Storefront test baseline plan

Status: planned
Related: [`TODO.md`](../../TODO.md), [`CONTEXT.md`](../../CONTEXT.md), [`docs/adr/0003-vintage-storefront-order-api-owner.md`](../adr/0003-vintage-storefront-order-api-owner.md), [`docs/adr/0004-vintage-storefront-api-response-envelope.md`](../adr/0004-vintage-storefront-api-response-envelope.md)

## Goal

Create a critical behavior gate for the Vintage Storefront before the React 19 + Vite + shadcn rewrite. The baseline should protect user-visible commerce behavior, API contracts, GitOps rendering, and the image/deploy path without freezing the current CRA/MUI layout.

The rewrite can start only after the baseline is green and enforced for PRs, the main image flow runs the same checks before pushing images, GitOps assertions pass, and the post-GitOps public smoke is green.

## Scope decisions

- The target is the existing `app/microservices/frontend` Vintage Storefront, not the later AIOps frontend.
- The baseline is a behavior safety contract, not a snapshot of current bugs.
- Current bugs exposed by the baseline should be fixed to match intended behavior.
- Use Playwright with mocked `/api` responses as the primary UI behavior baseline.
- Use Vitest for app unit tests and gateway/API contract tests.
- Use shared Zod schemas and representative fixtures for Playwright mocks and Vitest contract tests.
- Run Playwright on Chromium only in the initial PR gate.
- Use accessible selectors first; add `data-testid` only for stable business elements that lack good semantics.
- Do not add visual regression tests before the redesign.
- Do not add automated axe accessibility gates in this baseline.
- Do not gate on coverage percentages.

## App toolchain

- Migrate only `app/microservices` to pnpm for this slice.
- Commit a deterministic pnpm lockfile.
- Pin Node 24 for CI and local app tooling.
- Pin pnpm 11 through the `packageManager` field in `app/microservices/package.json`.
- Add pnpm workspace scripts so local developers can run the same baseline commands as CI.

## API contract decisions

- Browser API calls use same-origin `/api`; nginx and local dev proxy route `/api` to the gateway.
- All Vintage Storefront APIs use the minimal response envelope:
  - success: `{ "success": true, "data": ..., "message"?: string }`
  - failure: `{ "success": false, "error": string }`
- API wire fixtures use backend JSON naming, including snake_case fields such as `image_url`, `compare_price`, and `inventory_quantity`.
- Frontend adapters normalize wire data to UI/domain shapes.
- Remove the legacy demo password bypass (`password === "demo"`); portfolio demos should use seeded credentials that pass normal password verification.
- Exclude `/auth/refresh` from the initial critical auth baseline.
- Unauthenticated `/profile` and `/orders` direct loads redirect to `/login`.
- The cart stops before checkout in this baseline.
- The existing `Proceed to Checkout` affordance should be disabled or marked coming soon instead of navigating to a missing route.

## Backend ownership

- `app/microservices/backend/services/orders` owns the Storefront `/api/orders` contract.
- The older `order-service` is outside Storefront behavior tests until it is retired or deliberately given a separate route.
- Behavior tests initially cover active Storefront services only: gateway, auth, product-service, and orders.
- Gateway tests should still verify `/api/users` proxies to `USERS_SERVICE_URL`, but user-service behavior tests are out of scope for this baseline.
- Backend tests should mock DB boundaries and upstream HTTP calls; do not require a real PostgreSQL database in the PR gate.
- Small backend testability refactors are allowed: split Express `createApp()` from `listen()` so Vitest/supertest can test routes without real ports.

## Playwright baseline inventory

Use a five-spec Commerce spine:

1. **Routing**: direct loads for `/`, `/products`, `/products/:id`, `/cart`, `/login`, plus protected `/profile` or `/orders` redirect behavior.
2. **Catalog**: product list renders from mocked enveloped API data; search and sort work from representative fixtures.
3. **Product to cart**: product detail renders wire data, quantity controls respect inventory, and adding to cart updates the cart badge/state.
4. **Cart**: add/update/remove/clear behavior and totals are correct; checkout is disabled/coming soon.
5. **Auth and protected pages**: UI login uses mocked enveloped auth responses, storage state is reused, and profile/orders shells render for authenticated users.

Fixtures should be a small representative set: 3–5 products covering categories, prices, inventory edge cases, and one order fixture.

## Vitest API baseline inventory

- Gateway path rewrites for `/api/auth`, `/api/products`, `/api/orders`, and `/api/users` against mocked upstream services.
- Auth route behavior for register, demo login, logout, and me using the minimal envelope.
- Product route behavior for product list, categories, and product detail using the minimal envelope.
- Orders route behavior for create/list/status using the minimal envelope, with DB and product-service calls mocked.
- Key failure paths should return the minimal failure envelope where they are part of the public contract.

## Static checks

- Add explicit frontend build, typecheck, and lint scripts.
- Lint errors block; warnings are allowed initially.
- Remove the default CRA `learn react` test as part of replacing it with meaningful baseline tests.

## CI/CD baseline

- Add a separate app PR-check workflow rather than overloading the image push workflow.
- The app PR baseline runs with no AWS credentials and read-only repository permissions.
- Add `.github/utils/services.json` as the service metadata source of truth.
- Use a script driven by `services.json` to detect changed services and emit matrices.
- PR checks build Docker images for changed services only and do not push images.
- Trivy remains advisory-only while the pipeline stabilizes.
- The main image workflow should run the same app baseline scripts before pushing images.
- After a manifest update is pushed, run a read-only public route smoke:
  - `/` returns the Storefront shell.
  - `/api/products` returns a valid success envelope with products.
- If post-GitOps public smoke fails, fail the workflow only; do not auto-revert manifests yet.
- Once stable, make the app baseline a required PR check through GitHub branch protection or rulesets.

## GitOps and infra checks

- GitOps baseline runs `kubectl kustomize gitops`.
- Add targeted GitOps assertions for critical invariants:
  - frontend HTTPRoute host and backend service reference remain valid.
  - frontend service remains ClusterIP and routes to the container port.
  - gateway environment variables point to the intended in-cluster service names.
  - every deployed Deployment/Service port pair is internally consistent, including legacy `order-service`.
- Do not add Kubernetes readiness/liveness probes in this slice.
- Keep Terraform fmt/validate/test in separate infra CI, not the Storefront app baseline workflow.

## Known contradictions to fix during implementation

- `AuthContext` currently marks a visitor with no token as authenticated.
- `Cart` currently navigates to `/checkout`, but no `/checkout` route exists.
- Auth responses are currently raw while the new contract requires envelopes.
- Orders responses are enveloped but the frontend currently expects raw arrays/objects.
- Local CRA `setupProxy.js` points `/api` at product-service rather than the gateway.
- `order-service` GitOps Service port currently does not match its container port.

## Implementation slices

Prefer multiple vertical PRs:

1. **Tooling and catalog**: pnpm workspace/lockfile, Node/pnpm pins, baseline scripts, `.github/utils/services.json`, and changed-service detection script.
2. **API contracts**: shared Zod schemas/fixtures, Express app factories, Vitest gateway/active-service tests, minimal API envelope changes, and API adapter fixes.
3. **UI behavior baseline**: Playwright config/specs, mocked API fixtures, frontend auth/cart/proxy fixes, and removal of the default CRA test.
4. **CI and deployment guardrails**: app PR-check workflow, main workflow pre-push baseline reuse, changed-image Docker builds, GitOps render/assertions, post-GitOps public smoke, and branch protection/ruleset setup.

Within behavior slices, write the failing test first, then make the smallest code change to pass it.
