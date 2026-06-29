# CI/CD Optimization Research

CI/CD optimization is not only about making a pipeline "fast." The real goal is to shorten the feedback loop while preserving trust. A fast pipeline that hides failures, deploys inconsistently, or exhausts runner capacity is not optimized; it is just risky.

Useful optimization work usually asks four questions:

1. Can we fail earlier?
2. Can we avoid repeating work?
3. Can we split work safely?
4. Can we spend more only where the feedback is worth the cost?

This document keeps the original strategy framing and maps each strategy to practical CI/CD pipeline patterns.

## Optimization Principles

### Feedback-loop first

Optimize for the time between a developer action and a useful answer:

- Pull request opened -> validation result.
- Commit pushed -> broken assumption detected.
- Merge completed -> deployable artifact created.
- Release requested -> environment updated safely.

The best pipeline design gives cheap, high-signal feedback first, and reserves slower or more expensive checks for later stages.

### Trust is part of performance

Skipping work is only an optimization if the remaining signal is still trustworthy. A pipeline that uses change detection, caching, or parallelism should still make it obvious:

- what was tested,
- what was skipped,
- what artifact was produced,
- which commit and configuration produced it,
- whether a deploy is still waiting on a lock or approval.

### Optimize the whole path, not one job

A single slow job may be obvious, but the actual bottleneck might be elsewhere:

- queue time before a runner starts,
- repeated dependency installs across jobs,
- serialized tests that could be sharded,
- slow container rebuilds caused by poor Dockerfile layering,
- long artifact upload/download time,
- deployment waits caused by environment contention.

Measure queue time, setup time, execution time, upload/download time, and deployment wait time separately.

## Practical Pipeline Patterns

### 1. Do no work: fail fast

Fail-fast design detects invalid work before expensive stages begin.

Common uses:

- Validate pipeline configuration before provisioning runners for large jobs.
- Run formatting, lint, type checks, and dependency lockfile checks before build or integration tests.
- Detect missing secrets, invalid environment names, malformed version tags, or unsupported branch names at the beginning.
- Cancel superseded runs when a newer commit arrives on the same branch.
- Stop a matrix early when one critical axis fails, if later axes would not add useful information.

Common equivalents:

- GitHub Actions: `concurrency` with cancel-in-progress, matrix `fail-fast`, lightweight preflight jobs.
- GitLab CI: `interruptible`, staged jobs, `rules`.
- Jenkins: early stages, `milestone`, `lock`, `parallel` fail-fast behavior.
- Buildkite/CircleCI: cancel previous builds, conditional steps, dependency gates.

Reference notes for presentation agents:

- "Fail fast" should not mean hiding the full failure picture. For pull requests, it can be useful to run all cheap checks even after one fails, while preventing expensive deploy-like work.
- A good rule is: fail fast before costly work; collect enough detail where developer correction would benefit from multiple failures at once.

### 2. Do less work: incremental validation

Incremental work avoids running the full pipeline when a smaller, correct subset is enough.

Common uses:

- Path-based triggers: documentation-only changes skip application build and deploy jobs.
- Monorepo affected-project detection: run tests only for packages touched by a change and their dependents.
- Test selection: run unit tests related to changed modules first, then broader suites later.
- Infrastructure change detection: run Terraform plan only when infrastructure files or shared modules change.
- Image rebuild selection: rebuild only services whose source, base image, or build context changed.

Risks:

- Change detection can be wrong if dependency relationships are incomplete.
- Shared files, generated code, lockfiles, base images, and global configuration often affect more than the directly changed path.
- Overly aggressive skipping can create false confidence.

Useful safeguards:

- Maintain an explicit dependency graph for packages, services, and infra modules.
- Treat changes to shared config, lockfiles, schemas, and base images as broad invalidation events.
- Run a scheduled full validation to catch gaps in selective logic.
- Make skipped jobs visible in pipeline output with a reason.

### 3. Do work in parallel: matrices, sharding, and fan-out/fan-in

Parallelism reduces elapsed time by splitting independent work across runners.

Common uses:

- Matrix builds across language versions, operating systems, architectures, regions, or service variants.
- Test sharding by file, package, duration, or historical timing.
- Fan-out jobs for lint, unit tests, type checks, static analysis, and build.
- Fan-in gate that waits for required results before merge or deployment.

Common equivalents:

- Matrices in GitHub Actions, GitLab `parallel:matrix`, CircleCI matrix jobs, Jenkins parallel stages.
- Test splitters using historical timings or static partitioning.
- Fan-out/fan-in dependency graphs using `needs`, stages, or pipeline DAGs.

