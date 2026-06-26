# Reset Vintage Storefront dev database state

## When to use this

Use this runbook when the Vintage Storefront app/data contract changes, such as the Hiraya Furugi Catalog migration, and dev needs a clean database restore from GitOps seed data.

## Safety boundary

Reset only Vintage app database state in the `vintage` namespace. Do not destroy Project Bootstrap, Platform Core, Cluster Platform, Cluster Bootstrap, ECR repositories, public routes, or Terraform state for this app/data reset.

The dev restore source of truth is `gitops/apps/vintage/k8s/database/vintage_full.sql`. Keep it aligned with `app/microservices/database/vintage_full.sql`, local seed SQL, shared Storefront fixtures, and frontend product image assets.

## Preflight

1. Confirm the target app image/code and `vintage_full.sql` restore data are from the same commit or release.
2. Confirm the GitOps restore dump contains the Hiraya Furugi Catalog before touching the deployed database:

   ```bash
   rg "Hiraya Furugi|/product-images/prairie-midi-dress.jpg|demo@hirayavintage.test" \
     gitops/apps/vintage/k8s/database/vintage_full.sql
   pnpm run scripts:test -- --test-name-pattern "restore"
   ```

3. Confirm this rollout is app/data only. Do not run Terraform apply/destroy, do not recreate ECR repositories, and do not rebuild Project Bootstrap, Platform Core, Cluster Platform, Cluster Bootstrap, or EKS.
4. Record the current frontend and backend image tags plus the target Git commit so rollback can pair images/code with the matching database reseed.
5. Pause or watch Argo CD sync for the Vintage app if you need to control timing.

## Procedure

1. Connect to dev EKS:

   ```bash
   aws eks update-kubeconfig --region ap-northeast-1 --name devops-hiraya-dev-eks
   ```

2. Delete only the Vintage Postgres StatefulSet and its PVC so the restore Job can repopulate a clean volume:

   ```bash
   kubectl -n vintage scale statefulset/vintage-postgres --replicas=0
   kubectl -n vintage delete pod -l app=postgres --ignore-not-found
   kubectl -n vintage delete pvc postgres-data-vintage-postgres-0
   ```

3. Re-run the GitOps restore path. If Argo CD does not recreate it automatically, delete the old completed restore Job and let Argo reconcile:

   ```bash
   kubectl -n vintage delete job vintage-db-restore-v2 --ignore-not-found
   kubectl -n argocd annotate application vintage argocd.argoproj.io/refresh=hard --overwrite
   ```

4. Wait for database and workloads:

   ```bash
   kubectl -n vintage rollout status statefulset/vintage-postgres
   kubectl -n vintage wait --for=condition=complete job/vintage-db-restore-v2 --timeout=10m
   kubectl -n vintage rollout status deployment/frontend
   kubectl -n vintage rollout status deployment/product-service
   kubectl -n vintage rollout status deployment/orders
   kubectl -n vintage rollout status deployment/auth
   ```

## Validation

Validate the app/data pair after reseed.

### Read-only public smoke

```bash
pnpm run app:smoke:public
curl -fsS https://hiraya.noidilin.dev/api/products \
  | jq '.success, .data.products[0].brand, .data.products[0].image_url'
```

Expected: success is `true`, products are branded `Hiraya Furugi`, and image URLs start with `/product-images/`.

### Direct route QA checklist

Use a private browser window and direct-load each route from the address bar. Hard refresh once on each route to confirm nginx SPA fallback and public routing:

- [ ] `/`
- [ ] `/products`
- [ ] product detail, for example `/products/67be2d5e-ecfb-4bf9-b751-8474f9d7bcac`
- [ ] `/cart`
- [ ] `/login`
- [ ] `/register`
- [ ] `/profile` redirects unauthenticated visitors to `/login`
- [ ] `/orders` redirects unauthenticated visitors to `/login`
- [ ] `/order-confirmed` loads without a server 404
- [ ] `/manifesto`

### Mutating deployed QA checklist

Run only when the dev environment may accept test orders:

- [ ] Demo login works with `demo@hirayavintage.test` / `correct horse battery staple`.
- [ ] Add a product to cart from product detail with quantity capped by inventory.
- [ ] Logged-out checkout sends the visitor to login and returns to `/cart` after authentication with cart contents preserved.
- [ ] Logged-in checkout creates a pending order, not a paid order.
- [ ] `/order-confirmed` shows the newly created pending order.
- [ ] `/orders` shows the seeded order plus the newly created order.

Known backend limitation: the current orders service still accepts `userId` from the request and does not enforce per-token order ownership server-side. Treat checkout as client-gated demo behavior until a later security slice fixes ownership enforcement.

### Rollout evidence to record

- Git commit or release being rolled out.
- Previous and target image tags for `frontend`, `product-service`, `orders`, and `auth` when they changed.
- Argo CD sync status and Kubernetes rollout status for the Vintage app.
- Restore Job name, completion timestamp, and logs summary.
- Read-only public smoke output.
- Route QA checklist result.
- Mutating QA checklist result or reason it was skipped.
- Known limitations and rollback decision point.

## Rollback coupling

Rollback is not just an image change. Keep app images/code and demo database seed/restore data together:

1. Roll back or revert the affected app images/code.
2. Reset this Vintage app database state again.
3. Restore the `vintage_full.sql` data that matches the rolled-back app/API contract.
4. Recheck `/`, `/api/products`, product images, login, cart, checkout, and `/orders`.

If the previous app expected the old catalog, restoring only the frontend image while keeping the Hiraya Furugi database can leave product links, image filenames, fixtures, and order history inconsistent.
