# GitOps Refactor Implementation Plan

Status: planned
Related ADR: [`docs/adr/0007-gitops-owned-cluster-platform.md`](../adr/0007-gitops-owned-cluster-platform.md)
Related checklist: [`docs/plan/gitops-refactor-checklist.md`](./gitops-refactor-checklist.md)

## Goal

Move Hiraya dev from a monolithic Terraform platform stack that owns both AWS and Kubernetes resources to the ADR-0007 layered model:

```text
Project Bootstrap  -> durable dev foundation
Platform Core      -> AWS/EKS foundation, no Kubernetes/Helm providers
Cluster Bootstrap  -> Argo CD install and GitOps handoff
Cluster Platform   -> Argo CD-owned platform add-ons/controllers
GitOps Apps        -> Argo CD-owned workload manifests
```

This is a one-PR refactor because there is no live dev infrastructure to preserve. The PR must still be internally phased with reviewable commits/checklist items because it changes IAM, Terraform state layout, GitOps structure, CI/CD workflows, and destroy behavior.

## Deployment impact

- The dev EKS platform will be rebuilt from new Terraform state keys instead of migrated from the legacy `dev/platform` state.
- Public routes stay the same after rebuild:
  - `https://hiraya.noidilin.dev`
  - `https://argocd.hiraya.noidilin.dev`
  - `https://grafana.hiraya.noidilin.dev`
- The dev EKS API public endpoint remains an explicit temporary toggle so GitHub-hosted deploy/bootstrap/smoke jobs can reach the cluster.
- The shared ALB, Route 53 records, and Kubernetes add-ons become controller/GitOps managed; destroy must prune GitOps resources before Terraform destroys EKS/VPC.
- After acceptance deploy + destroy, leave dev infrastructure destroyed to avoid runtime cost.

## Non-goals

- Do not implement ADOT in this migration. When ADOT is added later, Terraform owns IAM/CloudWatch-side resources and Argo CD owns in-cluster collector manifests.
- Do not add SSO, WAF, or IP allowlists for public Argo CD/Grafana in this slice. Use strong generated Secrets Manager-backed credentials only.
- Do not switch from IRSA to EKS Pod Identity.
- Do not preserve Vintage PostgreSQL data across rebuilds.
- Do not run Cluster Bootstrap plans in PR CI; it depends on a live cluster.

## Target repository shape

```text
infra/
  envs/dev/
    bootstrap/                 # Project Bootstrap, manual/local apply
    platform-core/             # AWS/EKS foundation, GitHub deploy workflow
    cluster-bootstrap/         # Argo CD install + root app, post-core deploy job
  modules/
    aws-load-balancer-controller-irsa/
    external-dns-irsa/
    external-secrets-irsa/
    fluent-bit-irsa/
    platform-admin-secrets/
    ...existing AWS-only modules...

gitops/
  clusters/dev/root/
    kustomization.yml
    applications/
      platform-namespaces.yml
      platform-gateway-api-crds.yml
      platform-aws-load-balancer-controller.yml
      platform-external-dns.yml
      platform-external-secrets.yml
      platform-edge.yml
      platform-logging.yml
      platform-monitoring.yml
      platform-argocd-access.yml
      vintage.yml
  platform/
    namespaces/
    gateway-api-crds/
    aws-load-balancer-controller/
    external-dns/
    external-secrets/
    edge/
    logging/
    monitoring/
    argocd-access/
  apps/
    vintage/
      kustomization.yml
      external-secret.yml
      k8s/
        database/
        backend/
        frontend/
```

## Terraform state keys

Use new state keys and leave the legacy key retired:

```text
Project Bootstrap:  devops-hiraya-dev/dev/bootstrap/terraform.tfstate
Platform Core:      devops-hiraya-dev/dev/platform-core/terraform.tfstate
Cluster Bootstrap:  devops-hiraya-dev/dev/cluster-bootstrap/terraform.tfstate
Legacy platform:    devops-hiraya-dev/dev/platform/terraform.tfstate  # retired
```

## Phase 1 — Project Bootstrap

Update `infra/envs/dev/bootstrap` first because it creates roles and durable resources needed by later phases.

### 1.1 GitHub cluster-bootstrap role

Add a dedicated OIDC role, for example:

```text
devops-hiraya-dev-github-cluster-bootstrap
```

The role should be assumable only from this repository's trusted workflow contexts, following the same repo/branch restrictions as the existing infra roles.

