# Hiraya microservice CI/CD diagram research

Status: research for next diagram-generation agent  
Scope: Hiraya EKS Project dev environment, focused on Vintage Storefront microservice SDLC, AWS infrastructure delivery, and GitOps synchronization.  
Intended output: four draw.io diagrams — one high-level overview plus three detail diagrams.

## Source map for the next agent

Primary implementation evidence:

- `.github/workflows/app-pr-baseline.yml` — required no-AWS pull request gate named `app-baseline`.
- `.github/workflows/image-ci.yml` — main-branch image build, ECR push, Trivy advisory scan, and GitOps manifest promotion PR.
- `.github/workflows/deploy-smoke.yml` — public smoke after `gitops/**` reaches `main`.
- `.github/workflows/infra-ci.yml` — infrastructure static validation, GitOps render/schema checks, and trusted PR Terraform plan.
- `.github/workflows/infra-deploy.yml` — manual dev Platform Core deploy, environment-gated apply, Cluster Bootstrap, and platform smoke.
- `.github/workflows/infra-destroy.yml` — ordered GitOps prune plus layered destroy.
- `.github/workflows/service-image-dev-rollback.yml` — manual service image rollback through a reviewed manifest PR.
- `.github/utils/services.json` — canonical service catalog: service ownership, ECR repositories, Docker build inputs, and manifest targets.
- `gitops/clusters/dev/root/**` — Argo CD app-of-apps root.
- `gitops/apps/vintage/**` — Vintage Storefront Kubernetes desired state.
- `infra/envs/dev/bootstrap/**` — Project Bootstrap, durable ECR, GitHub OIDC roles, and durable Vintage Storefront secrets.
- `infra/envs/dev/platform-core/**` — disposable AWS/EKS foundation.
- `infra/envs/dev/cluster-bootstrap/**` — Argo CD install and root Application handoff.
- `docs/adr/0007-gitops-owned-cluster-platform.md` — accepted ownership model.
- `docs/portfolio/TEAM_ROLES.md`, `docs/portfolio/SECURITY_GATES.md`, `docs/portfolio/CICD.md` — visitor-facing role/security/CI-CD explanation.

## Vocabulary

Use the project vocabulary from `CONTEXT.md` in diagram labels:

- **Vintage Storefront**: public demo commerce app under `app/microservices`.
- **Hiraya EKS Project**: disposable EKS-hosted demonstration system.
- **Project Bootstrap**: durable foundation for state access, GitHub OIDC roles, ECR, and durable app secrets.
- **Platform Core**: AWS/EKS foundation created by Terraform.
- **Cluster Bootstrap**: Terraform handoff that installs Argo CD and the root GitOps Application.
- **Cluster Platform**: shared in-cluster capabilities owned by Argo CD from `gitops/platform/**`.
- **GitOps Apps**: workload manifests, especially `gitops/apps/vintage`.

## Overall design thesis

Hiraya separates SDLC responsibilities into four delivery lanes:

1. **Pull-request validation** runs first and does not need AWS credentials.
2. **Image publishing** happens only from trusted `main` code after the app baseline passes.
3. **Artifact promotion** updates GitOps manifests through a bot pull request instead of mutating the cluster directly.
4. **Infrastructure mutation** is manual, environment-gated, and split into Platform Core then Cluster Bootstrap before Argo CD owns in-cluster resources.

The ordering is intentional: cheap/no-credential checks catch defects before privileged jobs run; immutable images are built before deployment state changes; reviewed Git desired state becomes the deployment contract; and Argo CD, not GitHub Actions, performs runtime reconciliation.

## Diagram 1 — high-level SDLC and CI/CD overview

### Purpose

Show the whole delivery system at a higher level: developer change, PR gate, main-branch automation, AWS/ECR, GitOps promotion, Argo CD sync, runtime smoke, and separate infra deploy lane.

### Recommended diagram title

`Hiraya Vintage Storefront CI/CD overview`

### Main actors/nodes

