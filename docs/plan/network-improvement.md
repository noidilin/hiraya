# EKS Network Improvement Plan

Status: in progress
Related ADR: [`docs/adr/0001-eks-network-redesign.md`](../adr/0001-eks-network-redesign.md)

## Goal

Improve the dev EKS network design from a public-node teaching setup into a portfolio-grade private-node architecture while keeping costs controlled and preserving local Docker Compose behavior.

The target design is:

- Public internet traffic enters through one shared public ALB.
- EKS worker nodes and pods run in private subnets.
- Outbound traffic from private subnets uses one NAT Gateway plus an S3 Gateway VPC endpoint.
- App, Argo CD, and Grafana are exposed through Gateway API host-based routes.
- Prometheus remains private and is accessed with `kubectl port-forward` only.
- DNS for public hostnames is managed by ExternalDNS from HTTPRoute hostnames.
- Admin credentials are strong and created outside Git.

## Current observed state

The repo has landed the private-node network foundation slice:

- `infra/modules/vpc/main.tf`
  - one VPC
  - separate public edge and private workload subnet groups across three AZs
  - public subnets map public IPs and are tagged for external load balancers
  - private subnets do not map public IPs and are tagged for internal load balancers
  - one public route table to an Internet Gateway
  - private route tables default to one shared NAT Gateway
  - an S3 Gateway endpoint is associated with private route tables
  - optional VPC Flow Logs are configurable and disabled by default
- `infra/modules/eks/main.tf`
  - EKS API private access enabled
  - public API access is still enabled for dev but CIDRs are explicit in `terraform.tfvars`
  - managed node group receives private subnet IDs only
- `gitops/`
  - app services are `ClusterIP`
  - frontend nginx already proxies `/api` to the in-cluster `gateway` service
- `infra/modules/argocd/main.tf`
  - Terraform owns the `argocd` namespace and Argo CD Helm release
- `infra/modules/monitoring/main.tf`
  - Terraform owns the `monitoring` namespace and kube-prometheus-stack Helm release
- `gitops/namespace.yml`
  - GitOps owns the `vintage` namespace

## Accepted design decisions

### Network posture

Use a private-node dev EKS design:

```text
Internet
  -> Route 53
  -> shared public ALB
  -> Gateway API routes
  -> ClusterIP services
  -> private EKS nodes/pods
```

The public subnets are for the public ALB and the single NAT Gateway. EKS nodes should not be placed in public subnets.

### Public hostnames

Approved public URLs:

```text
App:     https://hiraya.noidilin.dev
Argo CD: https://argocd.hiraya.noidilin.dev
Grafana: https://grafana.hiraya.noidilin.dev
```

No public Prometheus hostname for now.

### Shared ALB and Gateway API

Use one shared public ALB/Gateway with host-based routing:

```text
hiraya.noidilin.dev          -> vintage/frontend
argocd.hiraya.noidilin.dev   -> argocd/argocd-server
grafana.hiraya.noidilin.dev  -> monitoring/kube-prometheus-stack-grafana
```

Gateway API is the routing model, not the whole network redesign. The VPC/subnet/NAT/EKS endpoint work is still required.

### Namespace and route ownership

Use an `edge` namespace for shared Gateway infrastructure.

Namespace label for allowed route attachment:

```yaml
hiraya.noidilin.dev/public-gateway-access: "true"
```

Ownership:

| Namespace | Owner | Label owner |
|---|---|---|
| `edge` | Terraform | Terraform |
| `argocd` | Terraform | Terraform |
| `monitoring` | Terraform | Terraform |
| `vintage` | GitOps | GitOps |

Route ownership:

| Hostname | Namespace | Route owner |
|---|---|---|
| `hiraya.noidilin.dev` | `vintage` | GitOps |
| `argocd.hiraya.noidilin.dev` | `argocd` | Terraform Argo CD module |
| `grafana.hiraya.noidilin.dev` | `monitoring` | Terraform monitoring module |

### TLS

Use one Terraform-managed ACM certificate:

```text
hiraya.noidilin.dev
*.hiraya.noidilin.dev
```

HTTP port 80 should redirect to HTTPS port 443.

