# CI/CD Security Research Notes

Purpose: structured reference material for later presentation docs. This is not
final presentation prose.

CI/CD security is about controlling the path from source change to production
change. A pipeline is a privileged automation system: it can read source code,
build artifacts, publish images, mutate infrastructure, deploy applications, and
sometimes access runtime secrets. Good CI/CD design makes those powers explicit,
small, auditable, and reversible.

## Core Framing

- Treat the pipeline as production infrastructure, not just a developer helper.
- Prefer short-lived identity over long-lived credentials.
- Split validation, build, publish, infrastructure deploy, and application deploy
  into separate trust boundaries.
- Make every privileged action answer: who can trigger it, what identity does it
  use, what can it change, what evidence does it leave, and how can it be safely
  undone?
- Security gates should reduce unreviewed risk without turning every deployment
  into manual ceremony.

## Threat Model for CI/CD

| Risk area | Typical failure | Control direction |
| --- | --- | --- |
| Secrets | Keys committed to Git, leaked in logs, stored in build artifacts, or left valid after incidents | Secret manager, masking, scoped injection, rotation, revocation |
| Identity | Shared deploy account or static cloud keys used by all jobs | Federated identity, per-job roles, least privilege, explicit trust policies |
| Source control | Unreviewed code reaches trusted branches | Pull request review, branch protection, signed commits where useful, merge gates |
| Build system | Compromised runner, dependency, or third-party action changes artifacts | Ephemeral runners, pinned tools, dependency scanning, reproducible build inputs |
| Artifact integrity | Deployed artifact does not match reviewed source | Immutable tags, provenance, SBOM, signing, deploy-time verification |
| Deployment | Validation job can mutate infrastructure, or untrusted PR can deploy | Environment separation, read-only plan roles, approval gates, protected environments |
| Operations | Bad release cannot be investigated or rolled back quickly | Logs, release evidence, health checks, runbooks, versioned rollback path |

## Secrets and Sensitive Values

Key idea: secrets should not live in source control or pipeline configuration as
plaintext. CI/CD should request them only when needed, expose them only to the
specific job that needs them, and leave an audit trail for reads and rotations.

Reference points for presentation agents:

- Avoid static cloud keys in CI/CD variables when the platform supports
  short-lived federation.
- Store operational secrets in a dedicated secret manager or equivalent, with
  encryption, access logging, ownership, and rotation metadata.
- Inject secrets at the narrowest practical scope: one job, one environment, one
  deployment target.
- Masking log output is a backup control, not the main control. Design jobs so
  secrets are not echoed, archived, or embedded in artifacts.
- Treat infrastructure state files, build caches, test reports, crash dumps, and
  container layers as possible secret storage locations.
- Codify rotation and revocation: who rotates, which systems receive the new
  value, how old values are invalidated, and how rollback behaves during
  rotation.

Useful distinction:

- Configuration: non-sensitive values such as region, service name, feature
  flags, image repository.
- Secret: value that grants access, proves identity, decrypts data, or bypasses a
  control.

## Permissions, Least Privilege, and OIDC

CI/CD jobs should not share one all-powerful identity. Each job should receive
only the permissions needed for that stage.

Common pattern:

1. Validation job: read source, install dependencies, run checks, upload reports.
   No cloud mutation permission.
2. Infrastructure plan job: read source and current infrastructure state, produce
   a reviewable plan. No apply permission.
3. Infrastructure apply job: mutate infrastructure only after protected branch
   and environment approval.
4. Image publish job: build and push images only to approved registries.
5. Application deploy job: update deployment version or sync GitOps state only
   for approved targets.

OIDC or federated identity replaces long-lived CI secrets with short-lived tokens.
Important design details:

- Trust policy should restrict repository/project, branch or environment, token
  audience, and allowed workflow context.
- Jobs request identity tokens only when needed.
- Cloud roles should be split by action: plan, apply, image push, app deploy,
  audit read, secret read.
- Permission boundaries or policy-as-code can prevent automation from creating
  broader privileges than intended.
- Human operators need their own access model, usually SSO/MFA plus role
  assignment, rather than borrowing CI/CD credentials.

Presentation angle: least privilege is easier to explain by stage than by
vendor-specific IAM syntax.

## Environment Separation

Environments are both deployment targets and trust levels. Development,
staging, and production should differ in data sensitivity, approval rules, secret
scope, deployment frequency, and blast radius.

Controls to highlight:

- Separate secrets per environment.
- Separate deploy identities per environment.
- Protect production with stricter branch, review, and approval gates.
- Keep pull request workflows read-only unless the contributor and context are
  trusted.
- Do not let test or preview environments access production data by default.
- Make destructive operations explicit, manually confirmed, and auditable.

## Supply-Chain Security

Supply-chain security asks whether the artifact being deployed can be trusted.
CI/CD is the natural enforcement point because it sees source, dependencies,
build steps, artifacts, registries, and deployment targets.

Control areas:

- Source review: pull requests, CODEOWNERS or reviewer rules, branch protection,
  merge checks.
- Build dependency control: pinned third-party actions/plugins, locked package
  versions, checksum verification where available.
- Runner hygiene: ephemeral or isolated runners, clean workspaces, no shared
  secrets across unrelated jobs.
- Artifact integrity: immutable artifact identifiers, content digests, image
  tags tied to commit SHAs.
