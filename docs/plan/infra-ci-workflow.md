# Infra CI/CD Workflow Implementation Plan

Status: planned
Related: [`TODO.md`](../../TODO.md), [`docs/adr/0001-eks-network-redesign.md`](../adr/0001-eks-network-redesign.md), [`docs/runbooks/dev-platform-cutover.md`](../runbooks/dev-platform-cutover.md), [`infra/README.md`](../../infra/README.md)

## Goal

Add a GitHub Actions infra workflow suite for the dev Hiraya platform that borrows the proven runtime workflow shape from the portfolio/devops project while fitting this repository's EKS/GitOps architecture.

The first implementation should create the full infra workflow trio:

```text
.github/workflows/infra-ci.yml       # PR checks + sticky Terraform plan comment
.github/workflows/infra-deploy.yml   # manual, environment-gated platform apply
.github/workflows/infra-destroy.yml  # manual, environment-gated platform destroy
```

Primary objective for CI: publish a readable Terraform plan as a PR comment with proper Terraform syntax highlighting.

## Explicit non-goals for this slice

Do not include these yet:

- PR image checks that build/test/smoke application containers.
- Local container smoke before ECR push.
- Reworking `.github/workflows/image-ci.yml` service metadata.
- Batching GitOps manifest updates.
- Making Trivy blocking.

Those belong to the later image/GitOps CI/CD stabilization phase.

## Confirmed decisions

- Use a **sticky PR comment** for Terraform plans, not a new comment on every run.
- Show **summary + collapsible syntax-highlighted truncated plan** inline.
- Upload the **full plan text as an artifact**.
- Add missing GitHub OIDC roles through `infra/envs/dev/bootstrap`, then run a **one-time manual bootstrap apply**.
- AWS-backed PR plan runs only for **same-repository PRs**.
- Fork PRs get static checks only.
- PR plan uses fast non-locking mode: `-refresh=false -lock=false`.
- Terraform plan role uses a **custom scoped read policy**.
- Planned destroys in a PR are **warned in the comment**, not blocked.
- Build the **full trio** now: CI, deploy, destroy.
- Infra deploy is **manual only** through `workflow_dispatch`.
- Infra deploy/destroy are allowed from **`main` only**.
- Deploy/destroy jobs use GitHub Environment **`dev`**.
- Deploy runs a route-health smoke test after apply.
- Destroy requires a typed confirmation input.
- Destroy verifies the disposable platform is gone and durable bootstrap resources remain.
- Apply/destroy role uses a **platform-scoped custom policy**, not broad admin.
- Add root `.mise.toml` and use `jdx/mise-action`, matching the portfolio pattern.
- AWS-backed PR plan scope is **platform only**: `infra/envs/dev/platform`.
- Keep the temporary public EKS API endpoint for GitHub-hosted deploys. Private-only API access requires a future VPC/self-hosted runner.
- In manual deploy, run a pre-approval plan, then after approval create a fresh local binary plan and apply that plan.

## Current repository baseline

Important current files:

```text
.github/workflows/image-ci.yml
.github/workflows/update-gitops-manifests.yml
.github/utils/file-filters.yml
infra/envs/dev/bootstrap/
infra/envs/dev/platform/
infra/modules/
gitops/
```

Current split:

- `infra/envs/dev/bootstrap` owns durable resources:
  - ECR repositories.
  - GitHub image-push OIDC role.
  - Bootstrap Terraform state.
- `infra/envs/dev/platform` owns disposable dev platform resources:
  - VPC/subnets/routes/NAT/S3 endpoint.
  - EKS cluster and node group.
  - Platform IAM/IRSA roles.
  - AWS Load Balancer Controller, ExternalDNS, Gateway, Argo CD, Grafana/monitoring, Fluent Bit.

Existing platform state backend values:

```hcl
bucket       = "devops-hiraya-dev-tf-state"
key          = "devops-hiraya-dev/dev/platform/terraform.tfstate"
region       = "ap-northeast-1"
use_lockfile = true
encrypt      = true
```

Existing bootstrap state key used by the platform remote-state data source:

```text
devops-hiraya-dev/dev/bootstrap/terraform.tfstate
```

## Borrowed workflow patterns