Minimum policy intent:

- Mutate only the Cluster Bootstrap Terraform state object/lockfile.
- Read Platform Core remote state.
- Read Project Bootstrap remote state if needed by Cluster Bootstrap.
- Read the Argo admin secret from Secrets Manager.
- Describe the EKS cluster and obtain Kubernetes API access for bootstrap/smoke.
- No broad AWS infrastructure mutation.

Do not grant Kubernetes API access to the GitHub plan role or Platform Core apply role.

### 1.2 State access

Update state object patterns to include:

```text
devops-hiraya-dev/dev/platform-core/terraform.tfstate
devops-hiraya-dev/dev/cluster-bootstrap/terraform.tfstate
```

Keep any legacy `dev/platform` access only if needed to clean up old empty state; otherwise retire it from new workflow references.

### 1.3 Durable Vintage secrets

Add a durable Secrets Manager JSON secret owned by Project Bootstrap:

```text
/hiraya/dev/apps/vintage
```

Suggested JSON shape:

```json
{
  "POSTGRES_DB": "postgres",
  "POSTGRES_USER": "postgres",
  "POSTGRES_PASSWORD": "<generated>",
  "AUTH_DB_URL": "postgresql://postgres:<generated>@vintage-postgres:5432/auth_db",
  "PRODUCTS_DB_URL": "postgresql://postgres:<generated>@vintage-postgres:5432/products_db",
  "ORDERS_DB_URL": "postgresql://postgres:<generated>@vintage-postgres:5432/orders_db",
  "USERS_DB_URL": "postgresql://postgres:<generated>@vintage-postgres:5432/users_db"
}
```

Use the AWS-managed Secrets Manager KMS key. Add a manual rotation keeper variable such as `vintage_secret_rotation_epoch` rather than automatic rotation.

### 1.4 Outputs

Add outputs for:

- `github_cluster_bootstrap_role_arn`
- `vintage_secret_name`
- `vintage_secret_arn`
- backend config map for `platform-core`
- backend config map for `cluster-bootstrap`

Do not output secret values.

### 1.5 Validation

```bash
terraform -chdir=infra/envs/dev/bootstrap fmt
terraform -chdir=infra/envs/dev/bootstrap init -backend=false
terraform -chdir=infra/envs/dev/bootstrap validate
```

Project Bootstrap is applied manually from `main` after the PR merges.

## Phase 2 — Platform Core

Create `infra/envs/dev/platform-core` by copying the AWS/EKS portions of the legacy platform stack and deleting Kubernetes/Helm provider usage.

### 2.1 Platform Core ownership

Platform Core owns:

- VPC, subnets, NAT Gateway, S3 gateway endpoint, optional VPC flow logs.
- EKS cluster and managed node group.
- EKS managed add-ons, especially EBS CSI.
- ACM certificate and DNS validation primitives.
- IAM/IRSA roles and policies for GitOps-owned controllers.
- CloudWatch log groups required by platform add-ons.
- Platform admin Secrets Manager secrets.
- Non-secret outputs consumed by Cluster Bootstrap and GitOps values.

Platform Core must not configure `kubernetes` or `helm` providers.

### 2.2 Refactor mixed modules into AWS-only modules

Replace modules that currently mix IAM/AWS plus Kubernetes/Helm resources with AWS-only equivalents.

#### AWS Load Balancer Controller IRSA

Create an AWS-only module from the IAM parts of `infra/modules/aws-load-balancer-controller`.

Keep fixed subject:

```text
system:serviceaccount:kube-system:aws-load-balancer-controller
```

Remove unused WAF/Shield permissions because WAF/Shield are deferred.

Output:

- `role_arn`
- `namespace = "kube-system"`
- `service_account_name = "aws-load-balancer-controller"`

#### ExternalDNS IRSA

Create an AWS-only module from the IAM and Route 53 zone lookup parts of `infra/modules/external-dns`.

Keep fixed subject:

```text
system:serviceaccount:external-dns:external-dns
```

ExternalDNS policy remains scoped to the public hosted zone and TXT registry behavior.

Output:

- `role_arn`
- `hosted_zone_id`
- `namespace = "external-dns"`
- `service_account_name = "external-dns"`

#### Fluent Bit IRSA and log group

Create an AWS-only module from the CloudWatch and IAM parts of `infra/modules/fluent-bit`.

Keep fixed subject:

```text
system:serviceaccount:amazon-cloudwatch:aws-for-fluent-bit
```

