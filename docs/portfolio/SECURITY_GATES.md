---
title: Security Gates and Risk Posture
audience: portfolio_visitor
category: security_gates
last_reviewed: 2026-06-27
---

# Security Gates and Risk Posture

Hiraya presents security as a set of concrete engineering gates and accepted risks, not as a broad compliance claim. The EKS project shows how a dev platform can reduce unnecessary access, keep sensitive values out of the browser and repository, and make deployment authority visible through code-reviewed workflows.

## Implemented security gates

Several controls are visible in the repository and delivery path:

- **GitHub OIDC for AWS access**: AWS-backed workflows assume dedicated IAM roles instead of relying on long-lived AWS access keys.
- **Job-scoped permissions**: workflows request `id-token: write` only in jobs that need AWS role assumption.
- **Separated automation roles**: infrastructure plan, infrastructure apply, cluster bootstrap, and image push use distinct role boundaries.
- **No-AWS PR baseline**: ordinary application validation can run without cloud credentials.
- **Build-only PR image checks**: pull requests can prove Docker image buildability without pushing to a registry.
- **GitOps render checks**: CI validates rendered Kubernetes desired state before changes are promoted.
- **IRSA foundation**: the EKS platform includes IAM Roles for Service Accounts so controller and workload AWS permissions do not need to come from node credentials.
- **Externalized secrets**: durable runtime secrets live in AWS Secrets Manager and are materialized into Kubernetes through External Secrets Operator.
- **Private backend boundary**: backend services and PostgreSQL are private to the cluster; the public path enters through the Storefront route.

## Supply-chain and deployment controls

The image delivery path builds service images from catalog-defined Docker inputs, tags images with the commit SHA, and promotes them by updating GitOps manifests. That means a deployed image can be traced back to a source commit and a manifest promotion change.

Trivy scanning is present in the image workflow and reports high and critical vulnerabilities in advisory mode. This is useful evidence for a portfolio-stage pipeline, while leaving room for a later policy decision to make scan findings blocking.

## Infrastructure permission boundary

Terraform ownership is split by platform layer. Project Bootstrap owns durable CI/CD and registry foundations. Platform Core owns AWS/EKS foundations. Cluster Bootstrap owns the GitOps handoff. Argo CD owns the long-lived in-cluster platform and application resources.

This division reduces the need for one automation identity to own every part of the platform. It also makes the destroy path safer: routine lab shutdown can remove disposable EKS runtime layers without destroying durable bootstrap resources.

## Public access risk posture

The public Storefront route is part of the demo. Argo CD and Grafana may also be exposed as dev admin surfaces with generated credentials. This is acceptable for a portfolio-scale dev environment but is not presented as production hardening.

Production-grade hardening would add stronger admin access controls such as SSO, IP allowlisting or private access, detailed auditing, and tighter Kubernetes RBAC. The current project documents those gaps instead of implying they are solved.

## Data and secrets boundary

The curated documentation and Hiraya Guide boundary intentionally avoid exposing raw operational detail. Portfolio Visitors receive reviewed explanations, not live AWS access, raw report JSON, prompts, request headers, retrieved chunks, or secrets.

Storefront demo credentials are seeded for local and dev validation. The seed data is suitable for a portfolio demo and should not be confused with production identity management.

## Accepted risks

Hiraya accepts several dev-environment risks to keep the platform understandable and affordable:

- The EKS API public access posture is a temporary dev convenience until private runner access or narrower CIDR automation is in place.
- The platform uses a cost-conscious dev network design rather than full production high availability for every component.
- The current database is an in-cluster dev PostgreSQL workload rather than a managed production database.
- Some checks provide visibility before becoming hard blocking gates.
- Human AWS Identity Center assignments and fine-grained human Kubernetes RBAC are not fully codified in the repository.

These are not hidden defects; they are trade-offs appropriate to a portfolio-scale dev platform.

## What the project does not claim

The EKS project does not claim formal compliance certification, production readiness, or complete zero-trust enforcement. It demonstrates security-aware delivery design: narrow automation roles, credentialless PR validation, GitOps reviewability, private service boundaries, and clear documentation of the remaining hardening path.
