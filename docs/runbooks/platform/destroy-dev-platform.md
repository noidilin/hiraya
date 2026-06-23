# Destroy dev platform

Related: [infra CI/CD PRD #13](https://github.com/noidilin/hiraya/issues/13), [runbook issue #19](https://github.com/noidilin/hiraya/issues/19), [ADR 0001: EKS network redesign](../../adr/0001-eks-network-redesign.md), [infra workflow implementation plan](../../plan/infra-ci-workflow.md), [infra README](../../../infra/README.md).

## When to use this

Use this runbook when dev platform deletion is approved and you need to destroy only the disposable `infra/envs/dev/platform` stack using `.github/workflows/infra-destroy.yml`.

## Do not use this when

- You need to preserve the live dev platform.
- You need to remove bootstrap resources, ECR repositories, the Terraform state bucket, GitHub OIDC roles, or the Route 53 hosted zone.
- You only need to roll back one service image. Use [../services/rollback-dev-service-image.md](../services/rollback-dev-service-image.md).

## Safety boundary

The destroy workflow destroys only `infra/envs/dev/platform` and preserves durable bootstrap resources:

- Externally managed Terraform remote-state S3 bucket `devops-hiraya-dev-tf-state`.
- `infra/envs/dev/bootstrap` state and resources.
- Durable ECR repositories used by application image workflows.
- GitHub OIDC roles for image push, infra plan, and infra apply/destroy.
- GitHub repository settings, including the `dev` Environment gate.
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
5. Confirm the `Validate destroy request` job fails before AWS credentials if:
   - The branch is not `main`, or
   - The confirmation does not exactly match `destroy dev platform`.
6. Approve the `dev` GitHub Environment gate only after confirming deletion is intended.
7. Confirm the destroy job:
   - Assumes the infra apply role through OIDC.
   - Captures `cluster_name`, `vpc_id`, and `edge_load_balancer_name` from Terraform outputs before destroy.
   - Runs `.github/scripts/platform-pre-destroy-k8s-ebs-cleanup.sh` to delete the Argo CD app, delete the application namespace, and wait for captured Kubernetes EBS volumes to disappear while the EBS CSI controller is still running.
   - Runs `terraform -chdir=infra/envs/dev/platform destroy -input=false -auto-approve`.
   - Runs `.github/scripts/platform-destroy-verify.sh`, including checks for captured EBS volume IDs, Hiraya-tagged EBS volumes, and legacy `kubernetes.io/cluster/<cluster>=owned` EBS volumes.

## Validation

### Disposable platform absence

```bash
aws eks describe-cluster --region ap-northeast-1 --name hiraya-dev || true
aws ec2 describe-vpcs --region ap-northeast-1 --vpc-ids <captured-vpc-id> || true
aws elbv2 describe-load-balancers --region ap-northeast-1 --names hiraya-dev-public || true
```

Expected: EKS cluster is gone or not `ACTIVE`; captured Kubernetes EBS volume IDs are deleted; Hiraya-tagged Kubernetes EBS volumes for the cluster are deleted; legacy `kubernetes.io/cluster/<cluster>=owned` EBS volumes are deleted; captured VPC is deleted; shared public ALB is deleted.

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

## Evidence to capture

- Confirmation preflight result.
- Environment approval record.
- Terraform destroy completion.
- Verification that EKS/VPC/ALB are absent or inactive.
- Verification that captured Kubernetes EBS volume IDs, Hiraya-tagged Kubernetes EBS volumes, and legacy `kubernetes.io/cluster/<cluster>=owned` EBS volumes are deleted.
- Verification that the state bucket and ECR repositories remain accessible.

## Recovery

If destroy verification fails, do not delete bootstrap resources. Investigate residual EKS, Kubernetes EBS volumes, VPC, ENI, NAT Gateway, ALB, or Route 53 dependencies and remove only disposable platform leftovers.
