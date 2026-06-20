# Gateway API CRD cutover runbook

Related: [PRD #8](https://github.com/noidilin/hiraya/issues/8), [issue #12](https://github.com/noidilin/hiraya/issues/12), [ADR 0001](../adr/0001-eks-network-redesign.md), [Gateway API CRD improvement plan](../plan/gateway-api-crd-improvement.md), [infra README](../../infra/README.md).

## Purpose

This runbook prepares an Operator to perform the live dev cutover from the old in-cluster Gateway API CRD installer Job to the Terraform-managed, vendored Gateway API CRD module.

Adding or updating this runbook does **not** execute the live dev apply. A human Operator must review the plan and run the apply in the deployment session.

## Expected ownership after cutover

- Terraform `module.gateway_api_crds` installs upstream Gateway API core CRDs from `infra/modules/gateway-api-crds/chart/crds/`.
- Terraform `module.gateway_api_crds` optionally installs upstream Gateway API validation resources from chart templates.
- The AWS Load Balancer Controller Helm release installs AWS-specific Gateway CRDs with `skip_crds = false`.
- Terraform still owns the shared `edge/public` Gateway, `GatewayClass`, `LoadBalancerConfiguration`, `TargetGroupConfiguration`, and Terraform-owned admin HTTPRoutes.
- GitOps still owns application manifests and the `vintage/frontend` app HTTPRoute.
- Backend Services for the app, Argo CD, and Grafana remain private `ClusterIP` Services behind the shared Gateway/ALB.

## Expected Terraform plan shape

Before apply, the platform plan should show the CRD ownership refactor only, not a public ingress redesign:

- `module.gateway_api_crds.helm_release.this` is present before `module.aws_load_balancer_controller` through module dependencies.
- The old in-cluster Gateway API CRD installer Job, hook RBAC, and remote GitHub manifest download path are absent.
- `module.aws_load_balancer_controller` keeps the controller release and explicitly allows chart CRDs (`skip_crds = false`).
- Existing Gateway resources, admin routes, ACM, Route 53, ExternalDNS, ALB scheme, and backend Service exposure are not intentionally changed.
- The root `moved` block transfers state from `module.aws_load_balancer_controller.helm_release.gateway_api_crds` to `module.gateway_api_crds.helm_release.this` when existing state still contains the old release address.

## Existing Helm release name conflict

The old and new Terraform resources both use the Helm release name `gateway-api-crds` in `kube-system`. Avoid creating the new release while the old state/address still owns the same live release.

Preferred path for the current dev state:

1. Keep `infra/envs/dev/platform/moved.tf` in the plan.
2. Run `terraform plan` and confirm Terraform moves the address instead of trying to create a second `gateway-api-crds` release.
3. Apply only after the Operator accepts the plan.

Manual recovery path if Terraform still reports a Helm release name conflict:

```bash
helm -n kube-system status gateway-api-crds || true
terraform -chdir=infra/envs/dev/platform state list | grep gateway_api_crds || true
terraform -chdir=infra/envs/dev/platform state rm 'module.aws_load_balancer_controller.helm_release.gateway_api_crds'
helm -n kube-system uninstall gateway-api-crds || true
terraform -chdir=infra/envs/dev/platform plan
```

Because this is dev-only infrastructure, a full disposable platform recreate is acceptable if the in-place state move becomes noisy or risky.

## Pre-apply checks

Run these before asking for apply approval:

```bash
git status --short
helm lint infra/modules/gateway-api-crds/chart
helm template gateway-api-crds \
  infra/modules/gateway-api-crds/chart \
  --namespace kube-system \
  --include-crds \
  > /tmp/gateway-api-crds.yaml
kubectl apply --dry-run=client -f /tmp/gateway-api-crds.yaml
terraform -chdir=infra/envs/dev/platform fmt -check -recursive
terraform -chdir=infra/envs/dev/platform init -backend-config=backend.hcl
terraform -chdir=infra/envs/dev/platform validate
terraform -chdir=infra/modules/gateway-api-crds test
terraform -chdir=infra/envs/dev/platform plan
```

Confirm the rendered `/tmp/gateway-api-crds.yaml` includes the core Gateway API CRDs and validation resources:

```bash
grep -E '^kind: (CustomResourceDefinition|ValidatingAdmissionPolicy|ValidatingAdmissionPolicyBinding)$' /tmp/gateway-api-crds.yaml
```

## Approved apply procedure

Only the human Operator runs this section after approving the plan.

```bash
terraform -chdir=infra/envs/dev/platform apply
aws eks update-kubeconfig --region ap-northeast-1 --name hiraya-dev
```

## Post-apply checklist

### Core Gateway API CRDs

```bash
kubectl get crd \
  backendtlspolicies.gateway.networking.k8s.io \
  gatewayclasses.gateway.networking.k8s.io \
  gateways.gateway.networking.k8s.io \
  grpcroutes.gateway.networking.k8s.io \
  httproutes.gateway.networking.k8s.io \
  listenersets.gateway.networking.k8s.io \
  referencegrants.gateway.networking.k8s.io \
  tlsroutes.gateway.networking.k8s.io
kubectl get validatingadmissionpolicy safe-upgrades.gateway.networking.k8s.io
kubectl get validatingadmissionpolicybinding safe-upgrades.gateway.networking.k8s.io
```

Expected: all eight core CRDs exist. Validation resources exist unless the apply intentionally disabled them.

### AWS-specific Gateway CRDs

```bash
kubectl get crd \
  loadbalancerconfigurations.gateway.k8s.aws \
  targetgroupconfigurations.gateway.k8s.aws \
  listenerruleconfigurations.gateway.k8s.aws
```

Expected: AWS-specific CRDs exist after AWS Load Balancer Controller installation.

### Controller rollout

```bash
kubectl -n kube-system rollout status deployment/aws-load-balancer-controller
kubectl get pods -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller
kubectl logs -n kube-system deploy/aws-load-balancer-controller --tail=100
```

Expected: rollout succeeds and logs do not show repeated Gateway API reconciliation or CRD discovery errors.

### Shared edge Gateway resources

```bash
kubectl get gatewayclass
kubectl get gateway -n edge public
kubectl describe gateway -n edge public
kubectl get loadbalancerconfiguration -A
kubectl get targetgroupconfiguration -A
```

Expected: the shared `edge/public` Gateway is accepted/programmed and AWS policy resources are accepted by the API server.

### HTTPRoute attachment

```bash
kubectl get httproute -A
kubectl describe httproute -n vintage frontend
kubectl describe httproute -n argocd argocd
kubectl describe httproute -n monitoring grafana
kubectl get namespace vintage argocd monitoring --show-labels
```

Expected: app, Argo CD, and Grafana HTTPRoutes are accepted and attached to the shared Gateway. The `vintage`, `argocd`, and `monitoring` namespaces carry the public Gateway access label.

### Private backend Service exposure

```bash
kubectl get svc -n vintage frontend gateway -o wide
kubectl get svc -n argocd argocd-server -o wide
kubectl get svc -n monitoring kube-prometheus-stack-grafana -o wide
kubectl get httproute -A | grep -i prometheus || true
```

Expected: frontend, gateway, Argo CD, and Grafana Services remain `ClusterIP`. Prometheus remains private and has no public HTTPRoute.

### Public smoke tests

```bash
curl -I https://hiraya.noidilin.dev
curl -I https://argocd.hiraya.noidilin.dev
curl -I https://grafana.hiraya.noidilin.dev
kubectl logs -n external-dns deploy/external-dns --tail=100
```

Expected: public app, Argo CD, and Grafana hostnames still route through the shared Gateway/ALB. ExternalDNS has no repeated HTTPRoute source errors.

## Rollback guidance

If the cutover fails:

1. Preserve Terraform output, the plan, controller logs, `kubectl describe gateway`, `kubectl describe httproute`, and CRD listings.
2. If only validation resources fail, disable `enable_validation_resources` for the Gateway API CRD module and re-plan.
3. If the Helm release state move fails, use the manual recovery path above or recreate the disposable platform stack.
4. Do not make backend Services public as a workaround; preserve the shared Gateway and private service exposure design.