| Lane / boundary | Nodes to include | Notes |
|---|---|---|
| Human SDLC | Junior developer, Senior developer, DevOps engineer, Security reviewer, Operator | Show reviewers as gates, not compute services. |
| GitHub | Feature branch, Pull Request, `app-baseline`, `infra-ci`, protected `main`, `image-ci`, manifest promotion PR, rollback workflow | `app-baseline` is the required branch check. |
| AWS foundation | Project Bootstrap, ECR, GitHub OIDC roles, Platform Core Terraform, EKS cluster | Keep Project Bootstrap as durable; Platform Core as disposable. |
| GitOps | `gitops/` desired state, Argo CD root app, child Applications | Git is source of deployment truth. |
| Runtime | Kubernetes Deployments/Services, Gateway/HTTPRoute, public Storefront URL, public smoke | Smoke is visibility, not auto-rollback. |

### Flow

```text
1. Developer opens PR
2. Pull request triggers app-baseline for all PRs
3. App PRs run catalog/tests/GitOps render/static checks and build-only Docker images
4. Infra/GitOps PRs also trigger infra-ci static checks and trusted same-repo Terraform plan
5. Senior developer / DevOps / Security reviewer review CI evidence and plan artifacts
6. Merge to protected main
7. For app changes, image-ci detects changed services, reruns app baseline, builds/scans/pushes ECR images tagged with commit SHA
8. image-ci opens/updates manifest promotion PR through Hiraya GitHub App bot
9. Manifest PR runs fast app-baseline GitOps render gate and auto-merges after required checks
10. Argo CD syncs main branch desired state into EKS
11. deploy-smoke checks public Storefront shell and `/api/products`
12. Separately, DevOps can run infra-deploy from main: preflight plan -> dev environment approval -> Platform Core apply -> Cluster Bootstrap apply -> platform smoke
```

### Why this order

- PR checks run before cloud credentials to reduce blast radius and cost.
- Main branch image build reruns the app baseline before ECR write access because branch merge alone is not treated as sufficient validation.
- GitOps manifest updates are separate PRs so the deploy artifact is reviewed as a small, auditable diff.
- Argo CD owns Kubernetes changes so deployment and drift correction are declarative.
- Infrastructure deploy is manual because creating/destroying EKS, IAM, DNS, and networking is higher risk than app image promotion.

### Reviewer gates and artifacts

| Gate | Reviewer | Evidence/artifact |
|---|---|---|
| Pull request review | Senior developer, DevOps, Security reviewer when relevant | `app-baseline` summary, image build-only result, infra-ci static checks, Terraform plan comment/artifact. |
| Main merge gate | Senior developer | Protected main required check: `app-baseline`. |
| Manifest promotion PR | Required check + optional reviewer | GitOps image tag diff, rendered manifest check, changed service JSON. |
| Infrastructure deploy approval | DevOps / Security reviewer through GitHub Environment `dev` | Pre-approval refreshed Terraform plan artifact and summary. |
| Rollback approval | Operator / DevOps through selected GitHub Environment | Rollback dry-run summary, manifest diff, target existing ECR tag. |

### Security and optimization summary

- Security: GitHub OIDC; job-scoped permissions; no AWS credentials in PR baseline; separate image/plan/apply/bootstrap roles; GitHub App bot for manifest PRs; AWS Secrets Manager plus External Secrets Operator; pinned GitHub actions.
- Optimization: service catalog changed-service matrix; BuildKit cache; concurrency cancellation for PR/main pipelines; fast manifest-only PR path; PR Terraform plan uses `-refresh=false -lock=false`; GitOps render checks avoid cluster credentials.

## Diagram 2 — microservice application pipeline

### Purpose

Dive into how Vintage Storefront code changes become images and then manifest promotion. This is the most important diagram for microservice SDLC.

### Recommended diagram title

`Vintage Storefront application image and promotion pipeline`

### Services in scope

From `.github/utils/services.json`:

| Service | ECR repository | Manifest target | Baseline active? |
|---|---|---|---|
| `auth` | `hiraya-auth` | `gitops/apps/vintage/k8s/backend/auth.yml` | yes |
| `gateway` | `hiraya-gateway` | `gitops/apps/vintage/k8s/backend/gateway.yml` | yes |
| `orders` | `hiraya-orders` | `gitops/apps/vintage/k8s/backend/orders.yml` | yes |
| `order-service` | `hiraya-order-service` | `gitops/apps/vintage/k8s/backend/order-service.yml` | no / legacy |
| `product-service` | `hiraya-product-service` | `gitops/apps/vintage/k8s/backend/product-service.yml` | yes |
| `user-service` | `hiraya-user-service` | `gitops/apps/vintage/k8s/backend/user-service.yml` | no / legacy |
| `frontend` | `hiraya-frontend` | `gitops/apps/vintage/k8s/frontend/deployment.yml` | yes |

