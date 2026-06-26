# DevOps + AIOps Series

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Application | React, Node.js, PostgreSQL |
| Containers | Docker, Docker Compose |
| Orchestration | Kubernetes (AWS EKS) |
| Infrastructure | Terraform |
| CI/CD | GitHub Actions |
| GitOps | ArgoCD + Kustomize |
| Monitoring | Prometheus + Grafana |
| Log Forwarding | Deferred until future AIOps logging design |
| AIOps | AWS Bedrock Agent (Kira) |

## Root pnpm monorepo

The repository root is the only pnpm workspace. Run package-manager, report, app baseline, changed-service, and Docker/Compose commands from the repository root.

```sh
corepack enable
corepack prepare pnpm@11.8.0 --activate
pnpm install --frozen-lockfile
```

Common root commands:

| Command | Purpose |
| --- | --- |
| `pnpm run app:baseline` | Run the no-AWS Vintage Storefront baseline used by PR checks. |
| `pnpm run app:smoke:compose` | Reset local Compose volumes, start the real Vintage Storefront stack, verify shell/API/auth/images/orders/checkout, and tear it down. |
| `pnpm run reports:permissions:validate` | Validate report control data and standards mappings. |
| `pnpm run reports:permissions` | Generate ignored report artifacts under `docs/reports/build/`. |
| `pnpm run services:changed -- --all` | Render the full service image matrix. Pass changed file paths instead of `--all` for targeted detection. |
| `pnpm run docker:build` | Build the Docker Compose stack using the root build context and `app/microservices/docker-compose.yml`. |
| `pnpm run docker:up` / `pnpm run docker:down` | Start or stop the production-like local Compose stack from the repository root. The Storefront is served by nginx on `http://localhost:3000` and proxies `/api/` to the gateway. Use `docker compose -f app/microservices/docker-compose.yml down --volumes` when intentionally resetting local database state. |
| `pnpm run docker:up:frontend-dev` | Start the profiled Vite hot-reload Storefront service on `http://localhost:3000` against the same Compose backend stack. |

## Structure

- Terraform owns AWS/EKS foundation resources; Argo CD owns in-cluster platform add-ons
- GitHub Actions owns image build/push + manifest image tag updates
- ECR stores built images
- ArgoCD owns application deployment into Kubernetes
- Kubernetes runs workloads and controllers
- Git repo is desired state for application layer

GitHub Actions
  → builds images
  → pushes to ECR
  → updates image tags in gitops manifests

Terraform
  → creates AWS/EKS foundation resources
  → installs Argo CD
  → creates the root GitOps Application handoff

Argo CD
  → clones repo
  → reads gitops/
  → applies platform add-ons and app manifests into EKS
  → keeps cluster in sync with Git

Kubernetes
  → runs Pods
  → creates Services
  → runs DB restore Job
  → exposes metrics through ServiceMonitor

---

## DevOps Project Implementation

- Docker containers and Docker Compose
- Infrastructure provisioning with Terraform
- Kubernetes deployments on EKS
- CI/CD pipelines with GitHub Actions
- GitOps automation with ArgoCD
- Observability with Prometheus and Grafana

---

## AIOps Integration

- Monitoring and anomaly detection
- Log analysis at scale
- Incident response automation
- DevOps troubleshooting
