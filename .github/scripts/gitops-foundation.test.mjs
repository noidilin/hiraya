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
