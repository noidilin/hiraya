# Reset Vintage Storefront dev database state

## When to use this

Use this runbook when the Vintage Storefront app/data contract changes, such as the Hiraya Furugi Catalog migration, and dev needs a clean database restore from GitOps seed data.

## Safety boundary

Reset only Vintage app database state in the `vintage` namespace. Do not destroy Project Bootstrap, Platform Core, Cluster Platform, Cluster Bootstrap, ECR repositories, public routes, or Terraform state for this app/data reset.

The dev restore source of truth is `gitops/apps/vintage/k8s/database/vintage_full.sql`. Keep it aligned with `app/microservices/database/vintage_full.sql`, local seed SQL, shared Storefront fixtures, and frontend product image assets.

## Procedure

1. Confirm the target app image/code and `vintage_full.sql` restore data are from the same commit or release.
2. Pause or watch Argo CD sync for the Vintage app if you need to control timing.
3. Connect to dev EKS:

   ```bash
   aws eks update-kubeconfig --region ap-northeast-1 --name devops-hiraya-dev-eks
   ```

4. Delete only the Vintage Postgres StatefulSet and its PVC so the restore Job can repopulate a clean volume:

   ```bash
   kubectl -n vintage scale statefulset/vintage-postgres --replicas=0
   kubectl -n vintage delete pod -l app=postgres --ignore-not-found
   kubectl -n vintage delete pvc postgres-data-vintage-postgres-0
   ```

5. Re-run the GitOps restore path. If Argo CD does not recreate it automatically, delete the old completed restore Job and let Argo reconcile:

   ```bash
   kubectl -n vintage delete job vintage-db-restore-v2 --ignore-not-found
   kubectl -n argocd annotate application vintage argocd.argoproj.io/refresh=hard --overwrite
   ```

6. Wait for database and workloads:

   ```bash
   kubectl -n vintage rollout status statefulset/vintage-postgres
   kubectl -n vintage wait --for=condition=complete job/vintage-db-restore-v2 --timeout=10m
   kubectl -n vintage rollout status deployment/frontend
   kubectl -n vintage rollout status deployment/product-service
   kubectl -n vintage rollout status deployment/orders
   kubectl -n vintage rollout status deployment/auth
   ```

## Validation

Validate the app/data pair after reseed:

```bash
curl -fsS https://hiraya.noidilin.dev/api/products | jq '.success, .data.products[0].brand, .data.products[0].image_url'
```

Expected: success is `true`, products are branded `Hiraya Furugi`, image URLs start with `/product-images/`, the demo login `demo@hirayavintage.test` / `correct horse battery staple` works, `/orders` shows the seeded order, and checkout creates a new pending order.

## Rollback coupling

Rollback is not just an image change. Keep app images/code and demo database seed/restore data together:

1. Roll back or revert the affected app images/code.
2. Reset this Vintage app database state again.
3. Restore the `vintage_full.sql` data that matches the rolled-back app/API contract.
4. Recheck `/`, `/api/products`, product images, login, cart, checkout, and `/orders`.

If the previous app expected the old catalog, restoring only the frontend image while keeping the Hiraya Furugi database can leave product links, image filenames, fixtures, and order history inconsistent.
