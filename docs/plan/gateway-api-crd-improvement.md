# Gateway API CRD Installation Improvement Plan

## Context

The dev platform currently installs Gateway API prerequisites through the AWS Load Balancer Controller module. The existing implementation uses a local Helm chart that creates a Helm hook Job. That Job runs `kubectl apply` inside the EKS cluster against remote GitHub URLs for:

- Gateway API upstream `standard-install.yaml`
- AWS Load Balancer Controller Gateway API CRDs

This approach now works after `terraform apply`, but it keeps platform bootstrap dependent on runtime network access to GitHub, a working `kubectl` image, hook Job lifecycle, and broad temporary cluster RBAC.

## Goal

Make Gateway API CRD installation deterministic, reviewable, and less fragile for CI/CD by vendoring upstream Gateway API CRDs into the repository and letting the AWS Load Balancer Controller Helm chart manage its own AWS-specific CRDs.

## Target Architecture

```text
module.eks
  -> module.gateway_api_crds
    -> module.aws_load_balancer_controller
      -> module.external_dns
        -> module.edge_gateway
          -> module.monitoring / module.argocd routes
```

Ownership split:

- `module.gateway_api_crds`
  - Installs core Gateway API CRDs from local vendored files.
  - Optionally installs Gateway API validation resources.
- `module.aws_load_balancer_controller`
  - Installs the AWS Load Balancer Controller Helm chart.
  - Relies on the chart `crds/` directory for AWS-specific CRDs.
- `module.edge_gateway`
  - Creates `GatewayClass`, `Gateway`, `LoadBalancerConfiguration`, `TargetGroupConfiguration`, and routes.

This should not change public traffic flow. It only changes platform bootstrap mechanics.

## Current Approach: Remote Helm Hook Job

Current flow:

```text
Terraform helm_release
  -> local crd-installer chart
    -> Helm pre-install/pre-upgrade Job
      -> kubectl apply -f GitHub Gateway API URL
      -> kubectl apply -f GitHub AWS LBC Gateway CRD URL
```

### Benefits

- Already proven by the latest successful `terraform apply`.
- Smallest short-term change.
- `kubectl apply` can update existing CRDs.
- Can apply both CRDs and non-CRD validation resources.
- Version bumps are simple Terraform value changes.

### Drawbacks

- `terraform apply` depends on pod egress to GitHub/raw GitHub.
- `terraform apply` depends on a working `kubectl` container image.
- Helm waits on a hook Job, so hook failures fail the whole platform apply.
- Requires hook-specific `ServiceAccount`, `ClusterRole`, and `ClusterRoleBinding`.
- Actual manifest content is not visible in Git review.
- Less compatible with future private-network hardening.

### Decision

Keep only as a temporary working state. Do not treat this as the long-term platform pattern.

## Recommended Approach

Use a dedicated vendored Gateway API CRD module and rely on the AWS Load Balancer Controller chart for AWS-specific CRDs.

### Benefits

- Removes in-cluster `kubectl` Job for Gateway API CRDs.
- Removes GitHub dependency during `terraform apply`.
- Removes `kubectl` image dependency during `terraform apply`.
- Makes CRD contents pinned and reviewable in Git diffs.
- Reduces temporary cluster-wide RBAC.
- Better fit for stable infra CI/CD and private EKS networking.

### Drawbacks

- Vendored Gateway API YAML is large.
- Helm does not automatically upgrade or delete CRDs placed under `crds/`.
- CRD upgrades need a deliberate manual process.
- Non-CRD resources from `standard-install.yaml` need separate handling under `templates/`.

## Implementation Plan

### Phase 1 — Add Dedicated Gateway API CRD Module

Create:

```text
infra/modules/gateway-api-crds/
  main.tf
  variables.tf
  outputs.tf
  chart/
    Chart.yaml
    values.yaml
    crds/
      backendtlspolicies.gateway.networking.k8s.io.yaml
      gatewayclasses.gateway.networking.k8s.io.yaml
      gateways.gateway.networking.k8s.io.yaml
      grpcroutes.gateway.networking.k8s.io.yaml
      httproutes.gateway.networking.k8s.io.yaml
      listenersets.gateway.networking.k8s.io.yaml
      referencegrants.gateway.networking.k8s.io.yaml
      tlsroutes.gateway.networking.k8s.io.yaml
    templates/
      validatingadmissionpolicy-safe-upgrades.yaml
      validatingadmissionpolicybinding-safe-upgrades.yaml
```

