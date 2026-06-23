# pnpm monorepo refactor plan

## Goal

Make the repository root the single canonical pnpm workspace for Hiraya application packages and repository automation.

This replaces the current nested `app/microservices` pnpm workspace because `.github/scripts` participates in app baseline planning, image CI, GitOps assertions, deploy smoke, and governance reports. Keeping those scripts owned by the app workspace creates an unclear seam. The refactor should be clean: no nested lockfile, no legacy app package wrappers, and no transitional path-filter metadata.

Decision record: [`docs/adr/0005-root-pnpm-workspace.md`](../adr/0005-root-pnpm-workspace.md).

## Non-goals

- Do not change Terraform, EKS resources, Argo CD application shape, or Kubernetes runtime manifests except where Docker image build inputs require path updates.
- Do not introduce compatibility wrappers for `cd app/microservices && pnpm ...`.
- Do not keep old duplicated service path-filter metadata.
- Do not move app-specific config files to root unless root execution requires an explicit path.

## Target repository shape

```text
/package.json
/pnpm-workspace.yaml
/pnpm-lock.yaml
/.dockerignore

.github/actions/setup-node-pnpm/action.yml
.github/scripts/src/*.mts
.github/scripts/dist/*.mjs
.github/scripts/*.test.mjs

app/microservices/
  docker-compose.yml
  playwright.config.mjs
  frontend/package.json
  frontend/...
  backend/package.json
  backend/services/*/package.json
  shared/package.json
```

Remove:

```text
app/microservices/package.json
app/microservices/pnpm-workspace.yaml
app/microservices/pnpm-lock.yaml
.github/actions/setup-app-toolchain/action.yml
.github/utils/file-filters.yml
```

## Root package design

Create root `package.json`:

```json
{
  "name": "hiraya",
  "private": true,
  "packageManager": "pnpm@11.8.0",
  "engines": {
    "node": "24.x"
  },
  "scripts": {
    "scripts:build": "tsc -p .github/scripts/tsconfig.json",
    "scripts:test": "node --test .github/scripts/*.test.mjs",

    "reports:permissions": "pnpm run scripts:build && node .github/scripts/dist/permission-controls.mjs --root .",
    "reports:permissions:validate": "pnpm run scripts:build && node .github/scripts/dist/permission-controls.mjs --root . --validate-only",

    "catalog:validate": "node .github/scripts/dist/validate-service-catalog.mjs .github/utils/services.json --root .",
    "services:changed": "pnpm run scripts:build && node .github/scripts/dist/detect-changed-services.mjs --catalog .github/utils/services.json --root .",

    "app:catalog": "pnpm run scripts:build && pnpm run catalog:validate && pnpm run scripts:test",
    "app:static": "pnpm run storefront:static && pnpm run build:backend",
    "app:gitops": "kubectl kustomize gitops >/tmp/hiraya-gitops-rendered.yaml && node .github/scripts/dist/assert-gitops-render.mjs --rendered /tmp/hiraya-gitops-rendered.yaml",
    "app:smoke:public": "node .github/scripts/storefront-public-smoke.mjs",
    "app:baseline": "pnpm list --recursive --depth -1 && pnpm run app:catalog && pnpm run app:test:backend-contract && pnpm run app:test:frontend && pnpm run services:changed -- --all && pnpm run app:gitops && pnpm run app:static",
    "app:test:catalog": "pnpm run scripts:build && pnpm run scripts:test",
    "app:test:contract": "pnpm --filter @hiraya/storefront-contracts test",
    "app:test:backend-contract": "pnpm --filter @hiraya/storefront-contracts test:backend-contract",
    "app:test:frontend": "pnpm --filter frontend test",
    "app:test:browser": "playwright test --config app/microservices/playwright.config.mjs",

    "dev": "concurrently \"pnpm run dev:frontend\" \"pnpm run dev:backend\"",
    "dev:frontend": "pnpm --filter frontend start",
    "dev:backend": "pnpm --filter vintage-backend dev:services",
    "test": "pnpm run test:frontend && pnpm run test:backend",
    "test:frontend": "pnpm --filter frontend test",
    "test:backend": "pnpm --filter vintage-backend test",
    "storefront:build": "pnpm --filter frontend build",
    "storefront:typecheck": "pnpm --filter frontend typecheck",
    "storefront:lint": "pnpm --filter frontend lint",
    "storefront:static": "pnpm run storefront:build && pnpm run storefront:typecheck && pnpm run storefront:lint",
    "build": "pnpm run build:frontend && pnpm run build:backend",
    "build:frontend": "pnpm run storefront:build",
    "build:backend": "pnpm --filter vintage-backend build",
    "docker:build": "docker compose -f app/microservices/docker-compose.yml build",
    "docker:up": "docker compose -f app/microservices/docker-compose.yml up -d",
    "docker:down": "docker compose -f app/microservices/docker-compose.yml down"
  },
  "devDependencies": {
    "@hiraya/storefront-contracts": "workspace:*",
    "@playwright/test": "^1.61.0",
    "@types/node": "^24.13.2",
    "concurrently": "^8.2.2",
    "typescript": "^5.9.3"
  }
}
```

