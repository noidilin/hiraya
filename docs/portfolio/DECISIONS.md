---
title: Key Architecture Decisions
audience: portfolio_visitor
category: decisions
last_reviewed: 2026-06-27
---

# Key Architecture Decisions

Hiraya records important platform choices in ADRs and planning documents. These decisions explain why the project is shaped as a portfolio-grade DevOps system instead of a single monolithic demo.

## EKS remains the workload demonstration

Vintage Storefront remains the EKS and GitOps demonstration workload. This keeps Kubernetes, cluster networking, Argo CD, and image delivery visible as the main infrastructure story.

## Hiraya Portfolio stays durable outside EKS

ADR-0008 accepts a durable Portfolio Stack for Hiraya Portfolio. The trade-off is deliberate: the portfolio explanation site should remain available even when the EKS dev cluster is destroyed to save cost. This means the portfolio app uses CloudFront, private S3 hosting, API Gateway, Lambda, and Bedrock Knowledge Bases instead of running inside the disposable cluster.

## Curated knowledge beats raw repository ingestion

Hiraya Guide should answer from Curated Project Knowledge. Raw repository snapshots, report JSON, generated graph artifacts, and live operational reads are out of scope for v1. This makes answers easier to review, safer to cite, and less likely to expose implementation noise or sensitive operational detail.

## Managed RAG keeps v1 small

The planned Guide API uses Amazon Bedrock Knowledge Bases and RetrieveAndGenerate first. Lambda stays thin: validate public requests, verify the CloudFront origin header, call the managed RAG path, normalize citations, and refuse when citations are missing.

## Honest limitations are part of the design

The project intentionally documents gaps, accepted risks, and target-state permission ideas. For example, IAM Identity Center and human Kubernetes RBAC are not fully codified, WAF is deferred for Portfolio v1, and contextual grounding is deferred until answer quality can be evaluated. Hiraya Guide should communicate those limitations rather than overstate readiness.
