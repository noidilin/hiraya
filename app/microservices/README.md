# Vintage Storefront app workspace

This workspace owns the reusable app baseline command surface for local development and future GitHub Actions workflows. Commands are generic so they can survive the planned Storefront rewrite from CRA/MUI to another frontend stack.

Run commands from `app/microservices` with the pinned package manager (`pnpm@9.15.9`). None of the baseline commands require AWS credentials.

## Baseline commands

| Command | Purpose |
| --- | --- |
| `pnpm run app:install` | Install the workspace with the committed lockfile using `--frozen-lockfile`. |
| `pnpm run app:workspace` | Verify deterministic install and list all workspace packages. |
| `pnpm run app:catalog` | Validate `.github/utils/services.json` and run catalog/detector self-tests. |
| `pnpm run app:changed -- <files...>` | Emit the service matrix for changed files. Use `-- --all` to select every service. |
| `pnpm run app:static` | Run the currently meaningful build/static checks for the Storefront and backend services. |
| `pnpm run app:baseline` | Run workspace, catalog, changed-service, and static checks in the same order CI should reuse. |
| `pnpm run app:test:catalog` | Run service catalog and changed-service detector tests. |
| `pnpm run app:test:contract` | Fails clearly until the API contract baseline slice is implemented. |
| `pnpm run app:test:browser` | Fails clearly until the browser behavior baseline slice is implemented. |

Legacy scripts such as `install:all`, `check:workspace`, and `test:catalog` delegate to this `app:*` surface for compatibility.

## Service metadata source of truth

`.github/utils/services.json` is the canonical service catalog for app service metadata: package names, image repositories, build contexts, manifest targets, path ownership, and Vintage Storefront baseline criticality. New app baseline work should update this catalog and verify changes through `pnpm run app:catalog` or `pnpm run app:changed -- <files...>`.

The verified changed-service detector is `.github/scripts/detect-changed-services.mjs`; future PR checks and image workflows should consume its matrix output instead of duplicating service mappings.

`.github/utils/file-filters.yml` is legacy path-filter metadata kept only as a transitional compatibility layer for the existing image workflow. During the transition:

- Update `services.json` first for any service metadata or ownership change.
- Update `file-filters.yml` too only when the current legacy image workflow must keep matching those paths before it is migrated to the catalog-driven detector.
- Do not add new duplicated service metadata elsewhere.
