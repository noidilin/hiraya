# Delivery Flow

This page explains the high-level CI/CD and GitOps delivery path. Workflow syntax and exact jobs live in `.github/workflows/`; operational procedures live in runbooks.

## Application delivery path

```text
Pull request
  -> no-AWS app baseline
  -> Docker buildability checks when app paths change
  -> merge to main
  -> image build and push to ECR
  -> GitOps manifest image tag update PR
  -> required app baseline on promotion PR
  -> merge promotion PR
  -> Argo CD syncs manifests
  -> public smoke observes deployed Storefront
```

## Infrastructure delivery path

```text
Terraform change PR
  -> infra CI plan/validation
  -> trusted review of plan output
  -> approved deploy workflow
  -> Platform Core apply
  -> Cluster Bootstrap apply
  -> Argo CD reconciles GitOps-owned resources
```

## Portfolio delivery path

```text
Portfolio app/API change
  -> portfolio PR baseline
  -> merge
  -> portfolio deploy workflow
  -> durable Portfolio Stack serves frontend and Guide API
```

## Important workflow entry points

See [`../references/workflows.md`](../references/workflows.md) for the workflow map.

Common owners:

- App PR baseline: `.github/workflows/app-pr-baseline.yml`
- Image build/promotion: `.github/workflows/image-ci.yml`
- Deploy smoke: `.github/workflows/deploy-smoke.yml`
- Infra CI/deploy/destroy: `.github/workflows/infra-ci.yml`, `infra-deploy.yml`, `infra-destroy.yml`
- Portfolio CI/deploy: `.github/workflows/portfolio-pr-baseline.yml`, `portfolio-deploy.yml`, `portfolio-infra-deploy.yml`

## Related docs

- Commands: [`../references/commands.md`](../references/commands.md)
- Workflow map: [`../references/workflows.md`](../references/workflows.md)
- Platform lifecycle: [platform-lifecycle.md](platform-lifecycle.md)
