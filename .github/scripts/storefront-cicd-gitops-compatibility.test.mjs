import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const detectScript = path.join(repoRoot, '.github/scripts/dist/detect-changed-services.mjs');
const catalogPath = path.join(repoRoot, '.github/utils/services.json');

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
  });
  assert.ifError(result.error);
  assert.equal(result.status, 0, `${command} ${args.join(' ')} failed:\n${result.stderr}`);
  return result.stdout;
}

function serviceNames(matrix) {
  return matrix.include.map((entry) => entry.service);
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

test('Vintage replacement keeps exactly one existing frontend service catalog entry', () => {
  const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
  const frontendServices = catalog.services.filter((service) =>
    service.name === 'frontend'
    || service.packageName === 'frontend'
    || service.workspace === 'app/microservices/frontend'
    || service.image?.repository === 'hiraya-frontend'
  );

  assert.equal(frontendServices.length, 1, 'replacement must not add a parallel frontend service entry');
  assert.deepEqual(frontendServices[0], {
    name: 'frontend',
    packageName: 'frontend',
    workspace: 'app/microservices/frontend',
    image: { repository: 'hiraya-frontend' },
    build: {
      context: '.',
      dockerfile: 'app/microservices/frontend/Dockerfile',
    },
    manifest: {
      path: 'gitops/apps/vintage/k8s/frontend/deployment.yml',
    },
    pathOwnership: [
      'app/microservices/frontend/**',
      'app/microservices/shared/**',
      'package.json',
      'pnpm-lock.yaml',
      'pnpm-workspace.yaml',
      '.dockerignore',
    ],
    vintageStorefrontBaseline: {
      active: true,
      critical: true,
    },
  });
});

test('changed-service detection still maps frontend changes to the existing frontend image', () => {
  const matrix = JSON.parse(run(process.execPath, [
    detectScript,
    '--catalog', catalogPath,
    '--root', repoRoot,
    'app/microservices/frontend/src/App.tsx',
  ]));

  assert.deepEqual(serviceNames(matrix), ['frontend']);
  assert.equal(matrix.include[0].repository, 'hiraya-frontend');
  assert.equal(matrix.include[0].dockerfile, 'app/microservices/frontend/Dockerfile');
  assert.equal(matrix.include[0].manifest, 'gitops/apps/vintage/k8s/frontend/deployment.yml');
});

test('GitOps render keeps the existing frontend object and public route shape', () => {
  const rendered = run('kubectl', ['kustomize', 'gitops/apps/vintage']);

  const deployment = byKindName(rendered, 'Deployment', 'frontend');
  assert.match(deployment, /image:\s*[^\n]*\/hiraya-frontend:[^\n]+/, 'Deployment/frontend must keep using hiraya-frontend image promotion');
  assert.match(deployment, /name:\s*frontend/, 'Deployment/frontend must keep the frontend container name');
  assert.match(deployment, /containerPort:\s*80/, 'Deployment/frontend must keep nginx container port 80');

  const service = byKindName(rendered, 'Service', 'frontend');
  assert.match(service, /type:\s*ClusterIP/, 'Service/frontend must remain ClusterIP');
  assert.match(service, /port:\s*3000/, 'Service/frontend must keep service port 3000');
  assert.match(service, /targetPort:\s*80/, 'Service/frontend must keep targeting nginx port 80');

  const route = byKindName(rendered, 'HTTPRoute', 'frontend');
  assert.match(route, /hostnames:\n\s*- hiraya\.noidilin\.dev/, 'HTTPRoute/frontend must keep the public hostname');
  assert.match(route, /backendRefs:\n\s*- name:\s*frontend\n\s+port:\s*3000/, 'HTTPRoute/frontend must route to the existing frontend Service on port 3000');
});
