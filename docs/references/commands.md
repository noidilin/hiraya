# Command Reference

Canonical command list for common local validation and development tasks. Run commands from the repository root unless the command explicitly says otherwise.

## Workspace setup

```sh
corepack enable
corepack prepare pnpm@11.8.0 --activate
pnpm install --frozen-lockfile
```

## Global script/helper checks

```sh
pnpm run scripts:build
pnpm run scripts:test
pnpm run app:catalog
pnpm run services:changed -- --all
```

## Vintage Storefront

```sh
pnpm run app:baseline
pnpm run app:static
pnpm run app:gitops
pnpm run app:smoke:compose
pnpm run app:smoke:public
pnpm run app:test:backend-contract
pnpm run app:test:frontend
pnpm run app:test:browser
pnpm run storefront:build
pnpm run storefront:typecheck
pnpm run storefront:lint
pnpm run storefront:static
pnpm --filter frontend dev
```

## Docker Compose

```sh
pnpm run docker:build
pnpm run docker:up
pnpm run docker:up:frontend-dev
pnpm run docker:down
```

Default Storefront URL in Compose is `http://localhost:3000`.

## Portfolio

```sh
pnpm run portfolio:frontend:build
pnpm run portfolio:frontend:typecheck
pnpm run portfolio:frontend:lint
pnpm run portfolio:frontend:test
pnpm run portfolio:guide-api:build
pnpm run portfolio:guide-api:typecheck
pnpm run portfolio:guide-api:test
pnpm run portfolio:guide-api:package
pnpm run portfolio:guide-api:dev
pnpm --filter @hiraya/portfolio-frontend dev
pnpm run portfolio:knowledge:validate
pnpm run portfolio:static
```

## Terraform stacks

Run inside the changed stack directory:

```sh
cp backend.hcl.example backend.hcl
terraform init -backend-config=backend.hcl
terraform fmt -check
terraform validate
terraform plan
```

Active dev stack directories:

- `infra/envs/dev/bootstrap/`
- `infra/envs/dev/platform-core/`
- `infra/envs/dev/cluster-bootstrap/`

Durable portfolio stack:

- `infra/portfolio/`

## Reports and agentic workflows

```sh
gh aw compile .github/workflows/weekly-permission-audit.md
```

## Kubernetes / EKS operator checks

These require AWS and cluster access:

```sh
aws eks update-kubeconfig \
  --region ap-northeast-1 \
  --name devops-hiraya-dev-eks

kubectl get nodes
kubectl get application -n argocd
kubectl get pods -n vintage
```

Use runbooks for deploy/destroy/rollback procedures instead of relying on this reference alone.
