---
name: gha-terraform-oidc-debug
description: Debugs infra-related GitHub Actions failures caused by AWS IAM/OIDC permissions managed in Terraform. Use when a user provides AWS and GitHub CLI access for the session, identifies a failing infra workflow/run, and wants an agent to observe, patch least-privilege Terraform IAM role permissions, apply them, rerun the workflow, and repeat until the workflow succeeds.
---

# GitHub Actions Terraform OIDC Debug

## Scope

Use this skill only for infra CI/CD workflow failures where GitHub Actions assumes AWS roles through OIDC and the role/trust/policy is managed by Terraform IaC.

Primary loop: run/observe → diagnose denied AWS action → patch Terraform IAM least-privilege → `terraform plan/apply` the IAM fix → rerun the failed GitHub Actions run → observe again.

Do **not** use this skill for application test failures, image build bugs, Kubernetes RBAC failures after AWS credentials are working, or architecture redesign.

## Operating assumptions

- The user has provided valid `gh` and AWS CLI/session access in the current terminal.
- The user specifies the target infra workflow, run, PR, branch, or ref.
- Prefer `gh run rerun <run-id> --failed` on the same failing run after IAM fixes. Use `gh workflow run` only for dispatch-only workflows or when no failed run exists.
- Local code/workflow patches are allowed only when needed to represent least-privilege Terraform IAM changes. Do not push unless the user explicitly asks.
- Before context reaches ~45%, write a compact state note containing workflow/run IDs, failing step/log URL, denied action/resource, Terraform files changed, apply status, rerun status, and next action; then compact/summarize.

## Workflow

1. **Identify target**
   - Record workflow name/path, run ID, ref/PR, AWS account/region, and the Terraform stack that owns the GitHub OIDC role.
   - Run `gh auth status`, `aws sts get-caller-identity`, and inspect repo workflows/IaC before changing anything.

2. **Observe the failure**
   - Use `gh run view <run-id> --log-failed` or equivalent job logs.
   - Capture exact failing workflow/job/step, AWS error code, denied API action, resource ARN, role ARN/session name, and whether failure is trust-policy/OIDC assume-role vs permissions after assume-role.

3. **Classify permission ownership**
   - Trust failure: patch the Terraform-managed assume-role policy only for the intended repo/ref/environment subject and audience.
   - Permission failure: patch the policy attached to the exact role used by the failing job.
   - If the missing permission belongs to a different role than the failing workflow assumes, stop and explain the dependency.

4. **Patch least privilege only**
   - Add the narrowest action/resource/condition that unblocks the observed API call.
   - Preserve existing boundaries, naming, tags, workflow gates, environments, and role separation.
   - Add/update Terraform tests or policy assertions when the repo has them.
   - Do not alter infrastructure architecture, deployment topology, resource ownership, workflow intent, or unrelated permissions.

5. **Forbidden without explicit user approval**
   - `AdministratorAccess` or broad managed policies as a shortcut.
   - New mutation permissions with `Action = "*"` or `Resource = "*"`.
   - Unconstrained `iam:PassRole`.
   - Weakening OIDC trust to all branches/repos, removing `aud`, replacing environment-gated subjects with broad refs, or disabling permission boundaries.
   - Non-IAM architecture changes to make CI pass.

6. **Validate and apply Terraform**
   - Run formatting/validation/tests for the owning Terraform stack.
   - Run `terraform plan` and inspect that the diff is limited to the intended IAM policy/trust/test changes.
   - Apply only narrow IAM/OIDC permission changes. If the plan includes unrelated resource creation/destruction/replacement, stop.

7. **Rerun and repeat**
   - Rerun the failed GitHub Actions run/jobs with `gh run rerun` after apply.
   - Watch with `gh run watch` or poll status; inspect failed logs again.
   - Repeat the loop until the workflow conclusion is `success`, or stop with a clear escalation reason.

## Done criteria

The target workflow run concludes successfully on the intended ref/PR. Conditional skipped jobs are acceptable when they match workflow logic.

Final response must include: original failure, IAM/Terraform diff summary, Terraform apply summary, successful rerun link/status, and any remaining risks or follow-up cleanup.
