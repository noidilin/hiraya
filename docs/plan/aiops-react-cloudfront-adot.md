# AIOps React UI and CloudWatch-backed Kira Plan

Status: planned
Related ADRs: [`docs/adr/0002-aiops-cloudwatch-metrics-via-adot.md`](../adr/0002-aiops-cloudwatch-metrics-via-adot.md), [`docs/adr/0007-gitops-owned-cluster-platform.md`](../adr/0007-gitops-owned-cluster-platform.md)

Ownership note: ADR-0007 supersedes the Terraform-owned in-cluster ADOT module described in this plan. Terraform should own ADOT IAM/CloudWatch-side resources and outputs; Argo CD Cluster Platform should own the in-cluster ADOT collector manifests when ADOT is implemented.
Depends on: GitHub issue #1 / [ADR-0001 EKS network redesign](../adr/0001-eks-network-redesign.md)

## Goal

Replace the local Streamlit AIOps prototype with a portfolio-grade, operator-only web UI for Kira while keeping the EKS network redesign clean. The new AIOps slice uses a static React frontend on CloudFront/S3, a Cognito-protected API Gateway HTTP API, a Lambda chat proxy, and a Terraform-managed Bedrock Agent.

The shared ALB remains the only public ingress path into EKS. CloudFront is allowed here only as the public edge for the external static AIOps UI; it must not expose cluster services or replace the Gateway API/ALB path for EKS workloads.

Kira diagnoses the dev EKS platform through AWS-native observability surfaces:

- CloudWatch Logs for pod logs, plus cluster control-plane logs only if the platform explicitly enables them.
- CloudWatch Metrics for selected EKS/application health and performance signals exported by ADOT.
- EKS read APIs for cluster and managed node group health.

Prometheus remains private for Grafana dashboards and port-forwarded operator access. Kira does not query Prometheus directly.

## Target architecture

```text
Operator browser
  -> https://aiops.hiraya.noidilin.dev
  -> CloudFront
  -> private S3 React static UI origin through CloudFront OAC
  -> Cognito Hosted UI login
  -> API Gateway HTTP API POST /chat
  -> chat_proxy Lambda
  -> Bedrock Agent Runtime
  -> Kira Bedrock Agent alias
       |-> fetch_logs Lambda -> CloudWatch Logs
       |-> fetch_metrics Lambda -> CloudWatch Metrics namespace Hiraya/AIOps
       `-> fetch_health Lambda -> EKS APIs + CloudWatch Metrics namespace Hiraya/AIOps
```

Inside EKS:

```text
Backend services /metrics, kube-state-metrics, cAdvisor/kubelet
  -> ADOT Collector in dedicated adot namespace
  -> CloudWatch Metrics / EMF namespace Hiraya/AIOps
```

Pod log forwarding is deferred:

```text
Future AIOps logging design
  -> selected CloudWatch Logs groups
  -> fetch_logs Lambda
```

The current platform no longer deploys Fluent Bit or a dedicated pod log group. AIOps must introduce an explicit logging design before depending on pod logs.

Existing dashboard path remains:

```text
Prometheus/Grafana
  -> ClusterIP services
  -> public Grafana through issue #1 shared ALB route
  -> Prometheus private only, no public or internal load balancer for AIOps