TLS terminates at the ALB. Backend traffic from ALB to Kubernetes services remains HTTP for this dev phase.

### DNS

Terraform owns:

- hosted zone lookup for `noidilin.dev`
- ACM certificate request
- ACM DNS validation records

ExternalDNS owns:

- public Route 53 alias records for HTTPRoute hostnames
- TXT ownership records

ExternalDNS should use `sync` policy with TXT registry ownership.

Reason: the ALB is created asynchronously by AWS Load Balancer Controller from the Kubernetes Gateway. Having Terraform create Route 53 aliases to a controller-created ALB would require brittle two-pass discovery.

### Egress

Use:

- one NAT Gateway in one public subnet
- private route tables in all AZs pointing to that NAT Gateway
- S3 Gateway VPC endpoint attached to private route tables

This is intentionally not fully HA because this is a dev portfolio environment and cost matters.

### EKS API access

Use:

```text
endpoint_private_access = true
endpoint_public_access  = true
```

Public endpoint CIDRs should be explicit in dev variables. For now, broad temporary access is allowed only as an explicit dev toggle:

```hcl
eks_public_access_cidrs = ["0.0.0.0/0"]
```

This must not become a silent default.

### Subnet sizing

Use all `/24` subnets for this dev project:

```text
3 public /24 subnets
3 private /24 subnets
```

This is acceptable for the current small node group size. It is not ideal for high pod density or large future growth with the AWS VPC CNI.

### NetworkPolicy

Defer Kubernetes NetworkPolicy to a later hardening phase. The first slice should land private subnets, private nodes, Gateway API, ALB, TLS, and DNS without adding east-west policy complexity.

### Migration model

Destroy and recreate the disposable dev platform stack instead of migrating in place.

Rationale:

- subnet topology changes are disruptive
- node group placement changes are disruptive
- EKS endpoint behavior changes affect Terraform/Kubernetes providers
- repo instructions already prefer destroy/recreate for big dev refactors

## Target infrastructure layout

```text
VPC 10.1.0.0/16
├── Public subnets
│   ├── ap-northeast-1a: 10.1.1.0/24
│   ├── ap-northeast-1c: 10.1.2.0/24
│   └── ap-northeast-1d: 10.1.3.0/24
│
├── Private subnets
│   ├── ap-northeast-1a: 10.1.11.0/24
│   ├── ap-northeast-1c: 10.1.12.0/24
│   └── ap-northeast-1d: 10.1.13.0/24
│
├── Internet Gateway
├── NAT Gateway in one public subnet
├── Public route table -> IGW
├── Private route tables -> single NAT Gateway
└── S3 Gateway VPC endpoint -> private route tables
```

The exact private subnet CIDRs can be adjusted during implementation, but public and private ranges should not overlap.

## Terraform implementation plan

### Phase 1: Refactor VPC module

Files:

```text
infra/modules/vpc/main.tf
infra/modules/vpc/variables.tf
infra/modules/vpc/outputs.tf
infra/envs/dev/platform/main.tf
infra/envs/dev/platform/variables.tf
infra/envs/dev/platform/terraform.tfvars
```

Add inputs:

```hcl
variable "public_subnets" {
  type = list(object({
    name              = string
    cidr_block        = string
    availability_zone = string
  }))
}

variable "private_subnets" {
  type = list(object({
    name              = string
    cidr_block        = string
    availability_zone = string
  }))
}

variable "enable_single_nat_gateway" {
  type    = bool
  default = true
}

variable "enable_s3_gateway_endpoint" {
  type    = bool
  default = true
}

variable "enable_vpc_flow_logs" {
  type    = bool
  default = false
}
```

Add resources:

- `aws_subnet.public`
- `aws_subnet.private`
- `aws_eip.nat`
- `aws_nat_gateway.this`
- `aws_route_table.public`
- `aws_route_table.private`
- `aws_route_table_association.public`
- `aws_route_table_association.private`
- `aws_vpc_endpoint.s3`
- optional Flow Logs resources behind `enable_vpc_flow_logs`

Subnet tags:

Public:

```hcl
"kubernetes.io/role/elb" = "1"
"kubernetes.io/cluster/${var.cluster_name}" = "shared"
```