### Pull request path

```text
PR opened/updated
  -> plan-app-pr
      - classify PR using path ownership in services.json
      - output pr_kind, changed services, matrix, reason
  -> one of three paths:
      A. non_app: skip heavy app/image jobs; still report app-baseline
      B. manifest_promotion_only: render gitops/apps/vintage and assert expected route/service wiring
      C. microservice_related: run pnpm run app:baseline
  -> if image-impacting services changed: Docker build-only matrix with push=false, no AWS credentials
  -> final app-baseline summarizer enforces expected job outcomes
```

`pnpm run app:baseline` order:

```text
pnpm list
-> app:catalog
   -> compile .github scripts
   -> validate services.json
   -> test service catalog, changed-service detector, PR classifier, GitOps foundations
-> backend contract tests
-> frontend unit tests
-> changed-service detection --all
-> app:gitops render/assertions
-> app:static
   -> Storefront build
   -> Storefront typecheck
   -> Storefront lint
   -> backend build
```

Test placement rationale:

- **Catalog/detector tests first**: the service matrix controls later image jobs; if metadata is wrong, downstream work is unsafe.
- **Contract and frontend unit tests before builds**: catch behavior and API-shape regressions without Docker/AWS cost.
- **GitOps render assertions before static packaging completes**: validates that deployment wiring stays coherent with service changes.
- **Docker build-only on PR after planning**: verifies container buildability but denies registry writes and cloud credentials.
- **Public smoke after GitOps merge**: validates the real public route once Argo CD has a chance to reconcile.

### Main branch image path

```text
push to main touching app/microservices or CI metadata
  -> detect-changes using services.json
  -> run app baseline before credentials
  -> build-and-push matrix for changed services only
      - request id-token: write
      - assume devops-hiraya-dev-github-image-push role
      - resolve ECR repository
      - login to ECR
      - build linux/amd64 image with tag = Git commit SHA
      - run Trivy scan for HIGH/CRITICAL vulnerabilities (advisory only)
      - push image to ECR
  -> update-manifests
      - create scoped Hiraya GitHub App token
      - update one image line per service manifest
      - render gitops/apps/vintage
      - commit to ci/update-manifests-dev
      - open/update promotion PR
      - enable squash auto-merge after required app-baseline check
```

### Artifact promotion model

| Stage | Artifact | Promotion rule |
|---|---|---|
| Source | Git commit SHA on `main` | Only after PR and `app-baseline`. |
| Build | Docker image tagged `${github.sha}` | Pushed only after app baseline passes and image-push OIDC role is assumed. |
| Registry | ECR image in service repository | Commit SHA is immutable deployment reference in practice; ECR lifecycle immutability is not asserted in the workflow. |
| Desired state | GitOps manifest image line | Changed only through bot PR and required check. |
| Runtime | Kubernetes Deployment rollout | Argo CD syncs from `main`; workflow does not run `kubectl set image`. |
| Evidence | Step summaries, PR body, Trivy report, public smoke | Reviewer/operator evidence; Trivy is currently non-blocking. |

### Role and permission model

| Role | What they can do in this flow | Permission boundary in current design |
|---|---|---|
| Junior developer | Push app changes to feature branch and open PR | No cloud credentials through PR baseline. |
| Senior developer | Review app/API/service-boundary changes and merge if checks pass | Uses GitHub review/merge permissions; `app-baseline` required. |
| DevOps engineer | Review Docker, CI/CD, GitOps wiring; run rollback if needed | Can operate workflows according to repo/environment permissions. |
| Security reviewer | Review Dockerfile/supply-chain/public-exposure-sensitive changes | Uses Trivy output, GitOps diff, and security docs; some policy gates are manual/partial. |
| GitHub Actions bot | Runs PR and main workflow jobs | Workflow `permissions: contents: read` by default; `id-token: write` only in image push job. |
| Image push AWS role | Push and read selected ECR repositories | ECR push/read actions only for repositories from Project Bootstrap; no Kubernetes access. |
| Hiraya GitHub App bot | Opens/updates manifest promotion PRs | Uses repository-scoped app token; does not push directly to protected `main`. |
| Operator | Runs approved rollback workflow for existing image tags | Rollback applies by PR after dry-run and optional environment approval. |

