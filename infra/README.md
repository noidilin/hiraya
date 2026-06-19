# Terraform infrastructure

Layout:

```text
infra/
  envs/dev/bootstrap/   # durable/shared resources: ECR + GitHub image-push IAM
  envs/dev/platform/    # disposable EKS platform: VPC, EKS, ArgoCD, monitoring, Fluent Bit
  modules/              # reusable modules: vpc, eks, argocd, monitoring, fluent-bit
```

The remote state S3 bucket is externally managed. Terraform uses it through each stack's `backend.hcl`, but no stack creates or destroys the bucket.

## Bootstrap stack

```bash
cd infra/envs/dev/bootstrap
cp backend.hcl.example backend.hcl
terraform init -backend-config=backend.hcl
terraform plan
```

If migrating an existing bootstrap state that still tracks the state bucket, remove only those bucket addresses from state before applying this refactor:

```bash
terraform state rm aws_s3_bucket.terraform_state
terraform state rm aws_s3_bucket_versioning.terraform_state
terraform state rm aws_s3_bucket_server_side_encryption_configuration.terraform_state
terraform state rm aws_s3_bucket_public_access_block.terraform_state
```

`terraform state rm` only stops Terraform managing those resources; it does not delete the real S3 bucket.

## Platform stack

```bash
cd infra/envs/dev/platform
cp backend.hcl.example backend.hcl
terraform init -backend-config=backend.hcl
terraform plan
```

The platform stack also installs cluster add-ons as separate modules:

- `kube-prometheus-stack` in `monitoring`
- Argo CD in `argocd`, including the bootstrap `vintage` Application that syncs `gitops/`
- `aws-for-fluent-bit` in `amazon-cloudwatch`, using IRSA to write pod logs to `/eks/vintage/pods`

Argo CD is installed after the monitoring module so the `ServiceMonitor` CRD from `kube-prometheus-stack` exists before the bootstrap Application syncs `gitops/`.

If an older dev cluster already has a manually created `Application/vintage`, apply `gitops/argo-cd.yml` once before the Terraform upgrade so the object has Helm ownership metadata, or delete the Application and let Terraform recreate it. New platform provisioning does not need this handoff.

The platform stack reads bootstrap outputs from:

```text
devops-hiraya-dev/dev/bootstrap/terraform.tfstate
```