Borrow from the portfolio runtime workflows:

1. Path-aware PR CI.
2. Pinned actions and `persist-credentials: false` checkouts.
3. OIDC to AWS, not long-lived credentials.
4. Separate plan/image-push/apply roles.
5. Generate `backend.hcl` during workflow execution.
6. Terraform fmt/validate/test/plan flow.
7. PR plan comments with fenced `terraform` blocks.
8. Environment-gated manual apply.
9. Manual destroy with post-destroy verification.

Adapt for Hiraya:

- There is one platform stack, not multiple labs.
- The image-push role already exists and remains owned by the image workflow.
- PR infra CI should not push images or update manifests.
- The platform stack contains Kubernetes/Helm providers, so deploy requires EKS API reachability from the GitHub runner.

## Files to add or change

### Add

```text
.mise.toml
.github/workflows/infra-ci.yml
.github/workflows/infra-deploy.yml
.github/workflows/infra-destroy.yml
.github/scripts/write-platform-backend.sh
.github/scripts/comment-terraform-plan.js
.github/scripts/platform-route-smoke.sh
.github/scripts/platform-destroy-verify.sh
```

### Change

```text
infra/envs/dev/bootstrap/data.tf
infra/envs/dev/bootstrap/main.tf
infra/envs/dev/bootstrap/outputs.tf
infra/envs/dev/bootstrap/variables.tf
infra/envs/dev/platform/outputs.tf
```

Optional but useful if scripts need shared constants later:

```text
.github/scripts/infra-env.sh
```

## Toolchain plan

Add a root `.mise.toml` so local and CI tool versions converge.

Initial version pins should match the current working toolchain unless a version is unavailable in mise:

```toml
[tools]
terraform = "1.15.6"
kubectl = "1.33.9"
helm = "4.2.2"
```

Use `kubectl kustomize`; do not add a separate kustomize tool unless needed later.

All new workflows should install tools with pinned `jdx/mise-action`, matching the existing portfolio pattern.

## Bootstrap IAM implementation

### Add variables

In `infra/envs/dev/bootstrap/variables.tf`:

```hcl
variable "github_environment" {
  description = "GitHub Environment name allowed to assume the infra apply/destroy role."
  type        = string
  default     = "dev"
}
```

### Add trust policies

In `infra/envs/dev/bootstrap/data.tf`, add:

```hcl
data "aws_iam_policy_document" "github_plan_assume_role" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [data.aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values = [
        "repo:${var.github_repository}:pull_request",
        "repo:${var.github_repository}:ref:refs/heads/main",
      ]
    }
  }
}

data "aws_iam_policy_document" "github_apply_assume_role" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [data.aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_repository}:environment:${var.github_environment}"]
    }
  }
}
```

Keep the existing image-push trust policy main-only.

### Add role names

In `infra/envs/dev/bootstrap/main.tf`:

```hcl
resource "aws_iam_role" "github_plan" {
  name                 = "${local.name_prefix}-github-plan"
  permissions_boundary = local.runtime_boundary_arn
  assume_role_policy   = data.aws_iam_policy_document.github_plan_assume_role.json

  tags = local.common_tags
}

resource "aws_iam_role" "github_apply" {
  name                 = "${local.name_prefix}-github-apply"
  permissions_boundary = local.runtime_boundary_arn
  assume_role_policy   = data.aws_iam_policy_document.github_apply_assume_role.json

  tags = local.common_tags
}
```

Expected ARNs:

```text
arn:aws:iam::549475122024:role/devops-hiraya-dev-github-plan
arn:aws:iam::549475122024:role/devops-hiraya-dev-github-apply
```

### Plan role policy shape

The plan role needs:

- Read access to bootstrap remote state.
- Read access to platform remote state.
- Lock-file mutation only if a plan command uses locking.
- Read/list/describe access for platform AWS resources.

Recommended policy groups:

```text
S3 state:
- s3:GetObject on:
  - devops-hiraya-dev/dev/bootstrap/terraform.tfstate
  - devops-hiraya-dev/dev/platform/terraform.tfstate
- s3:GetObject, s3:PutObject, s3:DeleteObject on:
  - devops-hiraya-dev/dev/platform/terraform.tfstate.tflock
- s3:ListBucket scoped to devops-hiraya-dev/dev/bootstrap/* and devops-hiraya-dev/dev/platform/*

Read-only platform APIs:
- acm:DescribeCertificate, acm:ListCertificates, acm:ListTagsForCertificate
- autoscaling:Describe*
- cloudwatch:Describe*, cloudwatch:Get*, cloudwatch:List*
- ec2:Describe*
- ecr:DescribeRepositories, ecr:DescribeImages, ecr:GetLifecyclePolicy, ecr:ListTagsForResource
- eks:Describe*, eks:List*
- elasticloadbalancing:Describe*
- iam:Get*, iam:List*
- logs:Describe*, logs:List*, logs:Get*
- route53:Get*, route53:List*
- tag:GetResources
```

Keep this custom. Do not attach AWS managed `ReadOnlyAccess` unless the custom policy proves too brittle and we explicitly decide to loosen it.

### Apply role policy shape

The apply role needs to mutate the disposable platform stack and read bootstrap state. It should not manage bootstrap ECR repositories or the state bucket.

Recommended policy groups:

```text
S3 state:
- s3:GetObject on bootstrap state
- s3:GetObject, s3:PutObject, s3:DeleteObject on platform state and platform lock file
- s3:ListBucket scoped to bootstrap/platform prefixes

VPC/network:
- ec2:* actions required for VPC, subnets, route tables, IGW, EIP, NAT Gateway, VPC endpoint, tags, and flow logs
- Prefer scoped resources/tags where AWS supports it; many EC2 create APIs require Resource="*"

EKS:
- eks:CreateCluster, DeleteCluster, Describe*, List*, Update*
- eks:CreateNodegroup, DeleteNodegroup, UpdateNodegroupConfig, UpdateNodegroupVersion
- eks:CreateAddon, DeleteAddon, UpdateAddon, DescribeAddon, ListAddons

IAM for platform-owned roles/policies only:
- iam:CreateRole, DeleteRole, GetRole, TagRole, UntagRole
- iam:CreatePolicy, DeletePolicy, GetPolicy, GetPolicyVersion, ListPolicyVersions, TagPolicy, UntagPolicy
- iam:AttachRolePolicy, DetachRolePolicy, ListAttachedRolePolicies
- iam:PutRolePolicy, DeleteRolePolicy, GetRolePolicy, ListRolePolicies
- iam:CreateOpenIDConnectProvider, DeleteOpenIDConnectProvider, GetOpenIDConnectProvider, TagOpenIDConnectProvider
- Resource scoped to devops-hiraya-dev-* role/policy/OIDC provider patterns where possible

PassRole:
- iam:PassRole scoped to devops-hiraya-dev-* roles
- Condition iam:PassedToService limited to:
  - eks.amazonaws.com
  - ec2.amazonaws.com

ACM/Route53:
- acm:RequestCertificate, DeleteCertificate, DescribeCertificate, AddTagsToCertificate, ListTagsForCertificate
- route53:ChangeResourceRecordSets, GetChange, ListResourceRecordSets, ListHostedZonesByName
- Route53 changes scoped to the noidilin.dev hosted zone when the hosted zone ID is known or available through data source constraints

CloudWatch Logs:
- logs:CreateLogGroup, DeleteLogGroup, PutRetentionPolicy, TagResource, UntagResource, DescribeLogGroups

Read/describe:
- Include describe/list/get actions from the plan policy for refresh and destroy verification.
```

Important IAM caveat: avoid `iam:PassRole` with `Resource="*"`. Scope it to Hiraya platform roles and constrain `iam:PassedToService`.

### Add bootstrap outputs

In `infra/envs/dev/bootstrap/outputs.tf`:

```hcl
output "github_plan_role_arn" {
  description = "GitHub Actions OIDC role ARN for Terraform plan jobs."
  value       = aws_iam_role.github_plan.arn
}

output "github_apply_role_arn" {
  description = "GitHub Actions OIDC role ARN for approved platform apply/destroy jobs."
  value       = aws_iam_role.github_apply.arn
}
```

Keep existing image-push output unchanged.

## Platform output additions

Add non-sensitive outputs to `infra/envs/dev/platform/outputs.tf` so workflow scripts do not hard-code every smoke/destroy target:

```hcl
output "vpc_id" {
  value = module.vpc.vpc_id
}

output "nat_gateway_id" {
  value = module.vpc.nat_gateway_id
}

output "edge_load_balancer_name" {
  value = "hiraya-dev-public"
}

output "app_hostname" {
  value = var.public_domain_name
}

output "grafana_admin_hostname" {
  value = "grafana.${var.public_domain_name}"
}

output "edge_gateway_namespace" {
  value = module.edge_gateway.namespace
}

output "edge_gateway_name" {
  value = module.edge_gateway.gateway_name
}
```

Do not print sensitive Grafana or Argo CD passwords in workflows.

## Shared helper scripts

### `.github/scripts/write-platform-backend.sh`

Purpose: avoid duplicating backend generation across CI/deploy/destroy workflows.

Behavior:

```bash
#!/usr/bin/env bash
set -euo pipefail

cat > infra/envs/dev/platform/backend.hcl <<EOF_BACKEND
bucket       = "${TF_STATE_BUCKET:-devops-hiraya-dev-tf-state}"
key          = "${TF_PLATFORM_STATE_KEY:-devops-hiraya-dev/dev/platform/terraform.tfstate}"
region       = "${AWS_REGION:-ap-northeast-1}"
use_lockfile = true
encrypt      = true
EOF_BACKEND
```

This file is generated during workflow execution and should remain uncommitted.

### `.github/scripts/comment-terraform-plan.js`

Purpose: create or update the sticky PR comment.

Required inputs through env:

```text
PLAN_PATH
STACK_NAME
ARTIFACT_NAME
GITHUB_TOKEN
```

Comment marker:

```markdown
<!-- hiraya:terraform-plan:dev-platform -->
```

Comment body shape:

````markdown
<!-- hiraya:terraform-plan:dev-platform -->
### Terraform plan: dev platform

| Field | Value |
| --- | --- |
| Stack | `infra/envs/dev/platform` |
| Commit | `<sha>` |
| Mode | `PR fast plan: -refresh=false -lock=false` |
| Summary | `Plan: 2 to add, 1 to change, 0 to destroy.` |
| Full plan | Uploaded as artifact `<artifact-name>` |

> Destroy warning: this plan includes `N` destroy actions. This is not blocked in PR CI, but apply still requires manual `dev` environment approval.

<details><summary>Show Terraform plan</summary>

```terraform
<truncated plan text>
```

</details>
````

Truncation rule:

- Keep the comment under GitHub's comment size limit.
- Inline at most about 55,000 characters of plan text.
- Always upload the full `plan.txt` artifact.
- If truncated, append:

```text
...truncated; see workflow artifact for full plan...
```

Update algorithm:

1. List existing issue comments for the PR.
2. Find a bot comment containing the hidden marker.
3. Update it if found.
4. Otherwise create a new comment.

### `.github/scripts/platform-route-smoke.sh`

Purpose: run post-apply route-health checks without printing secrets.

Expected checks:

```bash
terraform -chdir=infra/envs/dev/platform output -raw cluster_name
aws eks update-kubeconfig --region "$AWS_REGION" --name "$CLUSTER_NAME"
kubectl get nodes -o wide
kubectl get pods -A
kubectl get gateway -A
kubectl get httproute -A
kubectl get namespace vintage argocd monitoring --show-labels
```

Route retries:

```text
https://hiraya.noidilin.dev
https://argocd.hiraya.noidilin.dev
https://grafana.hiraya.noidilin.dev
```

Use retry loops because ALB, DNS, and Gateway readiness are eventually consistent.

Suggested HTTP acceptance:

- App hostname: require 200-ish response and body/header availability.
- Argo CD and Grafana: accept 200, 301, 302, 401, or 403 as evidence that the route is alive and protected/reachable.
- Do not retrieve or print admin passwords.

### `.github/scripts/platform-destroy-verify.sh`

Purpose: verify platform absence and bootstrap preservation after destroy.

Inputs from Terraform outputs captured before destroy:

```text
CLUSTER_NAME
VPC_ID
EDGE_LOAD_BALANCER_NAME
```

Verify gone:

