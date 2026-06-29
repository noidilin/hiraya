# CI/CD Pipeline Flow Reference

## Purpose

This document is reference material for later presentation writing. It describes a platform-agnostic CI/CD flow that applies across GitHub Actions, GitLab CI, Jenkins, Buildkite, CircleCI, Argo CD, Flux CD, and similar tools.

Use the concrete examples in `../../reference/capstone/` only as examples of the pattern:

- changed-service detection before tests and builds,
- test fan-out by service or package,
- immutable container image publication,
- GitOps-style manifest updates that roll out a new image tag.

Avoid making the presentation sound like it depends on that exact stack.

## Core Mental Model

A CI/CD pipeline moves a change through increasingly expensive and increasingly production-like gates.

```text
source change
  -> validation
  -> build/package
  -> infrastructure deploy or reconcile
  -> application deploy or reconcile
  -> verification and feedback
```

The important split:

- **CI answers "is this change acceptable to integrate?"**
- **CD answers "can this accepted change be released safely?"**

CI usually runs on pull requests, merge requests, commits, and scheduled checks. CD may run automatically after merge, after a release tag, after an approval, after an artifact is promoted, or when a GitOps controller observes a desired-state change.

## Recommended Stage Sequence

1. **Validation**
   Confirm the source change is reviewable, testable, and compatible with the existing codebase.

2. **Build and package**
   Convert source code into immutable artifacts: container images, packages, binaries, static bundles, SBOMs, provenance records, or deployment bundles.

3. **Infrastructure deploy**
   Create or update the platform layer the application depends on: networks, clusters, databases, queues, IAM, ingress, observability, and runtime configuration.

4. **Application deploy**
   Roll the built artifact into one or more environments using push deployment, GitOps reconciliation, progressive delivery, or manual promotion.

5. **Post-deploy verification**
   Confirm the release is healthy through smoke tests, health checks, metrics, logs, traces, synthetic checks, and rollback readiness.

## Stage Reference

### 1. Validation

Validation should fail fast before expensive builds or deployments start.

#### Responsibilities

- prove the change can be integrated,
- give reviewers and authors fast feedback,
- separate deterministic checks from judgment-based checks,
- record enough output for debugging without requiring local reproduction.

#### Typical Inputs

- source commit or pull request,
- dependency lockfiles,
- changed-file or changed-package metadata,
- language/runtime versions,
- test fixtures and service dependencies,
- lint, typecheck, and test configuration.

#### Typical Outputs

- pass/fail status,
- test reports and coverage summaries,
- lint/typecheck/static-analysis findings,
- review annotations,
- cached dependency or build layers,
- confidence signal for later build and deploy stages.

#### Deterministic Checks

These checks should produce the same result for the same input when the environment is controlled:

- formatting,
- linting,
- type checking,
- unit tests,
- integration tests with pinned dependencies,
- contract tests,
- schema compatibility checks,
- migration dry-runs,
- policy-as-code checks for repository rules.

Recommended flow:

1. Check out the exact revision.
2. Install or restore the required toolchain.
3. Restore dependency and build caches using lockfile-aware keys.
4. Detect the changed service, package, or module when the repository structure supports it.
5. Run the cheapest checks first: format, lint, typecheck.
6. Run tests in parallel by package, service, shard, or test class.
7. Publish reports, annotations, and status checks.

#### Judgment-Based Or Probabilistic Checks

These checks increase confidence but should not be treated like pure deterministic tests unless the team intentionally makes them blocking:

- human code review,
- architectural review,
- AI-assisted review,
- static-analysis risk scoring,
- dependency vulnerability triage,
- flaky-test detection,
- performance regression interpretation,
- third-party SaaS review comments.

Use them to surface risk, route attention, or require approval. Be explicit about which findings are advisory and which findings block merge.

#### Common Pitfalls

