# Troubleshoot Gateway API CRD Helm release conflict

## When to use this

Use this runbook when the Gateway API CRD cutover reports that a Helm release named `gateway-api-crds` already exists in `kube-system`, or Terraform tries to create a second release instead of moving state.

## Do not use this when

- You have not reviewed the Gateway API CRD cutover plan yet. Start with [../platform/gateway-api-crd-cutover.md](../platform/gateway-api-crd-cutover.md).
- You are troubleshooting application HTTPRoute attachment after a successful CRD cutover.

## Safety boundary

Because this is dev-only infrastructure, a full disposable platform recreate is acceptable if the in-place state move becomes noisy or risky.

## Expected conflict context

The old and new Terraform resources both use the Helm release name `gateway-api-crds` in `kube-system`. Avoid creating the new release while the old state/address still owns the same live release.

Preferred path for current dev state:

1. Keep `infra/envs/dev/platform/moved.tf` in the plan.
2. Run `terraform plan` and confirm Terraform moves the address instead of trying to create a second `gateway-api-crds` release.
3. Apply only after the Operator accepts the plan.

## Manual recovery path

Use this only if Terraform still reports a Helm release name conflict:

```bash
helm -n kube-system status gateway-api-crds || true
terraform -chdir=infra/envs/dev/platform state list | grep gateway_api_crds || true
terraform -chdir=infra/envs/dev/platform state rm 'module.aws_load_balancer_controller.helm_release.gateway_api_crds'
helm -n kube-system uninstall gateway-api-crds || true
terraform -chdir=infra/envs/dev/platform plan
```

## Validation

Expected after recovery:

- Terraform no longer attempts to create a second live Helm release with the same name.
- The Gateway API CRD cutover plan is limited to the intended CRD ownership refactor.
- Existing Gateway resources, admin routes, ACM, Route 53, ExternalDNS, ALB scheme, and backend Service exposure are not intentionally changed.

## Evidence to capture

- Original conflict error.
- `helm status` output.
- Terraform state list before and after manual recovery.
- New Terraform plan summary.