```text
aws eks describe-cluster --name "$CLUSTER_NAME"      # should fail / not be ACTIVE
aws ec2 describe-vpcs --vpc-ids "$VPC_ID"            # should fail after VPC deletion
aws elbv2 describe-load-balancers --names "$EDGE_LOAD_BALANCER_NAME" # should fail after ALB deletion
```

Verify preserved:

```text
aws s3api head-bucket --bucket devops-hiraya-dev-tf-state
aws ecr describe-repositories --repository-names \
  hiraya-frontend \
  hiraya-gateway \
  hiraya-auth \
  hiraya-order-service \
  hiraya-orders \
  hiraya-product-service \
  hiraya-user-service
```

Use a wait loop for deletion checks because EKS/VPC/ALB cleanup is eventually consistent.

## Workflow 1: `.github/workflows/infra-ci.yml`

### Trigger

```yaml
on:
  pull_request:
    branches: [main]
    paths:
      - "infra/**"
      - "gitops/**"
      - ".github/workflows/infra-ci.yml"
      - ".github/workflows/infra-deploy.yml"
      - ".github/workflows/infra-destroy.yml"
      - ".github/scripts/**"
      - ".mise.toml"
```

### Permissions

Top-level:

```yaml
permissions:
  contents: read
```

The AWS-backed plan/comment job needs:

```yaml
permissions:
  contents: read
  id-token: write
  pull-requests: write
```

### Concurrency

```yaml
concurrency:
  group: hiraya-infra-ci-${{ github.ref }}
  cancel-in-progress: true
```

### Job A: static checks

Runs for all PRs, including forks.

Steps:

1. Checkout with `persist-credentials: false`.
2. Install tools with `jdx/mise-action`.
3. Run:

```bash
terraform fmt -check -recursive infra
kubectl kustomize gitops >/tmp/hiraya-gitops.yaml
for chart in $(find infra/modules -path '*/Chart.yaml' -print | xargs -n1 dirname | sort); do
  helm template smoke "$chart" >/tmp/helm-smoke.yaml
done
```

4. Run mocked Terraform module tests that do not need AWS credentials:

```bash
terraform -chdir=infra/modules/vpc init -backend=false
terraform -chdir=infra/modules/vpc test
terraform -chdir=infra/modules/edge-gateway init -backend=false
terraform -chdir=infra/modules/edge-gateway test
terraform -chdir=infra/modules/monitoring init -backend=false
terraform -chdir=infra/modules/monitoring test
```

If future module tests require real AWS, split them into the trusted AWS-backed job.

### Job B: trusted platform plan

Runs only for same-repository PRs:

```yaml
if: github.event.pull_request.head.repo.full_name == github.repository
```

Steps:

1. Checkout.
2. Install tools.
3. Configure AWS credentials with plan role:

```yaml
role-to-assume: arn:aws:iam::549475122024:role/devops-hiraya-dev-github-plan
role-session-name: hiraya-infra-ci-${{ github.run_id }}
aws-region: ap-northeast-1
```

4. Validate root stacks after AWS credentials are available:

```bash
terraform -chdir=infra/envs/dev/bootstrap init -backend=false -input=false
terraform -chdir=infra/envs/dev/bootstrap validate -no-color
terraform -chdir=infra/envs/dev/platform init -backend=false -input=false
terraform -chdir=infra/envs/dev/platform validate -no-color
```

Note: root stack validation can initialize/configure the AWS provider, so it should run after OIDC credentials are configured. Module tests with mocked providers can run without AWS.

5. Generate platform backend:

```bash
.github/scripts/write-platform-backend.sh
```

6. Run fast PR plan:

```bash
terraform -chdir=infra/envs/dev/platform init -backend-config=backend.hcl -reconfigure -input=false
terraform -chdir=infra/envs/dev/platform plan \
  -refresh=false \
  -lock=false \
  -input=false \
  -no-color \
  -out=tfplan.binary | tee plan.txt
terraform -chdir=infra/envs/dev/platform show -no-color tfplan.binary > plan-full.txt
```

7. Upload artifact:

```yaml
uses: actions/upload-artifact@<pinned-sha>
with:
  name: terraform-plan-dev-platform-${{ github.event.pull_request.number }}-${{ github.sha }}
  path: infra/envs/dev/platform/plan-full.txt
  retention-days: 14
```

