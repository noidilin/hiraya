---
title: Architecture Overview
audience: portfolio_visitor
category: architecture
last_reviewed: 2026-06-27
---

# Architecture Overview

The Hiraya EKS Project is a layered dev platform for delivering the Vintage Storefront on AWS EKS. Its architecture is designed to show the full path from application code to public HTTPS traffic while keeping the platform reproducible, observable, and safe to destroy when the lab is not needed.

## Architecture goals

The architecture optimizes for four portfolio goals:

1. **Clear delivery path**: every major step from source code to running pods is visible in GitHub Actions, Terraform, GitOps, or Kubernetes manifests.
2. **Disposable runtime**: expensive dev runtime layers can be rebuilt instead of manually repaired.
3. **Private workload boundary**: backend services and PostgreSQL are private to the cluster; only the storefront route is public.
4. **Honest operations surface**: metrics and dashboards exist, while deferred hardening areas remain documented rather than hidden.

## AWS foundation

The platform runs in `ap-northeast-1` on a dedicated VPC. Public edge subnets host internet-facing load balancer resources, while EKS worker nodes run in private workload subnets.

| Layer | Main components | Role in the architecture |
|---|---|---|
| Network | VPC, public subnets, private subnets, route tables | Separates public ingress from private workloads. |
| Egress | NAT Gateway, S3 Gateway VPC Endpoint | Lets private nodes reach required external services while reducing S3 traffic through NAT. |
| DNS and TLS | Route 53, ACM, ExternalDNS | Provides public hostnames and HTTPS certificates. |
| Compute | EKS control plane, managed node group, Spot EC2 nodes | Runs platform controllers and application pods. |
| Storage | EBS CSI Driver, gp3 persistent volume | Supports the dev PostgreSQL database. |
| Registry and secrets | ECR, Secrets Manager, IRSA, External Secrets Operator | Stores service images and maps cloud secrets to Kubernetes consumers. |

## Platform layers

Hiraya separates platform ownership into layers so a reviewer can understand what survives a rebuild and what is recreated.

| Layer | Owner | Responsibility |
|---|---|---|
| Project Bootstrap | Terraform | Durable CI/CD foundation: ECR repositories, GitHub OIDC roles, Terraform state access, and durable workload secrets. |
| Platform Core | Terraform | Disposable AWS/EKS foundation: VPC, EKS, node group, IAM, Route 53/ACM prerequisites, storage integration, and controller-side IAM. |
| Cluster Bootstrap | Terraform and Helm | Reproducible handoff into GitOps: Argo CD installation, AppProjects, and the root GitOps Application. |
| Cluster Platform | Argo CD | Shared in-cluster capabilities: Gateway API CRDs, AWS Load Balancer Controller, ExternalDNS, External Secrets Operator, monitoring, and edge routing. |
| Vintage Application | Argo CD | Storefront deployments, services, database state, restore job, public HTTPRoute, and Grafana dashboard data. |

This split keeps Terraform focused on cloud foundations and lets Argo CD own long-lived Kubernetes desired state.

## Public traffic path

The public Storefront path is intentionally same-origin. A browser does not call backend services directly.

```text
Portfolio Visitor
  → Route 53
  → AWS Application Load Balancer
  → Gateway API shared edge Gateway
  → Vintage Storefront HTTPRoute
  → frontend Service
  → nginx static assets or /api proxy
  → gateway Service
  → private backend service
  → PostgreSQL
```

The public Storefront hostname is `https://hiraya.noidilin.dev`. Platform admin surfaces such as Argo CD and Grafana can also be routed publicly in the dev environment with generated credentials, but they are not part of the public customer path.

## Active Storefront service path

The visitor-facing Storefront path uses these components:

| Component | Responsibility | Connectivity role |
|---|---|---|
| `frontend` | Serves the React/Vite storefront through nginx and proxies `/api` requests. | Public entrypoint through Gateway API. |
| `gateway` | Aggregates Storefront API routes and forwards to private backend services. | Private API entrypoint for the frontend. |
| `auth` | Handles demo login and authentication responses. | Private backend service. |
| `product-service` | Serves catalog and product data for the Hiraya Furugi Catalog. | Private backend service. |
| `orders` | Handles active Storefront order history and checkout creation. | Private backend service. |
| `vintage-postgres` | Stores dev data for authentication, products, and orders. | Private StatefulSet with persistent storage. |

The shared API contract uses a predictable response envelope: successful responses return `success: true` with data or a message, while failures return `success: false` with an error.

## Application request flows

```text
Page load:
Browser → frontend → static SPA assets

Catalog browsing:
Browser → /api/products → frontend proxy → gateway → product-service → PostgreSQL

Authentication:
Browser → /api/auth/* → frontend proxy → gateway → auth → PostgreSQL

Checkout and order history:
Browser → /api/orders/* → frontend proxy → gateway → orders → PostgreSQL
```

These flows keep the frontend simple for Portfolio Visitors while still demonstrating private service-to-service communication inside Kubernetes.

## Local development architecture

Docker Compose mirrors the major runtime boundaries without requiring AWS credentials. It starts PostgreSQL, Prometheus, Grafana, the frontend, the gateway, and backend services on a local bridge network. The production-like local path serves the built storefront through nginx on `http://localhost:3000`; a separate Compose profile runs Vite hot reload against the same backend stack.

The full-stack local smoke resets database volumes, starts the stack, checks the storefront shell, validates the product envelope, verifies image assets, logs in with the demo customer, checks seeded order history, creates a pending checkout order, and tears the stack down.

## Observability architecture

Prometheus and Grafana form the current observability surface. GitOps installs monitoring components and loads a Vintage dashboard through a ConfigMap. The platform currently emphasizes metrics and dashboard visibility. Pod log forwarding to CloudWatch is deferred until the AIOps logging design is reintroduced, so the architecture should not be read as having an active log-ingestion pipeline.

## Rebuild and destroy model

The dev platform is designed to be destroyed and recreated cleanly. Routine shutdown destroys Cluster Bootstrap and Platform Core while keeping Project Bootstrap. That preserves durable state needed for later deployments while removing the costly EKS runtime.

This rebuild model is a deliberate design choice: for a portfolio-scale dev environment, reproducibility and cost control matter more than preserving every runtime object in place.

## Production hardening not claimed

The architecture is strong enough to demonstrate end-to-end delivery, but it is not presented as production-complete. Future hardening would include stricter EKS API access, private runner access, Kubernetes NetworkPolicy, stronger admin UI access controls, more complete resource requests and autoscaling, broader ServiceMonitor coverage, and a managed database option such as RDS or Aurora.
