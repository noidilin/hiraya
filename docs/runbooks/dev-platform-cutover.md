# Dev platform infra workflow cutover runbook

Related: [infra CI/CD PRD #13](https://github.com/noidilin/hiraya/issues/13), [runbook issue #19](https://github.com/noidilin/hiraya/issues/19), [ADR 0001: EKS network redesign](../adr/0001-eks-network-redesign.md), [infra workflow implementation plan](../plan/infra-ci-workflow.md), [infra README](../../infra/README.md).

## Purpose

This runbook guides a maintainer through adopting the GitHub Actions infrastructure workflow trio for the Hiraya dev platform:

- `Hiraya Infra CI` (`.github/workflows/infra-ci.yml`) for static checks and trusted pull-request Terraform plan comments.
- `Hiraya Infra Deploy` (`.github/workflows/infra-deploy.yml`) for manual, `dev` Environment-gated platform apply.
- `Hiraya Infra Destroy` (`.github/workflows/infra-destroy.yml`) for manual, typed-confirmation, `dev` Environment-gated platform destroy.

This is documentation only. Reading or updating this runbook must not perform the live bootstrap apply, platform deploy, or platform destroy.

## Ownership boundary

### Durable bootstrap: preserve

The durable layer supports repeated creation and deletion of the dev platform. It is not part of normal platform deploy/destroy runs.

Preserve:

- Externally managed Terraform remote-state S3 bucket `devops-hiraya-dev-tf-state`.
- `infra/envs/dev/bootstrap` state and resources.
- Durable ECR repositories used by application image workflows.
- GitHub OIDC roles for image push, infra plan, and infra apply/destroy.
- GitHub repository settings, including the `dev` Environment gate.
- Route 53 hosted zone for `noidilin.dev`.

Bootstrap changes require their own reviewed Terraform run. The new infra workflows expect the bootstrap stack to have already created the plan/apply roles.

### Disposable platform: deploy or destroy

The workflow trio manages only `infra/envs/dev/platform`, including:

- VPC, public/private subnets, route tables, Internet Gateway, NAT Gateway, and S3 Gateway VPC endpoint.
- EKS cluster, private managed node group, EKS OIDC provider, and Terraform-managed Kubernetes/Helm resources.
- ACM certificate and DNS validation records for `hiraya.noidilin.dev` and `*.hiraya.noidilin.dev`.
- AWS Load Balancer Controller, Gateway API CRDs, ExternalDNS, shared `edge/public` Gateway, Argo CD, monitoring/Grafana/Prometheus, and Fluent Bit.
- Terraform-owned admin HTTPRoutes and generated Argo CD/Grafana credentials stored in Terraform state.

This disposable boundary follows [ADR 0001](../adr/0001-eks-network-redesign.md): dev platform recreation is acceptable; bootstrap resources must survive.

## Prerequisites

Before the first workflow cutover, confirm all of the following:

1. The target workflow code has been merged to `main`.
2. The one-time bootstrap Terraform apply has been completed from `infra/envs/dev/bootstrap`, creating the GitHub infra plan/apply roles.
3. The repository has a GitHub Environment named `dev` with required reviewers or equivalent approval controls.
4. GitHub Actions OIDC is enabled through the bootstrap trust policies; no long-lived AWS access keys are required.
5. The default backend values are correct or supplied through workflow environment variables:
   - `TF_STATE_BUCKET=devops-hiraya-dev-tf-state`
   - `TF_PLATFORM_STATE_KEY=devops-hiraya-dev/dev/platform/terraform.tfstate`
   - `AWS_REGION=ap-northeast-1`
6. The maintainer has access to workflow artifacts, job summaries, AWS console/CLI evidence, and Kubernetes route checks.
7. Generated Argo CD and Grafana credentials are treated as secrets. Do not print them into workflow logs, issue comments, screenshots, or documentation.

## One-time bootstrap apply

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

Expected evidence to capture:

- Bootstrap `terraform plan` summary.
- Bootstrap `terraform apply` completion.
- Terraform outputs for the GitHub infra plan/apply role ARNs, without exposing unrelated secrets.
- AWS IAM view or CLI output confirming the roles exist and have OIDC trust policies scoped to this repository.

Do not broaden these roles to administrator access. If first-run workflows hit `AccessDenied`, add the smallest missing action/resource scope based on the exact denied API call.

## Validate the trusted PR plan comment

Use a same-repository pull request that touches `infra/**`, `gitops/**`, `.github/workflows/infra-*.yml`, `.github/scripts/**`, or `.mise.toml`.

1. Open or update the trusted PR.
2. Wait for `Hiraya Infra CI`.
3. Confirm `Static infrastructure checks` runs for the PR.
4. Confirm `Trusted PR Terraform plan` runs only because the PR branch is in the same repository.
5. Open the PR conversation and find the sticky Terraform plan comment.
6. Confirm the comment includes:
   - Hidden sticky marker behavior, visible as one updated bot comment rather than repeated duplicate comments.
   - Stack label `Disposable dev platform`, corresponding to `infra/envs/dev/platform`.
   - Commit SHA.
   - Fast PR mode using `-refresh=false -lock=false`.
   - Plan summary such as `Plan: X to add, Y to change, Z to destroy.` or `No changes.`
   - A destroy warning when destroy count is greater than zero.
   - A collapsible fenced code block using `terraform` syntax highlighting.
   - Full plan artifact name.
7. Re-run the workflow and confirm the same comment is updated in place.
8. Download the plan artifact and confirm it contains the full text plan.

Fork PR expectation: static checks should run, but AWS OIDC and the PR plan comment should not run.

## Run the first manual deploy from `main`

Use `Hiraya Infra Deploy` only from `main`. It is intentionally `workflow_dispatch` only.

1. In GitHub Actions, select `Hiraya Infra Deploy`.
2. Choose branch `main` and run the workflow.
3. Before approval, review the `Pre-approval platform plan` job:
   - It assumes the infra plan role.
   - It initializes and validates `infra/envs/dev/platform`.
   - It runs a full refreshed Terraform plan.
   - It uploads `terraform-preflight-plan-dev-platform-<sha>`.
   - It writes a summary to the workflow step summary.
4. Capture evidence before approval:
   - Commit SHA.
   - Preflight plan summary.
   - Uploaded preflight plan artifact name.
   - Any destructive changes you intend to approve.
5. Approve the `dev` GitHub Environment gate only after reviewing the plan.
6. Confirm the `Apply disposable dev platform` job:
   - Assumes the infra apply role through OIDC.
   - Creates a fresh post-approval binary plan.
   - Applies that exact local binary plan.
   - Runs `.github/scripts/platform-route-smoke.sh`.
7. Capture evidence after approval:
   - Apply job result.
   - Route-health smoke output showing EKS/node visibility, Gateway/HTTPRoute visibility, namespace visibility, and route checks.
   - Workflow summary result.

Sensitive credential warning: route smoke and summaries must not retrieve or print Argo CD or Grafana admin passwords.

## Post-deploy checklist

Use workflow smoke output first, then run local checks if extra evidence is needed.

### EKS reachability

```bash
aws eks update-kubeconfig --region ap-northeast-1 --name hiraya-dev
kubectl get nodes -o wide
kubectl get pods -A
aws eks describe-cluster --name hiraya-dev --region ap-northeast-1 \
  --query 'cluster.resourcesVpcConfig.{Private:endpointPrivateAccess,Public:endpointPublicAccess,PublicCidrs:publicAccessCidrs}'
```

Expected: EKS API is reachable, nodes are registered, private endpoint access is enabled, and any public API access is the explicit temporary dev setting.

### Gateway and HTTPRoute visibility

```bash
kubectl get gateway -A
kubectl get httproute -A
kubectl describe gateway -n edge public
kubectl describe httproute -n vintage frontend
kubectl describe httproute -n argocd argocd
kubectl describe httproute -n monitoring grafana
```

Expected: shared `edge/public` Gateway is accepted/programmed; Vintage Storefront, Argo CD, and Grafana HTTPRoutes are accepted and attached.

### Public route health

```bash
curl -I https://hiraya.noidilin.dev
curl -I https://argocd.hiraya.noidilin.dev
curl -I https://grafana.hiraya.noidilin.dev
```

Expected:

- Vintage Storefront route responds successfully.
- Argo CD route reaches the login/protected service.
- Grafana route reaches the login/protected service.
- HTTPS uses the expected ACM-backed certificate.

### GitOps and admin service posture

```bash
kubectl get pods -n argocd
kubectl get svc -n argocd argocd-server -o jsonpath='{.spec.type}{"\n"}'
kubectl get pods -n monitoring
kubectl get svc -n monitoring | grep -E 'grafana|prometheus'
kubectl get httproute -A | grep -i prometheus || true
```

Expected: Argo CD and Grafana are reachable through approved public routes; services remain `ClusterIP`; Prometheus has no public HTTPRoute and remains private/port-forward only.

## Run the first manual destroy from `main`

Use `Hiraya Infra Destroy` only when dev platform deletion is approved. The workflow destroys only `infra/envs/dev/platform` and preserves durable bootstrap resources.

1. In GitHub Actions, select `Hiraya Infra Destroy`.
2. Choose branch `main`.
3. Enter the exact confirmation phrase:

   ```text
   destroy dev platform
   ```

4. Start the workflow.
5. Confirm the `Validate destroy request` job fails before AWS credentials if:
   - The branch is not `main`, or
   - The confirmation does not exactly match `destroy dev platform`.
6. Approve the `dev` GitHub Environment gate only after confirming deletion is intended.
7. Confirm the destroy job:
   - Assumes the infra apply role through OIDC.
   - Captures `cluster_name`, `vpc_id`, and `edge_load_balancer_name` from Terraform outputs before destroy.
   - Runs `terraform -chdir=infra/envs/dev/platform destroy -input=false -auto-approve`.
   - Runs `.github/scripts/platform-destroy-verify.sh`.

Evidence to capture:

- Confirmation preflight result.
- Environment approval record.
- Terraform destroy completion.
- Verification that EKS/VPC/ALB are absent or inactive.
- Verification that the state bucket and ECR repositories remain accessible.

## Post-destroy checklist

### Disposable platform absence

```bash
aws eks describe-cluster --region ap-northeast-1 --name hiraya-dev || true
aws ec2 describe-vpcs --region ap-northeast-1 --vpc-ids <captured-vpc-id> || true
aws elbv2 describe-load-balancers --region ap-northeast-1 --names hiraya-dev-public || true
```

Expected: EKS cluster is gone or not `ACTIVE`; captured VPC is deleted; shared public ALB is deleted.

### Durable bootstrap preservation

```bash
aws s3api head-bucket --bucket devops-hiraya-dev-tf-state
aws ecr describe-repositories --region ap-northeast-1 --repository-names \
  hiraya-frontend \
  hiraya-gateway \
  hiraya-auth \
  hiraya-order-service \
  hiraya-orders \
  hiraya-product-service \
  hiraya-user-service
```

Expected: remote-state bucket remains accessible and durable ECR repositories still exist.

## Known edge cases and response

### Custom IAM permission gaps

First-run plan/apply/destroy jobs may expose missing custom IAM permissions. Respond by:

1. Capturing the exact `AccessDenied` action, resource ARN, and job step.
2. Deciding whether the action belongs to the plan role or apply role.
3. Adding the narrowest action/resource scope that unblocks the intended workflow.
4. Re-running bootstrap `terraform plan/apply` after review.
5. Re-running the failed workflow.

Do not attach `AdministratorAccess` or broad wildcard `iam:PassRole`. `iam:PassRole` must stay scoped to Hiraya platform roles and required AWS services.

### Existing-cluster access ownership

If the existing EKS cluster was created by a different local principal, the GitHub apply role may not initially have Kubernetes API admin access for Terraform-managed Helm/Kubernetes resources.

Safe rollout options:

1. Preferred for this disposable dev environment: destroy the existing platform locally, then let `Hiraya Infra Deploy` recreate it so the GitHub apply role becomes the consistent platform owner.
2. Alternatively, grant the apply role one-time cluster admin access through an EKS access entry or equivalent mapping before GitHub Actions manages the existing cluster.

After GitHub creates the platform, use the workflow path consistently for deploy/destroy.

### GitHub-hosted runner and EKS API access

GitHub-hosted deploy currently relies on the explicit temporary public EKS API endpoint. If the EKS API becomes private-only before a private-network runner exists, Terraform Helm/Kubernetes operations from GitHub-hosted runners will fail. Move to a VPC-hosted/self-hosted runner before removing public EKS API access.

### Rollback

If deploy fails after approval:

1. Preserve evidence before retrying: plan artifact, apply logs, route-smoke logs, Gateway/HTTPRoute descriptions, ExternalDNS logs, and relevant AWS console screenshots.
2. If the failure is an IAM gap, patch only the missing scoped bootstrap permission and rerun.
3. If the platform is partially created and unrecoverable, use the approved destroy workflow, then redeploy from the last known-good `main` commit.
4. Keep Prometheus private; do not add emergency public routes for debugging.

If destroy fails verification, do not delete bootstrap resources. Investigate residual EKS, VPC, ENI, NAT Gateway, ALB, or Route 53 dependencies and remove only disposable platform leftovers.
