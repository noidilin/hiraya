# Troubleshoot infra workflow AccessDenied

## When to use this

Use this runbook when `infra-ci`, `infra-deploy`, or `infra-destroy` fails with AWS `AccessDenied`, `UnauthorizedOperation`, or an equivalent IAM permission error.

## Do not use this when

- Bootstrap roles do not exist yet. Use [../platform/bootstrap-infra-workflows.md](../platform/bootstrap-infra-workflows.md).
- The failure is Kubernetes API authorization after AWS credentials are established. Use [eks-github-runner-access.md](eks-github-runner-access.md).

## Safety boundary

Do not attach `AdministratorAccess` or broad wildcard `iam:PassRole`. `iam:PassRole` must stay scoped to Hiraya platform roles and required AWS services.

## Procedure

1. Capture the exact denied API action, resource ARN, workflow name, job, and step.
2. Decide whether the missing permission belongs to the plan role or the apply/destroy role.
3. Add the narrowest action/resource scope that unblocks the intended workflow.
4. Review the bootstrap Terraform change.
5. Re-run bootstrap Terraform:

   ```bash
   cd infra/envs/dev/bootstrap
   terraform init -backend-config=backend.hcl
   terraform fmt -check -recursive
   terraform validate
   terraform plan
   terraform apply
   ```

6. Re-run the failed workflow.

## Validation

Expected: the workflow passes the previously failing AWS API call without expanding unrelated permissions.

## Evidence to capture

- Original error message.
- IAM policy diff.
- Bootstrap plan/apply summary.
- Successful retry link.

## Escalation

If the permission request requires broad resources or sensitive IAM delegation, stop and review the infrastructure design before applying the change.
