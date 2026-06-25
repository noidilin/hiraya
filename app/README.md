# Vintage Microservices — Deployment Guide

## Shutdown the lab safely

The normal lab shutdown destroys only the disposable dev layers:

- `infra/envs/dev/cluster-bootstrap`: Argo CD, AppProjects, and the root GitOps handoff.
- `infra/envs/dev/platform-core`: EKS, worker nodes, VPC, NAT Gateway, controller IAM/IRSA, disposable admin secrets, and AWS/EKS foundation resources.

Do **not** destroy `infra/envs/dev/bootstrap` for routine lab shutdown. Bootstrap owns durable/shared resources such as ECR repositories, GitHub OIDC roles, remote-state dependencies, and the durable Vintage Storefront secret.

Use the current destroy workflow/runbook instead of the retired monolithic `infra/envs/dev/platform` stack:

- `.github/workflows/infra-destroy.yml`
- `docs/runbooks/platform/destroy-dev-platform.md`

After shutdown, verify the EKS cluster is gone:

```sh
aws eks describe-cluster \
  --region ap-northeast-1 \
  --name devops-hiraya-dev-eks
```

Expected result: AWS returns `ResourceNotFoundException`.

## Local Development with Docker

Before deploying to the cloud, you can run the entire application locally using Docker Compose. This is the fastest way to test changes.

```bash
# Start with Docker Compose from the repository root
pnpm run docker:up
pnpm run docker:down # Stop all services
```

The Compose file remains colocated with the Vintage Storefront stack at `app/microservices/docker-compose.yml`, while root scripts provide the canonical command surface.

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
- When deployed to Kubernetes, these become container images stored in ECR, referenced by the manifests in `gitops/apps/vintage/`.
- During platform provisioning, Platform Core creates AWS/EKS foundations, Cluster Bootstrap installs Argo CD and the root app-of-apps, and Argo CD syncs `gitops/` automatically. First deploy no longer requires `kubectl apply -k gitops/`.

```bash
# Check the GitOps app and workload rollout after terraform apply
kubectl get application vintage -n argocd
kubectl get pods -n vintage
```

### Restore the database

The application needs seed data. The restore Job is included in `gitops/apps/vintage/kustomization.yml`, so Argo CD runs it during the first GitOps sync.

```bash
# Monitor it
kubectl get pods -n vintage -l job-name=vintage-db-restore # It will go Running → Completed

# Check restore logs
kubectl logs -n vintage -l job-name=vintage-db-restore
```

---

## Setting Up the CI/CD Pipeline

- The GitHub Actions pipeline (`.github/workflows/image-ci.yml`) automatically builds Docker images and pushes them to ECR on every push to `main`.
- It then updates the image tags in the k8s manifests so ArgoCD can sync the new version.

---

## Setting Up ArgoCD (GitOps)

ArgoCD watches the `main` branch of this repo. Any change pushed to `gitops/` is automatically synced to the cluster — no manual `kubectl apply` needed for first deploy or later rollouts.

- Cluster Bootstrap Terraform installs Argo CD into the `argocd` namespace.
- Cluster Bootstrap creates the root `hiraya-root` Application pointed at `gitops/clusters/dev/root`.
- The root app creates child Applications for Cluster Platform add-ons and Vintage.
- When the CI pipeline updates image tags and commits to `main`, Argo CD detects the change and rolls out the new pods automatically.

```bash
# Check sync status
kubectl get application -n argocd # should see `STATUS: Synced` and `HEALTH: Healthy` once initial sync completes

# Username: `admin`
# Get the admin password from AWS Secrets Manager:
aws secretsmanager get-secret-value \
  --region ap-northeast-1 \
  --secret-id /hiraya/dev/platform/argocd-admin \
  --query SecretString \
  --output text
```

---

## Prometheus

Prometheus is installed by Argo CD through the Cluster Platform monitoring Application. It scrapes metrics from the cluster and the vintage services.

## Grafana

Grafana is installed by the same monitoring Application. It is pre-configured with Prometheus as a datasource and comes with a custom vintage dashboard automatically loaded.

```bash
# Username: `admin`
# Get the admin password from AWS Secrets Manager
aws secretsmanager get-secret-value \
  --region ap-northeast-1 \
  --secret-id /hiraya/dev/platform/grafana-admin \
  --query SecretString \
  --output text
```

## Log Forwarding

Pod log forwarding is not part of the current dev platform. Fluent Bit and the former CloudWatch pod log group were removed after the GitOps refactor; future AIOps work should introduce a fresh logging design instead of relying on dormant scaffold.
