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

Hiraya Portfolio is planned as a durable public app outside EKS. ADR-0008 defines a Portfolio Stack under `infra/portfolio` that owns CloudFront, private S3 static hosting, API Gateway, a Guide API Lambda, Secrets Manager, Bedrock Knowledge Bases, Guardrails, and supporting IAM. The same CloudFront distribution should serve the SPA and route `/api/*` to the Guide API so browser calls stay same-origin.

The Portfolio Stack should not be mixed into Project Bootstrap, Platform Core, or the EKS destroy workflow. Project Bootstrap owns the cross-cutting CI/CD foundation, while the Portfolio Stack owns the durable public application resources.

## Hiraya Guide knowledge flow

Curated Project Knowledge is reviewed Markdown under `docs/portfolio/`. It is intended to be synced to an S3-backed Bedrock Knowledge Base. Hiraya Guide should use RetrieveAndGenerate, normalize citations, refuse when curated evidence is absent, and avoid returning raw retrieved chunks.

## Current scope and gaps

The durable Portfolio Stack and Guide API are target architecture, not fully deployed infrastructure in this starter pack. This slice creates the initial Curated Project Knowledge and validation foundation so later workflow and Bedrock ingestion work has a reviewed source of truth.
