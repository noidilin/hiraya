# Vintage Storefront

The Vintage Storefront packages live under `app/microservices`, but the repository root is the only pnpm workspace. All commands run from the repository root with the pinned package manager (`pnpm@11.8.0`). None of the baseline commands require AWS credentials.

## Baseline commands

| Command | Purpose |
| --- | --- |
| `pnpm run app:catalog` | Compile scripts, validate `.github/utils/services.json`, and run catalog/detector self-tests. |
| `pnpm run services:changed -- <files...>` | Emit the service matrix for changed files. Use `-- --all` to select every service. |
| `pnpm run app:static` | Run Storefront build, typecheck, and lint checks, then the backend build. Lint errors block while warnings remain allowed initially. |
| `pnpm run app:gitops` | Render GitOps desired state with `kubectl kustomize gitops` and run targeted GitOps render assertions without Kubernetes cluster credentials. |
| `pnpm run app:smoke:public` | Run the read-only public deploy smoke against `STOREFRONT_PUBLIC_URL` (default `https://hiraya.noidilin.dev`) by checking `/` for the Storefront shell and `/api/products` for a successful product envelope. |
| `pnpm run storefront:build` | Build the Vintage Storefront production bundle through the frontend package. |
| `pnpm run storefront:typecheck` | Run the Vintage Storefront TypeScript checker without emitting files. |
| `pnpm run storefront:lint` | Run the Vintage Storefront ESLint check. Errors fail the command; warnings are permitted for now. |
| `pnpm run storefront:static` | Run the reusable Storefront build, typecheck, and lint sequence for local and CI use. |
| `pnpm run app:baseline` | Run workspace listing, catalog checks, backend contract tests, Storefront Vitest unit tests, changed-service detection, GitOps render assertions, and static checks in the same order CI reuses. |
| `pnpm run app:test:catalog` | Run service catalog and changed-service detector tests. |
| `pnpm run app:test:contract` | Run Vitest shared Storefront API contract schema, fixture, route-path, backend route, and consumer smoke tests. |
| `pnpm run app:test:backend-contract` | Run the gateway, auth, product, and orders contract suites together as the reusable backend contract gate. |
| `pnpm run app:test:frontend` | Run the Storefront Vitest unit tests in jsdom so broken adapter and behavior tests fail the app baseline. |
| `pnpm run app:test:browser` | Run the Storefront Playwright browser behavior baseline. |

## Backend contract baseline

`pnpm run app:test:backend-contract` is the backend API contract baseline for the active Vintage Storefront services. It runs the gateway, auth, product, and orders contract suites in one Vitest invocation with the verbose reporter, so a regression names the failing suite in the output and exits non-zero for local use or PR-check workflow reuse.

The suite is intentionally isolated from deployed infrastructure with mocked database and upstream boundaries: auth, product, and orders use mocked database boundaries, orders also uses a mocked upstream product lookup boundary, and gateway route tests use mocked proxy handlers. The command runs without AWS credentials, PostgreSQL, Kubernetes, or real backend services.

## Service metadata source of truth

`.github/utils/services.json` is the canonical service catalog for app service metadata: package names, image repositories, build contexts, manifest targets, path ownership, and Vintage Storefront baseline criticality. New app baseline work should update this catalog and verify changes through `pnpm run app:catalog` or `pnpm run services:changed -- <files...>`.

The verified changed-service detector source is `.github/scripts/src/detect-changed-services.mts`. The PR baseline planner source is `.github/scripts/src/classify-app-pr.mts`; it reuses `services.json` path ownership to classify PRs, plan service image matrices, and skip heavy app jobs for non-app changes. Workflows and local commands execute the compiled runtime files in `.github/scripts/dist/`, so changed-service detection and PR classification stay runnable with plain Node after checkout.

The old duplicated service filter metadata has been removed. Update `services.json` first for any service metadata or ownership change, and do not add new duplicated service metadata elsewhere.

## PR baseline workflow

The dedicated no-AWS PR gate is `.github/workflows/app-pr-baseline.yml`. Its stable required branch protection status is `app-baseline`.

The workflow runs for every pull request so the required status check is always reported and cannot remain pending because of GitHub Actions path filters. It grants only read-only repository contents permission and does not request OIDC or cloud secrets. Its lightweight `plan-app-pr` job uses the compiled PR classifier and `services.json` to choose one of three paths: `non_app` skips heavy app jobs, `manifest_promotion_only` runs only the GitOps render fast path for trusted Hiraya bot image-tag PRs, and `microservice_related` activates the pinned root Node/pnpm toolchain before running `pnpm run app:baseline`.

`app:baseline` includes the GitOps render assertions from `.github/scripts/src/assert-gitops-render.mts`. The assertion gate renders repository desired state only, then verifies the Vintage Storefront HTTPRoute hostname and frontend backend reference, the frontend ClusterIP Service and container target port, gateway environment URLs for active Storefront APIs, and every rendered Deployment/Service targetPort-to-containerPort pair, including legacy deployed services outside active behavior tests.

The same catalog-driven plan also drives the PR build-only Docker image gate. For each changed service, the workflow uses the catalog `build.context` and `build.dockerfile` metadata with `docker/build-push-action` and `push: false`, so pull requests prove image buildability without logging in to AWS, pushing to ECR, or writing to any registry. If the plan emits an empty matrix, the image-build job is skipped cleanly while the app baseline still reports the PR check.

The required check is enforced on the protected `main` branch through the GitHub repository ruleset documented in [`docs/runbooks/platform/enforce-app-baseline-required-check.md`](../../docs/runbooks/platform/enforce-app-baseline-required-check.md). The rule requires only `app-baseline`; AWS-backed image push, deploy, public smoke, Terraform, and infra checks are not required for ordinary app PRs.

## Public deploy smoke

`.github/scripts/storefront-public-smoke.mjs` is the reusable public deploy smoke for the post-GitOps path. It performs only read-only HTTP GET checks: `/` must return the Storefront shell document and `/api/products` must return the minimal `{ success: true, data: ... }` product envelope. Image promotion and manual rollback workflows create GitHub App bot PRs instead of pushing GitOps manifests directly to `main`; those PRs use squash auto-merge after the required `app-baseline` check passes. After a manifest PR merges, `.github/workflows/deploy-smoke.yml` runs this smoke on `gitops/**` pushes to `main`. Smoke failures fail the workflow for visibility only; recovery remains manual and no automatic rollback or manifest revert is attempted.
