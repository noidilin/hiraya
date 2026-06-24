# Bootstrap infra workflows

Related: [ADR 0007: GitOps-owned Cluster Platform](../../adr/0007-gitops-owned-cluster-platform.md), [GitOps refactor PRD #93](https://github.com/noidilin/hiraya/issues/93), [implementation plan](../../plan/gitops-refactor-implementation.md), [implementation checklist](../../plan/gitops-refactor-checklist.md), [infra README](../../../infra/README.md).

## When to use this

Use this runbook when Project Bootstrap Terraform changes have been reviewed and need to be applied locally for dev. Project Bootstrap is the durable foundation for repeated Platform Core and Cluster Bootstrap rebuilds.

## Do not use this when

- You only want to deploy or destroy the disposable platform. Use [deploy-dev-platform.md](deploy-dev-platform.md) or [destroy-dev-platform.md](destroy-dev-platform.md).
- You are debugging a workflow permission failure after bootstrap already exists. Use [../troubleshooting/infra-workflow-access-denied.md](../troubleshooting/infra-workflow-access-denied.md).

## Safety boundary

The durable bootstrap layer supports repeated creation and deletion of the dev platform. It is not part of normal platform deploy/destroy runs.

Preserve:

- Externally managed Terraform remote-state S3 bucket `devops-hiraya-dev-tf-state`.
- `infra/envs/dev/bootstrap` state and resources.
- Durable ECR repositories used by application image workflows.
- GitHub OIDC roles for image push, infra plan, Platform Core apply/destroy, and Cluster Bootstrap bootstrap/smoke/destroy.
- Durable Vintage Storefront secret `/hiraya/dev/apps/vintage`.
- GitHub repository settings, including the `dev` Environment gate.
- Route 53 hosted zone for `noidilin.dev`.

## Prerequisites

1. Bootstrap code has been reviewed.
2. The target workflow code has been merged to `main`.
3. The repository has a GitHub Environment named `dev` with required reviewers or equivalent approval controls.
4. GitHub Actions OIDC trust policies are scoped to this repository.
5. Default backend values are correct or supplied through workflow environment variables:
   - `TF_STATE_BUCKET=devops-hiraya-dev-tf-state`
   - `TF_PLATFORM_CORE_STATE_KEY=devops-hiraya-dev/dev/platform-core/terraform.tfstate`
   - `TF_CLUSTER_BOOTSTRAP_STATE_KEY=devops-hiraya-dev/dev/cluster-bootstrap/terraform.tfstate`
   - `AWS_REGION=ap-northeast-1`

## Procedure

Run this only when bootstrap code for the infra workflow roles has been reviewed.

```bash
cd infra/envs/dev/bootstrap
cp backend.hcl.example backend.hcl # if backend.hcl is not already present locally
terraform init -backend-config=backend.hcl
terraform fmt -check -recursive
terraform validate
terraform plan
terraform apply
```

## Validation

Confirm the GitHub infra plan/apply roles and the GitHub cluster-bootstrap role exist with OIDC trust policies scoped to this repository. Confirm Project Bootstrap outputs include backend config for Platform Core and Cluster Bootstrap plus the durable Vintage Storefront secret name/ARN. Do not broaden these roles to administrator access, and do not grant Kubernetes API access to the plan or Platform Core apply roles.

## Evidence to capture

- Bootstrap `terraform plan` summary.
- Bootstrap `terraform apply` completion.
- Terraform outputs for GitHub infra plan/apply and cluster-bootstrap role ARNs, without exposing secret values.
- Terraform outputs for Platform Core and Cluster Bootstrap backend config.
- AWS IAM view or CLI output confirming the roles exist and trust GitHub OIDC for this repository.
- AWS Secrets Manager metadata confirming `/hiraya/dev/apps/vintage` exists; do not capture secret values.

## Recovery

If first-run workflows hit `AccessDenied`, add the smallest missing action/resource scope based on the exact denied API call. See [../troubleshooting/infra-workflow-access-denied.md](../troubleshooting/infra-workflow-access-denied.md).
