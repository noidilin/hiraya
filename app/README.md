# Vintage Microservices — Deployment Guide

Shutdown the lab:

```sh
aws eks update-kubeconfig \
  --region ap-northeast-1 \
  --name devops-hiraya-dev-eks
# stop Argo CD from healing the app
kubectl delete application vintage -n argocd
# delete app namespace/PVCs safely
kubectl delete namespace vintage --wait=true --timeout=10m

# destroy terraform platform
cd infra/envs/dev/platform
terraform init -backend-config=backend.hcl
terraform plan -destroy
terraform destroy
```

## Local Development with Docker

Before deploying to the cloud, you can run the entire application locally using Docker Compose. This is the fastest way to test changes.

```bash
# Start with Docker Compose
cd app/microservices
docker-compose -f docker-compose.yml up -d
docker-compose -f docker-compose.yml down # Stop all services
```

---

## After Infrastructure Provisioning on AWS

```bash
# Connect kubectl to the cluster
aws eks update-kubeconfig \
  --region ap-northeast-1 \
  --name devops-hiraya-dev-eks

# Verify
kubectl get nodes
kubectl get pods -n argocd
```

---

## From Docker to Kubernetes

- Each service has a `Dockerfile` in its directory under `app/microservices/`.
- When deployed to Kubernetes, these become container images stored in ECR, referenced by the manifests in `gitops/k8s/`.
- During platform provisioning, Terraform installs ArgoCD and bootstraps the `vintage` ArgoCD Application. ArgoCD then syncs `gitops/` automatically, so first deploy no longer requires `kubectl apply -k gitops/`.

```bash
# Check the GitOps app and workload rollout after terraform apply
kubectl get application vintage -n argocd
kubectl get pods -n vintage
```

### Restore the database

The application needs seed data. The restore Job is included in `gitops/kustomization.yml`, so ArgoCD runs it during the first GitOps sync.

```bash
# Monitor it
kubectl get pods -n vintage -l job-name=vintage-db-restore # It will go Running → Completed

# Check restore logs
kubectl logs -n vintage -l job-name=vintage-db-restore
```

---

## Setting Up the CI/CD Pipeline

- The GitHub Actions pipeline (`.github/workflows/ci.yml`) automatically builds Docker images and pushes them to ECR on every push to `main`.
- It then updates the image tags in the k8s manifests so ArgoCD can sync the new version.

---

## Setting Up ArgoCD (GitOps)

ArgoCD watches the `main` branch of this repo. Any change pushed to `gitops/` is automatically synced to the cluster — no manual `kubectl apply` needed for first deploy or later rollouts.

- ArgoCD is installed by Terraform into the `argocd` namespace
- Terraform bootstraps the `vintage` **Application** through the ArgoCD Helm release, using `infra/modules/argocd/application.yml`
- The Application tells ArgoCD which repo, branch, and path to watch
- When the CI pipeline updates image tags and commits to `main`, ArgoCD detects the change and rolls out the new pods automatically

```bash
# Check sync status
kubectl get application -n argocd # should see `STATUS: Synced` and `HEALTH: Healthy` once initial sync completes

# Username: `admin`
# Get the admin password:
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 --decode
```

---

## Prometheus

Prometheus is installed by Terraform via `kube-prometheus-stack`. It scrapes metrics from the cluster and the vintage services.

## Grafana

Grafana is also installed by `kube-prometheus-stack`. It is pre-configured with Prometheus as a datasource and comes with a custom vintage dashboard automatically loaded.

```bash
# Username: `admin`
# Get the admin password
kubectl get secret kube-prometheus-stack-grafana -n monitoring \
  -o jsonpath="{.data.admin-password}" | base64 --decode
```

## Log Forwarding to CloudWatch

Logs appear in **CloudWatch → Log groups → `/eks/vintage/pods`**.

Terraform manages this through `infra/modules/fluent-bit`:

- Creates the `/eks/vintage/pods` CloudWatch log group.
- Creates an IRSA role for `system:serviceaccount:amazon-cloudwatch:aws-for-fluent-bit`.
- Adds the inline `FluentBitCloudWatchPolicy` with scoped CloudWatch Logs write access.
- Installs the `aws-for-fluent-bit` Helm chart in the `amazon-cloudwatch` namespace.

Verify:

```bash
kubectl get pods -n amazon-cloudwatch
kubectl logs -n amazon-cloudwatch daemonset/aws-for-fluent-bit
```
