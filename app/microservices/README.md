# Vintage Storefront app workspace

This workspace owns the reusable app baseline command surface for local development and future GitHub Actions workflows. Commands are generic so they can survive the planned Storefront rewrite from CRA/MUI to another frontend stack.

Run commands from `app/microservices` with the pinned package manager (`pnpm@11.8.0`). None of the baseline commands require AWS credentials. pnpm 11 supply-chain and build-script policy exceptions are documented in `pnpm-workspace.yaml`.

## Baseline commands

| Command | Purpose |
| --- | --- |
| `pnpm run app:install` | Install the workspace with the committed lockfile using `--frozen-lockfile`. |
| `pnpm run app:workspace` | Verify deterministic install and list all workspace packages. |
| `pnpm run scripts:build` | Compile TypeScript CI helper scripts to checked-in Node runtime files. |
| `pnpm run app:catalog` | Compile scripts, validate `.github/utils/services.json`, and run catalog/detector self-tests. |
| `pnpm run app:changed -- <files...>` | Emit the service matrix for changed files. Use `-- --all` to select every service. |
| `pnpm run app:static` | Run Storefront build, typecheck, and lint checks, then the backend build. Lint errors block while warnings remain allowed initially. |
| `pnpm run app:gitops` | Render GitOps desired state with `kubectl kustomize gitops` and run targeted GitOps render assertions without Kubernetes cluster credentials. |
| `pnpm run app:smoke:public` | Run the read-only public deploy smoke against `STOREFRONT_PUBLIC_URL` (default `https://hiraya.noidilin.dev`) by checking `/` for the Storefront shell and `/api/products` for a successful product envelope. |
| `pnpm run storefront:build` | Build the Vintage Storefront production bundle through the frontend package. |
| `pnpm run storefront:typecheck` | Run the Vintage Storefront TypeScript checker without emitting files. |
| `pnpm run storefront:lint` | Run the Vintage Storefront ESLint check. Errors fail the command; warnings are permitted for now. |
| `pnpm run storefront:static` | Run the reusable Storefront build, typecheck, and lint sequence for local and CI use. |
| `pnpm run app:baseline` | Run workspace, catalog, backend contract, Storefront Vitest unit tests, changed-service, GitOps render assertions, and static checks in the same order CI should reuse. |
| `pnpm run app:test:catalog` | Run service catalog and changed-service detector tests. |
| `pnpm run app:test:contract` | Run Vitest shared Storefront API contract schema, fixture, route-path, backend route, and consumer smoke tests. |
| `pnpm run app:test:backend-contract` | Run the gateway, auth, product, and orders contract suites together as the reusable backend contract gate. |
| `pnpm run app:test:frontend` | Run the Storefront Vitest unit tests in jsdom so broken adapter and behavior tests fail the app baseline. |
| `pnpm run app:test:browser` | Fails clearly until the browser behavior baseline slice is implemented. |

Legacy scripts such as `install:all`, `check:workspace`, and `test:catalog` delegate to this `app:*` surface for compatibility.

## Backend contract baseline

`pnpm run app:test:backend-contract` is the backend API contract baseline for the active Vintage Storefront services. It runs the gateway, auth, product, and orders contract suites in one Vitest invocation with the verbose reporter, so a regression names the failing suite in the output and exits non-zero for local use or later PR-check workflow reuse.

The suite is intentionally isolated from deployed infrastructure with mocked database and upstream boundaries: auth, product, and orders use mocked database boundaries, orders also uses a mocked upstream product lookup boundary, and gateway route tests use mocked proxy handlers. The command runs without AWS credentials, PostgreSQL, Kubernetes, or real backend services.

## Service metadata source of truth

`.github/utils/services.json` is the canonical service catalog for app service metadata: package names, image repositories, build contexts, manifest targets, path ownership, and Vintage Storefront baseline criticality. New app baseline work should update this catalog and verify changes through `pnpm run app:catalog` or `pnpm run app:changed -- <files...>`.

The verified changed-service detector source is `.github/scripts/src/detect-changed-services.mts`. Workflows and local commands execute the compiled runtime file at `.github/scripts/dist/detect-changed-services.mjs`, so changed-service detection stays runnable with plain Node after checkout.

`.github/utils/file-filters.yml` is legacy path-filter metadata kept only as a transitional compatibility layer for the existing image workflow. During the transition:

- Update `services.json` first for any service metadata or ownership change.
- Update `file-filters.yml` too only when the current legacy image workflow must keep matching those paths before it is migrated to the catalog-driven detector.
- Do not add new duplicated service metadata elsewhere.

## PR baseline workflow

The dedicated no-AWS PR gate is `.github/workflows/app-pr-baseline.yml`. Its stable required branch protection status is `Vintage Storefront app baseline / app-baseline`.

The workflow runs for pull requests that touch the app workspace, GitOps manifests, the workflow itself, CI helper scripts, or the service catalog. It grants only read-only repository contents permission, does not request OIDC or cloud secrets, activates the pinned Node/pnpm app toolchain, summarizes impacted services through the service catalog changed-service detector, and runs `pnpm run app:baseline` from this workspace.

`app:baseline` includes the GitOps render assertions from `.github/scripts/src/assert-gitops-render.mts`. The assertion gate renders repository desired state only, then verifies the Vintage Storefront HTTPRoute hostname and frontend backend reference, the frontend ClusterIP Service and container target port, gateway environment URLs for active Storefront APIs, and every rendered Deployment/Service targetPort-to-containerPort pair, including legacy deployed services outside active behavior tests.

The same changed-service detector also drives the PR build-only Docker image gate. For each changed service, the workflow uses the catalog `build.context` and `build.dockerfile` metadata with `docker/build-push-action` and `push: false`, so pull requests prove image buildability without logging in to AWS, pushing to ECR, or writing to any registry. If the detector emits an empty matrix, the image-build job is skipped cleanly while the app baseline still reports the PR check.

## Public deploy smoke

`.github/scripts/storefront-public-smoke.mjs` is the reusable public deploy smoke for the post-GitOps path. It performs only read-only HTTP GET checks: `/` must return the Storefront shell document and `/api/products` must return the minimal `{ success: true, data: ... }` product envelope. The normal main image/GitOps update workflow runs this smoke after manifest updates are pushed, and the manual service rollback escape hatch runs the same smoke after an applied rollback commit. Smoke failures fail the workflow for visibility only; recovery remains manual and no automatic rollback or manifest revert is attempted.