8. Update sticky PR comment through `.github/scripts/comment-terraform-plan.js`.

### Fork PR behavior

For fork PRs:

- Run static checks only.
- Do not request `id-token: write`.
- Do not run AWS OIDC.
- Do not publish remote Terraform plan comments.

## Workflow 2: `.github/workflows/infra-deploy.yml`

### Trigger

```yaml
on:
  workflow_dispatch:
```

No push-triggered deploy yet.

### Branch guard

Every deploy job should guard against non-main refs:

```yaml
if: github.ref == 'refs/heads/main'
```

### Concurrency

Use the same platform concurrency group as destroy to prevent apply/destroy overlap:

```yaml
concurrency:
  group: hiraya-infra-dev-platform
  cancel-in-progress: false
```

### Job A: preflight plan

No environment approval yet. This gives the operator a plan before approving apply.

Permissions:

```yaml
permissions:
  contents: read
  id-token: write
```

Steps:

1. Checkout.
2. Install tools.
3. Configure AWS credentials with the plan role.
4. Generate backend config.
5. Run full refreshed plan:

```bash
terraform -chdir=infra/envs/dev/platform init -backend-config=backend.hcl -reconfigure -input=false
terraform -chdir=infra/envs/dev/platform validate -no-color
terraform -chdir=infra/envs/dev/platform plan -input=false -no-color | tee plan.txt
```

6. Upload preflight plan artifact.
7. Add plan output to `$GITHUB_STEP_SUMMARY` with truncation.

### Job B: approved apply

Needs preflight plan.

Use GitHub Environment:

```yaml
environment: dev
```

Permissions:

```yaml
permissions:
  contents: read
  id-token: write
```

Steps:

1. Checkout.
2. Install tools.
3. Configure AWS credentials with apply role:

```yaml
role-to-assume: arn:aws:iam::549475122024:role/devops-hiraya-dev-github-apply
role-session-name: hiraya-infra-apply-${{ github.run_id }}
aws-region: ap-northeast-1
```

4. Generate backend config.
5. Fresh plan and apply exact local binary plan:

```bash
terraform -chdir=infra/envs/dev/platform init -backend-config=backend.hcl -reconfigure -input=false
terraform -chdir=infra/envs/dev/platform plan -input=false -out=tfplan.binary
terraform -chdir=infra/envs/dev/platform apply -input=false -auto-approve tfplan.binary
```

6. Run route-health smoke:

```bash
.github/scripts/platform-route-smoke.sh
```

### First-run EKS access warning

If the current dev EKS cluster was created locally by a different AWS principal, the new GitHub apply role may not have Kubernetes API admin access for Terraform-managed Helm/Kubernetes resources.

Safe rollout options:

1. Preferable for a disposable dev platform: manually destroy the old platform locally, then let GitHub infra deploy recreate it with the apply role as the cluster creator.
2. Alternatively, before using GitHub to manage an existing cluster, grant the apply role cluster access through an EKS access entry or equivalent one-time admin mapping.

After the platform has been created by the GitHub apply role, subsequent GitHub deploy/destroy runs should be consistent.

## Workflow 3: `.github/workflows/infra-destroy.yml`

### Trigger

```yaml
on:
  workflow_dispatch:
    inputs:
      confirm:
        description: "Type: destroy dev platform"
        required: true
        type: string
```

### Guards

Run only on main:

```yaml
if: github.ref == 'refs/heads/main'
```

Require exact confirmation before any AWS mutation:

```bash
if [ "${{ inputs.confirm }}" != "destroy dev platform" ]; then
  echo "Confirmation did not match." >&2
  exit 1
fi
```

Use GitHub Environment:

```yaml
environment: dev
```

### Concurrency

Same group as deploy:

```yaml
concurrency:
  group: hiraya-infra-dev-platform
  cancel-in-progress: false
```

### Job: approved destroy

Permissions:

```yaml
permissions:
  contents: read
  id-token: write
```

Steps:

1. Checkout.
2. Install tools.
3. Verify confirmation.
4. Configure AWS credentials with apply role.
5. Generate backend config.
6. Initialize Terraform.
7. Capture platform outputs before destroy:

```bash
capture_output() {
  local name="$1"
  local value
  value=$(terraform -chdir=infra/envs/dev/platform output -raw "$name" 2>/dev/null || true)
  printf '%s=%s\n' "$name" "$value" >> "$GITHUB_OUTPUT"
}

capture_output cluster_name
capture_output vpc_id
capture_output edge_load_balancer_name
```

8. Destroy only the platform stack:

```bash
terraform -chdir=infra/envs/dev/platform destroy -input=false -auto-approve
```

9. Verify platform gone and bootstrap preserved:

```bash
.github/scripts/platform-destroy-verify.sh
```

## Plan comment details

### Summary extraction

Use the last matching summary line from `plan-full.txt` or `plan.txt`:

```bash
summary=$(grep -E '^(Plan:|No changes\.)' plan-full.txt | tail -1 || true)
```

If no summary is found, use:

```text
Summary unavailable; inspect full plan artifact.
```

### Destroy warning extraction

Parse destroy count from:

```text
Plan: X to add, Y to change, Z to destroy.
```

If `Z > 0`, show a warning in the PR comment. Do not fail the workflow.

### Syntax highlighting

Use a Markdown fenced code block with `terraform`:

````markdown
```terraform
...
```
````

This is the main portfolio pattern to preserve.

## Security posture

### OIDC only

Do not add AWS access keys or long-lived GitHub secrets.

### Least privilege role split

```text
github-plan       # PR and main plan/validate/refresh permissions
github-image-push # existing image push only
github-apply      # environment-gated apply/destroy only
```

### Trust boundaries

Plan role trust:

```text
repo:noidilin/hiraya:pull_request
repo:noidilin/hiraya:ref:refs/heads/main
```

Apply role trust:

```text
repo:noidilin/hiraya:environment:dev
```

Image push trust remains:

```text
repo:noidilin/hiraya:ref:refs/heads/main
```

### PR safety

PR code can influence Terraform evaluation. Therefore:

- Only same-repository PRs get AWS-backed plans.
- Fork PRs get static checks only.
- Apply is never run from PR workflows.

### Sensitive data

- Do not print Terraform sensitive outputs.
- Do not print Argo CD or Grafana admin passwords.
- Do not upload binary `tfplan` artifacts unless there is a specific reason; binary plans can contain sensitive data.
- Upload text plan output for review, truncated inline in comments.

## Rollout sequence

### Phase 1 — Bootstrap role code

1. Add `github_plan` and `github_apply` roles/policies to `infra/envs/dev/bootstrap`.
2. Add bootstrap outputs.
3. Run locally:

```bash
terraform -chdir=infra/envs/dev/bootstrap fmt -check -recursive
terraform -chdir=infra/envs/dev/bootstrap init -backend-config=backend.hcl
terraform -chdir=infra/envs/dev/bootstrap validate
terraform -chdir=infra/envs/dev/bootstrap plan
terraform -chdir=infra/envs/dev/bootstrap apply
```

This one-time manual apply must happen before expecting AWS-backed CI plans to pass.

### Phase 2 — Tooling and helper scripts

1. Add `.mise.toml`.
2. Add backend, plan-comment, smoke, and destroy-verify scripts.
3. Validate scripts locally where possible with dry-run inputs.

### Phase 3 — Infra CI workflow

1. Add `infra-ci.yml`.
2. Open or update a same-repo PR that touches infra.
3. Confirm:
   - Static checks run.
   - OIDC plan role can be assumed.
   - Platform plan runs with `-refresh=false -lock=false`.
   - Sticky PR comment is created.
   - Re-running CI updates the same comment.
   - Full plan artifact is uploaded.

### Phase 4 — Manual deploy workflow

1. Add `infra-deploy.yml`.
2. Confirm it is manual-only.
3. Run from `main`.
4. Confirm preflight plan completes before environment approval.
5. Approve `dev` environment.
6. Confirm apply runs a fresh local plan and applies it.
7. Confirm route-health smoke passes.

### Phase 5 — Manual destroy workflow