- Promotion model: promote the same artifact across environments instead of
  rebuilding a different artifact for each environment.

Anti-patterns:

- Deploying from a developer laptop as the normal path.
- Rebuilding from a mutable branch during production deploy.
- Using `latest` as the release identity.
- Giving third-party CI extensions write access without pinning, review, or
  isolation.

## Dependency Scanning

Dependency scanning is a feedback system, not a single tool choice. It should
cover direct dependencies, transitive dependencies, package lockfiles, container
base images, and CI/CD plugins/actions.

Pipeline uses:

- Run software composition analysis during pull requests for early feedback.
- Run vulnerability scans during artifact or image build before publish.
- Define severity thresholds and exception rules. For example: block critical
  exploitable findings unless an approved exception exists.
- Track license risks separately from vulnerability risks.
- Keep scan reports as artifacts so reviewers can see what changed.
- Pair scanning with dependency update automation so fixes are reachable.

Important nuance: advisory-only scanning is useful for visibility, but it is not
a release control unless the pipeline can block, require an exception, or route
approval.

## Container and Image Security

Container pipelines add a second supply chain: base image, build context, layers,
registry, runtime platform, and image pull permissions.

Reference controls:

- Use minimal, maintained base images.
- Keep build and runtime stages separate with multi-stage builds when possible.
- Avoid copying secrets into images or leaving package manager credentials in
  layers.
- Tag images with immutable identifiers such as commit SHA and record the digest.
- Enable registry immutability or policies that prevent silent tag replacement.
- Scan images before they become deployment inputs.
- Limit who can push images and which repositories a pipeline can write.
- Prefer deploy by digest for high assurance environments.

## Provenance, SBOM, and Signing

These controls answer: "What is this artifact, where did it come from, and has it
changed since the trusted build?"

- Provenance: metadata about source revision, build workflow, builder identity,
  inputs, and output artifact.
- SBOM: inventory of software components inside an artifact.
- Signing: cryptographic statement that an artifact or attestation came from a
  trusted identity.
- Verification: deploy-time policy that checks signatures, provenance, or SBOM
  requirements before release.

Maturity path:

1. Tag artifacts with commit SHA and store build logs.
2. Produce SBOMs and vulnerability reports as build artifacts.
3. Sign images or release artifacts.
4. Generate signed provenance/attestations.
5. Enforce verification before deployment, especially for production.

Presentation angle: SHA tags identify "which build"; provenance explains "why we
trust this build."

## Compliance and Policy Gates

Compliance gates should be expressed as checks that are understandable to
developers and reviewable by security or operations.

Examples:

- Infrastructure plan must be produced before apply.
- High-risk infrastructure changes require approval.
- Critical vulnerabilities block release unless an exception is documented.
- Production deploy requires protected branch, passing checks, and environment
  approval.
- Secrets must not be added to source control.
- Required logs, reports, and attestations must be retained for a defined period.

Policy-as-code can enforce repeatable rules for infrastructure, Kubernetes
manifests, dependencies, container images, and access policies. Manual approvals
still matter for business risk, exceptions, and irreversible operations.

## Auditability and Evidence

Auditability is not only for formal compliance. It also helps teams understand
what changed during incidents.

Evidence worth preserving:

- Pull request discussion, reviewer approvals, and merge commit.
- CI logs and status checks.
- Test, scan, and policy reports.
- Terraform or infrastructure plans.
- Artifact digest, SBOM, provenance, and signature.
- Deployment records: who/what deployed, when, to which environment, and which
  version.
- Secret read and rotation logs.
- Runtime monitoring and incident notes.

Good evidence is tamper-resistant, searchable, time-bound, and tied to release
identity.

## Incident-Safe Rollback

Rollback is a security control because it limits blast radius after a bad change,
compromised artifact, leaked secret, or failed deploy.

Design requirements:

- Release identity is immutable and visible in runtime.
- Previous known-good version can be redeployed without rebuilding.
- Database or schema changes have forward/backward compatibility plans.
- Feature flags can disable risky behavior without a full redeploy.
- Health checks and smoke tests detect failed deploys quickly.
- Rollback runbooks clarify who can act and which approvals are bypassed or
  preserved during incidents.
- Secret compromise response includes revocation and redeploy, not only image or
  code rollback.

Teaching point: "rollback" is not just a button. It depends on artifact
immutability, deployment records, environment separation, and operational
practice.

## Security Topics to Reuse in Presentation Docs

- CI/CD makes delivery faster, but it also concentrates power; secure design
  keeps that power bounded.
- "Easy CI/CD" means common tasks are automated. "Hard CI/CD" means automation
  must handle identity, secrets, artifacts, evidence, and rollback.
- Security and speed are not opposites when controls are automated and stage
  specific.
- AI-assisted development increases the need for strong CI/CD gates because more
  code and configuration can be produced faster than humans can manually inspect.
- The strongest story is lifecycle-based: code review -> validation -> build ->
  sign/scan -> deploy -> observe -> rollback.

## Open Questions for Later Docs

- Which security controls should be shown as beginner-friendly concepts versus
  advanced production hardening?
- Should the presentation use one concrete pipeline example throughout, or keep
  examples platform-neutral?
- How much detail should be given to OIDC/federation before it becomes too
  vendor-specific?
- Where should AI security fit: code review support, policy explanation,
  incident investigation, or all three?
