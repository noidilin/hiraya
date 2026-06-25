import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

function render(path) {
  const result = spawnSync('kubectl', ['kustomize', path], { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
  assert.ifError(result.error);
  assert.equal(result.status, 0, `kubectl kustomize ${path} failed:\n${result.stderr}`);
  return result.stdout;
}

function docs(rendered) {
  return rendered.split(/^---\s*$/m).map((doc) => doc.trim()).filter(Boolean);
}

function metadataName(doc) {
  return doc.match(/^metadata:\n(?:^[ \t].*\n)*?^[ \t]{2}name:\s*([^\n]+)$/m)?.[1]?.replace(/["']/g, '');
}

function kind(doc) {
  return doc.match(/^kind:\s*([^\n]+)$/m)?.[1]?.trim();
}

function byKindName(rendered, expectedKind, expectedName) {
  const found = docs(rendered).find((doc) => kind(doc) === expectedKind && metadataName(doc) === expectedName);
  assert.ok(found, `expected ${expectedKind}/${expectedName} to render`);
  return found;
}

function platformProjectSourceRepos() {
  const variables = readFileSync('infra/envs/dev/cluster-bootstrap/variables.tf', 'utf8');
  const defaultList = variables.match(/variable "platform_project_source_repos"[\s\S]*?default\s*=\s*\[([\s\S]*?)\]/)?.[1];
  assert.ok(defaultList, 'expected platform_project_source_repos default list to be readable');
  return new Set([...defaultList.matchAll(/"([^"]+)"/g)].map((match) => match[1]));
}

test('dev GitOps root renders foundation child Applications with ordered automated sync', () => {
  const rendered = render('gitops/clusters/dev/root');
  const expectedApps = [
    ['platform-namespaces', '-30', 'hiraya-platform', 'gitops/platform/namespaces'],
    ['platform-gateway-api-crds', '-25', 'hiraya-platform', 'gitops/platform/gateway-api-crds'],
    ['platform-storage', '-24', 'hiraya-platform', 'gitops/platform/storage'],
  ];

  for (const [name, wave, project, sourcePath] of expectedApps) {
    const app = byKindName(rendered, 'Application', name);
    assert.match(app, new RegExp(`argocd.argoproj.io/sync-wave:\\s*['"]?${wave}['"]?`), `${name} should have sync wave ${wave}`);
    assert.match(app, new RegExp(`project:\\s*${project}`), `${name} should use ${project}`);
    assert.match(app, new RegExp(`path:\\s*${sourcePath}`), `${name} should target ${sourcePath}`);
    assert.match(app, /prune:\s*true/, `${name} should enable automated prune`);
    assert.match(app, /selfHeal:\s*true/, `${name} should enable automated self-heal`);
    assert.match(app, /resources-finalizer\.argocd\.argoproj\.io/, `${name} should declare the Argo cleanup finalizer`);
  }
});

test('Cluster Bootstrap AppProject allowlist covers platform child Application source repos', () => {
  const rendered = render('gitops/clusters/dev/root');
  const allowlist = platformProjectSourceRepos();
  const platformApps = docs(rendered).filter((doc) => kind(doc) === 'Application' && /^\s*project:\s*hiraya-platform\s*$/m.test(doc));
  assert.ok(platformApps.length > 0, 'expected platform Applications to render');

  for (const app of platformApps) {
    const name = metadataName(app);
    const repoUrls = [...app.matchAll(/^\s*repoURL:\s*([^\s#]+)\s*$/gm)].map((match) => match[1].replace(/["']/g, ''));
    assert.ok(repoUrls.length > 0, `${name} should declare at least one source repoURL`);
    for (const repoUrl of repoUrls) {
      assert.ok(allowlist.has(repoUrl), `${name} repoURL ${repoUrl} must be allowed by platform_project_source_repos`);
    }
  }
});

test('Cluster Platform grants Public Gateway Access namespaces, excluding argocd', () => {
  const rendered = render('gitops/platform/namespaces');
  for (const namespace of ['edge', 'monitoring', 'vintage']) {
    const manifest = byKindName(rendered, 'Namespace', namespace);
    assert.match(manifest, /hiraya\.noidilin\.dev\/public-gateway-access:\s*"true"/, `${namespace} should have Public Gateway Access`);
  }
  assert.equal(docs(rendered).some((doc) => kind(doc) === 'Namespace' && metadataName(doc) === 'argocd'), false, 'argocd namespace must remain Cluster Bootstrap-owned');
});

test('Edge, logging, monitoring, and Argo CD access render as separated Cluster Platform Applications', () => {
  const rendered = render('gitops/clusters/dev/root');
  const expectedApps = [
    ['platform-edge', '-14', 'path', 'gitops/platform/edge', true],
    ['platform-logging', '-10', 'values', 'gitops/platform/logging/values-dev.yaml', true],
    ['platform-monitoring', '-10', 'path', 'gitops/platform/monitoring', false],
    ['platform-argocd-access', '-8', 'path', 'gitops/platform/argocd-access', true],
  ];

  for (const [name, wave, sourceKind, sourcePath, shouldPrune] of expectedApps) {
    const app = byKindName(rendered, 'Application', name);
    assert.match(app, new RegExp(`argocd.argoproj.io/sync-wave:\\s*['"]?${wave}['"]?`), `${name} should have sync wave ${wave}`);
    assert.match(app, /project:\s*hiraya-platform/, `${name} should use the Cluster Platform project`);
    if (sourceKind === 'values') {
      assert.match(app, new RegExp(sourcePath.replaceAll('/', '\\/')), `${name} should use ${sourcePath}`);
    } else {
      assert.match(app, new RegExp(`path:\\s*${sourcePath}`), `${name} should target ${sourcePath}`);
    }
    assert.match(app, new RegExp(`prune:\\s*${shouldPrune}`), `${name} should set automated prune to ${shouldPrune}`);
    assert.match(app, /selfHeal:\s*true/, `${name} should enable automated self-heal`);
  }
});

test('Edge owns only shared Gateway policy and redirect route', () => {
  const rendered = render('gitops/platform/edge');

  byKindName(rendered, 'GatewayClass', 'aws-alb');
  byKindName(rendered, 'Gateway', 'public');
  const loadBalancerConfiguration = byKindName(rendered, 'LoadBalancerConfiguration', 'public-alb');
  byKindName(rendered, 'TargetGroupConfiguration', 'public-target-group');
  const redirectRoute = byKindName(rendered, 'HTTPRoute', 'public-http-redirect');

  assert.doesNotMatch(loadBalancerConfiguration, /vpc-[0-9a-f]+/, 'Edge must not commit VPC IDs');
  assert.doesNotMatch(loadBalancerConfiguration, /arn:aws:acm:/, 'Edge must not commit ACM certificate ARNs');
  assert.match(redirectRoute, /RequestRedirect/, 'Edge should own the shared HTTP-to-HTTPS redirect');
  assert.match(redirectRoute, /statusCode:\s*301/, 'Edge redirect should use permanent HTTPS redirects');
  assert.equal(docs(rendered).filter((doc) => kind(doc) === 'HTTPRoute').length, 1, 'Edge must not own service-specific HTTPRoutes');
});

test('Argo CD access owns only the public Argo CD route', () => {
  const rendered = render('gitops/platform/argocd-access');
  const route = byKindName(rendered, 'HTTPRoute', 'argocd');

  assert.equal(docs(rendered).length, 1, 'Argo CD access should render only route/access manifests');
  assert.match(route, /namespace:\s*argocd/, 'Argo CD route should live in the argocd namespace');
  assert.match(route, /argocd\.hiraya\.noidilin\.dev/, 'Argo CD route should preserve its public hostname');
  assert.match(route, /namespace:\s*edge/, 'Argo CD route should attach to the shared edge Gateway');
  assert.match(route, /name:\s*argocd-server/, 'Argo CD route should target the Argo CD server Service');
});

test('Logging and monitoring platform apps use Terraform-owned secrets and log group contracts', () => {
  const root = render('gitops/clusters/dev/root');
  const loggingApp = byKindName(root, 'Application', 'platform-logging');
  const monitoringApp = byKindName(root, 'Application', 'platform-monitoring');

  assert.match(loggingApp, /chart:\s*aws-for-fluent-bit/, 'logging should use the Fluent Bit Helm chart');
  assert.match(loggingApp, /targetRevision:\s*0\.2\.0/, 'logging chart version should be pinned');
  assert.match(monitoringApp, /chart:\s*kube-prometheus-stack/, 'monitoring should use kube-prometheus-stack');
  assert.match(monitoringApp, /targetRevision:\s*56\.21\.0/, 'monitoring chart version should be pinned');
  assert.match(monitoringApp, /prune:\s*false/, 'monitoring should protect chart-owned CRDs/resources from unsafe automated Argo prune');

  const monitoring = render('gitops/platform/monitoring');
  const grafanaSecret = byKindName(monitoring, 'ExternalSecret', 'grafana-admin');
  const grafanaRoute = byKindName(monitoring, 'HTTPRoute', 'grafana');

  assert.match(grafanaSecret, /hiraya-dev-secrets-manager/, 'Grafana credentials should come from ESO ClusterSecretStore');
  assert.match(grafanaSecret, /\/hiraya\/dev\/platform\/grafana-admin/, 'Grafana credentials should use the stable Secrets Manager name');
  assert.match(grafanaRoute, /grafana\.hiraya\.noidilin\.dev/, 'Grafana route should preserve its public hostname');
  assert.match(grafanaRoute, /namespace:\s*edge/, 'Grafana route should attach to the shared edge Gateway');
  assert.match(grafanaRoute, /name:\s*kube-prometheus-stack-grafana/, 'Grafana route should target the chart Grafana Service');
});

test('Cluster Platform owns the Vintage EBS StorageClass', () => {
  const root = render('gitops/clusters/dev/root');
  const app = byKindName(root, 'Application', 'platform-storage');

  assert.match(app, /argocd\.argoproj\.io\/sync-wave:\s*['"]?-24['"]?/, 'storage should sync before workload apps');
  assert.match(app, /project:\s*hiraya-platform/, 'storage should use the Cluster Platform project');
  assert.match(app, /path:\s*gitops\/platform\/storage/, 'storage should target the platform storage GitOps tree');
  assert.match(app, /prune:\s*true/, 'storage should enable automated prune');
  assert.match(app, /selfHeal:\s*true/, 'storage should enable automated self-heal');

  const storage = render('gitops/platform/storage');
  const storageClass = byKindName(storage, 'StorageClass', 'hiraya-ebs-gp3');
  assert.match(storageClass, /provisioner:\s*ebs\.csi\.aws\.com/, 'StorageClass should use the EBS CSI provisioner');
  assert.match(storageClass, /type:\s*gp3/, 'StorageClass should provision gp3 volumes');
  assert.match(storageClass, /reclaimPolicy:\s*Delete/, 'StorageClass should preserve reset-on-rebuild deletion behavior');
  assert.match(storageClass, /volumeBindingMode:\s*WaitForFirstConsumer/, 'StorageClass should wait for pod scheduling before binding');

  const vintage = render('gitops/apps/vintage');
  const postgres = byKindName(vintage, 'StatefulSet', 'vintage-postgres');
  assert.match(postgres, /storageClassName:\s*hiraya-ebs-gp3/, 'Vintage Postgres should reference the platform-owned EBS StorageClass');
});

test('Vintage workload is a GitOps app backed by ESO secrets', () => {
  const root = render('gitops/clusters/dev/root');
  const app = byKindName(root, 'Application', 'vintage');

  assert.match(app, /argocd\.argoproj\.io\/sync-wave:\s*['"]?0['"]?/, 'Vintage should sync after platform prerequisites');
  assert.match(app, /project:\s*hiraya-workloads/, 'Vintage should use the workload AppProject');
  assert.match(app, /path:\s*gitops\/apps\/vintage/, 'Vintage should target the workload GitOps app tree');
  assert.match(app, /namespace:\s*vintage/, 'Vintage should deploy to the platform-granted vintage namespace');
  assert.match(app, /prune:\s*true/, 'Vintage should enable automated prune');
  assert.match(app, /selfHeal:\s*true/, 'Vintage should enable automated self-heal');

  const rendered = render('gitops/apps/vintage');
  assert.equal(docs(rendered).some((doc) => kind(doc) === 'Namespace' && metadataName(doc) === 'vintage'), false, 'Vintage app must not own its public namespace');
  assert.equal(docs(rendered).some((doc) => kind(doc) === 'Secret' && metadataName(doc) === 'vintage-secrets'), false, 'Vintage app must not commit a plaintext Kubernetes Secret');

  const externalSecret = byKindName(rendered, 'ExternalSecret', 'vintage-secrets');
  assert.match(externalSecret, /hiraya-dev-secrets-manager/, 'Vintage runtime secrets should come from the shared ESO ClusterSecretStore');
  assert.match(externalSecret, /\/hiraya\/dev\/apps\/vintage/, 'Vintage runtime secrets should reference the durable Secrets Manager secret name');

  byKindName(rendered, 'HTTPRoute', 'frontend');
  byKindName(rendered, 'ServiceMonitor', 'vintage-services');
  byKindName(rendered, 'ConfigMap', 'grafana-dashboards');
  byKindName(rendered, 'StatefulSet', 'vintage-postgres');
});

test('Gateway API and AWS Load Balancer Controller CRDs are vendored and no-prune protected', () => {
  const rendered = render('gitops/platform/gateway-api-crds');
  const crdNames = [
    'gatewayclasses.gateway.networking.k8s.io',
    'gateways.gateway.networking.k8s.io',
    'httproutes.gateway.networking.k8s.io',
    'referencegrants.gateway.networking.k8s.io',
    'loadbalancerconfigurations.gateway.k8s.aws',
    'targetgroupconfigurations.gateway.k8s.aws',
    'listenerruleconfigurations.gateway.k8s.aws',
  ];

  for (const crdName of crdNames) {
    const crd = byKindName(rendered, 'CustomResourceDefinition', crdName);
    assert.match(crd, /argocd\.argoproj\.io\/sync-options:\s*Prune=false/, `${crdName} should be protected from Argo prune`);
  }
});
