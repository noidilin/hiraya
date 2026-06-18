# Terraform infrastructure

Layout:

```text
infra/
  envs/dev/bootstrap/   # durable/shared resources: ECR + GitHub image-push IAM
  envs/dev/platform/    # disposable EKS platform: VPC, EKS, ArgoCD
  modules/              # reusable modules
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

The platform stack reads bootstrap outputs from:

```text
devops-hiraya-dev/dev/bootstrap/terraform.tfstate
```
