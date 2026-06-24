# Troubleshoot GitHub runner EKS access

## When to use this

Use this runbook when a GitHub-hosted infra workflow has AWS credentials but fails to reach the EKS cluster for Cluster Bootstrap, smoke checks, or ordered GitOps cleanup.

## Common causes

- The existing EKS cluster was created by a different local principal, so the GitHub cluster-bootstrap role does not have Kubernetes API admin access.
- The EKS API endpoint is private-only, but the workflow is running on a GitHub-hosted runner outside the VPC.

## Safety boundary

Do not make backend Services public as a workaround. Preserve the shared Gateway and private service exposure design. Keep Prometheus private.

## Existing-cluster access ownership

Under ADR-0007, Platform Core grants EKS admin access only to configured Dev SSO principals and the GitHub cluster-bootstrap role from Project Bootstrap. GitHub plan and Platform Core apply roles should not receive Kubernetes API access.

Safe rollout options:

1. Preferred for this disposable dev environment: destroy the existing platform locally, then let `infra-deploy` recreate it so Platform Core creates the expected access entry for the cluster-bootstrap role.
2. Alternatively, grant the cluster-bootstrap role one-time cluster admin access through an EKS access entry or equivalent mapping before GitHub Actions runs Cluster Bootstrap or smoke checks.

After GitHub creates the platform, use the workflow path consistently for deploy/destroy.

## GitHub-hosted runner and EKS API access

GitHub-hosted deploy currently relies on the explicit temporary public EKS API endpoint. If the EKS API becomes private-only before a private-network runner exists, Cluster Bootstrap, smoke checks, and ordered GitOps cleanup from GitHub-hosted runners will fail.

Move to a VPC-hosted/self-hosted runner before removing public EKS API access.

## Validation

From the workflow or an equivalent principal, confirm:

```bash
aws eks describe-cluster --name devops-hiraya-dev-eks --region ap-northeast-1 \
  --query 'cluster.resourcesVpcConfig.{Private:endpointPrivateAccess,Public:endpointPublicAccess,PublicCidrs:publicAccessCidrs}'
kubectl get nodes
kubectl get namespace
```

Expected: the runner can reach the API endpoint and the cluster-bootstrap role is authorized for Cluster Bootstrap, smoke checks, and ordered GitOps cleanup.

## Evidence to capture

- Workflow failure step and error.
- EKS endpoint access configuration.
- Current cluster access entry or auth mapping for the cluster-bootstrap role.
- Validation command output after remediation.