```

## Confirmed decisions

### Slice boundary

This AIOps UI/API work is a separate slice after the EKS network redesign in issue #1. CloudFront remains out of scope for issue #1 and belongs to this later AIOps slice.

### Existing prototype migration

The existing `app/aiops/` tree is a deprecated/manual prototype used as migration input, not the desired target architecture.

- `app/aiops/frontend/` is currently empty and becomes the React implementation location.
- `app/aiops/app.py` Streamlit UI remains only until the React/CloudFront UI is validated.
- `app/aiops/setup-iam.sh` and `app/aiops/deploy.sh` are deprecated for deployed resources once the Terraform stack exists.
- Existing Lambda handlers and OpenAPI schemas may be reused, but they must be hardened and moved into the planned layout before deployment.

### Public hostname and DNS ownership

The canonical AIOps UI hostname is:

```text
aiops.hiraya.noidilin.dev
```

The AIOps Terraform stack owns the Route 53 alias record for this hostname because it points to CloudFront, not the EKS shared ALB. Do not create an EKS `HTTPRoute` for `aiops.hiraya.noidilin.dev`; ExternalDNS remains responsible only for Gateway API hostnames served by the shared ALB.

### Authentication and access

- The AIOps UI is public on the internet but usable only by authenticated Operators.
- Use a dedicated Cognito User Pool for AIOps Operators.
- Use Cognito Hosted UI with Authorization Code + PKCE for the SPA.
- Do not configure a client secret for the SPA app client.
- Do not reuse the vintage shop auth service.
- Disable public self-signup.
- Operator accounts are admin-created.
- API Gateway validates Cognito JWTs.
- API Gateway JWT authorizer audience must be the Cognito app client ID.
- CORS allows only `https://aiops.hiraya.noidilin.dev`.

### API model

Use API Gateway HTTP API with a single first-slice endpoint:

```text
POST /chat
```

Request:

```json
{
  "sessionId": "browser-generated-uuid",
  "message": "Why are we seeing 503 errors?"
}
```

Response:

```json
{
  "sessionId": "same-session-id",
  "message": "Kira response text"
}
```

Structured error response:

```json
{
  "error": {
    "code": "BEDROCK_AGENT_ERROR",
    "message": "Unable to complete diagnosis right now."
  }
}
```

Validation:

- `sessionId` is required and should be UUID-like.
- `message` is required after trimming.
- `message` max length should be small and explicit, initially around 4000 characters.
- The Lambda ignores any user-supplied agent ID, alias ID, region, model ID, or tool parameters.

### Chat behavior

- Support multi-turn Diagnosis Sessions with browser-generated session IDs.
- Use synchronous `POST /chat` for the first slice.
- Do not implement token streaming yet.
- `chat_proxy` may consume the Bedrock Agent Runtime response stream internally, but must return the synchronous JSON response above.
- Store visible chat history only in browser state/localStorage.
- Do not persist server-side transcripts.
- The chat proxy Lambda logs metadata only: request ID, user subject or hash, session ID hash, message length, agent/alias IDs, latency, status, and error code.
- Do not log full prompts, full Kira responses, or evidence returned by tools.

### Frontend

- Build a focused chat UI, not a dashboard.
- Create the React app under `app/aiops/frontend`.
- Keep the existing Streamlit app only as a deprecated prototype until the React UI is validated; remove it afterwards.
- Host static assets from a private S3 bucket with Block Public Access enabled.
- Use CloudFront Origin Access Control, not public S3 website hosting.
- Use SPA fallback to `index.html` for client-side routes.
- React loads runtime config from `/config.json` in the S3/CloudFront distribution.
- `/config.json` uses no-cache or a very short TTL.
- Terraform or a deployment step writes deployment-specific config values such as API base URL, region, Cognito user pool ID, Cognito client ID, and Cognito domain.
- Configure HTTPS redirect and security headers where practical.
- Create a CloudFront invalidation after local/manual frontend deployment.
- First slice uses manual/Terraform-local frontend deployment. Add GitHub Actions static frontend deployment later.

### Regions

Use `ap-northeast-1` for regional AIOps resources:

- Cognito User Pool
- API Gateway HTTP API
- chat proxy Lambda
- Bedrock Agent
- Bedrock action Lambdas
- S3 static frontend bucket
- regional IAM/Lambda/CloudWatch resources

Use `us-east-1` only for the ACM certificate required by CloudFront viewer TLS.

### Bedrock Agent

- Terraform owns the Bedrock Agent, action groups, aliases, IAM roles, and Lambda permissions.
- The foundation model is configurable through Terraform.
- Validate model availability and access in `ap-northeast-1` before apply/demo.
- Default demo model:

```hcl
bedrock_agent_model_id = "qwen.qwen3-32b-v1:0"
```

