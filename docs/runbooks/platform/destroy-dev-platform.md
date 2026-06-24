# Destroy dev platform

Related: [ADR 0007: GitOps-owned Cluster Platform](../../adr/0007-gitops-owned-cluster-platform.md), [GitOps refactor PRD #93](https://github.com/noidilin/hiraya/issues/93), [destroy workflow issue #106](https://github.com/noidilin/hiraya/issues/106).

## When to use this

Use this runbook when dev platform deletion is approved and you need to destroy the disposable Hiraya dev Platform Core and Cluster Bootstrap layers using `.github/workflows/infra-destroy.yml`.

## Do not use this when

- You need to preserve the live dev platform.
- You need to remove Project Bootstrap resources, ECR repositories, the Terraform state bucket, GitHub OIDC roles, durable Vintage Storefront secrets, or the Route 53 hosted zone.
- You only need to roll back one service image. Use [../services/rollback-dev-service-image.md](../services/rollback-dev-service-image.md).

## Safety boundary

The destroy workflow removes only disposable dev layers:

- `infra/envs/dev/cluster-bootstrap`: Argo CD installation, AppProjects, and root Application handoff.
- `infra/envs/dev/platform-core`: EKS, VPC, controller IAM/IRSA, disposable platform admin secrets, and other AWS/EKS foundation resources.

It preserves Project Bootstrap resources:

- Remote-state bucket `devops-hiraya-dev-tf-state`.
- `infra/envs/dev/bootstrap` state and resources.
- Durable ECR repositories used by application image workflows.
- GitHub OIDC roles.
- Durable Vintage Storefront app secret `/hiraya/dev/apps/vintage`.
- Route 53 hosted zone for `noidilin.dev`.

## Prerequisites

1. Deletion of the dev platform is approved.
2. The workflow is run from `main`.
3. The operator can approve the `dev` GitHub Environment gate.
4. The exact confirmation phrase is available:

```text
destroy dev platform
```

## Procedure

1. In GitHub Actions, select `infra-destroy`.
2. Choose branch `main`.
3. Enter the exact confirmation phrase:

   ```text
   destroy dev platform
   ```

4. Start the workflow.
5. Confirm the `Validate destroy request` job fails before AWS credentials if the branch is not `main` or the confirmation does not match exactly.
6. Approve the `dev` GitHub Environment gate only after confirming deletion is intended.
7. Confirm the destroy job runs in this order:
   - Assumes the Cluster Bootstrap role.
   - Reads Platform Core outputs needed for cleanup and verification.
   - Runs `.github/scripts/platform-pre-destroy-k8s-ebs-cleanup.sh` to suspend/delete the root Argo CD Application non-cascading, prune child Applications in safe order, and wait for Vintage EBS, shared ALB, and ExternalDNS Route 53 cleanup while controllers are still running.
   - Destroys `infra/envs/dev/cluster-bootstrap`.
   - Assumes the Platform Core apply role.
   - Destroys `infra/envs/dev/platform-core`.
   - Runs `.github/scripts/platform-destroy-verify.sh` to verify disposable resources are gone and durable Project Bootstrap resources remain.

## Validation

### Disposable platform absence

```bash
aws eks describe-cluster --region ap-northeast-1 --name hiraya-dev || true
aws ec2 describe-vpcs --region ap-northeast-1 --vpc-ids <captured-vpc-id> || true
aws elbv2 describe-load-balancers --region ap-northeast-1 --names hiraya-dev-public || true
```

Expected: EKS cluster is gone or not `ACTIVE`; captured Kubernetes EBS volume IDs are deleted; Hiraya-tagged Kubernetes EBS volumes for the cluster are deleted; legacy `kubernetes.io/cluster/<cluster>=owned` EBS volumes are deleted; captured VPC is deleted; shared public ALB is deleted; ExternalDNS-created public records are gone.

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
aws secretsmanager describe-secret --region ap-northeast-1 --secret-id /hiraya/dev/apps/vintage
```

Expected: remote-state bucket, durable ECR repositories, and durable Vintage Storefront secret remain accessible.

## Evidence to capture

- Confirmation preflight result.
- Environment approval record.
- Ordered GitOps prune logs.
- Cluster Bootstrap destroy completion.
- Platform Core destroy completion.
- Verification that EKS/VPC/ALB are absent or inactive.
- Verification that captured Kubernetes EBS volume IDs, Hiraya-tagged Kubernetes EBS volumes, and legacy `kubernetes.io/cluster/<cluster>=owned` EBS volumes are deleted.
- Verification that the state bucket, ECR repositories, and durable Vintage secret remain accessible.

## Recovery

If destroy verification fails, do not delete Project Bootstrap resources. Investigate residual Argo Applications, finalizers, EKS, Kubernetes EBS volumes, VPC, ENI, NAT Gateway, ALB, Route 53 records, or controller-owned dependencies and remove only disposable platform leftovers.
