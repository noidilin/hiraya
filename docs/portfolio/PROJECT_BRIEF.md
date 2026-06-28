---
title: Project Brief
audience: portfolio_visitor
category: project_brief
last_reviewed: 2026-06-27
---

# Project Brief

Hiraya is an end-to-end DevOps portfolio project built around the **Hiraya EKS Project**: a disposable AWS EKS platform that runs the **Vintage Storefront** microservice workload and demonstrates how application delivery, infrastructure automation, GitOps, observability, and security boundaries fit together.

The project is intentionally a dev-environment platform rather than a production retail system. Its purpose is to make the delivery architecture reviewable: a Portfolio Visitor can see how code moves from local development to CI validation, container images, GitOps manifests, EKS workloads, public routing, and operational dashboards.

## What the project demonstrates

Hiraya demonstrates a complete delivery path for a cloud-native workload:

- A React/Vite storefront served behind a same-origin API path.
- Node.js backend services for authentication, catalog browsing, and order flows.
- PostgreSQL-backed service data with reproducible local and deployed seed data.
- Docker Compose for local full-stack validation.
- GitHub Actions for pull-request validation, image builds, image promotion, infrastructure workflows, and deploy smoke checks.
- Terraform for durable bootstrap resources and the disposable AWS/EKS foundation.
- Argo CD and Kustomize for in-cluster desired state reconciliation.
- Gateway API, AWS Load Balancer Controller, ExternalDNS, ACM, and Route 53 for public HTTPS access.
- Prometheus and Grafana for the current metrics and dashboard surface.

## Product workload

The Vintage Storefront is the concrete workload used to prove the platform. Portfolio Visitors can understand the system through three user-facing flows:

1. Browse the Hiraya Furugi Catalog.
2. Sign in with the seeded demo customer.
3. Create and inspect orders through the Storefront API path.

Those flows are backed by an active service path of frontend, gateway, auth, product-service, orders, and PostgreSQL. The storefront keeps the public browser contract simple: the browser talks to the frontend origin, the frontend proxies `/api` to the gateway, and backend services remain private inside the cluster.

## Platform boundary

The Hiraya EKS Project is deliberately disposable. The cluster, worker nodes, in-cluster controllers, routes, app workloads, and dev database can be destroyed to control cost. Durable foundations such as ECR repositories, GitHub OIDC roles, Terraform state access, and long-lived workload secrets are kept outside that routine destroy boundary.

This separation is one of the main portfolio points: the project distinguishes foundations that must survive rebuilds from platform layers that should be reproducible from code.

## Documentation and assistant boundary

These curated documents are the knowledge source for Hiraya Guide. They are written for Portfolio Visitors and explain the EKS project in polished but truthful language. Hiraya Guide should answer from these reviewed documents, cite the curated corpus, and avoid claiming live operational access or hidden implementation details.

## Current posture

Hiraya should be read as a strong dev-platform demonstration with explicit limits. It is not claiming production certification, formal compliance, or unlimited scale. The project records accepted risks and deferred hardening work so reviewers can evaluate both the implemented architecture and the engineering judgment behind it.