Private:

```hcl
"kubernetes.io/role/internal-elb" = "1"
"kubernetes.io/cluster/${var.cluster_name}" = "shared"
```

Outputs:

```hcl
output "vpc_id"
output "public_subnet_ids"
output "private_subnet_ids"
output "private_route_table_ids"
output "public_route_table_ids"
```

### Phase 2: Update EKS module

Files:

```text
infra/modules/eks/main.tf
infra/modules/eks/variables.tf
infra/modules/eks/outputs.tf
infra/envs/dev/platform/main.tf
infra/envs/dev/platform/variables.tf
infra/envs/dev/platform/terraform.tfvars
```

Add variables:

```hcl
variable "cluster_subnet_ids" {
  type = list(string)
}

variable "node_subnet_ids" {
  type = list(string)
}

variable "endpoint_private_access" {
  type    = bool
  default = true
}

variable "endpoint_public_access" {
  type    = bool
  default = true
}

variable "public_access_cidrs" {
  type = list(string)
}
```

Use private subnets:

```hcl
vpc_config {
  subnet_ids              = var.cluster_subnet_ids
  endpoint_private_access = var.endpoint_private_access
  endpoint_public_access  = var.endpoint_public_access
  public_access_cidrs     = var.public_access_cidrs
}

resource "aws_eks_node_group" "node_group" {
  subnet_ids = var.node_subnet_ids
}
```

In dev tfvars, make broad access explicit:

```hcl
eks_public_access_cidrs = ["0.0.0.0/0"]
```

Add comments that this is temporary dev access and should later become laptop `/32` CIDRs or a private access path.

### Phase 3: Add ACM certificate module or platform resources

Preferred: add a focused module if the implementation stays clean.

Possible path:

```text
infra/modules/acm-public-cert/
```

Responsibilities:

- lookup Route 53 zone `noidilin.dev`
- create ACM certificate in the same region as the ALB
- include SANs:
  - `hiraya.noidilin.dev`
  - `*.hiraya.noidilin.dev`
- create Route 53 validation records
- create `aws_acm_certificate_validation`
- output certificate ARN

Inputs:

```hcl
zone_name   = "noidilin.dev"
root_domain = "hiraya.noidilin.dev"
subject_alternative_names = ["*.hiraya.noidilin.dev"]
```

Output:

```hcl
certificate_arn
```

### Phase 4: Add AWS Load Balancer Controller module

Possible path:

```text
infra/modules/aws-load-balancer-controller/
```

Responsibilities:

- create IRSA IAM role for the controller
- attach least-privilege AWS Load Balancer Controller IAM policy
- install Gateway API CRDs
- install AWS Load Balancer Controller with Helm

Inputs:

```hcl
cluster_name
region
vpc_id
oidc_provider_arn
oidc_issuer_url
```

Implementation notes:

- Reuse existing EKS OIDC provider outputs.
- Scope IAM as tightly as practical for a dev portfolio environment.
- Pin Helm chart versions.
- Verify the selected AWS Load Balancer Controller version supports Gateway API before implementation.
- Ensure the module is applied before any Gateway/HTTPRoute resources.

### Phase 5: Add ExternalDNS module

Possible path:

```text
infra/modules/external-dns/
```

Responsibilities:

- create `external-dns` namespace or use a platform namespace
- create IRSA IAM role scoped to the `noidilin.dev` hosted zone
- install ExternalDNS with Helm
- configure it to read Gateway API HTTPRoute hostnames
- configure Route 53 provider
- configure TXT registry
- configure `sync` policy

Inputs:

```hcl
cluster_name
oidc_provider_arn
oidc_issuer_url
hosted_zone_name = "noidilin.dev"
txt_owner_id     = "hiraya-dev-eks"
```

Expected Helm values conceptually:

```yaml
provider: aws
policy: sync
registry: txt
txtOwnerId: hiraya-dev-eks
sources:
  - gateway-httproute
```

Verify exact chart value names and supported source names during implementation.

IAM should allow only the required Route 53 changes in the hosted zone for `noidilin.dev`.

### Phase 6: Add edge Gateway module

Possible path:

```text
infra/modules/edge-gateway/
```