Notes:

- Scripts use plain `pnpm`; Corepack activation happens in CI/local setup.
- `app:install`, `app:workspace`, `install:all`, `check:workspace`, `test:catalog`, and `catalog:changed` are intentionally not preserved.
- Root declares `@hiraya/storefront-contracts` because root-owned browser tests import it.

## Root workspace design

Create root `pnpm-workspace.yaml`:

```yaml
packages:
  - app/microservices/frontend
  - app/microservices/backend
  - app/microservices/backend/services/*
  - app/microservices/shared

# pnpm 11 verifies the committed lockfile against supply-chain policy.
# This exact transitive version was already selected during the Node 24 lock refresh.
minimumReleaseAgeExclude:
  - nanoid@3.3.14

# pnpm 11 requires explicit lifecycle-script decisions.
# core-js postinstall scripts are informational; sharp needs its native install step.
allowBuilds:
  core-js: false
  core-js-pure: false
  sharp: true
```

Generate root lockfile:

```sh
corepack enable
corepack prepare pnpm@11.8.0 --activate
pnpm install --lockfile-only
```

Then delete the nested app workspace files.

## Backend aggregate package

Keep `app/microservices/backend/package.json` as a real backend aggregate package. Clean scripts to plain `pnpm`:

```json
{
  "scripts": {
    "dev:services": "concurrently \"pnpm run dev:gateway\" \"pnpm run dev:auth\" \"pnpm run dev:products\" \"pnpm run dev:orders\" \"pnpm run dev:users\"",
    "dev:gateway": "pnpm --filter gateway-service dev",
    "dev:auth": "pnpm --filter auth-service dev",
    "dev:products": "pnpm --filter product-service dev",
    "dev:orders": "pnpm --filter orders-service dev",
    "dev:users": "pnpm --filter user-service dev",
    "build": "pnpm --filter gateway-service build && pnpm --filter auth-service build && pnpm --filter product-service build && pnpm --filter orders-service build && pnpm --filter user-service build",
    "test": "pnpm --filter gateway-service test && pnpm --filter auth-service test && pnpm --filter orders-service test && pnpm --filter user-service test"
  }
}
```

Preserve current behavior unless tests reveal an existing service test script exits intentionally.

## TypeScript helper build

Update `.github/scripts/tsconfig.json`:

- Remove the nested app type root:

```json
"typeRoots": ["../../app/microservices/node_modules/@types"]
```

- Prefer normal root Node type resolution with:

```json
"types": ["node"]
```

Root `node_modules` should supply `@types/node`.

Keep `.github/scripts/dist/*.mjs` checked in as runtime artifacts generated by root tooling.

## PR classification and service detection

Update `.github/scripts/src/classify-app-pr.mts`:

- Delete obsolete logic that ignores report-only changes in `app/microservices/package.json`.
- Remove references to deleted `app/microservices/package.json`.
- Replace `.github/actions/setup-app-toolchain/**` with `.github/actions/setup-node-pnpm/**`.
- Add root workspace files to app baseline impact:

```text
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
```

- Keep image fanout targeted. Full service image fanout should happen for:

```text
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
.github/utils/services.json
.github/scripts/src/classify-app-pr.mts
.github/scripts/dist/classify-app-pr.mjs
.github/scripts/src/detect-changed-services.mts
.github/scripts/dist/detect-changed-services.mjs
.github/workflows/app-pr-baseline.yml
.github/workflows/image-ci.yml
```

- Do not fan out images for report-only data or `permission-controls` changes.

Update `.github/scripts/src/detect-changed-services.mts` only if needed for root-path assumptions. It already accepts `--root` and `--catalog`.

