---
title: Project Brief
audience: portfolio_visitor
category: project_brief
last_reviewed: 2026-06-27
---

# Project Brief

Hiraya is a DevOps portfolio project that demonstrates how a small product team can design, deploy, observe, and explain a cloud-native application on AWS. The platform has two public experiences with different jobs.

- **Vintage Storefront** is the disposable EKS-hosted commerce demo. It proves the Kubernetes, GitOps, service delivery, and observability story.
- **Hiraya Portfolio** is the durable project-introduction site. It remains outside the disposable EKS platform so Portfolio Visitors can evaluate the project even when the cluster is destroyed to save cost.
- **Hiraya Guide** is the portfolio-facing assistant. It should answer from Curated Project Knowledge only, not from a raw repository dump or live operational systems.

The current implementation emphasis is a dev environment, not a production retail system. The repository is intentionally explicit about what is implemented, what remains a gap, and which risks are accepted for a portfolio-scale environment.

## What Hiraya demonstrates

Hiraya demonstrates several DevOps themes together:

- AWS network and EKS platform design for a dev cluster.
- GitHub Actions workflows that separate validation, infrastructure deployment, image publishing, and GitOps reconciliation.
- Argo CD driven in-cluster delivery for the Vintage Storefront.
- Security and permission-control evidence captured as reviewed repository data under `docs/reports/`.
- A deploy-ready durable Portfolio Stack for Hiraya Portfolio and Hiraya Guide, separate from the disposable EKS platform and awaiting first approved AWS apply.

## Visitor promise

A Portfolio Visitor should be able to ask how the platform is shaped and receive a grounded explanation with citations to Curated Project Knowledge. The assistant should not claim live operational access, expose internal report JSON, or present target-state permissions as already finished implementation.
