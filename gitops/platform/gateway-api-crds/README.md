# Gateway and AWS Load Balancer Controller CRDs

Vendored CRD base for the Hiraya dev Cluster Platform.

Pinned sources:

- Gateway API CRDs: upstream Gateway API release `v1.5.0`, exported with:

```bash
curl -L https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.5.0/standard-install.yaml
curl -L https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.5.0/experimental-install.yaml
```
- AWS Load Balancer Controller CRDs: Helm chart `aws-load-balancer-controller` `3.4.0` (`appVersion: v3.4.0`), exported with:

```bash
helm repo add eks https://aws.github.io/eks-charts
helm show crds eks/aws-load-balancer-controller --version 3.4.0
```

All CRDs include `argocd.argoproj.io/sync-options: Prune=false` so deleting the child Application cannot accidentally prune dependent custom resources during normal GitOps cleanup.