- Run `prepare-agent` after configuration changes in the Terraform/module implementation path.
- Create and track a real deployed alias for the chat proxy; do not use `TSTALIASID` for the deployed UI.
- Bedrock Agent role must include the needed model invoke permissions, including streaming invoke if the runtime path requires it.
- Lambda resource-based permissions for Bedrock must include confused-deputy protections scoped by `aws:SourceAccount` and `aws:SourceArn` for the agent.
- Python Lambdas may need bundled recent `boto3`/`botocore` if the managed runtime SDK lags Bedrock Agent Runtime/API features.
- Defer Bedrock Guardrails for the first slice.

### Lambda implementation

Use Python for AIOps Lambda code.

Planned layout:

```text
app/aiops/
  frontend/
  lambda/
    chat_proxy/
    fetch_logs/
    fetch_metrics/
    fetch_health/
  schemas/
```

All AIOps Lambdas stay outside the VPC. Do not create Lambda private subnet networking for this slice.

Use separate least-privilege IAM roles or policies per Lambda type:

- `chat_proxy`: invoke only the configured Bedrock Agent alias.
- `fetch_logs`: read only approved CloudWatch log groups.
- `fetch_metrics`: read only the approved AIOps metric namespace/query surface.
- `fetch_health`: read the target EKS cluster/node groups and approved AIOps metrics.

Update the deployed OpenAPI schemas with the hardened tool surface:

- Remove synthetic/demo defaults such as `/app/production`, `us-east-1`, `eu-north-1`, and `eks-cluster`.
- Remove arbitrary CloudWatch namespace/dimension controls from `fetch_metrics`.
- Describe only approved metric names and approved namespace/service filters.
- Keep operation descriptions clear so the Bedrock Agent can select tools correctly.
- Ensure schemas describe CloudWatch-backed ADOT metrics, not direct Prometheus access.

### Logs scope

Restrict `fetch_logs` to approved log groups.

Initial deployed allowlist: empty until a future AIOps logging design creates or selects log groups.

The EKS control-plane log group `/aws/eks/devops-hiraya-dev-eks/cluster` should be added only if Platform Core explicitly enables EKS control-plane logging and exports the log group name. Synthetic `/app/production` can remain local/demo-only, but should not be included in deployed Terraform by default.

### Metrics scope

Restrict `fetch_metrics` to:

- CloudWatch namespace `Hiraya/AIOps`
- predefined metric names only
- approved Kubernetes namespaces, initially `vintage`
- known service/deployment names only

Do not allow raw PromQL, raw Metrics Insights, arbitrary metric namespace, arbitrary dimensions, or user-selected region from the agent.

The current prototype directly queries Prometheus and allows raw PromQL fallback. The deployed implementation must replace that path with CloudWatch Metrics reads only.

### Health scope

Restrict `fetch_health` to:

- cluster `devops-hiraya-dev-eks`
- region `ap-northeast-1`
- approved namespaces, initially `vintage`
- EKS `DescribeCluster`, `ListNodegroups`, and `DescribeNodegroup`
- CloudWatch metrics in `Hiraya/AIOps`

Do not call the Kubernetes API directly from Lambda in the first slice.

The current prototype uses stale defaults and Prometheus-backed deployment/restart checks. The deployed implementation must use the approved cluster/region and CloudWatch-backed ADOT metrics instead.

### ADOT and metric export

ADR-0007 refines this plan: ADOT is deferred from the GitOps refactor and belongs to the Cluster Platform when implemented, not to the AIOps stack. Platform Core should own AWS/IAM/CloudWatch-side resources and outputs; Argo CD-owned Cluster Platform manifests should own the in-cluster ADOT Collector, namespace, service account, and chart/Kustomize configuration. The ADOT Collector should use a Prometheus receiver to scrape selected in-cluster `/metrics` endpoints directly; it should not query the Prometheus server.

ADOT should run in a dedicated Cluster Platform namespace:

```text
adot
```

ADOT publishes selected metrics to:

```text
CloudWatch namespace: Hiraya/AIOps
```

First metric set:

```text
DeploymentDesiredReplicas
DeploymentAvailableReplicas
DeploymentUnavailableReplicas
PodRestartCount
PodCpuUtilization or PodCpuCores
PodMemoryUtilization or PodMemoryWorkingSetBytes
HttpRequestCount
Http5xxCount
HttpLatencyMs
```