Responsibilities:

- create `edge` namespace
- install shared Gateway resources using a small local Helm chart
- configure public internet-facing ALB through AWS Load Balancer Controller
- configure listeners:
  - HTTP 80 redirects to HTTPS 443
  - HTTPS 443 uses ACM certificate
- configure allowed route attachment using namespace selector

Use local Helm chart instead of Terraform `kubernetes_manifest` to avoid CRD schema planning issues.

Possible local chart path:

```text
infra/modules/edge-gateway/chart/
├── Chart.yaml
├── values.yaml
└── templates/
    ├── gatewayclass.yaml
    └── gateway.yaml
```

Gateway attachment policy should only allow namespaces with:

```yaml
hiraya.noidilin.dev/public-gateway-access: "true"
```

Inputs:

```hcl
namespace = "edge"
certificate_arn
gateway_name = "public"
allowed_namespace_label_key = "hiraya.noidilin.dev/public-gateway-access"
allowed_namespace_label_value = "true"
```

### Phase 7: Update Argo CD module

Files:

```text
infra/modules/argocd/main.tf
infra/modules/argocd/variables.tf
```

Changes:

- Add namespace label to Terraform-managed `argocd` namespace.
- Generate or set strong admin password outside Git.
- Add admin HTTPRoute for `argocd.hiraya.noidilin.dev` using a small local Helm chart or chart template.
- Keep `argocd-server` Service as `ClusterIP`.
- Keep ALB -> backend traffic HTTP for dev.

Namespace label:

```hcl
metadata {
  name = "argocd"
  labels = {
    "hiraya.noidilin.dev/public-gateway-access" = "true"
  }
}
```

Admin route target should point to the Argo CD server service and port used by the chart.

### Phase 8: Update monitoring module

Files:

```text
infra/modules/monitoring/main.tf
infra/modules/monitoring/variables.tf
```

Changes:

- Add namespace label to Terraform-managed `monitoring` namespace.
- Set strong Grafana admin credentials from Terraform-generated secret/password.
- Add Grafana HTTPRoute for `grafana.hiraya.noidilin.dev` using a small local Helm chart or chart template.
- Keep Prometheus Service as `ClusterIP` with no HTTPRoute.
- Keep Alertmanager private unless explicitly decided later.

Namespace label:

```hcl
metadata {
  name = "monitoring"
  labels = {
    "hiraya.noidilin.dev/public-gateway-access" = "true"
  }
}
```

### Phase 9: Update GitOps app manifests

Files:

```text
gitops/namespace.yml
gitops/kustomization.yml
gitops/k8s/frontend/httproute.yml
```

Update `gitops/namespace.yml`:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: vintage
  labels:
    hiraya.noidilin.dev/public-gateway-access: "true"
```

Add app HTTPRoute:

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: frontend
  namespace: vintage
spec:
  parentRefs:
    - name: public
      namespace: edge
  hostnames:
    - hiraya.noidilin.dev
  rules:
    - backendRefs:
        - name: frontend
          port: 3000
```

Add the new route to `gitops/kustomization.yml`.

Keep frontend Service as `ClusterIP`.

Do not change local Docker Compose behavior.

### Phase 10: Platform wiring

Update `infra/envs/dev/platform/main.tf` module order:

```text
vpc
 -> eks
 -> aws-load-balancer-controller
 -> acm-public-cert
 -> external-dns
 -> edge-gateway
 -> monitoring
 -> argocd
 -> fluent-bit
```

Exact ordering can be adjusted, but these dependencies matter:

- EKS needs private subnets from VPC.
- LBC and ExternalDNS need EKS OIDC provider outputs.
- Edge Gateway needs LBC installed and ACM certificate ARN.
- Admin routes need Gateway available and namespace labels in place.
- Argo CD bootstrap app should sync after Gateway CRDs exist if GitOps includes HTTPRoute.

## Validation plan

### Static checks

Run:

```bash
terraform fmt -recursive
```

From `infra/envs/dev/platform`:

```bash
terraform init
terraform validate
terraform plan
```

Render GitOps:

```bash
kubectl kustomize gitops
```

Render local Helm charts if added:

