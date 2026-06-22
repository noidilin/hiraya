# Deploy dev platform

Related: [infra CI/CD PRD #13](https://github.com/noidilin/hiraya/issues/13), [runbook issue #19](https://github.com/noidilin/hiraya/issues/19), [ADR 0001: EKS network redesign](../../adr/0001-eks-network-redesign.md), [infra workflow implementation plan](../../plan/infra-ci-workflow.md), [infra README](../../../infra/README.md).

## When to use this

Use this runbook to manually deploy or recreate the disposable dev EKS platform from `main` using `.github/workflows/infra-deploy.yml`.

## Do not use this when

- Bootstrap OIDC roles do not exist yet. Use [bootstrap-infra-workflows.md](bootstrap-infra-workflows.md).
- You need to delete the platform. Use [destroy-dev-platform.md](destroy-dev-platform.md).
- You need to roll back one service image. Use [../services/rollback-dev-service-image.md](../services/rollback-dev-service-image.md).

## Safety boundary

The deploy workflow manages only `infra/envs/dev/platform`, including:

- VPC, public/private subnets, route tables, Internet Gateway, NAT Gateway, and S3 Gateway VPC endpoint.
- EKS cluster, private managed node group, EKS OIDC provider, and Terraform-managed Kubernetes/Helm resources.
- ACM certificate and DNS validation records for `hiraya.noidilin.dev` and `*.hiraya.noidilin.dev`.
- AWS Load Balancer Controller, Gateway API CRDs, ExternalDNS, shared `edge/public` Gateway, Argo CD, monitoring/Grafana/Prometheus, and Fluent Bit.
- Terraform-owned admin HTTPRoutes and generated Argo CD/Grafana credentials stored in Terraform state.

Do not modify or destroy durable bootstrap resources from this runbook.

## Prerequisites

1. Target workflow code is merged to `main`.
2. Bootstrap Terraform has created the GitHub infra plan/apply roles.
3. The repository has a GitHub Environment named `dev` with required reviewers or equivalent approval controls.
4. GitHub Actions OIDC is enabled through bootstrap trust policies; no long-lived AWS access keys are required.
5. The maintainer can access workflow artifacts, job summaries, AWS console/CLI evidence, and Kubernetes route checks.
6. Generated Argo CD and Grafana credentials are treated as secrets.

## Procedure

Use `infra-deploy` only from `main`. It is intentionally `workflow_dispatch` only.

1. In GitHub Actions, select `infra-deploy`.
2. Choose branch `main` and run the workflow.
3. Before approval, review the `Pre-approval platform plan` job:
   - It assumes the infra plan role.
   - It initializes and validates `infra/envs/dev/platform`.
   - It runs a full refreshed Terraform plan.
   - It uploads `terraform-preflight-plan-dev-platform-<sha>`.
   - It writes a summary to the workflow step summary.
4. Capture evidence before approval:
   - Commit SHA.
   - Preflight plan summary.
   - Uploaded preflight plan artifact name.
   - Any destructive changes you intend to approve.
5. Approve the `dev` GitHub Environment gate only after reviewing the plan.
6. Confirm the `Apply disposable dev platform` job:
   - Assumes the infra apply role through OIDC.
   - Creates a fresh post-approval binary plan.
   - Applies that exact local binary plan.
   - Runs `.github/scripts/platform-route-smoke.sh`.

Sensitive credential warning: route smoke and summaries must not retrieve or print Argo CD or Grafana admin passwords.

## Validation

Use workflow smoke output first, then run local checks if extra evidence is needed.

### EKS reachability

```bash
aws eks update-kubeconfig --region ap-northeast-1 --name hiraya-dev
kubectl get nodes -o wide
kubectl get pods -A
aws eks describe-cluster --name hiraya-dev --region ap-northeast-1 \
  --query 'cluster.resourcesVpcConfig.{Private:endpointPrivateAccess,Public:endpointPublicAccess,PublicCidrs:publicAccessCidrs}'
```

Expected: EKS API is reachable, nodes are registered, private endpoint access is enabled, and any public API access is the explicit temporary dev setting.

### Gateway and HTTPRoute visibility

```bash
kubectl get gateway -A
kubectl get httproute -A
kubectl describe gateway -n edge public
kubectl describe httproute -n vintage frontend
kubectl describe httproute -n argocd argocd
kubectl describe httproute -n monitoring grafana
```

Expected: shared `edge/public` Gateway is accepted/programmed; Vintage Storefront, Argo CD, and Grafana HTTPRoutes are accepted and attached.

### Public route health

```bash
curl -I https://hiraya.noidilin.dev
curl -I https://argocd.hiraya.noidilin.dev
curl -I https://grafana.hiraya.noidilin.dev
```

Expected:

- Vintage Storefront route responds successfully.
- Argo CD route reaches the login/protected service.
- Grafana route reaches the login/protected service.
- HTTPS uses the expected ACM-backed certificate.

### GitOps and admin service posture

```bash
kubectl get pods -n argocd
kubectl get svc -n argocd argocd-server -o jsonpath='{.spec.type}{"\n"}'
kubectl get pods -n monitoring
kubectl get svc -n monitoring | grep -E 'grafana|prometheus'
kubectl get httproute -A | grep -i prometheus || true
```

Expected: Argo CD and Grafana are reachable through approved public routes; services remain `ClusterIP`; Prometheus has no public HTTPRoute and remains private/port-forward only.

## Evidence to capture

- Apply job result.
- Route-health smoke output showing EKS/node visibility, Gateway/HTTPRoute visibility, namespace visibility, and route checks.
- Workflow summary result.

## Recovery

If deploy fails after approval:

1. Preserve evidence before retrying: plan artifact, apply logs, route-smoke logs, Gateway/HTTPRoute descriptions, ExternalDNS logs, and relevant AWS console screenshots.
2. If the failure is an IAM gap, patch only the missing scoped bootstrap permission and rerun. See [../troubleshooting/infra-workflow-access-denied.md](../troubleshooting/infra-workflow-access-denied.md).
3. If the GitHub runner cannot reach or manage EKS, see [../troubleshooting/eks-github-runner-access.md](../troubleshooting/eks-github-runner-access.md).
4. If the platform is partially created and unrecoverable, use the approved destroy workflow, then redeploy from the last known-good `main` commit.
5. Keep Prometheus private; do not add emergency public routes for debugging.
