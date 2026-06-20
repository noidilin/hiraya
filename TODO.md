## Recommended order

### 1. Stabilize current platform/network baseline

 Finish validating the EKS network refactor:

- Terraform fmt/validate/plan for platform.
- kubectl kustomize gitops.
- Helm template checks for local charts.
- Confirm private nodes, shared ALB, ExternalDNS, Grafana/Argo/app routes.

 This gives us a known-good deployment target.

### 2. Add infra CI first

Create a dedicated infra workflow for:

- terraform fmt -check -recursive
- terraform validate
- terraform plan
- maybe terraform test for existing module tests
- artifact/comment plan output later

Use GitHub Actions OIDC to AWS, not long-lived credentials. Your image workflow already uses OIDC, so extend that pattern.

Initial infra CD should be manual apply to dev, probably through workflow_dispatch and a GitHub Environment named dev.

### 3. Optimize existing image/GitOps CI/CD

Current workflows are a good start:

- .github/workflows/ci.yml
- .github/workflows/update-gitops-manifests.yml

But before adding more features, I’d improve:

- Add PR checks that build/test without pushing images.
- Move repeated service metadata into one file/script.
- Add kubectl kustomize gitops after manifest update.
- Consider batching GitOps manifest updates instead of one workflow dispatch per service.
- Decide when Trivy should become blocking. Keep advisory until pipeline is stable.

### 4. Add “real tests” gradually

Before the frontend rewrite, add a small but meaningful test baseline:

- Backend unit tests per service.
- API contract/smoke tests for gateway routes.
- Frontend build/lint test for current frontend.
- GitOps render test.
- Terraform module tests already present should run in CI.

Do not wait for perfect coverage. Add enough tests so the pipeline can catch obvious regressions.

### 5. Then rewrite frontend with React 19 + Vite + shadcn

This is a good pipeline exercise, but only after the pipeline can prove:

- build passes
- image builds
- vulnerability scan runs
- manifest updates
- Argo CD deploys
- smoke test passes

The frontend rewrite becomes a visible demo of CI/CD rather than another manual migration.

### 6. Add AIOps after CI/CD is stable

Then implement AIOps in slices:

 1. Observability alignment + ADOT module.
 2. CloudWatch-backed Lambda tools.
 3. Terraform-managed Bedrock Agent.
 4. API Gateway/Cognito/chat proxy.
 5. React AIOps frontend on CloudFront.

This will showcase mature DevOps: infra pipeline, image pipeline, GitOps, observability, and then AI Ops on top.

## Short answer

Work current CI/CD first.

Suggested next target:

> Add infra CI/CD for Terraform plan/apply + GitOps render validation, then improve the existing image/GitOps workflows.

AIOps should come after that, because it will benefit from the pipeline instead of bypassing it.