### Security approach

- PR baseline uses `contents: read`, `persist-credentials: false`, and no OIDC.
- Docker PR gate uses `push: false` and no AWS login.
- AWS access uses OIDC role assumption, not static AWS keys.
- Image push happens after baseline validation.
- Manifest promotion checks exactly one `image:` line per manifest before editing.
- Secrets used for runtime database credentials are not in manifests; they live in AWS Secrets Manager and are pulled by External Secrets Operator.
- Trivy scans high/critical OS/library vulnerabilities, but is advisory (`continue-on-error`, `exit-code: 0`). Mark this as a current gap if drawing security gates.

### Optimization strategy

- Path ownership in `services.json` produces targeted image matrices.
- Buildx cache uses GitHub Actions cache scopes by service.
- `max-parallel: 4` limits concurrent image build load.
- Workflow concurrency cancels stale PR/main runs.
- Manifest promotion PR uses a fast render-only baseline, avoiding full app test reruns for trusted bot image-tag-only PRs.
- Root pnpm workspace provides local/CI command parity and shared dependency caching.

### Current gaps to annotate lightly

- Trivy is visibility-only, not a blocking release gate.
- No artifact attestations/SBOM gate is visible in current workflows.
- Public deploy smoke does not automatically rollback or revert failed promotions.
- Human reviewer enforcement beyond `app-baseline` is partly GitHub settings/process, not all codified in repo.

## Diagram 3 — infrastructure-on-AWS pipeline

### Purpose

Explain Terraform and AWS deployment order, role separation, and why infrastructure is gated differently from app delivery.

### Recommended diagram title

`Hiraya dev AWS infrastructure delivery pipeline`

### Layer ownership

| Layer | Owner / executor | What it owns | Normal lifecycle |
|---|---|---|---|
| Project Bootstrap | Manual/local Terraform after review | Remote-state access assumptions, ECR, GitHub OIDC roles, durable Vintage Storefront secret | Durable, preserved across platform rebuilds. |
| Platform Core | `infra-deploy` with infra apply role | VPC, EKS, node group, ACM/DNS primitives, AWS-side IRSA roles, admin secrets | Disposable dev platform. |
| Cluster Bootstrap | `infra-deploy` with cluster-bootstrap role | Argo CD namespace, Argo CD Helm release, AppProjects, root `hiraya-root` Application | Recreated after Platform Core. |
| Cluster Platform | Argo CD from `gitops/platform/**` | controllers, CRDs, namespaces, shared Gateway, monitoring | Continuous GitOps sync. |
| GitOps Apps | Argo CD from `gitops/apps/**` | Vintage Storefront workload manifests | Continuous GitOps sync. |

### PR validation path for infra/GitOps changes

```text
Infra/GitOps PR
  -> static-infrastructure-checks
      - terraform fmt -check -recursive infra
      - terraform init -backend=false and validate root stacks without AWS credentials
      - terraform module contract tests
      - render kustomize and Helm output for root, vintage, platform apps/controllers
      - kubeconform schema lint rendered manifests
      - render local Helm charts
  -> trusted-pr-terraform-plan only for same-repository PRs, excluding bot manifest promotion branch
      - assume infra plan role through OIDC
      - init Platform Core remote backend
      - terraform plan -refresh=false -lock=false -detailed-exitcode
      - upload full plan artifact
      - publish sticky PR plan comment
```

Why PR plan is limited:

- Fork PRs do not get AWS OIDC trust.
- Cluster Bootstrap is not planned as a PR deploy target because it depends on a live cluster/Kubernetes API; it is statically validated instead.
- PR plan uses read-oriented role and fast plan flags to provide reviewer evidence without locking state or refreshing all resources.

### Manual deploy path

```text
workflow_dispatch infra-deploy from main
  -> preflight-plan
      - assume infra plan role
      - init/validate Platform Core
      - run full refreshed Terraform plan
      - upload pre-approval plan artifact and summary
  -> apply-platform-core
      - GitHub Environment: dev approval
      - assume infra apply role
      - create fresh approved binary plan
      - terraform apply
  -> apply-cluster-bootstrap
      - GitHub Environment: dev approval
      - assume cluster-bootstrap role
      - init/validate Cluster Bootstrap
      - apply Argo CD + AppProjects + root app handoff
  -> smoke-dev-platform
      - assume cluster-bootstrap role
      - initialize Platform Core state for outputs
      - run platform route smoke
      - validate Argo Application sync/health, namespaces, Gateway/HTTPRoute readiness, pods, public routes
```

