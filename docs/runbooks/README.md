# Runbooks

Use this page to choose a runbook by scenario or action. These runbooks target the dev Hiraya platform unless a page says otherwise.

## Platform operations

| I want to... | Use this runbook |
|---|---|
| Bootstrap GitHub OIDC roles for infra workflows | [platform/bootstrap-infra-workflows.md](platform/bootstrap-infra-workflows.md) |
| Validate Terraform plan comments on a trusted PR | [platform/validate-infra-pr-plan.md](platform/validate-infra-pr-plan.md) |
| Deploy or recreate the dev EKS platform | [platform/deploy-dev-platform.md](platform/deploy-dev-platform.md) |
| Destroy the disposable dev EKS platform | [platform/destroy-dev-platform.md](platform/destroy-dev-platform.md) |
| Cut over Gateway API CRD ownership | [platform/gateway-api-crd-cutover.md](platform/gateway-api-crd-cutover.md) |

## Service operations

| I want to... | Use this runbook |
|---|---|
| Roll back one dev service to an existing ECR image tag | [services/rollback-dev-service-image.md](services/rollback-dev-service-image.md) |

## Troubleshooting

| Symptom | Use this runbook |
|---|---|
| GitHub Actions receives AWS `AccessDenied` | [troubleshooting/infra-workflow-access-denied.md](troubleshooting/infra-workflow-access-denied.md) |
| GitHub-hosted runner cannot reach or manage EKS | [troubleshooting/eks-github-runner-access.md](troubleshooting/eks-github-runner-access.md) |
| Gateway API CRD Helm release name conflicts during cutover | [troubleshooting/gateway-api-crd-helm-conflict.md](troubleshooting/gateway-api-crd-helm-conflict.md) |

## Safety boundaries

- Durable bootstrap resources are preserved during normal platform deploy/destroy operations.
- Disposable platform resources live in `infra/envs/dev/platform-core` and `infra/envs/dev/cluster-bootstrap`; the legacy `infra/envs/dev/platform` stack is retired.
- Project Bootstrap is durable and owns state access, GitHub OIDC roles, ECR repositories, and durable Vintage Storefront secrets.
- Argo CD owns Cluster Platform and GitOps Apps desired state from `gitops/platform/**` and `gitops/apps/**` after Cluster Bootstrap installs the root app.
- Generated Argo CD and Grafana credentials are secrets in AWS Secrets Manager. Do not print them into workflow logs, issue comments, screenshots, or documentation.
- Prometheus remains private. Do not add emergency public routes for debugging.

## Archived compatibility links

Older root-level redirect stubs were retired. Use the current runbooks above, including the archived historical [Gateway API CRD cutover](platform/gateway-api-crd-cutover.md) only for pre-ADR-0007 context.
