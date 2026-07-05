# Hiraya Documentation Index

Use this as the first documentation stop for non-trivial work. It routes agents to the smallest useful reading set instead of asking them to scan every README and runbook.

## Documentation roles

See [`docs/references/documentation-guidelines.md`](references/documentation-guidelines.md) for the full governance rules.

Short rule:

> READMEs route, architecture explains, runbooks operate, ADRs justify, references enumerate.

## Task routing

### Portfolio frontend content or visuals

Read:
1. `CONTEXT.md`
2. `docs/architecture/portfolio-stack.md`
3. `app/portfolio/README.md`
4. `docs/portfolio/README.md` if editing Hiraya Guide knowledge
5. `app/portfolio/frontend/`

Validate with the Portfolio commands in [`docs/references/commands.md`](references/commands.md#portfolio).

### Hiraya Guide API or portfolio knowledge

Read:
1. `app/portfolio/README.md`
2. `docs/portfolio/README.md`
3. `docs/architecture/portfolio-stack.md`
4. `docs/references/env-vars.md`

Validate with the Portfolio and knowledge commands in [`docs/references/commands.md`](references/commands.md#portfolio).

### Vintage Storefront app or contracts

Read:
1. `CONTEXT.md`
2. `app/microservices/README.md`
3. `docs/architecture/runtime-flow.md`
4. `docs/references/commands.md`
5. `.github/utils/services.json`

Validate with the Vintage Storefront commands in [`docs/references/commands.md`](references/commands.md#vintage-storefront).

### GitOps manifests or Cluster Platform add-ons

Read:
1. `docs/architecture/gitops-ownership.md`
2. `docs/adr/0007-gitops-owned-cluster-platform.md`
3. `gitops/README.md`
4. Relevant `gitops/platform/**` or `gitops/apps/**` directory

Validate with the GitOps render command in [`docs/references/commands.md`](references/commands.md#vintage-storefront).

### Terraform infrastructure

Read:
1. `infra/README.md`
2. `docs/architecture/platform-lifecycle.md`
3. `docs/adr/0007-gitops-owned-cluster-platform.md`
4. Relevant platform runbook in `docs/runbooks/platform/`

Validate with the Terraform stack commands in [`docs/references/commands.md`](references/commands.md#terraform-stacks), then follow the relevant runbook for live operations.

### CI/CD workflows or repository automation

Read:
1. `docs/architecture/delivery-flow.md`
2. `docs/references/workflows.md`
3. `.github/workflows/`
4. `.github/scripts/`
5. `.github/utils/services.json` for app ownership/build metadata

Validate with the script/helper and baseline commands in [`docs/references/commands.md`](references/commands.md).

### Operational deploy, destroy, rollback, or troubleshooting

Read:
1. `docs/runbooks/README.md`
2. The specific runbook for the action or symptom
3. `docs/architecture/platform-lifecycle.md` if changing the procedure itself

Runbooks own exact operational commands. Architecture docs should link to runbooks instead of duplicating command sequences.

## Source-of-truth quick map

- Domain terms: `CONTEXT.md`
- Commands: `docs/references/commands.md`
- Repository paths: `docs/references/repo-map.md`
- GitHub workflows: `docs/references/workflows.md`
- Documentation rules: `docs/references/documentation-guidelines.md`
- Platform lifecycle: `docs/architecture/platform-lifecycle.md`
- GitOps ownership: `docs/architecture/gitops-ownership.md`
- Operational procedures: `docs/runbooks/`
- Historical rationale: `docs/adr/README.md`