- running every test for every tiny change when changed-scope detection would be reliable,
- using caches that are not keyed by lockfiles or toolchain versions,
- hiding test output behind collapsed logs,
- treating flaky tests as harmless noise,
- mixing review comments, security findings, and deterministic test failures into one unclear status,
- allowing local-only scripts to diverge from CI commands.

### 2. Build And Package

Build converts validated source into a deployable artifact. Deployment should consume artifacts, not rebuild source in each environment.

#### Responsibilities

- produce immutable artifacts,
- attach metadata that links artifact to source revision,
- publish artifacts to an appropriate registry or storage location,
- make artifacts promotable across environments,
- avoid leaking secrets into images, packages, logs, or bundles.

#### Typical Inputs

- validated source revision,
- dependency lockfiles,
- Dockerfile, buildpack, package manifest, or build script,
- runtime base images,
- build arguments and non-secret configuration,
- registry credentials or workload identity,
- versioning rules.

#### Typical Outputs

- container image, binary, package, static bundle, or deploy bundle,
- image digest or artifact checksum,
- semantic version, build number, commit SHA tag, or release tag,
- SBOM and provenance attestation when required,
- published artifact URL or registry reference.

#### Recommended Flow

1. Check out the exact revision.
2. Authenticate to the artifact registry with least-privilege credentials.
3. Set up the build engine and dependency cache.
4. Build the artifact once.
5. Tag the artifact with both human-readable and immutable identifiers.
6. Push the artifact.
7. Publish artifact metadata for downstream deploy jobs.

Use immutable references, such as image digests, for deployment when possible. Human-readable tags are useful for operators, but they can move unless the registry enforces immutability.

#### Common Pitfalls

- rebuilding separately for staging and production instead of promoting one artifact,
- relying only on mutable tags such as `latest`,
- mixing build-time secrets into artifacts,
- allowing build scripts to download unpinned dependencies,
- failing to capture source revision, version, and artifact digest together,
- publishing artifacts before validation has enough confidence.

### 3. Infrastructure Deploy

Infrastructure deploy changes the environment that applications run on. It may happen before app deploy, independently from app deploy, or as part of a coordinated release.

#### Responsibilities

- manage shared platform resources safely,
- keep desired infrastructure state versioned,
- preview changes before applying when possible,
- separate read-only planning from write-capable applying,
- protect production with approvals, policy checks, and rollback or recovery plans.

#### Typical Inputs

- infrastructure-as-code definitions,
- environment-specific variables,
- current remote state,
- cloud or platform credentials,
- policy rules,
- manual approval context for sensitive environments.

#### Typical Outputs

- plan or diff,
- applied infrastructure changes,
- updated state,
- audit trail,
- endpoints, connection strings, secrets references, or runtime configuration needed by application deploy.

#### Recommended Flow

1. Validate and format IaC definitions.
2. Authenticate with environment-scoped, least-privilege identity.
3. Run a read-only plan or diff.
4. Evaluate policy and security gates.
5. Request approval for sensitive or production changes.
6. Apply the change with concurrency control around shared state.
7. Export outputs needed by application deployment.
8. Verify resource health and drift status.

In cloud examples, this often means separate identities for image publishing, infrastructure planning, and infrastructure applying. In Kubernetes examples, this may mean separate permissions for namespace management, cluster-scoped resources, and app-level resources.

#### Common Pitfalls

- using one broad credential for build, plan, and apply,
- applying infrastructure changes without a visible diff,
- allowing parallel applies against the same state,
- mixing platform bootstrap changes with routine app rollout changes,
- making application deploy depend on hidden manual infrastructure edits,
- treating secrets values as normal pipeline variables instead of references to a secrets manager.

### 4. Application Deploy

Application deploy moves a known artifact into an environment. The deployment mechanism can be push-based or pull-based.

#### Push-Based Deploy

A pipeline job directly calls the platform API or deployment tool:

- `kubectl apply`,
- Helm upgrade,
- Terraform apply for app-level resources,
- serverless deploy,
- VM rollout script,
- PaaS deploy command.

This is simple to understand, but the CI/CD system needs write access to the runtime environment.

#### Pull-Based GitOps Deploy

A pipeline updates desired state in Git, then a controller such as Argo CD, Flux CD, or another reconciler applies the change:

1. Build and publish the artifact.
2. Update the image tag, digest, Helm values, Kustomize overlay, or deployment manifest.
3. Commit the desired-state change.
4. Let the controller reconcile the environment.
5. Observe sync, health, and drift status.

This reduces direct CI/CD access to the cluster, but introduces a second feedback loop: the pipeline may finish before the environment is actually healthy.

#### Responsibilities

- deploy the artifact that was built and recorded,
- preserve environment-specific configuration,
- control rollout speed and blast radius,
- verify the release,
- support rollback, roll-forward, or redeploy.

#### Typical Inputs

- artifact reference and digest,
- deployment manifest or release configuration,
- environment target,
- feature flags and runtime configuration references,
- database migration plan,
- approval or promotion signal,
- deployment strategy settings.

#### Typical Outputs

- updated desired state,
- deployment revision,
- rollout status,
- health-check result,
- smoke-test result,
- release notes or change record,
- rollback reference.

#### Recommended Flow

1. Select the artifact to release.
2. Resolve environment-specific configuration without changing the artifact.
3. Run pre-deploy checks, including migration compatibility when needed.
4. Apply or commit the desired-state change.
5. Roll out progressively when risk justifies it.
6. Watch health signals until the release is accepted or failed.
7. Record the deployed version and environment outcome.

Database migrations can run before deploy, during deploy, or after deploy depending on the compatibility strategy. Expand-and-contract migrations often split work across releases; simpler migrations may run as a pre-deploy or deploy-time job; cleanup migrations may be safer after the new application version is stable.

#### Common Pitfalls

- deploying from source instead of a previously published artifact,
- overwriting environment-specific config during manifest updates,
- letting database migrations and app rollout race each other,
- assuming a GitOps commit means deployment has completed,
- skipping smoke tests because the platform reports the workload as running,
- lacking a defined rollback or roll-forward path.

### 5. Post-Deploy Verification

Post-deploy verification confirms whether the environment is actually serving the release safely. It closes the loop between deployment automation and operational reality.

#### Responsibilities

- verify the released version is reachable and healthy,
- distinguish platform readiness from application correctness,
- detect regressions through checks and observable signals,
- decide whether to accept the release, roll back, or roll forward,
- feed deployment results back into the pipeline, issue tracker, incident process, and future release decisions.

#### Typical Inputs

- deployed artifact reference and deployment revision,
- target environment and service endpoints,
- smoke-test suite,
- health-check endpoints,
- metrics, logs, and traces,
- synthetic checks or user-journey probes,
- SLOs, error-budget thresholds, or release acceptance criteria,
- rollback or roll-forward candidate version.

#### Typical Outputs

- release acceptance or rejection decision,
- smoke-test and synthetic-check results,
- health status and rollout status,
- metric snapshots or anomaly alerts,
- linked logs, traces, and dashboards,
- rollback, roll-forward, or redeploy action record,
- feedback status reported back to the pipeline.

#### Recommended Flow

1. Confirm the deployed revision matches the intended artifact reference.
2. Wait for platform-level readiness, such as pods, tasks, instances, or functions becoming available.
3. Run smoke tests against critical paths.
4. Run synthetic checks that represent important user journeys when the system supports them.
5. Inspect metrics for error rate, latency, traffic, saturation, and restart or crash signals.
6. Use logs and traces to investigate failures or unusual behavior.
7. Compare the observed state with release acceptance criteria.
8. Accept the release, roll back to a known-good version, or roll forward with a fix.
9. Publish the final outcome back to the pipeline and notify the responsible team.