Rebuild dist after source updates:

```sh
pnpm run scripts:build
```

## Service catalog

Update `.github/utils/services.json`:

For every service:

- Change Docker build context:

```json
"context": "."
```

- Keep Dockerfile as repo-relative path:

```json
"dockerfile": "app/microservices/.../Dockerfile"
```

- Replace old shared app workspace path ownership:

```text
app/microservices/package.json
app/microservices/pnpm-lock.yaml
app/microservices/pnpm-workspace.yaml
```

with:

```text
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
```

- Keep package-specific ownership such as:

```text
app/microservices/backend/package.json
app/microservices/frontend/package.json
app/microservices/backend/services/<service>/package.json
app/microservices/shared/package.json
```

Delete `.github/utils/file-filters.yml`.

## Invariant tests

Rewrite `.github/scripts/app-baseline-scripts.test.mjs` for root monorepo expectations:

- Read root `package.json`, not `app/microservices/package.json`.
- Assert root command surface exists.
- Remove tests that preserve legacy path-filter metadata.
- Assert old app aggregate files are absent if useful.
- Update setup action path to `.github/actions/setup-node-pnpm/action.yml`.
- Assert workflows run root commands, not app working-directory commands.
- Preserve valuable invariants:
  - PR baseline is no-AWS/read-only.
  - Required status remains `app-baseline`.
  - Manifest promotion fast path remains install-free.
  - Image pushes and manifest updates remain gated by app baseline.
  - Deploy smoke remains read-only and no automatic rollback.

Update `.github/scripts/classify-app-pr.test.mjs`:

- Fixture should create root `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` instead of `app/microservices/package.json` for workspace-wide changes.
- Remove tests for ignoring app permission-report script-only changes.
- Add tests for root package/lock/workspace changes:
  - root package changes classify as app-related.
  - root lock/workspace changes fan out all services.
  - permission report script/data changes do not fan out images unless they match baseline-impact rules intentionally.

Update `.github/scripts/detect-changed-services.test.mjs`:

- Fixture ownership should use root package/lock/workspace files.
- Expected build context should become `.`.

Update `.github/scripts/validate-service-catalog.test.mjs` if it asserts old contexts.

## GitHub Actions

### New setup action

Create `.github/actions/setup-node-pnpm/action.yml`:

```yaml
name: setup-node-pnpm
description: Set up pinned Node, Corepack pnpm, and pnpm store cache for repo workflows.

runs:
  using: composite
  steps:
    - name: set-up-node-from-root-toolchain
      uses: actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e # v6
      with:
        node-version-file: package.json

    - name: activate-pinned-pnpm
      shell: bash
      run: |
        set -euo pipefail
        corepack enable
        corepack prepare pnpm@11.8.0 --activate

    - name: resolve-pnpm-store-path
      id: pnpm-store
      shell: bash
      run: echo "path=$(pnpm store path --silent)" >> "$GITHUB_OUTPUT"

    - name: restore-pnpm-store-cache
      uses: actions/cache@0057852bfaa89a56745cba8c7296529d2fc39830 # v4
      with:
        path: ${{ steps.pnpm-store.outputs.path }}
        key: ${{ runner.os }}-pnpm-${{ hashFiles('pnpm-lock.yaml') }}
        restore-keys: |
          ${{ runner.os }}-pnpm-
```

The action does not install dependencies. Jobs run `pnpm install --frozen-lockfile` explicitly when needed.

Delete `.github/actions/setup-app-toolchain/action.yml`.

### `.github/workflows/app-pr-baseline.yml`

- Planner job:
  - Add `actions/setup-node` with `node-version-file: package.json`.
  - Keep no pnpm install.
  - Continue running checked-in `dist/classify-app-pr.mjs` directly.

- Manifest-promotion fast path:
  - Add `actions/setup-node` with `node-version-file: package.json` before running `assert-gitops-render.mjs`.
  - Keep no pnpm install.

- Full app baseline job:

```yaml
- uses: ./.github/actions/setup-node-pnpm
- run: pnpm install --frozen-lockfile
- run: pnpm run app:baseline
```

- Remove `working-directory: app/microservices`.
- Keep final required check job named `app-baseline`.

### `.github/workflows/image-ci.yml`