### Destroy path to represent if included

```text
workflow_dispatch infra-destroy from main with typed confirmation
  -> dev environment approval
  -> cluster-bootstrap role prunes GitOps resources in safe order
  -> destroy Cluster Bootstrap state
  -> infra apply role destroys Platform Core
  -> verify platform removal while preserving Project Bootstrap resources
```

### Why infrastructure order matters

- Project Bootstrap must exist first because it creates durable OIDC roles, ECR, state access, and the Vintage Storefront secret.
- Platform Core must exist before Cluster Bootstrap because it creates EKS, OIDC provider, IRSA roles, DNS/certificate prerequisites, and admin secrets.
- Cluster Bootstrap must run before GitOps because Argo CD and the root Application do not exist yet.
- Argo CD must own long-lived in-cluster add-ons and apps to prevent Terraform/Kubernetes provider ownership conflicts.
- Destroy reverses ownership carefully so GitOps-created load balancers, DNS records, PVCs/EBS volumes, and Applications are removed before Terraform tears down AWS foundations.

### Roles and permissions

| Automation role | Trust condition | Allowed high-level action | Notable denied/limited area |
|---|---|---|---|
| Infra plan role | GitHub OIDC `pull_request` or `main` subject for repo | Read Platform Core state, inspect AWS resources, mutate only plan lockfile object | No infrastructure mutation, no Kubernetes admin access. |
| Infra apply role | GitHub OIDC `environment:dev` subject | Mutate disposable Platform Core AWS resources and scoped IAM resources | Does not receive Kubernetes API access per ADR-0007. |
| Cluster bootstrap role | GitHub OIDC `environment:dev` subject | Read required state/secrets, access EKS Kubernetes API for bootstrap/smoke/cleanup | Separate from Platform Core apply to avoid over-broad role. |
| Dev SSO principal | Configured in Platform Core vars | Human admin access for dev operations | Human assignments are not fully codified in repo. |
| Argo CD controller | In-cluster service account | Sync GitOps resources from `main` | AppProjects exist but resource kind whitelists are broad today. |
| Platform controllers | IRSA roles for AWS Load Balancer Controller, ExternalDNS, External Secrets | AWS integration for ALB/Gateway, DNS, Secrets Manager | Scoped by controller-specific policies; some hardening gaps are documented. |

### Reviewer gates and artifacts

| Gate | Artifact/reviewer evidence |
|---|---|
| Infra PR static checks | Terraform fmt/validate/test, Kustomize/Helm render output, kubeconform result. |
| Trusted PR plan | Sticky PR plan comment and full plan artifact. |
| Pre-deploy review | Full refreshed Platform Core plan artifact before `dev` approval. |
| Environment approval | GitHub Environment `dev` approval record. |
| Post-deploy smoke | Platform route smoke summary: Argo app health, namespaces, Gateway/HTTPRoutes, public routes. |
| Destroy | Typed confirmation, environment approval, cleanup/verification scripts. |

### Security approach

- No long-lived AWS keys; GitHub OIDC with repository/environment-scoped trust.
- Job-scoped `id-token: write` only for AWS jobs.
- Different Terraform responsibilities use different IAM roles and state scopes.
- Terraform state is remote and sensitive; plan artifacts/comments are evidence but should avoid exposing secrets.
- Platform admin passwords are generated into AWS Secrets Manager, not printed in Terraform outputs.
- Runtime Vintage Storefront secrets are durable in AWS Secrets Manager and consumed by External Secrets Operator.
- Public EKS API CIDR and public Argo/Grafana dev routes are accepted dev risks, not production claims.

### Optimization strategy

- PR static checks use `init -backend=false` where possible, avoiding cloud credentials.
- Same-repo PR plan uses `-refresh=false -lock=false` for faster, lower-contention preview.
- Deploy separates a readable preflight plan from the post-approval binary plan to balance reviewability and freshness.
- Disposable Platform Core enables full rebuild instead of complex Terraform state moves/imports for large refactors.