Rename the default pod log group to:

```text
/eks/hiraya/dev/pods
```

Output:

- `role_arn`
- `log_group_name`
- `namespace = "amazon-cloudwatch"`
- `service_account_name = "aws-for-fluent-bit"`

#### External Secrets Operator IRSA

Create a new AWS-only module for ESO.

Fixed subject:

```text
system:serviceaccount:external-secrets:external-secrets
```

Policy intent:

- `secretsmanager:GetSecretValue`
- `secretsmanager:DescribeSecret`
- scoped only to allowlisted secret ARNs:
  - Platform Core Argo admin secret
  - Platform Core Grafana admin secret
  - Project Bootstrap Vintage secret

Output:

- `role_arn`
- `namespace = "external-secrets"`
- `service_account_name = "external-secrets"`

### 2.3 Platform admin secrets

Add a module such as `infra/modules/platform-admin-secrets`.

Secrets:

```text
/hiraya/dev/platform/argocd-admin
/hiraya/dev/platform/grafana-admin
```

Use AWS-managed Secrets Manager KMS key.

Suggested Argo secret JSON:

```json
{
  "username": "admin",
  "password": "<generated>",
  "bcrypt_hash": "<stable random_password.bcrypt_hash>",
  "password_mtime": "<rotation timestamp>"
}
```

Suggested Grafana secret JSON:

```json
{
  "admin-user": "admin",
  "admin-password": "<generated>"
}
```

Destroy behavior:

- Force-delete generated platform admin secrets so the dev platform can be destroyed and recreated immediately with the same names.
- Do not output password values; Operators retrieve them through AWS Secrets Manager CLI.

### 2.4 EKS access entries

Platform Core grants EKS admin access only to:

- Dev SSO role from `cluster_admin_principal_arns`
- Project Bootstrap output `github_cluster_bootstrap_role_arn`

Do not include GitHub plan or core apply roles in EKS access entries.

### 2.5 Outputs

Expose non-secret outputs:

- `region`
- `cluster_name`
- `cluster_endpoint`
- `cluster_certificate_authority_data`
- `public_domain_name`
- `argocd_hostname`
- `grafana_hostname`
- `app_hostname`
- `public_gateway_access_label_key`
- `public_gateway_access_label_value`
- `aws_load_balancer_controller_role_arn`
- `external_dns_role_arn`
- `external_secrets_role_arn`
- `fluent_bit_role_arn`
- `pod_log_group_name`
- `argocd_admin_secret_name`
- `argocd_admin_secret_arn`
- `grafana_admin_secret_name`
- `grafana_admin_secret_arn`

Do not output generated passwords.

### 2.6 Validation

```bash
terraform -chdir=infra/envs/dev/platform-core fmt
terraform -chdir=infra/envs/dev/platform-core init -backend=false
terraform -chdir=infra/envs/dev/platform-core validate
terraform fmt -recursive infra
```

PR CI should run a fast no-refresh speculative plan only for Platform Core.

## Phase 3 — Cluster Bootstrap

Create `infra/envs/dev/cluster-bootstrap` as a separate Terraform state that runs after Platform Core apply.

### 3.1 Providers

Cluster Bootstrap may use:

- `aws` for remote state and Secrets Manager reads.
- `kubernetes` for namespace/AppProject/Application manifests.
- `helm` for Argo CD chart install.

Provider configuration reads Platform Core remote state:

- cluster endpoint
- cluster CA data
- cluster name
- region

Use `aws eks get-token` exec auth.

### 3.2 Argo CD namespace

Cluster Bootstrap creates the special `argocd` namespace because Argo CD cannot create its own namespace before it exists.

Labels:

```yaml
hiraya.noidilin.dev/public-gateway-access: "true"
```

This is the exception to the Cluster Platform namespace ownership rule.

### 3.3 Argo CD Helm release

Preserve the existing chart version first unless it blocks required behavior:

```text
chart: argo-cd
repo: https://argoproj.github.io/argo-helm
version: 6.7.0
```

Values intent:

- server service remains `ClusterIP`
- `server.insecure=true` because TLS terminates at the ALB
- built-in admin remains enabled for now
- admin password hash comes from `/hiraya/dev/platform/argocd-admin` JSON `bcrypt_hash`
- password mtime comes from the same JSON or a Terraform variable

### 3.4 AppProjects

Create AppProjects with `kubernetes_manifest` after Argo CD CRDs exist.