Default dimensions:

```text
ClusterName
Namespace
Service or Deployment
Environment
```

Use `PodName` / `ContainerName` only where needed for restart/crash diagnosis. Avoid high-cardinality dimensions such as request IDs, user IDs, session IDs, raw pod UID values, and raw HTTP paths.

The current backend metrics include labels that can become high-cardinality, especially `route` when middleware falls back to `req.path`. ADOT config must drop, aggregate, or normalize `route` before CloudWatch export.

Recommended source-to-target mapping:

| Target CloudWatch metric | Source metric | Notes |
| --- | --- | --- |
| `HttpRequestCount` | `http_requests_total` | Count by service/status class, not raw path. |
| `Http5xxCount` | `http_requests_total` filtered to 5xx status | Use status class grouping. |
| `HttpLatencyMs` | `http_request_duration_seconds` | Define percentile/statistic and convert seconds to ms. |
| `DeploymentDesiredReplicas` | kube-state-metrics desired replicas | Dimension by deployment. |
| `DeploymentAvailableReplicas` | kube-state-metrics available replicas | Dimension by deployment. |
| `DeploymentUnavailableReplicas` | kube-state-metrics unavailable replicas | Dimension by deployment. |
| `PodRestartCount` | kube-state-metrics container restart counter | Define cumulative versus delta semantics. |
| `PodCpuUtilization` / `PodCpuCores` | cAdvisor/kubelet CPU usage | Use utilization only after defining requests/limits. |
| `PodMemoryUtilization` / `PodMemoryWorkingSetBytes` | cAdvisor/kubelet memory usage | Use utilization only after defining requests/limits. |

CPU/memory utilization percentages are ambiguous until Kubernetes requests/limits are defined. Before implementing those metric names, choose one path:

1. Add resource requests/limits in GitOps and define utilization relative to request/limit.
2. Keep first-slice raw usage metrics named `PodCpuCores` and `PodMemoryWorkingSetBytes`.

Discuss the requests/limits option before changing manifests because it can affect scheduling and runtime behavior.

### Backend service metrics alignment

ADOT should scrape all backend services, not only the gateway:

```text
gateway
auth
product-service
order-service
orders
user-service
```

Standardize all backend Kubernetes Services to expose their HTTP port as `name: http`.

The previous `order-service` service port/targetPort mismatch is already corrected to `3004`; keep it correct and only add missing metrics-compatible names/labels as needed.

Add scrape-selection labels to all backend Services. Recommended pattern:

```yaml
metadata:
  labels:
    app: <service-name>
    hiraya.noidilin.dev/metrics: "true"
```

Update the existing Prometheus `ServiceMonitor` selector from gateway-only to the shared metrics label, so Prometheus/Grafana and ADOT/CloudWatch have consistent service coverage.

### Ownership

Telemetry production/export follows the ADR-0007 split:

```text
infra/envs/dev/platform-core/
  - EKS
  - future ADOT IAM/IRSA and CloudWatch-side resources

gitops/platform/
  - kube-prometheus-stack
  - future ADOT in-cluster manifests -> CloudWatch Metrics
```

AIOps stack owns telemetry consumption and user-facing AIOps resources:

```text
infra/envs/dev/aiops/
  - S3 React hosting bucket
  - CloudFront distribution
  - CloudFront ACM certificate in us-east-1
  - Terraform-owned Route 53 alias record for aiops.hiraya.noidilin.dev pointing to CloudFront
  - Cognito User Pool and app client/domain
  - API Gateway HTTP API
  - chat proxy Lambda
  - Bedrock Agent/action groups/alias
  - AIOps action Lambdas
  - AIOps IAM roles and Lambda permissions
```

AIOps stack reads platform remote state outputs. It should not duplicate core platform values manually and should not use Kubernetes or Helm providers. This keeps the AIOps stack independent of EKS API endpoint reachability if the platform later moves to private-only API access.

Expected platform outputs:

