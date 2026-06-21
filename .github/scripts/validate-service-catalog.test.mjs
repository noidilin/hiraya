import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const scriptPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  'validate-service-catalog.mjs',
);

async function createCatalogFixture(catalogOverrides = {}) {
  const root = await mkdtemp(path.join(tmpdir(), 'hiraya-service-catalog-'));
  await mkdir(path.join(root, 'app/microservices/frontend'), { recursive: true });
  await mkdir(path.join(root, 'gitops/k8s/frontend'), { recursive: true });
  await writeFile(path.join(root, 'app/microservices/frontend/package.json'), '{"name":"frontend"}\n');
  await writeFile(path.join(root, 'app/microservices/frontend/Dockerfile'), 'FROM scratch\n');
  await writeFile(path.join(root, 'gitops/k8s/frontend/deployment.yml'), '---\n');

  const catalog = {
    services: [
      {
        name: 'frontend',
        packageName: 'frontend',
        workspace: 'app/microservices/frontend',
        image: { repository: 'hiraya-frontend' },
        build: {
          context: 'app/microservices/frontend',
          dockerfile: 'app/microservices/frontend/Dockerfile',
        },
        manifest: { path: 'gitops/k8s/frontend/deployment.yml' },
        pathOwnership: ['app/microservices/frontend/**'],
        vintageStorefrontBaseline: { active: true, critical: true },
      },
    ],
    ...catalogOverrides,
  };

  const catalogPath = path.join(root, '.github/utils/services.json');
  await mkdir(path.dirname(catalogPath), { recursive: true });
  await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
  return { root, catalogPath };
}

function validate(catalogPath, root) {
  return spawnSync(process.execPath, [scriptPath, catalogPath, '--root', root], {
    encoding: 'utf8',
  });
}

test('validates a complete service catalog through the CLI', async () => {
  const { root, catalogPath } = await createCatalogFixture();

  const result = validate(catalogPath, root);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Validated 1 service/);
});

test('fails when required service metadata is missing', async () => {
  const { root, catalogPath } = await createCatalogFixture({
    services: [{ name: 'frontend' }],
  });

  const result = validate(catalogPath, root);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /services\[0\]\.packageName is required/);
  assert.match(result.stderr, /services\[0\]\.build\.context is required/);
});

test('fails when referenced local paths do not exist', async () => {
  const { root, catalogPath } = await createCatalogFixture({
    services: [
      {
        name: 'frontend',
        packageName: 'frontend',
        workspace: 'app/microservices/missing-frontend',
        image: { repository: 'hiraya-frontend' },
        build: {
          context: 'app/microservices/frontend',
          dockerfile: 'app/microservices/frontend/missing.Dockerfile',
        },
        manifest: { path: 'gitops/k8s/frontend/missing.yml' },
        pathOwnership: ['app/microservices/frontend/**'],
        vintageStorefrontBaseline: { active: true, critical: true },
      },
    ],
  });

  const result = validate(catalogPath, root);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /workspace path does not exist/);
  assert.match(result.stderr, /build\.dockerfile path does not exist/);
  assert.match(result.stderr, /manifest\.path path does not exist/);
});

test('fails when a path ownership glob points at a missing local base path', async () => {
  const { root, catalogPath } = await createCatalogFixture({
    services: [
      {
        name: 'frontend',
        packageName: 'frontend',
        workspace: 'app/microservices/frontend',
        image: { repository: 'hiraya-frontend' },
        build: {
          context: 'app/microservices/frontend',
          dockerfile: 'app/microservices/frontend/Dockerfile',
        },
        manifest: { path: 'gitops/k8s/frontend/deployment.yml' },
        pathOwnership: ['app/microservices/missing-frontend/**'],
        vintageStorefrontBaseline: { active: true, critical: true },
      },
    ],
  });

  const result = validate(catalogPath, root);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /pathOwnership\[0\] base path does not exist/);
});
