# Deploy dev platform

Related: [platform lifecycle](../../architecture/platform-lifecycle.md), [ownership boundaries](../../architecture/boundaries.md), [ADR 0007: GitOps-owned Cluster Platform](../../adr/0007-gitops-owned-cluster-platform.md), [infra README](../../../infra/README.md), [bootstrap runbook](bootstrap-infra-workflows.md), [destroy runbook](destroy-dev-platform.md).

## When to use this

Use this runbook to manually deploy or recreate the disposable Hiraya dev EKS platform from `main` using `.github/workflows/infra-deploy.yml`.

## Do not use this when

- Project Bootstrap has not been applied from current `main`. Apply [bootstrap-infra-workflows.md](bootstrap-infra-workflows.md) first.
- You need to delete the platform. Use [destroy-dev-platform.md](destroy-dev-platform.md).
- You need to roll back one service image. Use [../services/rollback-dev-service-image.md](../services/rollback-dev-service-image.md).

## Safety boundary

The deploy workflow manages only disposable layers after Project Bootstrap exists:

- `infra/envs/dev/platform-core` creates the AWS/EKS foundation and non-secret outputs.
- `infra/envs/dev/cluster-bootstrap` installs Argo CD and hands control to GitOps.
- Argo CD then reconciles Cluster Platform and GitOps Apps from `main`.

Do not modify or destroy durable Project Bootstrap resources from this runbook. Do not retrieve or print Argo CD or Grafana admin passwords in workflow logs; Operators read them directly from AWS Secrets Manager if needed.

## Prerequisites

1. Target workflow code is merged to `main`.
2. Project Bootstrap has been applied from `main`, including the GitHub cluster-bootstrap role and durable `/hiraya/dev/apps/vintage` secret.
3. The repository has a GitHub Environment named `dev` with required reviewers or equivalent approval controls.
4. GitHub Actions OIDC is enabled through Project Bootstrap trust policies; no long-lived AWS access keys are required.
5. The maintainer can access workflow artifacts, job summaries, AWS console/CLI evidence, and Kubernetes route checks.

## Procedure

Use `infra-deploy` only from `main`. It is intentionally `workflow_dispatch` only.

1. In GitHub Actions, select `infra-deploy`.
2. Choose branch `main` and run the workflow.
3. Before approval, review the Platform Core preflight plan:
   - It assumes the infra plan role.
   - It initializes and validates `infra/envs/dev/platform-core`.
   - It runs a full refreshed Terraform plan for Platform Core only.
   - It uploads the Platform Core plan artifact and writes a summary.
4. Capture evidence before approval:
   - Commit SHA.
   - Platform Core plan summary.
   - Uploaded preflight plan artifact name.
   - Any destructive changes you intend to approve.
5. Approve the `dev` GitHub Environment gate only after reviewing the plan.
6. Confirm the Platform Core apply job:
   - Assumes the infra apply role through OIDC.
   - Creates a fresh post-approval Platform Core binary plan.
   - Applies that local binary plan.
7. Confirm the Cluster Bootstrap apply job:
   - Runs only after Platform Core succeeds.
   - Assumes the GitHub cluster-bootstrap role.
   - Initializes and applies `infra/envs/dev/cluster-bootstrap`.
   - Installs Argo CD, AppProjects, and the root `hiraya-root` Application.
8. Confirm the smoke job:
   - Uses the cluster-bootstrap role for Kubernetes checks.
   - Waits for Argo child Applications to become synced/healthy.
   - Checks namespaces, Gateway/HTTPRoutes, pods, and public routes.
   - Does not call the Argo CD API and does not require Argo credentials.

## Validation

Use workflow smoke output first, then run local checks if extra evidence is needed.

### EKS reachability

```bash
aws eks update-kubeconfig --region ap-northeast-1 --name devops-hiraya-dev-eks
kubectl get nodes -o wide
kubectl get pods -A
aws eks describe-cluster --name devops-hiraya-dev-eks --region ap-northeast-1 \
  --query 'cluster.resourcesVpcConfig.{Private:endpointPrivateAccess,Public:endpointPublicAccess,PublicCidrs:publicAccessCidrs}'
```

Expected: EKS API is reachable, nodes are registered, private endpoint access is enabled, and any public API access is the explicit temporary dev setting for GitHub-hosted deploy/bootstrap/smoke jobs.

### GitOps convergence

```bash
kubectl get applications.argoproj.io -n argocd
kubectl get appprojects.argoproj.io -n argocd
kubectl get ns argocd edge monitoring vintage external-dns external-secrets
```

Expected: `hiraya-root` and child Applications are present and synced/healthy; `argocd` exists from Cluster Bootstrap; public workload/platform namespaces exist from Cluster Platform. Pod log forwarding is intentionally absent until future AIOps logging design work.

### Gateway and HTTPRoute visibility

```bash
kubectl get gateway -A
kubectl get httproute -A
kubectl describe gateway -n edge public
kubectl describe httproute -n vintage frontend
kubectl describe httproute -n argocd argocd
kubectl describe httproute -n monitoring grafana
```

Expected: shared `edge/public` Gateway is accepted/programmed; Vintage Storefront, Argo CD, and Grafana HTTPRoutes are accepted and attached. Edge owns only shared Gateway policy and redirect resources; service owners own their HTTPRoutes.

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
- HTTPS uses the expected Platform Core ACM-backed certificate discovered by AWS Load Balancer Controller.

### Observability and admin service posture

```bash
kubectl get pods -n argocd
kubectl get svc -n argocd argocd-server -o jsonpath='{.spec.type}{"\n"}'
kubectl get pods -n monitoring
kubectl get svc -n monitoring | grep -E 'grafana|prometheus'
! kubectl get ns amazon-cloudwatch
```

Expected: Argo CD and Grafana are reachable through approved public routes; services remain `ClusterIP`; Prometheus has no public HTTPRoute and remains private/port-forward only. Pod log forwarding is not deployed; the `amazon-cloudwatch` namespace should be absent unless a future AIOps logging design reintroduces it.

## Evidence to capture

- Platform Core preflight plan summary and approval record.
- Platform Core apply result.
- Cluster Bootstrap apply result.
- Route-health smoke output showing EKS/node visibility, Argo Application health, Gateway/HTTPRoute visibility, namespace visibility, and route checks.
- Workflow summary result.

## Recovery

If deploy fails after approval:

1. Preserve evidence before retrying: plan artifact, apply logs, route-smoke logs, Argo Application status, Gateway/HTTPRoute descriptions, ExternalDNS logs, and relevant AWS console screenshots.
2. If the failure is an IAM gap, patch only the missing scoped permission and rerun. See [../troubleshooting/infra-workflow-access-denied.md](../troubleshooting/infra-workflow-access-denied.md).
3. If the GitHub runner cannot reach or manage EKS, see [../troubleshooting/eks-github-runner-access.md](../troubleshooting/eks-github-runner-access.md).
4. If Cluster Bootstrap/GitOps sync fails, use the Dev SSO role or cluster-bootstrap role to inspect Argo/Kubernetes state, fix GitOps, and rerun bootstrap/smoke.
5. If the platform is partially created and unrecoverable, use the approved destroy workflow, then redeploy from the last known-good `main` commit.
6. Keep Prometheus private; do not add emergency public routes for debugging.