### Current gaps to annotate lightly

- Security reviewer approval/risk labels are partially process-based, not policy-as-code.
- Human IAM Identity Center and fine-grained Kubernetes RBAC are not fully codified.
- Argo CD AppProjects still allow broad resource kinds.
- Some controller/workload hardening controls are partial in report data.

## Diagram 4 — GitOps synchronization flow

### Purpose

Show how Git desired state becomes cluster runtime state and how image promotion/rollback interact with Argo CD.

### Recommended diagram title

`Hiraya GitOps synchronization and runtime reconciliation`

### Key nodes

| Area | Nodes |
|---|---|
| Git | `main` branch, `gitops/clusters/dev/root`, `gitops/platform/**`, `gitops/apps/vintage/**` |
| Bootstrap | Cluster Bootstrap Terraform, Argo CD Helm release, AppProjects, root `hiraya-root` Application |
| Argo CD | Root app-of-apps, platform Applications, Vintage Application |
| Cluster Platform | namespaces, Gateway API CRDs, AWS Load Balancer Controller, ExternalDNS, External Secrets Operator, edge Gateway, monitoring |
| Vintage App | ExternalSecret, PostgreSQL StatefulSet/restore job, backend Deployments/Services, frontend Deployment/Service, HTTPRoute, ServiceMonitor/Grafana dashboard |
| AWS controllers | ALB/Gateway resources, Route 53 records, Secrets Manager reads, EBS volumes |
| Verification | platform route smoke, deploy smoke, Kubernetes rollout status |

### Bootstrap-to-sync flow

```text
Platform Core creates EKS + AWS-side prerequisites
  -> Cluster Bootstrap Terraform installs Argo CD
  -> Cluster Bootstrap creates AppProjects:
       - hiraya-platform for cluster/platform resources
       - hiraya-workloads for workload namespaces such as vintage
  -> Cluster Bootstrap creates root Application hiraya-root
  -> Argo CD pulls gitops/clusters/dev/root from main
  -> root app creates child Applications
  -> child Applications sync platform and workload manifests
  -> controllers create AWS side effects as needed
```

### Application image sync flow

```text
Image promotion PR merges to main with changed image tag in gitops/apps/vintage/.../*.yml
  -> Argo CD detects main branch change
  -> Vintage Application syncs gitops/apps/vintage
  -> Kubernetes Deployment template changes because container image tag changed
  -> Kubernetes rolls out new ReplicaSet/Pods
  -> Service and HTTPRoute continue routing to stable service names
  -> deploy-smoke reads https://hiraya.noidilin.dev and /api/products
```

### Rollback sync flow

```text
Operator runs service-image-dev-rollback dry run
  -> workflow verifies target image tag exists in ECR
  -> workflow renders manifest diff and validates kustomize
  -> apply run uses environment gate and typed confirmation
  -> bot opens rollback PR with reason/current/target image
  -> PR auto-merges after app-baseline
  -> Argo CD reconciles the previous image tag
```

### Sync waves and ownership hints

- Vintage app manifests include Argo CD sync-wave annotations, for example database at earlier waves and app deployments at wave `2`.
- Platform root lists child Applications for namespaces, CRDs, storage, controllers, edge, monitoring, admin access, and Vintage.
- HTTPRoute ownership is service-specific: Vintage owns its public app route; Edge owns shared Gateway and redirect resources.
- GitOps values should avoid dynamic AWS IDs where possible; AWS Load Balancer Controller discovers VPC/certificate context through stable names/tags.

### GitOps gates and artifacts

| Before merge | After merge/runtime |
|---|---|
| `kubectl kustomize gitops/apps/vintage` render artifact | Argo CD Application sync/health status |
| `assert-gitops-render.mjs` route/service/env/port assertions | Kubernetes Deployment rollout status |
| `kubeconform` for broader infra/GitOps PRs | Gateway/HTTPRoute accepted/programmed status |
| Manifest diff in promotion/rollback PR | Public Storefront smoke result |
| PR body with changed service matrix or rollback reason | Operator evidence from kubectl/curl |

### Security approach