```text
cluster_name
region
eks_cluster_log_group_name, only if control-plane logging is enabled
aiops_metric_namespace = "Hiraya/AIOps"
aiops_allowed_namespaces = ["vintage"]
```

Because AIOps Lambdas are outside the VPC, the AIOps stack should not need VPC subnet outputs for Lambda networking. Do not consume the optional control-plane log group unless the platform output exists.

### AIOps Terraform deployment model

AIOps infrastructure is local-only for the first slice. Do not add `infra/envs/dev/aiops` to GitHub infra plan/apply workflows.

Deploy from a local Terraform command:

```bash
cd infra/envs/dev/aiops
terraform init -backend-config=backend.hcl
terraform validate
terraform plan
terraform apply
```

The AIOps stack may still use the shared S3 backend pattern, but backend config should be generated or documented for local use. CI roles do not need to be expanded for AIOps while this stack stays local-only.

If strict “out of CI” behavior is required, adjust infra workflow path filters so AIOps-only changes do not trigger static infra CI. The current broad `infra/**` trigger would otherwise run CI on AIOps changes even if apply remains local.

## Implementation phases

### Phase 1: Observability alignment in GitOps

- Add `ports[].name: http` to all backend Services that do not already have it.
- Preserve `order-service` as `port: 3004` and `targetPort: 3004`.
- Add the shared metrics label to all backend Services.
- Update `ServiceMonitor` to select the shared metrics label and scrape all backend services.
- Validate with `kubectl kustomize gitops`.
- Also run `pnpm run app:gitops` if the custom render assertions are in scope for the change.

### Phase 2: Platform ADOT module

- Add `infra/modules/adot`.
- Create `adot` namespace.
- Create ADOT IRSA role with CloudWatch metric publishing permissions scoped as tightly as practical.
- Install ADOT Collector with Helm.
- Configure the ADOT Collector Prometheus receiver to scrape selected in-cluster `/metrics` endpoints from backend services and Kubernetes health sources directly.
- Drop/aggregate high-cardinality labels before export.
- Export only the selected AIOps metric set to `Hiraya/AIOps`.
- Choose raw CPU/memory usage metrics or add resource requests/limits before using utilization metrics.
- Validate that private-node ADOT pods can reach required AWS APIs through the accepted dev egress path: private subnets -> single NAT Gateway -> CloudWatch/STS endpoints.
- Add platform outputs consumed by the AIOps stack.

### Phase 3: Refactor AIOps tool Lambdas

- `fetch_logs`: enforce log group allowlist, Terraform-configured region, bounded templates, max lookback, and max results.
- `fetch_metrics`: replace Prometheus HTTP calls and raw PromQL fallback with CloudWatch metric reads for predefined metric names.
- `fetch_health`: keep EKS describe calls and replace Prometheus reads with `Hiraya/AIOps` CloudWatch metrics.
- Update schemas to describe CloudWatch-backed tools accurately.
- Remove stale/demo deployed defaults.
- Remove raw query behavior.

### Phase 4: Terraform-managed Bedrock Agent

- Package action Lambda code.
- Create least-privilege Lambda execution roles.
- Create Bedrock Agent role with action Lambda invoke permissions and configured model invoke permissions.
- Create Bedrock Agent/action groups from hardened OpenAPI schemas.
- Add Lambda permissions for Bedrock with source account and source ARN constraints.
- Prepare the agent and create/track the alias used by the chat proxy.

### Phase 5: API and auth

- Add `chat_proxy` Lambda.
- Add API Gateway HTTP API with Cognito JWT authorizer.
- Configure `POST /chat` Lambda proxy integration.
- Configure strict CORS for `https://aiops.hiraya.noidilin.dev`.
- Validate metadata-only logging.

### Phase 6: React frontend and CloudFront

- Create `app/aiops/frontend` focused chat UI.
- Add Cognito Hosted UI Authorization Code + PKCE login flow.
- Load `/config.json` at runtime with no-cache/short-TTL behavior.
- Create private S3 bucket, CloudFront distribution with OAC, CloudFront ACM cert in `us-east-1`, and Terraform-owned Route 53 alias.
- Configure SPA fallback, HTTPS redirect, and security headers where practical.
- Deploy built static assets manually/Terraform-local for first slice.
- Invalidate CloudFront after deployment.

