# Gateway and AWS Load Balancer Controller CRDs

Vendored CRD base for the Hiraya dev Cluster Platform.

Pinned sources:

- Gateway API CRDs: `v1.5.0`, copied from `infra/modules/gateway-api-crds/chart/crds`.
- AWS Load Balancer Controller CRDs: Helm chart `aws-load-balancer-controller` `3.4.0` (`appVersion: v3.4.0`), exported with:

```bash
helm repo add eks https://aws.github.io/eks-charts
helm show crds eks/aws-load-balancer-controller --version 3.4.0
```

All CRDs include `argocd.argoproj.io/sync-options: Prune=false` so deleting the child Application cannot accidentally prune dependent custom resources during normal GitOps cleanup.