- GitOps changes are reviewed as Git diffs and pass required `app-baseline` before `main`.
- GitHub workflows do not directly mutate Kubernetes for app release; Argo CD reconciles declared state.
- ExternalSecret references stable AWS Secrets Manager secret names; secret values are not committed.
- Backend services and PostgreSQL are private ClusterIP/in-cluster workloads; public path enters through frontend HTTPRoute/Gateway.
- Argo CD self-heal/prune is enabled for root and Vintage, giving drift correction but requiring careful review of manifests.

### Optimization strategy

- GitOps render assertions catch route/service/env/port wiring errors without cluster credentials.
- Manifest promotion updates only image tags, producing small PR diffs and fast review.
- Argo CD self-heal reduces manual drift repair.
- Public smoke is read-only HTTP, cheap, and runs only when `gitops/**` changes on `main`.

### Current gaps to annotate lightly

- Deploy smoke is non-remediating; failed smoke does not auto-revert manifest PR.
- Argo CD API is intentionally not used by smoke; validation relies on Kubernetes/public route checks.
- AppProjects exist but are not yet strict enough to be a complete policy guardrail.
- Public admin routes for Argo CD/Grafana are dev-accepted risk pending SSO/IP restrictions.

## Cross-cutting SDLC role matrix

| SDLC phase | Primary human role | Automation role | Permission / authority | Main gate evidence |
|---|---|---|---|---|
| Requirements and risk framing | Junior developer, Senior developer, DevOps, Security reviewer | None | Issues/docs/ADRs; risk review partly manual | Requirement discussion, ADR/runbook docs. |
| Feature branch development | Junior developer | GitHub Actions PR baseline | Source branch only; no cloud mutation | PR diff and baseline classification. |
| App PR validation | GitHub Actions bot | `app-pr-baseline` | `contents: read`; no AWS/OIDC | `app-baseline`, tests, render assertions, build-only images. |
| App review and merge | Senior developer; Security reviewer if risky | Branch protection | Protected main with required `app-baseline` | PR review + status check. |
| Image publish | GitHub Actions bot | Image push role | ECR push/read to service repositories | Build summary, Trivy report, pushed SHA image. |
| Manifest promotion | Hiraya GitHub App bot, reviewer as needed | GitHub App token | Open/update PR; no direct protected-main push | Manifest diff, app-baseline fast path. |
| GitOps sync | Argo CD controller | Argo CD | Sync/prune/self-heal Git desired state | Argo/Kubernetes status and smoke checks. |
| Infra PR validation | DevOps, Security reviewer | Infra plan role | Read Platform Core state/AWS; plan only | Static checks, sticky plan comment, artifact. |
| Infra deploy | DevOps, Security reviewer | Infra apply role + cluster-bootstrap role | Environment-gated AWS/EKS mutation | Preflight plan, approval, apply/smoke summaries. |
| Operations/rollback | Operator, DevOps | Image read role + GitHub App bot + Argo CD | Verify ECR image and submit rollback PR | Dry-run diff, reasoned rollback PR, rollout/smoke. |

## Design decisions to make visually clear

1. **Credentials come after tests**, not before tests.
2. **Image build and deployment are decoupled** by ECR and GitOps manifest PRs.
3. **Git, not the CI runner, is deployment source of truth** for Kubernetes.
4. **Terraform owns AWS foundations; Argo CD owns in-cluster long-lived resources**.
5. **Dev environment is disposable except Project Bootstrap resources**.
6. **Reviewers gate artifacts**: PR diffs, test status, plan artifact, manifest diff, smoke evidence.
7. **Some gates are visibility-only today**: Trivy and deploy smoke do not automatically block/revert beyond workflow failure/summary visibility.

## Suggested draw.io layout guidance

- Use four separate pages/files, not one crowded diagram.
- Prefer swimlanes: Human / GitHub Actions / AWS / GitOps / EKS Runtime.
- Use numbered teal step badges and a right-side legend for each diagram.
- Make gates visually distinct with diamond or shield markers: `app-baseline`, `dev environment approval`, `manifest PR`, `preflight plan`.
- Make artifacts visually distinct with document/package icons: Terraform plan artifact, Docker image, ECR image tag, GitOps manifest diff, smoke report.
- Use dashed arrows for verification/feedback paths such as smoke and reviewer evidence.
- Use solid arrows for artifact/data promotion paths.
- Mark current gaps with small amber callouts rather than central flow nodes, so the implemented pipeline remains readable.