Use the current Gateway API release:

```text
v1.5.0
```

The upstream `standard-install.yaml` for `v1.5.0` contains:

- 8 `CustomResourceDefinition` resources
- 1 `ValidatingAdmissionPolicy`
- 1 `ValidatingAdmissionPolicyBinding`

Only CRDs belong under `chart/crds/`. The validation resources should be rendered from `chart/templates/` and controlled by a value.

Example values:

```yaml
validationResources:
  enabled: true
```

Example `main.tf` shape:

```hcl
resource "helm_release" "this" {
  name      = "gateway-api-crds"
  namespace = var.namespace
  chart     = "${path.module}/chart"

  wait    = true
  timeout = 300

  values = [
    yamlencode({
      validationResources = {
        enabled = var.enable_validation_resources
      }
    })
  ]
}
```

Example variables:

```hcl
variable "namespace" {
  description = "Namespace used by the Gateway API CRD Helm release."
  type        = string
  default     = "kube-system"
}

variable "enable_validation_resources" {
  description = "Whether to install Gateway API validation resources from templates."
  type        = bool
  default     = true
}
```

Example output:

```hcl
output "release_name" {
  description = "Gateway API CRD Helm release name."
  value       = helm_release.this.name
}
```

### Phase 2 — Remove Custom CRD Installer From AWS LBC Module

In:

```text
infra/modules/aws-load-balancer-controller/
```

Remove:

```text
crd-installer/
```

Remove this Terraform resource from `main.tf`:

```hcl
resource "helm_release" "gateway_api_crds" { ... }
```

Remove this variable from `variables.tf`:

```hcl
variable "gateway_api_version" { ... }
```

Remove this output from `outputs.tf`:

```hcl
output "gateway_api_crds_release_name" { ... }
```

Then make the AWS Load Balancer Controller chart CRD behavior explicit:

```hcl
resource "helm_release" "controller" {
  name       = "aws-load-balancer-controller"
  namespace  = local.namespace
  repository = "https://aws.github.io/eks-charts"
  chart      = "aws-load-balancer-controller"
  version    = var.chart_version

  skip_crds = false

  wait    = true
  timeout = 600

  # existing values unchanged
}
```

The AWS LBC chart includes its own CRD files, including:

```text
crds/crds.yaml
crds/gateway-crds.yaml
```

This chart should own AWS-specific CRDs such as:

```text
loadbalancerconfigurations.gateway.k8s.aws
targetgroupconfigurations.gateway.k8s.aws
listenerruleconfigurations.gateway.k8s.aws
```

### Phase 3 — Wire New Module Into Dev Platform

In:

```text
infra/envs/dev/platform/main.tf
```

Add before `module "aws_load_balancer_controller"`:

```hcl
module "gateway_api_crds" {
  source = "../../../modules/gateway-api-crds"

  providers = {
    helm = helm.eks
  }

  depends_on = [module.eks]
}
```

Update AWS LBC dependency:

```hcl
module "aws_load_balancer_controller" {
  source = "../../../modules/aws-load-balancer-controller"

  # existing provider and variable wiring unchanged

  depends_on = [
    module.eks,
    module.gateway_api_crds
  ]
}
```

Downstream dependencies can remain mostly unchanged:

- `external_dns` depends on `module.aws_load_balancer_controller`
- `edge_gateway` depends on `module.aws_load_balancer_controller`, `module.edge_certificate`, and `module.external_dns`
- `monitoring` and `argocd` depend on `module.edge_gateway`

### Phase 4 — Terraform State Migration

Because the current Helm release is already named `gateway-api-crds`, avoid a destroy/recreate name conflict.

Preferred migration: add a root-level moved block in `infra/envs/dev/platform/moved.tf`:

```hcl
moved {
  from = module.aws_load_balancer_controller.helm_release.gateway_api_crds
  to   = module.gateway_api_crds.helm_release.this
}
```

Keep the moved block until all active local states have migrated.

Alternative clean-dev reset if needed:

```sh
helm -n kube-system uninstall gateway-api-crds || true
terraform -chdir=infra/envs/dev/platform state rm 'module.aws_load_balancer_controller.helm_release.gateway_api_crds'
terraform -chdir=infra/envs/dev/platform apply
```

