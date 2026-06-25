# Terraform infrastructure

Layout:

```text
infra/
  envs/dev/bootstrap/          # Project Bootstrap: durable ECR, GitHub OIDC roles, state access, workload secrets
  envs/dev/platform-core/      # Platform Core: AWS/EKS foundation only; no Kubernetes or Helm providers
  envs/dev/cluster-bootstrap/  # Cluster Bootstrap: Argo CD install and GitOps root handoff
  modules/                     # reusable AWS-only and bootstrap modules
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
- AWS-only IRSA roles for AWS Load Balancer Controller, ExternalDNS, and External Secrets Operator.
- disposable Argo CD and Grafana admin secrets in AWS Secrets Manager.
- non-secret outputs consumed by later Cluster Bootstrap and GitOps phases.

Platform Core intentionally contains no Kubernetes or Helm providers/resources. In-cluster add-ons, Argo CD handoff, Gateway resources, public routes, and workload manifests are no longer part of this Terraform stack; they move to the ADR-0007 Cluster Bootstrap and GitOps-owned Cluster Platform model.

EKS admin access entries are limited to configured Dev SSO principals plus the GitHub Cluster Bootstrap role from Project Bootstrap. GitHub plan and Platform Core apply roles do not receive Kubernetes API access.

The broad `0.0.0.0/0` public EKS API CIDR in dev is a temporary explicit workstation/GitHub-hosted runner toggle. Replace it with `/32` CIDRs or private runner access when practical.

## Cluster Bootstrap

```bash
cd infra/envs/dev/cluster-bootstrap
cp backend.hcl.example backend.hcl
terraform init -backend-config=backend.hcl
terraform plan
```

Cluster Bootstrap runs after Platform Core. It may use Kubernetes and Helm providers because its only job is the reproducible handoff into GitOps: create the special `argocd` namespace, install Argo CD, create AppProjects, and install the root `hiraya-root` Application pointed at `gitops/clusters/dev/root`.

Cluster Bootstrap does not own long-lived Cluster Platform add-ons. Argo CD owns those resources from `gitops/platform/**`; GitOps Apps such as the Vintage Storefront live under `gitops/apps/**`.

## Operator references

Use these docs before changing deploy, destroy, or ownership boundaries:

- [ADR-0007: GitOps-owned Cluster Platform add-ons](../docs/adr/0007-gitops-owned-cluster-platform.md)
- [Bootstrap runbook](../docs/runbooks/platform/bootstrap-infra-workflows.md)
- [Deploy runbook](../docs/runbooks/platform/deploy-dev-platform.md)
- [Destroy runbook](../docs/runbooks/platform/destroy-dev-platform.md)
- [Infra PR plan validation runbook](../docs/runbooks/platform/validate-infra-pr-plan.md)

## Legacy platform stack retired

The former `infra/envs/dev/platform` monolithic stack was removed from active workflows. Do not recreate it unless ADR-0007 is superseded by a new architectural decision. New deploy/destroy automation targets `infra/envs/dev/platform-core` and `infra/envs/dev/cluster-bootstrap` with the `dev/platform-core` and `dev/cluster-bootstrap` Terraform state keys.
