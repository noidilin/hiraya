import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const infraCiWorkflowPath = '.github/workflows/infra-ci.yml';
const infraDeployWorkflowPath = '.github/workflows/infra-deploy.yml';
const infraDestroyWorkflowPath = '.github/workflows/infra-destroy.yml';
const backendWriterPath = '.github/scripts/write-terraform-backend.sh';

function blockBetween(text, start, end) {
  const startIndex = text.indexOf(start);
  assert.notEqual(startIndex, -1, `missing start marker: ${start}`);
  const endIndex = text.indexOf(end, startIndex + start.length);
  assert.notEqual(endIndex, -1, `missing end marker after ${start}: ${end}`);
  return text.slice(startIndex, endIndex);
}

test('Terraform backend writer is stack-generic for layered dev states', async () => {
  const script = await readFile(backendWriterPath, 'utf8');

  assert.match(script, /TF_STACK|stack=\"\$\{1:-/, 'writer should accept a stack name instead of being tied to one env var set');
  assert.match(script, /platform-core/, 'writer should document or support the Platform Core stack name');
  assert.match(script, /cluster-bootstrap/, 'writer should document or support the Cluster Bootstrap stack name');
  assert.match(script, /portfolio/, 'writer should document or support the Portfolio Stack name');
  assert.match(script, /infra\/portfolio\/backend\.hcl/, 'Portfolio backend config should be written to infra/portfolio/backend.hcl');
  assert.match(script, /TF_STATE_PREFIX/, 'writer should derive state keys from a shared prefix for layered stacks');
  assert.doesNotMatch(script, /PLATFORM_DIR/, 'backend writer must not be coupled to Platform Core only');
});

test('infra CI validates all layered Terraform roots without cluster credentials', async () => {
  const workflow = await readFile(infraCiWorkflowPath, 'utf8');
  const validateStep = blockBetween(workflow, 'validate-terraform-root-stacks-without-backend-credentials', 'run-terraform-module-contract-tests');

  for (const stack of ['infra/envs/dev/bootstrap', 'infra/envs/dev/platform-core', 'infra/envs/dev/cluster-bootstrap']) {
    assert.match(validateStep, new RegExp(stack.replaceAll('/', '\\/')), `${stack} should be validated in static CI`);
  }
  assert.match(validateStep, /init -backend=false/, 'static validation must not initialize remote backends');
  assert.doesNotMatch(validateStep, /aws eks update-kubeconfig|kubectl config|configure-aws-credentials/, 'static validation must not require Kubernetes or AWS credentials');
});

test('infra CI renders and schema-lints GitOps desired state with CRD allowances', async () => {
  const workflow = await readFile(infraCiWorkflowPath, 'utf8');

  assert.match(workflow, /kubectl kustomize gitops\/clusters\/dev\/root/, 'root app-of-apps should render in CI');
  assert.match(workflow, /kubectl kustomize gitops\/platform\/storage/, 'platform storage app should render in CI');
  assert.match(workflow, /kubectl kustomize gitops\/apps\/vintage/, 'Vintage workload app should render in CI');
  assert.match(workflow, /helm template[\s\S]*gitops\/platform\/aws-load-balancer-controller\/values-dev\.yaml/, 'AWS LBC Helm values should render in CI');
  assert.match(workflow, /helm template[\s\S]*gitops\/platform\/external-dns\/values-dev\.yaml/, 'ExternalDNS Helm values should render in CI');
  assert.match(workflow, /helm template[\s\S]*gitops\/platform\/external-secrets\/values-dev\.yaml/, 'ESO Helm values should render in CI');
  assert.doesNotMatch(workflow, /helm template[\s\S]*gitops\/platform\/logging\/values-dev\.yaml/, 'disabled logging Helm values should not render in active CI');
  assert.match(workflow, /helm template[\s\S]*gitops\/platform\/monitoring\/values-dev\.yaml/, 'monitoring Helm values should render in CI');
  assert.match(workflow, /kubeconform/, 'CI should run practical schema linting');
  assert.match(workflow, /-ignore-missing-schemas/, 'schema lint should allow known custom resources and CRDs without live cluster schemas');
});

test('trusted PR planning covers Platform Core only', async () => {
  const workflow = await readFile(infraCiWorkflowPath, 'utf8');
  const planJob = blockBetween(workflow, 'trusted-platform-plan:', 'publish-sticky-plan-comment');

  assert.match(planJob, /PLATFORM_DIR: infra\/envs\/dev\/platform-core/, 'trusted PR plan should target Platform Core');
  assert.match(planJob, /-refresh=false/, 'trusted PR plan should stay fast and speculative');
  assert.doesNotMatch(planJob, /cluster-bootstrap/, 'Cluster Bootstrap must be excluded from PR planning');
});

test('deploy workflow applies Platform Core before Cluster Bootstrap and then smokes GitOps convergence', async () => {
  const workflow = await readFile(infraDeployWorkflowPath, 'utf8');

  assert.match(workflow, /apply-platform-core/, 'deploy should apply Platform Core first');
  assert.match(workflow, /apply-cluster-bootstrap[\s\S]*needs: apply/, 'Cluster Bootstrap deploy should depend on Platform Core apply');
  assert.match(workflow, /smoke-dev-platform[\s\S]*needs: apply-cluster-bootstrap/, 'smoke checks should run only after Cluster Bootstrap apply');
  assert.match(workflow, /CLUSTER_BOOTSTRAP_ROLE_ARN/, 'Cluster Bootstrap should use its dedicated GitHub role');
  assert.match(workflow, /write-terraform-backend\.sh cluster-bootstrap/, 'Cluster Bootstrap should use the generic backend writer');
  assert.match(workflow, /terraform -chdir="\$\{CLUSTER_BOOTSTRAP_DIR\}" apply/, 'deploy should apply the Cluster Bootstrap state');
  assert.match(workflow, /platform-route-smoke\.sh/, 'deploy should run Kubernetes and public route smoke checks after GitOps convergence');
  assert.doesNotMatch(workflow, /argocd login|argocd app sync|ARGOCD_AUTH_TOKEN/, 'deploy validation must not call the Argo CD API');
});

test('destroy workflow prunes GitOps before layered Terraform teardown', async () => {
  const workflow = await readFile(infraDestroyWorkflowPath, 'utf8');

  assert.match(workflow, /CLUSTER_BOOTSTRAP_ROLE_ARN/, 'destroy should use the dedicated Cluster Bootstrap role for Kubernetes cleanup');
  assert.match(workflow, /configure-aws-credentials-with-cluster-bootstrap-role[\s\S]*platform-pre-destroy-k8s-ebs-cleanup\.sh/, 'GitOps/Kubernetes cleanup should run under the Cluster Bootstrap role');
  assert.match(workflow, /destroy-cluster-bootstrap-state[\s\S]*terraform -chdir="\$\{CLUSTER_BOOTSTRAP_DIR\}" destroy/, 'Cluster Bootstrap state should be destroyed before Platform Core');
  assert.match(workflow, /configure-aws-credentials-with-platform-core-apply-role[\s\S]*destroy-platform-core-stack/, 'Platform Core destroy should use the infra apply role after Cluster Bootstrap teardown');
  assert.match(workflow, /write-terraform-backend\.sh cluster-bootstrap/, 'destroy should initialize the Cluster Bootstrap layered state');
  assert.match(workflow, /write-terraform-backend\.sh platform-core/, 'destroy should initialize the Platform Core layered state');
});

test('pre-destroy script stops root reconciliation and prunes child apps in safe order', async () => {
  const script = await readFile('.github/scripts/platform-pre-destroy-k8s-ebs-cleanup.sh', 'utf8');

  assert.match(script, /ROOT_ARGOCD_APPLICATION/, 'cleanup should know the root app name');
  assert.match(script, /suspend_root_application/, 'cleanup should suspend or orphan-delete the root app before child pruning');
  assert.match(script, /delete_child_application vintage/, 'Vintage workload must be pruned first');
  assert.match(script, /wait_for_vintage_storage_cleanup/, 'cleanup should wait for Vintage PVC/PV/EBS cleanup before controller teardown');
  assert.match(script, /wait_for_vintage_storage_cleanup[\s\S]*delete_child_application platform-storage/, 'platform storage should be pruned only after Vintage PVC/PV/EBS cleanup');
  assert.match(script, /delete_child_application platform-edge[\s\S]*wait_for_alb_cleanup/, 'edge resources should be removed while AWS LBC is still running');
  assert.match(script, /wait_for_aws_load_balancer_controller_k8s_cleanup/, 'cleanup should wait for AWS LBC Kubernetes finalizers before controller teardown');
  assert.match(script, /gatewayclasses\.gateway\.networking\.k8s\.io/, 'cleanup should wait for GatewayClass finalizers before controller teardown');
  assert.match(script, /EXTERNAL_DNS_TXT_OWNER_ID/, 'cleanup should detect ExternalDNS TXT ownership records, including prefixed TXT records');
  assert.match(script, /wait_for_external_dns_cleanup/, 'cleanup should wait for ExternalDNS-managed records to disappear');
  assert.match(script, /delete_child_application platform-aws-load-balancer-controller/, 'AWS Load Balancer Controller should be pruned only after ALB cleanup');
  assert.match(script, /delete_child_application platform-external-dns/, 'ExternalDNS should be pruned only after DNS cleanup');
  assert.match(script, /delete_child_application platform-gateway-api-crds/, 'CRD app should be pruned last');
});

test('platform smoke script validates GitOps health and layered public surface', async () => {
  const script = await readFile('.github/scripts/platform-route-smoke.sh', 'utf8');

  assert.match(script, /wait_for_argocd_application/, 'smoke should wait for Argo Applications through Kubernetes');
  assert.match(script, /status\.sync\.status/, 'smoke should require Argo sync status');
  assert.match(script, /status\.health\.status/, 'smoke should require Argo health status');

  for (const namespace of ['argocd', 'edge', 'monitoring', 'vintage', 'external-dns', 'external-secrets']) {
    assert.match(script, new RegExp(`\\b${namespace}\\b`), `${namespace} namespace should be covered by smoke checks`);
  }

  assert.match(script, /condition=Programmed/, 'smoke should wait for the shared Gateway to become programmed');
  assert.match(script, /Accepted/, 'smoke should wait for HTTPRoutes to be accepted');
  assert.match(script, /Vintage Storefront[\s\S]*"200 204 301 302"/, 'Vintage route should allow the expected status codes');
  assert.match(script, /Argo CD[\s\S]*"200 301 302 401 403"/, 'Argo CD route should allow the expected status codes');
  assert.match(script, /Grafana[\s\S]*"200 301 302 401 403"/, 'Grafana route should allow the expected status codes');
  assert.doesNotMatch(script, /argocd login|argocd app sync|ARGOCD_AUTH_TOKEN/, 'smoke validation must not call the Argo CD API');
});
