---
title: Target Team Permission Model
audience: portfolio_visitor
category: team_roles
last_reviewed: 2026-06-27
---

# Target Team Permission Model

This document describes the **Target Team Permission Model**: the intended access design Hiraya may explain to Portfolio Visitors. It is target-state unless a control is explicitly described as implemented. It must not be read as a claim that every IAM, GitHub, Kubernetes, or Identity Center permission is already fully deployed.

## Intended roles

Hiraya's report evidence uses a small set of practical project roles:

- **Junior developer** can contribute requirements and application changes through review-controlled repository workflows.
- **Senior developer** can review implementation direction and help approve changes that affect delivery or architecture.
- **DevOps** owns infrastructure design, CI/CD foundations, deployment workflows, and operational readiness.
- **Security reviewer** evaluates permission boundaries, accepted risks, and hardening gaps.
- **Operator** can inspect operational signals and use Kira for incident diagnosis when that Operator-only capability exists.
- **Terraform apply role** performs controlled infrastructure mutations through approved automation.
- **GitHub Actions bot** runs validation, publish, deploy, and GitOps automation with job-scoped permissions.

## Implemented boundaries

The implemented evidence is strongest around automation roles. GitHub Actions uses OIDC role assumption for AWS workflows, and Terraform/GitHub automation can manage infrastructure through declared roles. EKS IRSA exists as a foundation for workload AWS permissions.

## Not yet implemented

The repository does not fully codify human AWS Identity Center permission sets, human-to-role assignments, named EKS operator access entries, or fine-grained human Kubernetes RBAC. Those remain target-state model elements and should be described with clear disclaimers.

## Why the distinction matters

Hiraya Guide is for Portfolio Visitors, not Operators. It can explain the target team model and cite curated documentation, but it should not imply that a visitor has live access or that the project has completed every human access-control implementation.
