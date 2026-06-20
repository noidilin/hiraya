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

The platform stack creates a disposable dev EKS network foundation with:

- three public edge subnets tagged for external load balancers
- three private workload subnets tagged for internal load balancers
- one NAT Gateway in a public subnet for private subnet outbound internet egress
- an S3 Gateway VPC endpoint associated with private route tables
- EKS cluster networking and managed node groups attached to private subnet IDs only
- EKS private endpoint access enabled
- explicit public EKS API CIDRs in `terraform.tfvars`
- VPC Flow Logs support available through `enable_vpc_flow_logs`, disabled by default to avoid dev logging cost

The broad `0.0.0.0/0` public EKS API CIDR in dev is temporary workstation access, not a secure default. Replace it with workstation `/32` CIDRs when the IP is stable. Because subnet topology and node placement are disruptive, recreate the disposable platform stack for this redesign instead of attempting an in-place migration.

The platform stack also installs cluster add-ons as separate modules:

- AWS Load Balancer Controller and Gateway API CRDs for the shared public edge
- ExternalDNS in `external-dns`, using IRSA, Route 53 permissions scoped to `noidilin.dev`, `gateway-httproute` sources, `sync` policy, and TXT registry ownership
- `kube-prometheus-stack` in `monitoring`
- Argo CD in `argocd`, plus a separate Helm release that bootstraps the `vintage` Application from `infra/modules/argocd/application.yml` to sync `gitops/`
- `aws-for-fluent-bit` in `amazon-cloudwatch`, using IRSA to write pod logs to `/eks/vintage/pods`

Argo CD is installed after the monitoring module so the `ServiceMonitor` CRD from `kube-prometheus-stack` exists before the bootstrap Application syncs `gitops/`. The bootstrap Application is intentionally installed as a second Helm release after the main Argo CD chart, because the `Application` CRD must exist before Helm can render and apply an `Application` resource.

If an older dev cluster already has a manually created `Application/vintage`, delete it before the Terraform upgrade and let Terraform recreate it through the `argocd-gitops-application` Helm release. New platform provisioning does not need this handoff.

The platform stack reads bootstrap outputs from:

```text
devops-hiraya-dev/dev/bootstrap/terraform.tfstate
```

After apply, validate app DNS automation and frontend routing with:

```bash
kubectl get httproute -n vintage frontend -o yaml
kubectl logs -n external-dns deploy/external-dns
curl -I https://hiraya.noidilin.dev
curl -I https://hiraya.noidilin.dev/api
```

The `frontend` and `gateway` Kubernetes Services should remain `ClusterIP`; public app access should flow through the shared Gateway/ALB to the frontend service, and frontend `/api` requests should continue to use the existing nginx proxy to the in-cluster gateway service.
