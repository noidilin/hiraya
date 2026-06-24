# Terraform infrastructure

Layout:

```text
infra/
  envs/dev/bootstrap/       # Project Bootstrap: durable ECR, GitHub OIDC roles, state access, workload secrets
  envs/dev/platform-core/   # Platform Core: AWS/EKS foundation only; no Kubernetes or Helm providers
  modules/                  # reusable AWS-only and legacy modules
```

The remote state S3 bucket is externally managed. Terraform uses it through each stack's `backend.hcl`, but no stack creates or destroys the bucket.

## Project Bootstrap

```bash
cd infra/envs/dev/bootstrap
cp backend.hcl.example backend.hcl
terraform init -backend-config=backend.hcl
terraform plan
```

Project Bootstrap is the durable dev foundation. It owns ECR repositories, GitHub OIDC roles, Terraform state permissions, and durable Vintage Storefront runtime secrets.

## Platform Core

```bash
cd infra/envs/dev/platform-core
cp backend.hcl.example backend.hcl
terraform init -backend-config=backend.hcl
terraform plan
```

Platform Core creates the disposable AWS/EKS foundation with:

- VPC, public edge subnets, private workload subnets, NAT Gateway, and S3 Gateway endpoint.
- EKS cluster, managed node group, OIDC provider, and EKS managed add-ons such as EBS CSI.
- ACM certificate and Route 53 DNS validation primitives for `hiraya.noidilin.dev` and `*.hiraya.noidilin.dev`.
- AWS-only IRSA roles for AWS Load Balancer Controller, ExternalDNS, External Secrets Operator, and Fluent Bit.
- CloudWatch pod log group `/eks/hiraya/dev/pods`.
- disposable Argo CD and Grafana admin secrets in AWS Secrets Manager.
- non-secret outputs consumed by later Cluster Bootstrap and GitOps phases.

Platform Core intentionally contains no Kubernetes or Helm providers/resources. In-cluster add-ons, Argo CD handoff, Gateway resources, public routes, and workload manifests are no longer part of this Terraform stack; they move to the ADR-0007 Cluster Bootstrap and GitOps-owned Cluster Platform model.

EKS admin access entries are limited to configured Dev SSO principals plus the GitHub Cluster Bootstrap role from Project Bootstrap. GitHub plan and Platform Core apply roles do not receive Kubernetes API access.

The broad `0.0.0.0/0` public EKS API CIDR in dev is a temporary explicit workstation/GitHub-hosted runner toggle. Replace it with `/32` CIDRs or private runner access when practical.

## Legacy platform stack retired

The former `infra/envs/dev/platform` monolithic stack was removed from active workflows. Do not recreate it unless ADR-0007 is superseded by a new architectural decision. New deploy/destroy automation targets `infra/envs/dev/platform-core` and the new `dev/platform-core` Terraform state key.