- `detect-changes` job:
  - Add `actions/setup-node` with `node-version-file: package.json`.
  - Remove pnpm setup/cache/install.
  - Run `node .github/scripts/dist/detect-changed-services.mjs ...` directly.

- `app-baseline` job:
  - Use `.github/actions/setup-node-pnpm`.
  - Run `pnpm install --frozen-lockfile`.
  - Run `pnpm run app:baseline` from root.
  - Cache key uses root `pnpm-lock.yaml` via the action.

- Build/push jobs keep using catalog matrix fields. Their `context` will become `.` after service catalog update.

### `.github/workflows/permission-report-ci.yml`

- Path filters include:

```text
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
docs/reports/data/**
docs/reports/schema/**
.github/scripts/src/permission-controls.mts
.github/scripts/dist/permission-controls.mjs
.github/workflows/permission-report-ci.yml
```

- Use `.github/actions/setup-node-pnpm`.
- Run `pnpm install --frozen-lockfile` at root.
- Run `pnpm run reports:permissions` at root.
- Remove app working-directory and app install steps.

### `.github/workflows/deploy-smoke.yml`

- Use `.github/actions/setup-node-pnpm`.
- Run `pnpm install --frozen-lockfile` at root.
- Run `pnpm run app:smoke:public` at root.

### Other workflow references

Search and update all remaining references to:

```text
app/microservices/package.json
app/microservices/pnpm-lock.yaml
app/microservices/pnpm-workspace.yaml
setup-app-toolchain
working-directory: app/microservices
pnpm run app:install
```

Keep `working-directory: app/microservices` only where the command truly operates on app-local files and does not rely on the old pnpm root.

## Docker and Compose

### Root `.dockerignore`

Create root `.dockerignore`:

```dockerignore
.git
.github
.ralph
tutor
docs
infra
terraform
node_modules
**/node_modules
**/dist
**/coverage
docs/reports/build
.DS_Store
*.log
```

Keep precise Dockerfile `COPY` so ignored repo tooling does not enter images.

### Dockerfiles

Update every app image Dockerfile to use repo-relative paths under `/workspace`.

Example TypeScript service pattern:

```dockerfile
FROM node:24-alpine AS builder

WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY app/microservices/backend/package.json app/microservices/backend/package.json
COPY app/microservices/backend/services/auth/package.json app/microservices/backend/services/auth/package.json
RUN corepack enable && corepack pnpm@11.8.0 install --frozen-lockfile --filter auth-service

COPY app/microservices/backend/services/auth app/microservices/backend/services/auth
RUN corepack pnpm@11.8.0 --filter auth-service build

FROM node:24-alpine

WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY app/microservices/backend/package.json app/microservices/backend/package.json
COPY app/microservices/backend/services/auth/package.json app/microservices/backend/services/auth/package.json
RUN corepack enable && corepack pnpm@11.8.0 install --frozen-lockfile --prod --filter auth-service

COPY --from=builder /workspace/app/microservices/backend/services/auth/dist app/microservices/backend/services/auth/dist

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /workspace/app/microservices/backend/services/auth
USER nodejs

EXPOSE 3002
CMD ["node", "dist/index.js"]
```

Example frontend pattern:

```dockerfile
FROM node:24-alpine AS build

WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY app/microservices/frontend/package.json app/microservices/frontend/package.json
RUN corepack enable && corepack pnpm@11.8.0 install --frozen-lockfile --filter frontend

COPY app/microservices/frontend app/microservices/frontend

ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN corepack pnpm@11.8.0 --filter frontend build

FROM nginx:alpine

COPY app/microservices/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/app/microservices/frontend/build /usr/share/nginx/html

EXPOSE 80
```

Check whether backend service builds need shared package files. If any service imports workspace packages, copy the required package manifests before install and source before build.

### Compose

Keep `app/microservices/docker-compose.yml`, but update each build context:

```yaml
build:
  context: ../..
  dockerfile: app/microservices/backend/services/auth/Dockerfile
```

For frontend:

```yaml
build:
  context: ../..
  dockerfile: app/microservices/frontend/Dockerfile
```

Root scripts invoke compose with:

```sh
docker compose -f app/microservices/docker-compose.yml build
```

## Documentation

### Root README

Add a monorepo command section to `README.md`:

```sh
corepack enable
corepack prepare pnpm@11.8.0 --activate
pnpm install --frozen-lockfile
pnpm run app:baseline
pnpm run reports:permissions:validate
pnpm run services:changed -- --all
```

