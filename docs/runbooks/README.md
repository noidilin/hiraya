# Runbooks

Use this page to choose a runbook by scenario or action. These runbooks target the dev Hiraya platform unless a page says otherwise.

## Platform operations

| I want to... | Use this runbook |
|---|---|
| Bootstrap GitHub OIDC roles for infra workflows | [platform/bootstrap-infra-workflows.md](platform/bootstrap-infra-workflows.md) |
| Validate Terraform plan comments on a trusted PR | [platform/validate-infra-pr-plan.md](platform/validate-infra-pr-plan.md) |
| Deploy or recreate the dev EKS platform | [platform/deploy-dev-platform.md](platform/deploy-dev-platform.md) |
| Destroy the disposable dev EKS platform | [platform/destroy-dev-platform.md](platform/destroy-dev-platform.md) |

## Portfolio operations

| I want to... | Use this runbook |
|---|---|
| First deploy the durable Portfolio Stack and Hiraya Guide | [portfolio/first-deploy.md](portfolio/first-deploy.md) |

## Service operations

| I want to... | Use this runbook |
|---|---|
| Roll back one dev service to an existing ECR image tag | [services/rollback-dev-service-image.md](services/rollback-dev-service-image.md) |

## Troubleshooting

| Symptom | Use this runbook |
|---|---|
| GitHub Actions receives AWS `AccessDenied` | [troubleshooting/infra-workflow-access-denied.md](troubleshooting/infra-workflow-access-denied.md) |
| GitHub-hosted runner cannot reach or manage EKS | [troubleshooting/eks-github-runner-access.md](troubleshooting/eks-github-runner-access.md) |

## Safety boundaries

Use the safety section inside the specific runbook before acting. For background, read [platform lifecycle](../architecture/platform-lifecycle.md), [ownership boundaries](../architecture/boundaries.md), and [GitOps ownership](../architecture/gitops-ownership.md).

Global cautions:

- Do not destroy Project Bootstrap during routine lab shutdown.
- Do not print generated Argo CD or Grafana credentials into logs, issue comments, screenshots, or documentation.
- Keep Prometheus private; do not add emergency public routes for debugging.
