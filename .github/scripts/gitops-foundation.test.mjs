import { spawnSync } from 'node:child_process';
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

test('dev GitOps root renders foundation child Applications with ordered automated sync', () => {
  const rendered = render('gitops/clusters/dev/root');
  const expectedApps = [
    ['platform-namespaces', '-30', 'hiraya-platform', 'gitops/platform/namespaces'],
    ['platform-gateway-api-crds', '-25', 'hiraya-platform', 'gitops/platform/gateway-api-crds'],
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

test('Cluster Platform grants Public Gateway Access namespaces, excluding argocd', () => {
  const rendered = render('gitops/platform/namespaces');
  for (const namespace of ['edge', 'monitoring', 'vintage']) {
    const manifest = byKindName(rendered, 'Namespace', namespace);
    assert.match(manifest, /hiraya\.noidilin\.dev\/public-gateway-access:\s*"true"/, `${namespace} should have Public Gateway Access`);
  }
  assert.equal(docs(rendered).some((doc) => kind(doc) === 'Namespace' && metadataName(doc) === 'argocd'), false, 'argocd namespace must remain Cluster Bootstrap-owned');
});

test('Edge and Argo CD access render as separated Cluster Platform Applications', () => {
  const rendered = render('gitops/clusters/dev/root');
  const expectedApps = [
    ['platform-edge', '-14', 'gitops/platform/edge'],
    ['platform-argocd-access', '-8', 'gitops/platform/argocd-access'],
  ];

  for (const [name, wave, sourcePath] of expectedApps) {
    const app = byKindName(rendered, 'Application', name);
    assert.match(app, new RegExp(`argocd.argoproj.io/sync-wave:\\s*['"]?${wave}['"]?`), `${name} should have sync wave ${wave}`);
    assert.match(app, /project:\s*hiraya-platform/, `${name} should use the Cluster Platform project`);
    assert.match(app, new RegExp(`path:\\s*${sourcePath}`), `${name} should target ${sourcePath}`);
    assert.match(app, /prune:\s*true/, `${name} should enable automated prune`);
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