Security and optimization checks may add extra gates here, such as runtime policy findings or performance regression thresholds, but those details belong in the security and optimization research docs.

#### Common Pitfalls

- treating a successful deploy command as proof that the release is healthy,
- checking only infrastructure readiness and not user-visible behavior,
- relying on manual dashboard inspection without explicit acceptance criteria,
- running smoke tests against the wrong environment or artifact version,
- failing to connect GitOps sync status with application health status,
- rolling back when a compatible roll-forward fix would be safer,
- rolling forward without understanding whether the current release is still harming users,
- losing verification results because they are not attached to the pipeline run or release record.

## Cross-Cutting Responsibilities

### Version And Artifact Traceability

Every deployment should answer:

- which source revision produced this artifact?
- which validation checks ran before it was built?
- which artifact digest or checksum was deployed?
- which environment received it?
- who or what approved the promotion?
- what health signals confirmed the outcome?

### Environment Promotion

Prefer promoting the same artifact through environments:

```text
build once -> deploy to dev -> promote to staging -> promote to production
```

Promotion may be automatic for low-risk environments and approval-gated for production. The key point is that promotion changes the target environment, not the artifact contents.

### Job Boundaries

Keep job boundaries aligned with responsibility:

- validation jobs should not need production credentials,
- build jobs should publish artifacts but not mutate runtime infrastructure,
- infrastructure jobs should not rebuild application source,
- deploy jobs should consume artifact metadata from the build stage,
- review and approval gates should be explicit, not hidden inside scripts.

### Feedback Loops

The pipeline should report status at each boundary:

- validation status for authors and reviewers,
- artifact status for release coordination,
- infrastructure plan/apply status for operators,
- deployment and health status for product and operations teams.

## Tool-Agnostic Mapping

| Concept | GitHub Actions / GitLab CI / Jenkins | Argo CD / Flux CD / GitOps |
| --- | --- | --- |
| Trigger | PR, merge request, commit, tag, schedule, manual dispatch | Git commit, registry event, webhook, controller poll |
| Validation | Jobs, stages, matrix builds, status checks | Usually outside the GitOps controller |
| Build | Runner builds and publishes artifacts | Usually outside the GitOps controller |
| Infra deploy | IaC job, protected environment, manual approval | Controller can reconcile cluster resources from Git |
| App deploy | Job pushes change directly or updates desired state | Controller pulls desired state and applies it |
| Feedback | Job logs, checks, artifacts, annotations | Sync status, health status, drift detection, events |

## Reference Pattern From The Capstone

The capstone reference demonstrates one common flow without being the only valid flow:

1. Detect which services changed.
2. Run tests for affected services.
3. Build and push container images.
4. Update deployment manifests with the new image reference.
5. Commit the desired-state change for deployment.
6. Export timing data for later pipeline optimization.

Presentation writers can reuse this as an example of separation of concerns: validation proves source quality, build publishes an artifact, manifest updates describe desired runtime state, and deployment tooling reconciles or applies that state.

## Terms To Use Consistently

- **Pipeline**: the end-to-end automated flow from source change to feedback.
- **Job**: a unit of work in a pipeline.
- **Stage**: a logical group of jobs with a shared purpose.
- **Runner/agent/executor**: the compute environment that runs jobs.
- **Artifact**: a built output that can be stored, promoted, and deployed.
- **Immutable artifact**: an artifact whose contents do not change after publication.
- **Environment**: a target runtime such as dev, staging, production, or preview.
- **Promotion**: moving an already-built artifact to a later environment.
- **Desired state**: the versioned declaration of what an environment should run.
- **Reconciliation**: a controller comparing desired state to actual state and correcting drift.
- **Gate**: an automated or manual decision point before proceeding.
- **Rollback**: returning to a previous known-good version.
- **Roll-forward**: fixing the issue with a newer version rather than reverting.
