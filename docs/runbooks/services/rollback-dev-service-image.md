# Roll back dev service image

## When to use this

Use `.github/workflows/service-image-dev-rollback.yml` when one dev service must be moved back to an existing ECR image tag without rebuilding images.

## Do not use this when

- You are making a normal release. Use `.github/workflows/image-ci.yml`.
- The target image tag does not already exist in ECR.
- You need to destroy or redeploy the whole platform. Use [../platform/deploy-dev-platform.md](../platform/deploy-dev-platform.md) or [../platform/destroy-dev-platform.md](../platform/destroy-dev-platform.md).

## Safety boundary

The rollback workflow updates GitOps manifests for one selected service and lets Argo CD reconcile the cluster. It does not rebuild images or mutate infrastructure.

## Normal path

Prefer `.github/workflows/image-ci.yml` for normal releases. It builds images, pushes to ECR, updates GitOps manifests, and lets Argo CD reconcile the cluster.

## Prerequisites

1. The operator knows the service to roll back.
2. The target `rollback_to_tag` already exists in ECR, usually a previous commit SHA image tag.
3. A rollback reason is available for the audit commit.
4. The workflow is run from `main`.
5. The selected GitHub Environment approval rules are available, if configured.

## Procedure

1. Open **GitHub Actions → service-image-dev-rollback → Run workflow**.
2. Keep the branch as `main`.
3. Select `environment=dev`.
4. Select the service.
5. Enter `rollback_to_tag`, usually a previous commit SHA image tag.
6. Enter a rollback reason.
7. First run with `dry_run=true` and `confirm=DRY_RUN`.
8. Review the workflow summary diff:
   - current image
   - target image
   - manifest path
   - rendered GitOps validation
9. To apply, run it again with `dry_run=false` and `confirm=ROLLBACK`.
10. After the commit lands on `main`, Argo CD reconciles the updated manifest.

## Validation

After Argo CD reconciles, validate the selected service only:

```bash
aws eks update-kubeconfig --region ap-northeast-1 --name hiraya-dev
kubectl -n vintage rollout status deployment/<service-deployment-name>
kubectl -n vintage get deploy <service-deployment-name> -o jsonpath='{.spec.template.spec.containers[0].image}{"\n"}'
kubectl -n vintage get pods -l app=<service-label> -o wide
```

For public path impact, run the relevant route smoke check:

```bash
curl -I https://hiraya.noidilin.dev
```

Expected: the selected Deployment runs the target ECR image tag and the app route remains healthy.

## Evidence to capture

- Dry-run workflow summary.
- Apply workflow summary.
- Rollback commit SHA and message.
- Previous image and target image.
- Argo CD sync status or Kubernetes rollout status.
- Post-rollback smoke check result.

## Guardrails

- The workflow only runs from `main`.
- The target image tag must already exist in ECR.
- Service metadata is read from `.github/utils/services.json` to avoid drift.
- Apply runs use the selected GitHub Environment, so environment approval rules can gate rollback commits.
- The workflow validates `kubectl kustomize gitops` before committing.
- The rollback commit records the reason, operator, previous image, and target image.

## Recovery

If the rollback makes the service worse, run the workflow again with a different known-good ECR tag or use the normal image pipeline to release a forward fix.