1. Add `infra-destroy.yml`.
2. Run from `main` with wrong confirmation and confirm it fails before AWS mutation.
3. Run with exact confirmation after approval.
4. Confirm only `infra/envs/dev/platform` is destroyed.
5. Confirm EKS/VPC/ALB absence checks pass.
6. Confirm state bucket and ECR repositories remain.

## Local validation checklist before PR

Run:

```bash
terraform fmt -check -recursive infra
kubectl kustomize gitops >/tmp/hiraya-gitops.yaml
for chart in $(find infra/modules -path '*/Chart.yaml' -print | xargs -n1 dirname | sort); do
  helm template smoke "$chart" >/tmp/helm-smoke.yaml
done
```

With valid AWS credentials or after OIDC in CI:

```bash
terraform -chdir=infra/envs/dev/bootstrap init -backend=false -input=false
terraform -chdir=infra/envs/dev/bootstrap validate -no-color
terraform -chdir=infra/envs/dev/platform init -backend=false -input=false
terraform -chdir=infra/envs/dev/platform validate -no-color
```

Module tests:

```bash
terraform -chdir=infra/modules/vpc test
terraform -chdir=infra/modules/edge-gateway test
terraform -chdir=infra/modules/monitoring test
```

## Acceptance criteria

### CI

- A PR that changes `infra/**` or `gitops/**` runs infra static checks.
- Same-repo PRs run an AWS-backed platform plan.
- Fork PRs do not request AWS OIDC credentials.
- The platform plan appears as one sticky PR comment.
- The comment uses a fenced `terraform` code block for highlighting.
- The full plan text is uploaded as an artifact.
- Re-running CI updates the existing comment instead of adding a new one.
- Destroy counts are highlighted but do not fail CI.

### Deploy

- The deploy workflow can only be manually dispatched.
- It only runs on `main`.
- It serializes with destroy through the shared concurrency group.
- It requires the `dev` GitHub Environment before apply.
- It assumes the apply role through OIDC.
- It runs a fresh binary plan immediately before apply.
- It applies only `infra/envs/dev/platform`.
- It runs route-health smoke without exposing secrets.

### Destroy

- The destroy workflow can only be manually dispatched.
- It only runs on `main`.
- It requires exact typed confirmation.
- It requires the `dev` GitHub Environment.
- It assumes the apply role through OIDC.
- It destroys only `infra/envs/dev/platform`.
- It verifies EKS/VPC/ALB are gone or inactive.
- It verifies the state bucket and durable ECR repositories remain.

## Known risks and mitigations

### Custom IAM policy gaps

Risk: The first CI/deploy runs may reveal missing read or mutation actions.

Mitigation:

- Start with custom scoped policies grouped by service.
- Inspect exact AWS AccessDenied errors.
- Add the smallest missing action/resource scope.
- Do not jump to AdministratorAccess.

### Existing cluster access mismatch

Risk: The GitHub apply role may not have Kubernetes API admin access to an existing locally-created EKS cluster.

Mitigation:

- For the first migration, either destroy locally first or grant the apply role access once.
- After GitHub creates the platform, use the GitHub role consistently for deploy/destroy.

### GitHub-hosted runner needs EKS public API access

Risk: If the EKS API endpoint is private-only, GitHub-hosted runners cannot run Terraform Helm/Kubernetes operations.

Mitigation:

- Keep the explicit temporary public EKS API endpoint while using GitHub-hosted runners.
- Move to a VPC/self-hosted runner before making the EKS API private-only.

### Terraform plan comment size

Risk: Large plans can exceed GitHub comment limits.

Mitigation:

- Truncate inline plan text.
- Always upload the full plan as an artifact.
- Keep summary visible outside `<details>`.

### Apply/destroy overlap

Risk: Manual deploy and destroy could run at the same time.

Mitigation:

- Use one shared concurrency group: `hiraya-infra-dev-platform`.
- Set `cancel-in-progress: false`.

## Future follow-ups

After this infra trio is stable:

1. Add PR image checks that build/test without pushing images.
2. Add local container smoke before image push.
3. Add `kubectl kustomize gitops` after manifest updates.
4. Consolidate repeated service metadata in image/GitOps workflows.
5. Decide when Trivy should become blocking.
6. Consider a self-hosted/VPC runner to support private-only EKS API access.