Document that root is the only pnpm workspace and that commands run from repo root.

### App README

Update `app/microservices/README.md`:

- Remove “run from `app/microservices`”.
- Say Vintage Storefront commands run from repo root.
- Remove `app:install`, `app:workspace`, and `scripts:build` command rows.
- Replace `app:changed` with `services:changed`.
- Remove legacy path-filter transition section.
- Keep app baseline, service catalog, GitOps assertion, backend contract, frontend static/unit/browser, and public smoke explanations.

### Reports README

Update `docs/reports/README.md`:

```sh
pnpm run reports:permissions:validate
pnpm run reports:permissions
```

Run from repository root.

### Runbooks

Update runbooks that mention old app workspace package/lock/setup paths.

## Validation plan

Run from repo root.

### Install and script build

```sh
corepack enable
corepack prepare pnpm@11.8.0 --activate
pnpm install --frozen-lockfile
pnpm run scripts:build
```

### Repo script tests

```sh
pnpm run scripts:test
pnpm run app:catalog
```

### Reports

```sh
pnpm run reports:permissions:validate
pnpm run reports:permissions
rm -rf docs/reports/build
```

Expected report validation should remain equivalent to current known result:

```text
Validated 37 permission controls with 54 report views.
Validated 35 standards mappings across 5 standards.
```

### App baseline

```sh
pnpm run app:test:backend-contract
pnpm run app:test:frontend
pnpm run services:changed -- --all
pnpm run app:gitops
pnpm run app:static
pnpm run app:baseline
```

### Docker build checks

At minimum, verify one frontend and one backend image locally:

```sh
docker build -f app/microservices/frontend/Dockerfile .
docker build -f app/microservices/backend/services/auth/Dockerfile .
```

If time permits, verify all compose builds:

```sh
pnpm run docker:build
```

On Apple Silicon, keep CI/EKS target in mind. CI builds use `linux/amd64`; local Docker may build for the host architecture unless `--platform linux/amd64` is specified.

### Workflow static checks

```sh
rg -n "app/microservices/package.json|app/microservices/pnpm-lock.yaml|app/microservices/pnpm-workspace.yaml|setup-app-toolchain|app:install|working-directory: app/microservices" .github docs app README.md
```

Expected: no stale references except intentional prose about historical migration, if any.

### Git status hygiene

Before finishing:

```sh
git status --short
```

Ensure generated ignored artifacts are removed:

```sh
rm -rf docs/reports/build
```

## Deployment impact

This refactor is CI/tooling and image-build oriented. It should not directly change Terraform, EKS cluster resources, Argo CD desired state, service ports, Kubernetes manifests, or public routing.

However, Docker image build inputs change from nested `app/microservices` context to repository-root context. This affects the microservice image pipeline and therefore ECR images that Argo CD deploys. Dockerfiles must use precise `COPY` instructions and a root `.dockerignore` to avoid accidentally expanding image context or content.

Expected runtime behavior after successful image build should be unchanged:

- Same Node/nginx base images.
- Same exposed ports.
- Same service start commands.
- Same GitOps manifests and EKS deployment paths.

## Implementation order

1. Add root `package.json`, `pnpm-workspace.yaml`, and `.dockerignore`.
2. Move pnpm policy from `app/microservices/pnpm-workspace.yaml` to root.
3. Remove app aggregate package and nested lock/workspace files.
4. Generate root `pnpm-lock.yaml`.
5. Update `.github/scripts/tsconfig.json` and root script tests.
6. Update classifier/service detector tests and service catalog.
7. Rebuild `.github/scripts/dist`.
8. Replace setup action.
9. Update workflows.
10. Update Dockerfiles and Compose contexts.
11. Update docs.
12. Run validation plan.
13. Remove generated ignored artifacts.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Root lockfile changes many dependencies unexpectedly | Generate lockfile once, review diff, run app baseline and reports. |
| Dockerfiles miss required package manifests | Build representative images, then full compose build if possible. |
| PR baseline planner loses cheap no-install behavior | Keep checked-in dist and use setup-node only for planner jobs. |
| Root package changes cause excessive image builds | Keep image fanout patterns targeted; report-only changes should not fan out. |
| Branch protection check changes accidentally | Keep final workflow job named `app-baseline`; update tests to assert it. |
| Stale docs keep telling users to run from `app/microservices` | Search and update stale references. |
