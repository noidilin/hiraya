---
title: CI/CD Workflow
audience: portfolio_visitor
category: cicd
last_reviewed: 2026-06-27
---

# CI/CD Workflow

Hiraya uses GitHub Actions as the main automation layer. The workflow design separates validation, infrastructure work, image delivery, and GitOps reconciliation so permissions can stay narrow and review points are visible.

## Implemented CI/CD controls

The report evidence records that AWS workflows use GitHub OIDC instead of long-lived AWS access keys. Jobs request `id-token` only when needed and assume dedicated AWS roles. Infrastructure deployment is separated from validation, and image publishing uses a controlled build-and-push path.

The repository also keeps a separate Vintage Storefront baseline. The existing `app:baseline` command validates service catalog data, backend contracts, frontend tests, GitOps rendering, and static app checks for the EKS-hosted storefront.

## GitOps delivery

Vintage Storefront delivery is GitOps-oriented. Kubernetes manifests and platform add-ons are rendered and reconciled by Argo CD after cluster bootstrap. This keeps in-cluster desired state visible in the repository instead of relying on manual kubectl changes.

## Portfolio delivery

Hiraya Portfolio uses separate root scripts and does not change the Vintage Storefront `app:baseline` command. Portfolio workflows validate the frontend, bundled Guide API package, Curated Project Knowledge, and Portfolio Terraform independently. On merge, app and knowledge changes deploy through the Portfolio orchestration workflow, while Portfolio infrastructure changes require a reviewed plan and manual approved apply.

## Gaps and accepted risks

The microservice image pipeline is still being completed. The Portfolio Stack is deploy-ready in code but not yet applied to AWS, so public smoke results depend on the first approved infrastructure deployment and knowledge ingestion. The project accepts a small v1 workflow surface for the Portfolio Stack instead of introducing a service catalog for every Portfolio component immediately.