Given this project has only a dev environment, full infra destroy/recreate is also acceptable for a larger refactor, but the moved block is cleaner for this targeted change.

### Phase 5 — Validation Before Apply

Lint the new chart:

```sh
helm lint infra/modules/gateway-api-crds/chart
```

Render with CRDs included:

```sh
helm template gateway-api-crds \
  infra/modules/gateway-api-crds/chart \
  --namespace kube-system \
  --include-crds \
  > /tmp/gateway-api-crds.yaml
```

Client-side Kubernetes dry run:

```sh
kubectl apply --dry-run=client -f /tmp/gateway-api-crds.yaml
```

Terraform formatting and validation:

```sh
terraform -chdir=infra/envs/dev/platform fmt -recursive
terraform -chdir=infra/envs/dev/platform validate
terraform -chdir=infra/envs/dev/platform plan
```

### Phase 6 — Apply and Runtime Validation

Apply:

```sh
terraform -chdir=infra/envs/dev/platform apply
```

Verify core Gateway API CRDs:

```sh
kubectl get crd \
  gatewayclasses.gateway.networking.k8s.io \
  gateways.gateway.networking.k8s.io \
  httproutes.gateway.networking.k8s.io \
  referencegrants.gateway.networking.k8s.io
```

Verify AWS LBC Gateway CRDs:

```sh
kubectl get crd \
  loadbalancerconfigurations.gateway.k8s.aws \
  targetgroupconfigurations.gateway.k8s.aws \
  listenerruleconfigurations.gateway.k8s.aws
```

Verify validation resources:

```sh
kubectl get validatingadmissionpolicy safe-upgrades.gateway.networking.k8s.io
kubectl get validatingadmissionpolicybinding safe-upgrades.gateway.networking.k8s.io
```

Verify controller rollout:

```sh
kubectl -n kube-system rollout status deployment/aws-load-balancer-controller
```

Verify edge resources:

```sh
kubectl get gatewayclass
kubectl get gateway -A
kubectl get httproute -A
kubectl get loadbalancerconfiguration -A
kubectl get targetgroupconfiguration -A
```

## Documentation Updates

Update `infra/README.md` after implementation to document:

- Gateway API core CRDs are vendored under `infra/modules/gateway-api-crds`.
- AWS LBC CRDs are installed by the AWS LBC Helm chart.
- CRD upgrades are deliberate and reviewed through Git diffs.
- Helm does not automatically upgrade or delete CRDs from chart `crds/`.

Suggested upgrade note:

```text
To upgrade Gateway API:
1. Download the target release standard-install.yaml.
2. Split CRDs into infra/modules/gateway-api-crds/chart/crds/.
3. Put non-CRD validation resources into chart/templates/.
4. Review YAML diffs carefully.
5. Run helm template, kubectl dry-run, terraform validate, and terraform plan.
6. For dev-only breaking CRD schema changes, prefer cluster recreate over complex CRD migration.
```

## Acceptance Criteria

- `terraform apply` no longer runs an in-cluster `kubectl` CRD installer Job.
- Gateway API CRD install no longer depends on GitHub during apply.
- Gateway API CRD install no longer depends on a `kubectl` container image.
- Gateway API CRD contents are pinned and reviewable in Git.
- AWS LBC chart installs AWS-specific CRDs with `skip_crds = false`.
- Fresh platform apply produces both core Gateway API CRDs and AWS LBC Gateway CRDs.
- `edge_gateway` successfully creates:
  - `GatewayClass`
  - `Gateway`
  - `LoadBalancerConfiguration`
  - `TargetGroupConfiguration`
- Argo CD and Grafana HTTPRoutes still attach to the shared Gateway.
- No public traffic flow change is introduced by this refactor.

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Helm does not upgrade CRDs in `crds/` | Treat Gateway API upgrades as deliberate reviewed changes; recreate dev infra when schema migration is risky. |
| Vendored YAML is large | Split CRDs into one file per resource for readable diffs. |
| Existing Helm release name conflicts | Use Terraform `moved` block or uninstall/state-remove before apply. |
| Validation resources fail on unsupported Kubernetes versions | EKS is currently pinned to Kubernetes `1.34`; keep validation resources behind `enable_validation_resources`. |
| AWS LBC chart CRDs do not upgrade automatically | Accept for dev, or document manual CRD apply/recreate path when bumping AWS LBC major versions. |