Use dedicated projects, not `default`:

```text
hiraya-platform
hiraya-workloads
```

Initial policy should be moderate:

- `hiraya-platform` may manage cluster-scoped resources and platform namespaces.
- `hiraya-workloads` is limited to workload namespaces such as `vintage` and source paths under `gitops/apps/*`.
- Tighten exact resource allowlists later if needed, but do not leave everything in the default project.

### 3.5 Root Application

Create the root app with `kubernetes_manifest`:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: hiraya-root
  namespace: argocd
spec:
  project: hiraya-platform
  source:
    repoURL: https://github.com/noidilin/hiraya.git
    targetRevision: main
    path: gitops/clusters/dev/root
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

The root app owns child Application manifests only. Child Applications own actual platform/workload resources.

### 3.6 Validation

Static validation:

```bash
terraform -chdir=infra/envs/dev/cluster-bootstrap fmt
terraform -chdir=infra/envs/dev/cluster-bootstrap init -backend=false
terraform -chdir=infra/envs/dev/cluster-bootstrap validate
```

Runtime validation happens only after Platform Core has created the EKS cluster.

## Phase 4 — GitOps tree

Move Kubernetes desired state under the new app-of-apps tree.

### 4.1 Root app-of-apps

`gitops/clusters/dev/root/kustomization.yml` should include child Application manifests from `applications/`.

Each child Application should have:

- `argocd.argoproj.io/sync-wave` for ordering.
- automated `prune` and `selfHeal` unless explicitly protected.
- finalizer for cleanup where safe.
- project set to `hiraya-platform` or `hiraya-workloads`.

Suggested sync waves:

```text
-30 platform-namespaces
-25 platform-gateway-api-crds
-20 platform-external-secrets
-18 platform-aws-load-balancer-controller
-16 platform-external-dns
-14 platform-edge
-10 platform-logging
-10 platform-monitoring
 -8 platform-argocd-access
  0 vintage
```

Exact waves can change during implementation, but CRDs/controllers/namespaces must converge before dependent routes and ServiceMonitors.

### 4.2 Namespace ownership

Create a `platform-namespaces` Application for platform-granted public namespaces:

```text
edge
monitoring
vintage
```

Apply Public Gateway Access label where required:

```yaml
hiraya.noidilin.dev/public-gateway-access: "true"
```

Do not let the Vintage app own the `vintage` Namespace, or Argo ownership conflicts can occur.

Non-public add-on namespaces may be owned by their add-on app or created with Argo `CreateNamespace=true`, but keep that consistent per add-on.

`argocd` namespace remains Cluster Bootstrap-owned.

### 4.3 Gateway API and AWS LBC CRDs

Create `gitops/platform/gateway-api-crds` with vendored, pinned CRDs:

- Gateway API standard CRDs.
- AWS Load Balancer Controller Gateway API CRDs required for:
  - `LoadBalancerConfiguration`
  - `TargetGroupConfiguration`
  - `ListenerRuleConfiguration` if needed by the pinned LBC version.

Protect CRDs from accidental prune using Argo sync options such as:

```yaml
argocd.argoproj.io/sync-options: Prune=false
```

Do not fetch CRDs from remote URLs at sync time.

### 4.4 AWS Load Balancer Controller Application

Use remote Helm chart with adjacent values file:

```text
gitops/platform/aws-load-balancer-controller/values-dev.yaml
```

Preserve current chart version first:

```text
chart: aws-load-balancer-controller
repo: https://aws.github.io/eks-charts
version: 3.4.0
```

Values intent:

```yaml
clusterName: devops-hiraya-dev-eks
region: ap-northeast-1
serviceAccount:
  create: true
  name: aws-load-balancer-controller
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::<account-id>:role/devops-hiraya-dev-eks-aws-lbc
extraArgs:
  feature-gates: NLBGatewayAPI=false,ALBGatewayAPI=true
```

Do not set `vpcId`; rely on AWS LBC VPC discovery and correct Platform Core subnet/VPC tags.

### 4.5 ExternalDNS Application

Use remote Helm chart with adjacent values file:

```text
gitops/platform/external-dns/values-dev.yaml
```

Preserve current chart version first:

```text
chart: external-dns
repo: https://kubernetes-sigs.github.io/external-dns/
version: 1.20.0
```

Values intent:

