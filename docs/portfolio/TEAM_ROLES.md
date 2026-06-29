---
title: Target Team Permission Model
audience: portfolio_visitor
category: team_roles
last_reviewed: 2026-06-27
---

# Target Team Permission Model

Hiraya uses a small target team model to explain who should be able to change, deploy, review, or operate the EKS project. This document is polished visitor-facing guidance, not a claim that every human IAM Identity Center assignment or Kubernetes RBAC rule is fully codified today.

## Role model

| Role | Intended responsibility |
|---|---|
| Junior developer | Contributes Storefront changes through pull requests and relies on CI feedback before merge. |
| Senior developer | Reviews application direction, API contracts, service boundaries, and release-impacting changes. |
| DevOps engineer | Owns infrastructure design, CI/CD workflows, GitOps foundations, runtime platform behavior, and cost-aware rebuilds. |
| Security reviewer | Reviews permission boundaries, accepted risks, public exposure, secrets handling, and hardening gaps. |
| Operator | Inspects operational signals and responds to incidents when operator-only capabilities exist. |
| Terraform plan role | Reads enough AWS and Terraform state to produce infrastructure plans. |
| Terraform apply role | Applies approved infrastructure changes through automation. |
| Cluster bootstrap role | Performs the controlled handoff from a new EKS cluster into Argo CD and GitOps. |
| Image push role | Publishes validated service images to ECR. |
| GitHub Actions bot | Opens and updates manifest-promotion pull requests after images are built. |

## Automation boundaries

The strongest implemented boundaries are around automation. GitHub Actions workflows use OIDC role assumption, and different workflow paths use different AWS roles. Application PR validation does not need AWS credentials, while image push and infrastructure apply paths request credentials only when required.

This gives the project a clear permission story:

```text
Pull request validation → repository read only
Image publishing → dedicated image-push role
Platform Core changes → dedicated Terraform plan/apply roles
Cluster GitOps handoff → dedicated cluster-bootstrap role
Manifest promotion → GitHub App bot pull request
```

The model keeps routine code validation, artifact publishing, infrastructure mutation, and GitOps promotion from collapsing into one overpowered identity.

## Review expectations

Different changes should receive different review attention:

- Storefront UI or behavior changes should pass the app baseline and be reviewed for user impact.
- API contract changes should be reviewed against shared Storefront contracts and frontend consumers.
- Service image or Dockerfile changes should pass image build checks and be reviewed for runtime and supply-chain impact.
- GitOps manifest changes should be reviewed for rendered Kubernetes behavior, public route impact, and service connectivity.
- Terraform changes should be reviewed through plan artifacts before apply.
- Public access or admin-surface changes should receive security-review attention.

## Operator boundary

An Operator is different from a general user. A general user can read about the project and ask Hiraya Guide for curated explanations. An Operator is allowed to inspect operational signals and use operational tooling when those capabilities exist.

This distinction matters because Hiraya Guide should not imply that public users have live operational access. It should explain the target operating model without exposing secrets, raw operational data, or hidden admin capabilities.

## Current implementation posture

The repository is strongest around automated roles and workflow boundaries. It already demonstrates GitHub OIDC, service-catalog-driven app validation, image promotion through bot PRs, Terraform role separation, and GitOps handoff.

The human side of the target model is less complete in code. IAM Identity Center permission sets, named human assignments, and fine-grained Kubernetes RBAC are not fully represented as repository-managed configuration. That is an acknowledged gap, not a hidden implementation detail.

## Why the model matters

The target team model helps users understand that Hiraya is not only a collection of services. It is a delivery system with explicit responsibility boundaries: developers change the app, automation validates and promotes artifacts, infrastructure roles mutate cloud foundations, Argo CD reconciles runtime state, and operators inspect the platform when needed.