### Phase 7: Documentation cleanup

- Update the AIOps README to remove Prometheus LoadBalancer instructions.
- Mark Streamlit and manual scripts as deprecated prototype paths.
- Describe the CloudWatch/ADOT metric path and local Terraform AIOps deployment flow.
- Update onboarding/report diagrams or prose if they still show the legacy Streamlit/Prometheus-direct path.
- Document validation commands and demo prompts.

## Validation plan

Static/local validation:

```bash
terraform fmt -recursive
kubectl kustomize gitops
pnpm run app:gitops
```

From Platform Core:

```bash
cd infra/envs/dev/platform-core
terraform init -backend-config=backend.hcl
terraform validate
terraform plan
```

After Platform Core, Cluster Bootstrap, and GitOps convergence:

```bash
kubectl get pods -n adot
kubectl logs -n adot deploy/<adot-collector-deployment>
kubectl get servicemonitor -n vintage
```

Verify CloudWatch metrics exist in `ap-northeast-1`:

```bash
aws cloudwatch list-metrics \
  --region ap-northeast-1 \
  --namespace Hiraya/AIOps
```

Verify logs path:

```bash
aws logs describe-log-groups \
  --region ap-northeast-1 \
  --log-group-name-prefix /aws/eks/devops-hiraya-dev-eks/cluster
```

AIOps stack validation and local deploy:

```bash
cd infra/envs/dev/aiops
terraform init -backend-config=backend.hcl
terraform validate
terraform plan
terraform apply
```

Functional checks:

- Cognito self-signup is disabled.
- API Gateway JWT authorizer audience is the Cognito app client ID.
- Unauthenticated `POST /chat` is rejected.
- Authenticated `POST /chat` returns a Kira response.
- Browser can load `https://aiops.hiraya.noidilin.dev/config.json`.
- CloudFront serves React UI with valid TLS.
- CloudFront uses a private S3 origin through OAC, not public S3 website hosting.
- SPA fallback returns `index.html` for client-side routes.
- `aiops.hiraya.noidilin.dev` is a Terraform-owned CloudFront alias, not an ExternalDNS-owned ALB record.
- Lambda logs contain metadata only, not full prompts/responses.
- `fetch_logs` rejects unapproved log groups, regions, and unbounded queries.
- `fetch_metrics` rejects unknown metric names, arbitrary namespaces, arbitrary dimensions, and raw queries.
- `fetch_health` rejects unapproved cluster/namespace values.
- Kira can answer demo prompts:
  - Why are we seeing 503 errors?
  - Are all services healthy?
  - Is CPU or memory high?
  - Which services restarted recently?

## Out of scope for first slice

- CloudWatch alarms and notification channels.
- Event-driven auto-diagnosis.
- Remediation actions or write operations against Kubernetes/AWS.
- Bedrock Guardrails.
- Token streaming, SSE, or WebSockets.
- Server-side chat transcript persistence.
- AIOps frontend GitHub Actions deployment.
- CI-managed AIOps Terraform plan/apply.
- Direct Prometheus queries from Lambda.
- Public or internal Prometheus load balancers for AIOps.
- Lambda VPC networking for AIOps tools.
- Kubernetes API calls from AIOps Lambda.
- Multi-environment Terraform restructuring beyond `dev`.

## Future improvements

- Add GitHub Actions workflow for AIOps frontend build, S3 sync, and CloudFront invalidation.
- Add Bedrock Guardrails if Kira becomes broader than authenticated operator usage.
- Add CloudWatch alarms or Alertmanager integration for event-driven Kira diagnosis.
- Add response streaming if diagnosis latency becomes noticeable.
- Add server-side encrypted transcript storage only if there is a clear audit/replay requirement.
- Add CloudWatch dashboard for the `Hiraya/AIOps` exported metric set.
- Move secrets/configuration to a stronger secrets-management pattern if the AIOps stack expands beyond dev.
