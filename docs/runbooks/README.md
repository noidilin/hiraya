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
- Disposable platform resources under `infra/envs/dev/platform` may be recreated in dev.
- Generated Argo CD and Grafana credentials are secrets. Do not print them into workflow logs, issue comments, screenshots, or documentation.
- Prometheus remains private. Do not add emergency public routes for debugging.

## Archived compatibility links

Older links still exist as redirect stubs:

- [dev-platform-cutover.md](dev-platform-cutover.md)
- [dev-service-rollback.md](dev-service-rollback.md)
- [gateway-api-crd-cutover.md](gateway-api-crd-cutover.md)