Design notes:

- Parallelism helps only when enough runner capacity exists. Otherwise, it can move time from execution into queueing.
- Very small shards can waste time on setup overhead.
- Uneven shards cause a long-tail problem: most jobs finish quickly, but one shard holds the whole pipeline open.
- Shared databases, registries, or test environments can become contention points.

Practical pattern:

1. Split expensive suites into shards by historical duration, not just number of files.
2. Give each shard isolated resources or unique namespaces.
3. Upload machine-readable test results from every shard.
4. Merge results in a final gate that preserves one clear pass/fail signal.

### 4. Do work before the actual work: precomputation and warm paths

Some work can happen before the developer is waiting for it.

Common uses:

- Pre-build base container images on a schedule or when base dependencies change.
- Maintain warm dependency caches for active branches.
- Generate SDKs, schemas, or docs in a dedicated producer pipeline and reuse artifacts downstream.
- Pre-provision ephemeral environments or runner images with common toolchains.
- Run nightly full regression suites so pull request pipelines can stay focused.

Tradeoff:

- Precomputation reduces interactive wait time but adds background cost and cache invalidation complexity.
- It works best for stable inputs such as base images, toolchains, dependency stores, and generated clients.

### 5. Do work only once: idempotence and artifact promotion

CI/CD should avoid rebuilding the same logical output multiple times.

Common uses:

- Build an artifact once, then promote the exact artifact through test, staging, and production.
- Build a container image once, tag it with an immutable digest or commit SHA, and deploy that digest.
- Store compiled assets, package archives, SBOMs, and test reports as artifacts.
- Use deployment jobs to reference an already-built artifact instead of rebuilding from the branch.

Why it matters:

- Rebuilding during deployment can produce a different result if dependencies, base images, or generated assets changed.
- Promoting the same artifact improves traceability and rollback.
- Idempotent jobs can be retried safely after network, runner, or API failures.

Idempotent job design:

- Use deterministic versioning based on commit SHA, build number, or release tag.
- Make create/update operations safe to repeat.
- Separate "plan" and "apply" where possible for infrastructure.
- Write deployment steps so a retry converges on the intended state instead of duplicating resources.

### 6. Do work with previous results: caching

Caching saves work by reusing outputs from previous runs.

Common cache targets:

- Package manager dependencies: npm/pnpm/yarn, Maven/Gradle, pip/Poetry, Cargo, Go modules.
- Compiler and build outputs: TypeScript, Babel, Gradle, Bazel, Turborepo, Nx.
- Docker layers: BuildKit cache, registry-backed layer cache, local runner layer cache.
- Test framework caches: browser binaries, coverage instrumentation, transformed modules.
- Tool downloads: linters, scanners, CLIs, language runtimes where safe.

Common equivalents:

- GitHub Actions cache, GitLab cache, CircleCI save/restore cache, Buildkite plugins, Jenkins persistent workspaces.
- Docker BuildKit `cache-from` and `cache-to`, registry cache images, Docker layer cache.
- Remote build caches for Bazel, Gradle, Turborepo, Nx, and similar tools.

Cache key strategy:

- Key dependency caches by lockfile and platform.
- Key build caches by source inputs, compiler options, environment, and tool versions.
- Use restore keys for partial matches, but avoid restoring incompatible dependencies.
- Include OS, architecture, package manager version, and language version when they affect output.

Cache invalidation risks:

- Stale caches can hide missing dependencies or produce non-reproducible builds.
- Cross-branch caches can leak incorrect intermediate state when keys are too broad.
- Untrusted pull requests should not be allowed to poison privileged caches.
- Large caches can cost more to download/upload than they save.

Practical rule:

- Cache dependencies and intermediate computation.
- Treat release artifacts as immutable artifacts, not mutable caches.
- Measure cache hit rate and cache transfer time; delete or narrow caches that do not pay for themselves.

### 7. Do work with less: artifact size and compression

Pipelines often spend surprising time moving data.

Common uses:

- Upload only required artifacts, not entire workspaces.
- Use test reports and coverage summaries instead of huge raw logs where possible.
- Compress large artifacts when network transfer is the bottleneck.
- Split artifacts by consumer so each downstream job downloads only what it needs.
- Prefer registry or object storage reuse for large binaries and images.

Tradeoff:

- Compression helps when network is slower than CPU.
- Compression hurts when artifacts are already compressed or CPU is the bottleneck.
- Artifact retention policies affect both cost and debuggability.

### 8. Do work when required: lazy and conditional execution

Conditional jobs keep pipelines focused on the current decision.

Common uses:

- Run preview environment deployment only for pull requests with a specific label.
- Run production deployment only for release tags or approved main-branch workflows.
- Run expensive end-to-end tests only after unit tests and build pass.
- Run security scans at different depths depending on event type: pull request, merge, release, scheduled audit.
- Trigger downstream service integration tests only when a contract, schema, or API surface changes.

Design notes:

- Conditions should be explicit and visible.
- Critical checks should not depend on labels or manual actions that are easy to forget.
- Conditional execution pairs well with scheduled full runs for defense in depth.

### 9. Do work without contention: concurrency controls and deployment locks

CI/CD systems need to prevent two valid pipelines from fighting over the same resource.

Common contention points:

- Shared staging environments.
- Database migrations.
- Terraform state files.
- Package or container publishing for the same version.
- Preview environment names.
- Production deployment windows.

Common equivalents:

- Concurrency groups and environment locks.
- Deployment queues.
- Terraform state locking.
- Kubernetes rollout locks or GitOps reconciliation controls.
- Jenkins locks, GitLab resource groups, GitHub environment protection and concurrency.

Practical patterns:

- Allow validation jobs to run concurrently, but serialize deployment to the same environment.
- Use one lock per protected resource, not one global lock for the whole pipeline.
- Cancel outdated deployment requests for preview environments, but queue production deployments deliberately.
- Make lock waiting time visible; long waits are capacity or process signals.

### 10. Do work near the data: locality

Locality reduces time spent moving source, dependencies, images, and artifacts.

Common uses:

- Run jobs in the same region as artifact storage, container registry, or deployment target.
- Use registry mirrors for dependency and container downloads.
- Keep self-hosted runners near private infrastructure when jobs need private network access.
- Use local caches on long-lived runners for large dependency stores or Docker layers.
- Avoid repeatedly downloading large artifacts across regions or providers.

Risks:

- Self-hosted or long-lived runners need stronger isolation and cache hygiene.
- Local caches can improve speed but make runs less reproducible if not managed carefully.
- Data locality should not bypass security boundaries.

### 11. Do work adaptively: runner capacity and autoscaling

Pipeline speed depends on runner availability as much as job duration.

Metrics to separate:

- Queue time: waiting for a runner.
- Setup time: checkout, toolchain, cache restore.
- Execution time: actual work.
- Transfer time: artifact and cache upload/download.
- Wait time: locks, approvals, deployment windows.

Capacity strategies:

- Autoscale runners for bursty pull request traffic.
- Use larger runners for jobs that are CPU, memory, or IO bound.
- Use specialized runners for Docker builds, browser tests, mobile builds, or GPU work.
- Reserve capacity for high-priority release or hotfix workflows.
- Set job timeouts to prevent stuck jobs from consuming capacity indefinitely.

Cost/performance tradeoffs:

- More parallel jobs can reduce elapsed time but increase compute spend.
- Larger runners can be cheaper if they finish much faster, but wasteful for small tasks.
- Persistent runners improve cache warmth but require maintenance and security controls.
- Hosted runners reduce maintenance but may increase queue time or limit environment customization.

Useful presentation framing:

- Optimization is a product decision: decide which feedback loops deserve premium speed.
- Not every check needs the fastest runner. The highest value is usually in pull-request validation, release gates, and rollback paths.

## Flaky-Test Control

Flaky tests damage CI/CD because they make pipeline feedback untrustworthy. Speed work should include flake control, not just retries.

Common causes:

- Shared mutable state between tests.
- Time-based assertions and race conditions.
- Network or third-party dependency instability.
- Insufficient isolation in databases, queues, object storage, or browser sessions.
- Tests that depend on execution order.
- Resource starvation on undersized runners.

Control patterns:

- Quarantine known flaky tests into a separate visible job, with ownership and a deadline.
- Retry only to collect signal, not to hide failure. Report both initial failure and retry pass.
- Track flake rate by test, suite, owner, and environment.
- Make tests deterministic with isolated fixtures, unique namespaces, controlled clocks, and mocked external boundaries where appropriate.
- Separate product failures from infrastructure failures in reporting.
- Fail the pipeline when flake budget is exceeded.

Balanced retry policy:

- Unit tests: prefer no retries; fix determinism quickly.
- Integration/browser tests: limited retries can reduce noise, but initial failures must remain visible.
- Deployment steps: retry transient network/API operations only if the operation is idempotent.

## Feedback-loop Design by Stage

### Pull request validation

Goal: help the author fix problems quickly before review and merge.

Good candidates:

- Formatting and lint.
- Type checks.
- Unit tests.
- Changed-package tests.
- Lightweight dependency and security checks.
- Build verification.
- Preview environment only when useful for review.

