---
title: Key Architecture Decisions
audience: portfolio_visitor
category: decisions
last_reviewed: 2026-06-27
---

# Key Architecture Decisions

Hiraya records important choices as ADRs and curated explanations so a Portfolio Visitor can understand not only what exists, but why the platform is shaped this way. The key decisions below explain the EKS project as an end-to-end DevOps system rather than a single app demo.

## Use EKS for the workload demonstration

Vintage Storefront remains the main EKS and GitOps workload. This keeps Kubernetes scheduling, service discovery, ingress, image promotion, controller integration, and operational dashboards visible in the project.

The trade-off is cost and complexity. A simpler portfolio could use only static hosting or a single container service, but that would not demonstrate the platform skills Hiraya is intended to show.

## Keep the dev runtime disposable

The EKS cluster and in-cluster runtime are treated as disposable dev infrastructure. The project can destroy Platform Core and Cluster Bootstrap to control cost while keeping Project Bootstrap resources such as ECR repositories, GitHub OIDC roles, Terraform state access, and durable workload secrets.

This decision favors reproducibility over preserving runtime state. For a portfolio-scale dev platform, being able to rebuild cleanly from code is more valuable than maintaining a long-lived cluster at all times.

## Split Terraform and GitOps ownership

Terraform owns AWS and EKS foundations. Argo CD owns long-lived Kubernetes desired state after the cluster bootstrap handoff.

This avoids a common ownership problem where Terraform, Helm, and GitOps all compete to manage the same in-cluster resources. It also makes responsibilities easier to explain:

- Project Bootstrap creates durable CI/CD foundations.
- Platform Core creates AWS/EKS foundations.
- Cluster Bootstrap installs Argo CD and the root handoff.
- Argo CD reconciles platform add-ons and Storefront workloads.

## Use a shared public edge

Public traffic enters through a shared Gateway API edge backed by AWS load balancing, DNS, and TLS automation. The Storefront is exposed publicly, while backend services and PostgreSQL remain private.

This demonstrates a realistic Kubernetes ingress pattern without creating separate public load balancers for every service.

## Use a same-origin Storefront API path

The browser calls the frontend origin and uses `/api` for backend access. The frontend nginx layer proxies API requests to the private gateway service.

This keeps browser configuration simple, avoids exposing internal service addresses, and makes public smoke testing straightforward: the project can validate the Storefront shell and a known API envelope through the same public host.

## Treat API contracts as a shared seam

The Storefront uses shared API contract tests and a predictable response envelope. Successful responses return `success: true` with data or a message. Failed responses return `success: false` with an error.

This gives the frontend, gateway, and backend services a stable seam while the platform continues to evolve. It is especially useful during frontend modernization because UI work can move quickly without guessing backend wire shapes.

## Promote images through GitOps manifests

The image pipeline builds commit-SHA-tagged service images and promotes them by opening manifest update pull requests. Argo CD then reconciles the merged GitOps state.

This decision keeps deployment intent reviewable in Git. It also means the running cluster can be compared against repository desired state instead of treating workflow logs as the only deployment record.

## Keep observability focused before expanding AIOps

The current platform emphasizes Prometheus metrics and Grafana dashboards. Pod log forwarding and richer AIOps diagnosis are deferred until the logging design is reintroduced deliberately.

This prevents the project from pretending to have an active log-analysis pipeline while still showing the operational direction clearly.

## Keep Hiraya Guide curated, not raw

Hiraya Guide answers from reviewed Markdown in `docs/portfolio/`. It should not ingest a raw repository snapshot, report JSON, live AWS data, prompts, retrieved chunks, or operational secrets.

This choice makes the assistant safer and easier to evaluate. The trade-off is that the corpus must be maintained intentionally; the benefit is that Portfolio Visitors receive clear explanations rather than noisy implementation dumps.

## Present polished truth, not production claims

Hiraya is written confidently because it is a portfolio project, but the documentation should still distinguish implemented controls from target-state and deferred hardening work. That honesty is part of the design: a strong DevOps project should show engineering judgment, not just a polished diagram.