```yaml
provider:
  name: aws
sources:
  - gateway-httproute
policy: sync
registry: txt
txtOwnerId: hiraya-dev-eks
domainFilters:
  - hiraya.noidilin.dev
triggerLoopOnEvent: true
serviceAccount:
  create: true
  name: external-dns
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::<account-id>:role/devops-hiraya-dev-eks-external-dns
```

ExternalDNS remains the owner of public DNS records derived from HTTPRoute hostnames.

### 4.6 External Secrets Operator Application

Add a pinned ESO Helm chart version during implementation. Do not use a floating chart version.

Namespace/service-account contract:

```text
external-secrets/external-secrets
```

Create a `ClusterSecretStore` or equivalent store manifest under `gitops/platform/external-secrets`.

Intent:

```yaml
provider: AWS Secrets Manager
region: ap-northeast-1
auth: IRSA via external-secrets/external-secrets service account
```

ESO may read only allowlisted secret ARNs through its IRSA policy.

### 4.7 Edge Application

Move the custom edge Gateway manifests out of Terraform module internals and into `gitops/platform/edge`.

Edge owns:

- `GatewayClass`
- `LoadBalancerConfiguration`
- `TargetGroupConfiguration`
- shared public `Gateway`
- HTTP-to-HTTPS redirect route

Edge does not own service-specific HTTPRoutes.

Avoid dynamic AWS IDs:

- Do not commit VPC ID.
- Do not commit ACM certificate ARN.
- Use AWS LBC VPC and certificate discovery.
- Keep an operational rule that only one active matching ACM certificate should exist for `hiraya.noidilin.dev` / `*.hiraya.noidilin.dev` in `ap-northeast-1`.

Validate that HTTPS listeners discover the Platform Core ACM certificate after deploy.

### 4.8 Logging Application

Use remote Helm chart with adjacent values file:

```text
gitops/platform/logging/values-dev.yaml
```

Preserve current chart version first:

```text
chart: aws-for-fluent-bit
repo: https://aws.github.io/eks-charts
version: 0.2.0
```

Values intent:

```yaml
serviceAccount:
  create: true
  name: aws-for-fluent-bit
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::<account-id>:role/devops-hiraya-dev-eks-fluent-bit-irsa
cloudWatch:
  enabled: false
cloudWatchLogs:
  enabled: true
  region: ap-northeast-1
  logGroupName: /eks/hiraya/dev/pods
  logStreamPrefix: from-fluent-bit-
  autoCreateGroup: false
```

The log group is Terraform-owned by Platform Core.

### 4.9 Monitoring Application

Use remote Helm chart with adjacent values file:

```text
gitops/platform/monitoring/values-dev.yaml
```

Preserve current chart version first:

```text
chart: kube-prometheus-stack
repo: https://prometheus-community.github.io/helm-charts
version: 56.21.0
```

Monitoring owns:

- kube-prometheus-stack release
- Grafana ExternalSecret mapping
- Grafana public HTTPRoute

Use ESO to materialize the Grafana admin secret from:

```text
/hiraya/dev/platform/grafana-admin
```

Configure Grafana chart values to use an existing Kubernetes Secret rather than putting the password in Helm values.

Protect monitoring CRDs from prune where needed, especially CRDs backing `ServiceMonitor`.

### 4.10 Argo CD access Application

Create `gitops/platform/argocd-access` to own the public Argo CD HTTPRoute.

It should run after:

- Argo CD is installed by Cluster Bootstrap.
- Edge Gateway is available.

It owns only route/access manifests, not the Argo CD Helm release or `argocd` namespace.

### 4.11 Vintage Application

Move current `gitops/` app manifests under:

```text
gitops/apps/vintage
```

Changes:

- Remove app-owned `Namespace`; `platform-namespaces` owns `vintage`.
- Replace plaintext `Secret` with `ExternalSecret` that references stable Secrets Manager name:

```text
/hiraya/dev/apps/vintage
```

- Keep Vintage-owned ServiceMonitor and Grafana dashboard declarations with the app.
- Keep Vintage-owned frontend HTTPRoute for `hiraya.noidilin.dev`.
- Keep reset-on-rebuild database behavior: PVC/EBS are deleted during destroy and seed data is restored from GitOps dump.

## Phase 5 — GitHub Actions and scripts

### 5.1 Generic backend writer

Replace stack-specific backend writer logic with a generic script, for example:

```text
.github/scripts/write-terraform-backend.sh
```

Inputs should include:

- bucket
- key
- region
- output path

