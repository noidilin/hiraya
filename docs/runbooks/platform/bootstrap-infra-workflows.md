# Bootstrap infra workflows

Related: [infra CI/CD PRD #13](https://github.com/noidilin/hiraya/issues/13), [runbook issue #19](https://github.com/noidilin/hiraya/issues/19), [ADR 0001: EKS network redesign](../../adr/0001-eks-network-redesign.md), [infra workflow implementation plan](../../plan/infra-ci-workflow.md), [infra README](../../../infra/README.md).

## When to use this

Use this runbook when bootstrap Terraform changes for the GitHub Actions infrastructure workflow roles have been reviewed and need to be applied once for dev.

## Do not use this when

- You only want to deploy or destroy the disposable platform. Use [deploy-dev-platform.md](deploy-dev-platform.md) or [destroy-dev-platform.md](destroy-dev-platform.md).
- You are debugging a workflow permission failure after bootstrap already exists. Use [../troubleshooting/infra-workflow-access-denied.md](../troubleshooting/infra-workflow-access-denied.md).

## Safety boundary

The durable bootstrap layer supports repeated creation and deletion of the dev platform. It is not part of normal platform deploy/destroy runs.

Preserve:

- Externally managed Terraform remote-state S3 bucket `devops-hiraya-dev-tf-state`.
- `infra/envs/dev/bootstrap` state and resources.
- Durable ECR repositories used by application image workflows.
- GitHub OIDC roles for image push, infra plan, and infra apply/destroy.
- GitHub repository settings, including the `dev` Environment gate.
- Route 53 hosted zone for `noidilin.dev`.

## Prerequisites

1. Bootstrap code has been reviewed.
2. The target workflow code has been merged to `main`.
3. The repository has a GitHub Environment named `dev` with required reviewers or equivalent approval controls.
4. GitHub Actions OIDC trust policies are scoped to this repository.
5. Default backend values are correct or supplied through workflow environment variables:
   - `TF_STATE_BUCKET=devops-hiraya-dev-tf-state`
   - `TF_PLATFORM_STATE_KEY=devops-hiraya-dev/dev/platform/terraform.tfstate`
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

Confirm the GitHub infra plan/apply roles exist and have OIDC trust policies scoped to this repository. Do not broaden these roles to administrator access.

## Evidence to capture

- Bootstrap `terraform plan` summary.
- Bootstrap `terraform apply` completion.
- Terraform outputs for the GitHub infra plan/apply role ARNs, without exposing unrelated secrets.
- AWS IAM view or CLI output confirming the roles exist and trust GitHub OIDC for this repository.

## Recovery

If first-run workflows hit `AccessDenied`, add the smallest missing action/resource scope based on the exact denied API call. See [../troubleshooting/infra-workflow-access-denied.md](../troubleshooting/infra-workflow-access-denied.md).
