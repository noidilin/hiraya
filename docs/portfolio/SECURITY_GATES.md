---
title: Security Gates and Risk Posture
audience: portfolio_visitor
category: security_gates
last_reviewed: 2026-06-27
---

# Security Gates and Risk Posture

Hiraya treats security gates as evidence-backed controls, not broad compliance claims. The canonical report data remains under `docs/reports/data/`, while this document summarizes that evidence in Portfolio Visitor-facing language.

## Implemented controls

The repository evidence shows several implemented controls:

- GitHub Actions can assume AWS roles through OIDC, reducing reliance on static CI/CD credentials.
- Infrastructure and deployment workflows are separated so validation, planning, applying, and publishing can use different permissions.
- The EKS module creates an IAM OIDC provider for IRSA, allowing pod AWS permissions to be separated from node credentials.
- GitOps manifests and workflow render checks make cluster desired state reviewable before deployment.
- Terraform state and bootstrap resources are treated as durable foundations rather than ad hoc local setup.

## Partial controls and gaps

Several controls are intentionally recorded as partial or not implemented:

- Human AWS access through IAM Identity Center is not codified in the repository. It remains externally and manually governed.
- Named human operator EKS access entries, aws-auth mappings, Identity Center role mappings, and Kubernetes RBAC are not fully declared.
- Admin UI hardening for Argo CD and Grafana is partial. HTTPS routes and generated admin passwords exist, but SSO, IP allowlists, fine-grained RBAC, and detailed operation auditing remain gaps.
- WAF is deferred for Hiraya Portfolio v1. The planned public controls are throttling, strict request validation, Lambda concurrency limits, explicit Bedrock token limits, and origin-header verification.

## Accepted risk statement

Hiraya is a dev-environment portfolio project. It is designed to show security thinking and permission boundaries, not to claim production certification. Report mappings to AWS Well-Architected, CIS, NIST CSF, and SLSA are evidence-based orientation aids and should not be read as formal audit or compliance attestation.

## Guide safety boundary

Hiraya Guide must not ingest raw report JSON, live AWS data, prompts, retrieved chunks, or operational secrets. It should answer only from curated Markdown and refuse questions that lack curated evidence.