Use it for:

- Platform Core
- Cluster Bootstrap
- future stacks if needed

### 5.2 Infra CI

Update `.github/workflows/infra-ci.yml`:

- Validate Terraform stacks without backend credentials:
  - `infra/envs/dev/bootstrap`
  - `infra/envs/dev/platform-core`
  - `infra/envs/dev/cluster-bootstrap`
- Run Terraform module tests for updated/new modules.
- Render GitOps root and app paths.
- Add schema lint where practical, allowing known CRDs.
- Trusted PR Terraform plan should plan Platform Core only with:

```text
-refresh=false
-lock=false
```

Do not plan Cluster Bootstrap in PR CI.

### 5.3 Deploy workflow

Update `.github/workflows/infra-deploy.yml`.

Recommended jobs:

1. `preflight-platform-core-plan`
   - assume infra plan role
   - init/validate Platform Core
   - full refreshed pre-approval Platform Core plan
   - upload plan artifact

2. `apply-platform-core`
   - environment: `dev`
   - assume infra apply role
   - create fresh Platform Core binary plan
   - apply Platform Core

3. `apply-cluster-bootstrap`
   - needs `apply-platform-core`
   - assume cluster-bootstrap role
   - init Cluster Bootstrap
   - create post-approval Cluster Bootstrap plan
   - apply Cluster Bootstrap

4. `smoke-dev-platform`
   - assume cluster-bootstrap role
   - update kubeconfig
   - wait for Argo Applications to exist and become healthy/synced
   - check core pods, Gateway, HTTPRoutes, namespaces
   - check public routes

The workflow should not call the Argo CD API or require Argo credentials.

### 5.4 Destroy workflow

Update `.github/workflows/infra-destroy.yml` and cleanup scripts.

Destroy order:

1. Assume cluster-bootstrap role.
2. Update kubeconfig.
3. Suspend or delete root app non-cascading so it cannot recreate child apps.
4. Delete child Applications in explicit order:
   - workload apps first, especially Vintage
   - service route/access apps
   - monitoring/logging
   - edge resources
   - controllers last
   - CRD apps last or leave CRDs protected until cluster teardown
5. Wait for:
   - Vintage StatefulSet/PVC/PV/EBS cleanup
   - Gateway/HTTPRoute deletion
   - ALB deletion
   - ExternalDNS record cleanup
6. Destroy Cluster Bootstrap state.
7. Assume Platform Core apply role.
8. Destroy Platform Core state.

Controllers must stay running until their managed AWS resources are gone.

### 5.5 Smoke script

Update `.github/scripts/platform-route-smoke.sh` for the new state outputs and ownership model.

It should verify:

- EKS API reachable.
- nodes ready.
- Argo Applications synced/healthy.
- namespaces visible:
  - `argocd`
  - `edge`
  - `monitoring`
  - `vintage`
  - `external-dns`
  - `external-secrets`
  - `amazon-cloudwatch`
- Gateway and HTTPRoutes ready.
- public routes return expected codes:
  - Vintage: `200 204 301 302`
  - Argo CD: `200 301 302 401 403`
  - Grafana: `200 301 302 401 403`

### 5.6 Image pipeline path updates

Moving Vintage manifests requires updating image pipeline metadata and tests.

Update `.github/utils/services.json` manifest paths from old paths such as:

```text
gitops/k8s/backend/auth.yml
```

to new paths such as:

```text
gitops/apps/vintage/k8s/backend/auth.yml
```

Update affected scripts/tests:

- `.github/scripts/src/classify-app-pr.mts`
- `.github/scripts/src/detect-changed-services.mts`
- generated `.github/scripts/dist/*` files if committed in this repo
- app baseline tests
- rollback workflow assumptions
- image promotion diff checks

Bot manifest promotion PRs should still fast-path only image-tag changes under `gitops/`.

### 5.7 Package scripts

Update root package scripts that render GitOps manifests.

Current `app:gitops` renders `gitops`; it should render at least:

- `gitops/clusters/dev/root`
- `gitops/apps/vintage`
- local platform manifest directories that are not remote Helm-only

For remote Helm applications, add explicit `helm template` checks against adjacent values files or a helper script that iterates platform add-on config.

## Phase 6 — Documentation updates

Update runbooks and infra docs in the same PR:

- `infra/README.md`
- `docs/onboard.md` sections that describe Terraform-owned add-ons
- deploy/destroy instructions
- any references to `/eks/vintage/pods`, changing them to `/eks/hiraya/dev/pods` where relevant

