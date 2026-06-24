## 0. Docs already started

Updated/created:

- `CONTEXT.md`
- `docs/adr/0001-eks-network-redesign.md`
- `docs/adr/0002-aiops-cloudwatch-metrics-via-adot.md`
- `docs/adr/0007-gitops-owned-cluster-platform.md`
- `docs/plan/aiops-react-cloudfront-adot.md`

## 1. Project Bootstrap

Update `infra/envs/dev/bootstrap`:

- Add GitHub OIDC **cluster-bootstrap role**.
- Add state access for `dev/cluster-bootstrap`.
- Add durable Vintage Secrets Manager JSON secret under `/hiraya/dev/apps/vintage`.
- Output:
  - cluster-bootstrap role ARN
  - Vintage secret ARN/name
  - backend config data for new states.
- Keep Project Bootstrap manual/local apply.

## 2. Platform Core

Create `infra/envs/dev/platform-core` with state key:

```text
devops-hiraya-dev/dev/platform-core/terraform.tfstate
```

Platform Core owns:

- VPC, subnets, NAT, S3 endpoint
- EKS cluster/node group
- EKS managed add-ons, especially EBS CSI
- ACM cert and DNS validation
- IAM/IRSA roles for:
  - AWS LBC
  - ExternalDNS
  - Fluent Bit
  - ESO
- CloudWatch pod log group renamed to:

```text
/eks/hiraya/dev/pods
```

- Argo/Grafana admin Secrets Manager secrets.
- No Kubernetes or Helm providers.
- EKS admin access only for:
  - Dev SSO role
  - GitHub cluster-bootstrap role

Also:

- Remove Kubernetes API access from plan/core-apply roles.
- Remove unused WAF/Shield permissions from LBC IRSA.
- Force-delete disposable admin secrets on destroy.

## 3. Cluster Bootstrap

Create `infra/envs/dev/cluster-bootstrap` with state key:

```text
devops-hiraya-dev/dev/cluster-bootstrap/terraform.tfstate
```

Cluster Bootstrap owns only:

- `argocd` namespace with Public Gateway Access label
- Argo CD Helm release
- Argo admin password hash from Platform Core secret JSON
- AppProjects
- Root Argo Application via `kubernetes_manifest`

Root app:

```text
repo: https://github.com/noidilin/hiraya.git
revision: main
path: gitops/clusters/dev/root
```

## 4. GitOps tree

Move to:

```text
gitops/
  clusters/dev/root/
  platform/
  apps/vintage/
```

Cluster Platform:

- One Argo Application per add-on.
- Use Argo multi-source for remote Helm charts + adjacent values/manifests.
- Vendor Gateway/AWS LBC CRDs.
- Protect CRDs from prune.
- Preserve service-account subjects.
- Use full stable IRSA role ARNs.
- Avoid dynamic IDs:
  - no committed VPC ID
  - no committed ACM cert ARN
  - rely on AWS LBC VPC/cert discovery
- Edge app owns Gateway/GatewayClass/config/redirect.
- Service owners own HTTPRoutes.
- Platform owns public namespaces except `argocd`, which Cluster Bootstrap owns.
- ESO materializes secrets by stable secret names.
- Vintage replaces plaintext `Secret` with `ExternalSecret`.
- ADOT deferred.

## 5. CI/CD

Update workflows/scripts:

- Generic backend writer for multiple stacks.
- PR CI:
  - Terraform fmt/validate/test
  - fast `platform-core` plan with `-refresh=false`
  - GitOps render + schema lint
  - no cluster access
- Deploy:
  - pre-approval full refreshed Platform Core plan
  - environment approval
  - apply Platform Core
  - post-approval Cluster Bootstrap plan/apply
  - K8s + public route smoke using bootstrap role
- GitOps CD:
  - CI validates only
  - Argo auto-syncs from `main`
- Update image-pipeline catalog/scripts/tests for new `gitops/apps/vintage/...` paths.

## 6. Destroy workflow

Order matters:

1. Assume cluster-bootstrap role.
2. Suspend root Argo app.
3. Delete workload apps first.
4. Wait for Vintage PVC/PV/EBS cleanup.
5. Delete service/route apps.
6. Keep LBC and ExternalDNS running until ALB/DNS cleanup completes.
7. Delete controller apps.
8. Destroy Cluster Bootstrap.
9. Assume core apply role.
10. Destroy Platform Core.

## 7. Rollout

Because this is one PR:

1. Merge PR to `main`.
2. Locally apply Project Bootstrap from `main`.
3. Run `infra-deploy`.
4. Confirm CI + deploy + Argo health + public routes.
5. Run destroy.
6. Leave dev infra destroyed.

Sources:

- [AWS Load Balancer Controller Gateway API](https://kubernetes-sigs.github.io/aws-load-balancer-controller/latest/guide/gateway/gateway/)
- [AWS Load Balancer Controller LoadBalancerConfiguration](https://kubernetes-sigs.github.io/aws-load-balancer-controller/latest/guide/gateway/loadbalancerconfig/)
