# Validate infra PR plan comment

Related: [ADR 0007: GitOps-owned Cluster Platform](../../adr/0007-gitops-owned-cluster-platform.md), [infra README](../../../infra/README.md), [bootstrap runbook](bootstrap-infra-workflows.md), [deploy runbook](deploy-dev-platform.md).

## When to use this

Use this runbook when validating that `.github/workflows/infra-ci.yml` produces safe static checks and a trusted Platform Core Terraform plan comment for same-repository pull requests.

## Do not use this when

- You need to apply platform changes. Use [deploy-dev-platform.md](deploy-dev-platform.md).
- The pull request comes from a fork. Fork PRs should run static checks only; AWS OIDC and plan comments should not run.

## Prerequisites

1. The infra workflow changes are merged or present in the PR being tested.
2. Project Bootstrap has created the GitHub infra plan role. See [bootstrap-infra-workflows.md](bootstrap-infra-workflows.md).
3. The test PR touches at least one watched path:
   - `infra/**`
   - `gitops/**`
   - `.github/workflows/infra-*.yml`
   - `.github/scripts/**`
   - `.mise.toml`

## Procedure

1. Open or update a same-repository pull request.
2. Wait for `infra-ci`.
3. Confirm `Static infrastructure checks` runs for the PR.
4. Confirm `Trusted PR Terraform plan` runs only because the PR branch is in the same repository.
5. Open the PR conversation and find the sticky Terraform plan comment.
6. Re-run the workflow and confirm the same comment is updated in place.
7. Download the plan artifact and confirm it contains the full text plan.

## Validation

The sticky plan comment should include:

- Hidden sticky marker behavior, visible as one updated bot comment rather than repeated duplicate comments.
- Stack label for Platform Core, corresponding to `infra/envs/dev/platform-core`.
- No Cluster Bootstrap plan; that stack depends on a live cluster and is validated statically only.
- Commit SHA.
- Fast PR mode using `-refresh=false -lock=false`.
- Plan summary such as `Plan: X to add, Y to change, Z to destroy.` or `No changes.`
- A destroy warning when destroy count is greater than zero.
- A collapsible fenced code block using `terraform` syntax highlighting.
- Full plan artifact name.

Fork PR expectation: static checks should run, but AWS OIDC and the PR plan comment should not run.

## Evidence to capture

- PR link and commit SHA.
- `infra-ci` run link.
- Screenshot or copied text of the updated sticky plan comment.
- Downloaded full plan artifact name.

## Recovery

- If AWS OIDC fails with `AccessDenied`, use [../troubleshooting/infra-workflow-access-denied.md](../troubleshooting/infra-workflow-access-denied.md).
- If duplicate comments are created, inspect the sticky marker script before approving the workflow.
