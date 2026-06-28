---
title: CI/CD Workflow
audience: portfolio_visitor
category: cicd
last_reviewed: 2026-06-27
---

# CI/CD Workflow

Hiraya uses GitHub Actions as the automation layer for the EKS project. The workflow design separates pull-request validation, image delivery, GitOps promotion, infrastructure deployment, and public smoke checks so each path can use narrow permissions and clear review points.

## CI/CD principles

The pipeline follows five principles:

1. **Validate before credentials**: application baselines run before AWS OIDC credentials, ECR login, image push, or manifest updates.
2. **Use Git as desired state**: Kubernetes changes flow through GitOps manifests rather than manual `kubectl` changes.
3. **Promote immutable images**: service images are tagged with the commit SHA and promoted through manifest updates.
4. **Separate infrastructure from app delivery**: Terraform workflows are distinct from microservice image and GitOps workflows.
5. **Keep PR checks no-AWS by default**: ordinary application pull requests can be validated without cloud credentials.

## Pull-request baseline

The required Storefront PR gate is `app-baseline`. It is always reported for pull requests so branch protection does not get stuck behind path filters.

For microservice-related changes, the baseline runs:

- service catalog validation,
- backend API contract tests,
- frontend unit tests,
- changed-service detection,
- GitOps render assertions,
- Storefront build, typecheck, and lint,
- backend build.

For image-impacting PRs, the workflow also runs build-only Docker checks with `push: false`. Those builds prove that images can be produced without requesting AWS credentials or writing to ECR.

For trusted manifest-promotion PRs opened by the Hiraya bot, the baseline takes a faster path that validates rendered GitOps manifests before merge.

## Service catalog and changed-service detection

The service catalog in `.github/utils/services.json` is the source of truth for Storefront service metadata used by CI/CD. It records package names, image repositories, Docker build inputs, GitOps manifest targets, path ownership, and baseline participation.

That catalog drives changed-service detection. Instead of rebuilding every image for every change, the workflow maps changed files to affected services and builds the relevant image matrix. This makes the pipeline easier to explain and keeps ownership metadata in one reviewable place.

## Image build and promotion flow

On pushes to `main` that affect the Storefront app, the `image-ci` workflow performs the delivery path:

```text
main branch change
  → detect changed services
  → run app baseline
  → assume image-push role through GitHub OIDC
  → build linux/amd64 images
  → scan images with Trivy in advisory mode
  → push commit-SHA images to ECR
  → open or update a bot PR that changes GitOps image tags
  → auto-merge after required checks pass
  → Argo CD syncs the new desired state
```

The workflow uses AWS OIDC rather than static AWS access keys. The image push job requests `id-token: write` only when it needs to assume the dedicated image-push role.

## GitOps deployment flow

Application deployment state lives under `gitops/`. Argo CD watches the repository and reconciles the desired state into the cluster. When image tags change in Git, Argo CD applies the rollout instead of a workflow directly mutating Kubernetes objects.

This creates a clear separation:

- GitHub Actions builds and promotes artifacts.
- Git stores the desired deployment state.
- Argo CD applies and continuously reconciles that state.
- Kubernetes performs rolling updates for the running workloads.

A public deploy smoke runs after GitOps changes land on `main`. The smoke checks the public Storefront shell and `/api/products` response envelope for visibility. Recovery is manual; the project does not currently claim automatic rollback.

## Infrastructure workflow

Infrastructure deployment uses separate Terraform workflows. Platform Core has a pre-approval plan and an approved apply path. Cluster Bootstrap runs after Platform Core to install Argo CD and hand off to GitOps.

Terraform roles are separated by responsibility:

- plan roles inspect proposed infrastructure changes,
- apply roles mutate AWS foundations,
- the cluster-bootstrap role performs the Kubernetes handoff,
- image-push roles publish service images.

This split keeps infrastructure authority separate from application delivery authority.

## Local and CI parity

The root pnpm workspace provides the canonical command surface. The same app baseline used by CI can be run locally from the repository root. Docker Compose provides a production-like local runtime path, and the Compose smoke exercises the Storefront without AWS credentials.

## Current polish and limits

The pipeline is designed as a polished dev delivery system, not as a production release train. Trivy image scanning is currently advisory while CI/CD stabilizes. Public smoke tests provide visibility rather than automatic rollback. The workflow shape is intentionally explicit so a reviewer can see where stronger gates, approvals, or rollback automation would be added later.