```bash
helm template edge-gateway infra/modules/edge-gateway/chart
helm template argocd-route infra/modules/argocd/<route-chart-path>
helm template grafana-route infra/modules/monitoring/<route-chart-path>
```

### Post-apply checks

After approved destroy/recreate:

```bash
kubectl get nodes -o wide
kubectl get pods -A
kubectl get gateway -A
kubectl get httproute -A
kubectl get svc -A
```

Check AWS Load Balancer Controller:

```bash
kubectl logs -n kube-system deploy/aws-load-balancer-controller
```

Check ExternalDNS:

```bash
kubectl logs -n external-dns deploy/external-dns
```

Check Route 53 records exist:

```text
hiraya.noidilin.dev
argocd.hiraya.noidilin.dev
grafana.hiraya.noidilin.dev
```

Check public access:

```bash
curl -I http://hiraya.noidilin.dev
curl -I https://hiraya.noidilin.dev
curl -I https://argocd.hiraya.noidilin.dev
curl -I https://grafana.hiraya.noidilin.dev
```

Expected:

- HTTP returns redirect to HTTPS.
- HTTPS returns valid certificate.
- App loads and `/api` calls work through frontend nginx to gateway.
- Argo CD login page is reachable.
- Grafana login page is reachable.
- Prometheus has no public DNS route.

Check EKS endpoint posture:

- Private endpoint enabled.
- Public endpoint enabled only with explicit dev CIDRs.
- Nodes have private IPs only.
- No worker node public IPs.

Check outbound from private nodes:

- Pods can pull images from ECR.
- Argo CD can reach GitHub.
- Helm-installed controllers can reach required endpoints.
- S3 endpoint is attached to private route tables.

## Deployment procedure

This plan intentionally uses destroy/recreate for the dev platform.

Do not run this until ready for downtime and loss of disposable platform resources.

```bash
cd infra/envs/dev/platform
terraform destroy
terraform apply
```

Bootstrap state and durable resources such as ECR should remain in the separate bootstrap stack.

## Rollback plan

Because this is dev and the chosen migration model is destroy/recreate, rollback is one of:

1. Revert the Terraform/GitOps commits and recreate the previous platform.
2. Restore from a known-good branch/tag and run `terraform apply` after destroy.
3. Temporarily remove HTTPRoutes and use `kubectl port-forward` for access while debugging.

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Single NAT Gateway fails or AZ has issue | Private subnet outbound may fail | Accepted dev cost trade-off; production would use NAT per AZ |
| `/24` private subnets run out of pod IPs | Pods fail to schedule at larger scale | Accepted for small dev; use larger private subnets or CNI tuning later |
| EKS public endpoint left open | Weakens security posture | Keep broad CIDR explicit in tfvars and document as temporary |
| ExternalDNS deletes records unexpectedly | Public DNS outage | Use TXT registry ownership and hosted-zone scoped IAM |
| Gateway API CRDs unavailable at Terraform plan time | Terraform apply issues | Use local Helm charts for CRD-backed Gateway resources |
| Argo CD/Grafana exposed with weak credentials | Public admin compromise | Generate strong credentials with Terraform; no default credentials |
| LBC Gateway API behavior differs by version | ALB/Gateway creation fails | Verify/pin AWS Load Balancer Controller version before implementation |
| Local dev behavior accidentally changes | Docker Compose workflow breaks | Do not change Compose; keep frontend `/api` proxy model |

## Out of scope for this slice

- Kubernetes NetworkPolicy enforcement
- Secrets Manager + External Secrets Operator
- WAF
- CloudFront
- private-only EKS API with VPN/bastion/SSM access
- production NAT per AZ
- Prometheus public exposure
- RDS migration
- full multi-environment Terraform structure

## Future improvements

- Replace broad EKS public API CIDR with laptop `/32` or private access path.
- Add NetworkPolicy default-deny and explicit service allowlists.
- Move app/database credentials to AWS Secrets Manager with External Secrets Operator.
- Add WAF rules for public ALB.
- Add VPC Flow Logs temporarily during incident/debug sessions.
- Consider larger private subnets or pod networking improvements if node count grows.
- Consider NAT per AZ if dev evolves into staging/production.
