# Troubleshoot GitHub runner EKS access

## When to use this

Use this runbook when a GitHub-hosted infra workflow has AWS credentials but fails to reach or manage the EKS cluster for Terraform Helm/Kubernetes operations.

## Common causes

- The existing EKS cluster was created by a different local principal, so the GitHub apply role does not have Kubernetes API admin access.
- The EKS API endpoint is private-only, but the workflow is running on a GitHub-hosted runner outside the VPC.

## Safety boundary

Do not make backend Services public as a workaround. Preserve the shared Gateway and private service exposure design. Keep Prometheus private.

## Existing-cluster access ownership

If the existing EKS cluster was created by a different local principal, the GitHub apply role may not initially have Kubernetes API admin access for Terraform-managed Helm/Kubernetes resources.

Safe rollout options:

1. Preferred for this disposable dev environment: destroy the existing platform locally, then let `infra-deploy` recreate it so the GitHub apply role becomes the consistent platform owner.
2. Alternatively, grant the apply role one-time cluster admin access through an EKS access entry or equivalent mapping before GitHub Actions manages the existing cluster.

After GitHub creates the platform, use the workflow path consistently for deploy/destroy.

## GitHub-hosted runner and EKS API access

GitHub-hosted deploy currently relies on the explicit temporary public EKS API endpoint. If the EKS API becomes private-only before a private-network runner exists, Terraform Helm/Kubernetes operations from GitHub-hosted runners will fail.

Move to a VPC-hosted/self-hosted runner before removing public EKS API access.

## Validation

From the workflow or an equivalent principal, confirm:

```bash
aws eks describe-cluster --name hiraya-dev --region ap-northeast-1 \
  --query 'cluster.resourcesVpcConfig.{Private:endpointPrivateAccess,Public:endpointPublicAccess,PublicCidrs:publicAccessCidrs}'
kubectl get nodes
kubectl get namespace
```

Expected: the runner can reach the API endpoint and the apply role is authorized for Terraform-managed Kubernetes and Helm resources.

## Evidence to capture

- Workflow failure step and error.
- EKS endpoint access configuration.
- Current cluster access entry or auth mapping for the apply role.
- Validation command output after remediation.