Do not fully rewrite unrelated historical reports unless they block the new runbook.

## Phase 7 — Validation matrix

### Static/local validation

Run before opening/merging the PR:

```bash
terraform fmt -recursive infra
terraform -chdir=infra/envs/dev/bootstrap init -backend=false
terraform -chdir=infra/envs/dev/bootstrap validate
terraform -chdir=infra/envs/dev/platform-core init -backend=false
terraform -chdir=infra/envs/dev/platform-core validate
terraform -chdir=infra/envs/dev/cluster-bootstrap init -backend=false
terraform -chdir=infra/envs/dev/cluster-bootstrap validate
kubectl kustomize gitops/clusters/dev/root >/tmp/hiraya-root.yaml
kubectl kustomize gitops/apps/vintage >/tmp/hiraya-vintage.yaml
pnpm test
pnpm run app:baseline
```

Also render every local chart or remote Helm values file used by GitOps.

### PR validation

PR must pass:

- Terraform formatting/validation/tests.
- Platform Core fast speculative plan.
- GitOps render/schema checks.
- App/image pipeline tests after manifest path updates.

### Post-merge operational validation

After merge to `main`:

1. Locally apply Project Bootstrap from `main`.
2. Run `infra-deploy` workflow manually.
3. Confirm Platform Core apply succeeds.
4. Confirm Cluster Bootstrap apply succeeds.
5. Confirm Argo child Applications are synced/healthy.
6. Confirm public routes work.
7. Retrieve Argo/Grafana passwords through AWS Secrets Manager CLI only.
8. Run destroy workflow manually.
9. Confirm ALB, Route 53 controller-created records, EBS volumes, node groups, and VPC resources are gone.
10. Leave dev infra destroyed.

## Acceptance criteria

The migration is complete when all are true:

- `infra/envs/dev/platform` is removed or clearly retired from active workflows.
- Platform Core has no Kubernetes or Helm providers.
- Cluster Bootstrap is the only Terraform stack that installs Argo CD or applies Argo bootstrap manifests.
- Argo CD owns Cluster Platform add-ons and Vintage app manifests.
- GitHub plan/core-apply roles do not have Kubernetes API access.
- Cluster-bootstrap role performs bootstrap and smoke checks.
- Vintage app uses ESO instead of a plaintext committed Kubernetes Secret.
- CI validates Platform Core and GitOps manifests without cluster credentials.
- Post-merge deploy succeeds.
- Post-merge destroy prunes GitOps resources first and removes AWS resources cleanly.
- Dev infra is left destroyed after acceptance.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| ACM certificate discovery picks an unexpected cert | Keep only one active matching ACM cert for Hiraya hostnames in-region; fall back to generated ARN only if discovery fails repeatedly. |
| Argo root app recreates children during destroy | Suspend/delete root app non-cascading before ordered child deletion. |
| Controllers deleted before ALB/DNS cleanup | Destroy script keeps AWS LBC and ExternalDNS running until managed resources are gone. |
| ESO cannot read secrets | Scope policy by ARN allowlist and verify `external-secrets/external-secrets` IRSA annotation/trust subject. |
| AppProject restrictions block platform resources | Start with moderate allowlists, validate sync, tighten later. |
| Image promotion breaks after path move | Update service catalog, promotion/rollback scripts, and tests in the same PR. |
| Secrets Manager name reuse blocked on rebuild | Force-delete disposable Platform Core admin secrets; keep durable Vintage secret in Project Bootstrap. |
| PR too large to review | Use phased commits and a PR checklist matching this plan. |

## Rollback strategy

Because no live dev infra exists, rollback is mostly repository rollback:

1. If static CI fails, fix forward in the migration branch.
2. If post-merge Project Bootstrap apply fails, revert or patch bootstrap resources before running `infra-deploy`.
3. If Platform Core deploy fails, destroy partial Platform Core resources with the core apply role and fix forward.
4. If Cluster Bootstrap/GitOps sync fails, use Dev SSO or cluster-bootstrap role to inspect Argo/Kubernetes state, then fix GitOps and rerun bootstrap/smoke.
5. If destroy fails after controllers are removed too early, use AWS CLI cleanup only as a last resort, then patch the destroy ordering before trying again.

Do not revive the monolithic Terraform platform stack unless the layered model itself is abandoned through a new ADR.
