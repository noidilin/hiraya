# Troubleshoot Gateway API CRD Helm release conflict

Status: archived legacy troubleshooting note. ADR-0007 supersedes the Terraform-owned Gateway API CRD Helm release model; current CRDs are GitOps-owned under `gitops/platform/**` and reconciled by Argo CD. Use this page only to understand historical pre-ADR-0007 failures.

## When to use this

Do not use this runbook for current dev operations. It only applied when the retired monolithic Terraform platform stack managed a `gateway-api-crds` Helm release in `kube-system`.

## Do not use this when

- You have not reviewed the Gateway API CRD cutover plan yet. Start with [../platform/gateway-api-crd-cutover.md](../platform/gateway-api-crd-cutover.md).
- You are troubleshooting application HTTPRoute attachment after a successful CRD cutover.

## Safety boundary

Because this is dev-only infrastructure, a full disposable platform recreate is acceptable if the in-place state move becomes noisy or risky.

## Expected conflict context

The old and new Terraform resources both use the Helm release name `gateway-api-crds` in `kube-system`. Avoid creating the new release while the old state/address still owns the same live release.

Historical preferred path for the retired dev state:

1. Keep the old `moved.tf` state move in the plan.
2. Run `terraform plan` and confirm Terraform moves the address instead of trying to create a second `gateway-api-crds` release.
3. Apply only after the Operator accepts the plan.

## Manual recovery path

Use this only if Terraform still reports a Helm release name conflict:

```bash
helm -n kube-system status gateway-api-crds || true
# Historical only: the active platform no longer has infra/envs/dev/platform.
# Inspect the retired state manually before changing anything.
helm -n kube-system uninstall gateway-api-crds || true
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