Optimization emphasis:

- cheap checks first,
- matrix only where it catches real compatibility risk,
- cache dependency installs,
- cancel superseded runs,
- show skipped work clearly.

### Merge to main

Goal: confirm the integrated branch is healthy and create deployable artifacts.

Good candidates:

- Full build.
- Broader test suite.
- Container image build and publish.
- Artifact generation.
- SBOM/provenance generation where relevant.
- Staging deploy or GitOps update.

Optimization emphasis:

- build once,
- promote immutable artifacts,
- serialize shared environment updates,
- preserve traceability from commit to artifact to deployment.

### Release and production deployment

Goal: update an environment safely and predictably.

Good candidates:

- Deployment lock.
- Approval or policy gate where needed.
- Migration plan/apply.
- Progressive rollout.
- Smoke tests and health checks.
- Rollback readiness.

Optimization emphasis:

- do not rebuild during deploy,
- make retries idempotent,
- keep deployment queue visible,
- optimize rollback path as a feedback loop.

### Scheduled or background validation

Goal: preserve confidence without slowing every pull request.

Good candidates:

- Full regression suite.
- Long-running end-to-end tests.
- Deep security scans.
- Dependency update validation.
- Base image rebuilds.
- Cache warming.

Optimization emphasis:

- move expensive checks out of interactive paths when acceptable,
- feed findings back into pull request rules when they become high-signal,
- avoid making scheduled jobs invisible maintenance debt.

## Cost and Performance Decision Table

| Strategy | Improves | Costs/Risks | Good fit |
| --- | --- | --- | --- |
| Fail fast | Developer wait time, compute spend | May hide later failures if too aggressive | Preflight checks, invalid configs, superseded runs |
| Incremental work | Pull request speed | Incorrect skip logic | Monorepos, docs-only changes, service-specific builds |
| Parallelism | Wall-clock time | Runner cost, queue pressure, long-tail shards | Test suites, compatibility matrices |
| Caching | Setup/build time | Stale or poisoned caches, transfer overhead | Dependencies, Docker layers, build systems |
| Artifact promotion | Reproducibility, deploy speed | Artifact storage and retention decisions | Release pipelines, container deploys |
| Conditional jobs | Pipeline focus | Hidden skipped work, missed coverage | Preview envs, expensive scans, release-only gates |
| Deployment locks | Safety | Wait time, queues | Shared environments, infra state, production |
| Autoscaling runners | Queue time | Cloud spend, runner security | Bursty PR traffic, release windows |

## Anti-patterns

- Rebuilding separately for each environment instead of promoting one artifact.
- Using broad cache keys that restore incompatible dependencies.
- Retrying flaky tests until they pass without tracking the initial failure.
- Parallelizing jobs while all shards fight for one shared database or environment.
- Running expensive end-to-end tests before cheap compile or unit failures are known.
- Treating a deployment lock as a global pipeline lock.
- Hiding skipped jobs so reviewers cannot tell what was validated.
- Measuring only job execution time while ignoring queue time and lock wait time.
- Optimizing for average pipeline time while ignoring p95/p99 slow paths.

## Terms and Equivalents

- Matrix: a way to run the same job across multiple dimensions such as OS, language version, service, or shard.
- Shard: a slice of a larger test suite or workload.
- Cache: reusable intermediate data that can be invalidated and regenerated.
- Artifact: an output of a specific run that should be traceable and usually immutable.
- Docker layer cache: reuse of container image build layers across builds.
- Build cache: reuse of compilation or bundling outputs based on source inputs.
- Concurrency control: rules that cancel, queue, or serialize runs that target the same branch, environment, or resource.
- Deployment lock: a specific concurrency control that prevents conflicting deployments.
- Fan-out/fan-in: split work into parallel jobs, then merge results into a final gate.
- Runner capacity: available compute workers for pipeline jobs.
- Queue time: time spent waiting for runner capacity before work starts.

## Presentation Reuse Notes

Later presentation docs can reuse these points:

- CI/CD optimization is feedback-loop design, not just speed tuning.
- The order of work matters: cheap, deterministic checks should run before expensive or stateful work.
- Caching and parallelism are powerful but must be paired with correctness controls.
- Flaky tests are a performance problem because they slow decisions and reduce trust.
- Artifact promotion connects optimization with reliability: build once, deploy the same thing everywhere.
- Runner capacity, queue time, and deployment locks should be discussed alongside job duration.
- Cost/performance decisions depend on which feedback loop matters most: pull request, merge, release, rollback, or scheduled assurance.
