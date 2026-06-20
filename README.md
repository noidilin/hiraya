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
| Log Forwarding | AWS Fluent Bit → CloudWatch |
| AIOps | AWS Bedrock Agent (Kira) |

## Structure

- Terraform owns AWS infra + EKS platform add-ons
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
  → creates AWS/EKS platform
  → installs ArgoCD + monitoring
  → registers the GitOps Application

ArgoCD
  → clones repo
  → reads gitops/
  → applies manifests into EKS
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
