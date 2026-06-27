---
title: Architecture Overview
audience: portfolio_visitor
category: architecture
last_reviewed: 2026-06-27
---

# Architecture Overview

Hiraya separates durable portfolio explanation from disposable Kubernetes demonstration.

## Disposable EKS platform

The Vintage Storefront runs on the dev EKS platform. Platform Core provides the cloud foundation for the cluster, including networking, identity, and public-domain prerequisites. Cluster Platform provides in-cluster shared capabilities such as ingress, GitOps, storage integration, external secrets, and monitoring. Cluster Bootstrap establishes GitOps control for a rebuilt cluster.

This boundary is intentionally disposable. The maintainer can destroy the dev EKS environment to control cost without treating the cluster as the only public project entry point.

## Durable Portfolio Stack

Hiraya Portfolio is implemented in the repository as a durable public app outside EKS, but it has not yet been applied to AWS. ADR-0008 defines a Portfolio Stack under `infra/portfolio` that owns CloudFront, private S3 static hosting, API Gateway, a Guide API Lambda, Secrets Manager, Bedrock Knowledge Bases backed by S3 Vectors, Guardrails, and supporting IAM. The same CloudFront distribution serves the SPA and routes `/api/*` to the Guide API so browser calls stay same-origin after deployment.

The Portfolio Stack should not be mixed into Project Bootstrap, Platform Core, or the EKS destroy workflow. Project Bootstrap owns the cross-cutting CI/CD foundation, while the Portfolio Stack owns the durable public application resources.

## Hiraya Guide knowledge flow

Curated Project Knowledge is reviewed Markdown under `docs/portfolio/`. The deploy workflow stages exactly the six curated documents, syncs them to the S3 knowledge prefix, uploads a separate citation manifest, and starts Bedrock ingestion. Hiraya Guide uses RetrieveAndGenerate, normalizes citations, refuses when curated evidence is absent, and avoids returning raw retrieved chunks.

## Current scope and gaps

The durable Portfolio Stack, Guide API, Lambda packaging, curated sync, and validation are deploy-ready in the repository. The remaining gap is operational: the Portfolio Stack has not yet been applied to AWS, and the first knowledge ingestion has not yet run.
