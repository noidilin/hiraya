import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  'dist/detect-changed-services.mjs',
);

async function createCatalogFixture() {
  const root = await mkdtemp(path.join(tmpdir(), 'hiraya-changed-services-'));
  const catalogPath = path.join(root, '.github/utils/services.json');
  await mkdir(path.dirname(catalogPath), { recursive: true });
  await writeFile(catalogPath, `${JSON.stringify({
    services: [
      service('frontend', {
        packageName: 'frontend',
        workspace: 'app/microservices/frontend',
        repository: 'hiraya-frontend',
        dockerfile: 'app/microservices/frontend/Dockerfile',
        manifest: 'gitops/k8s/frontend/deployment.yml',
        pathOwnership: [
          'app/microservices/frontend/**',
          'app/microservices/shared/**',
          'package.json',
          'pnpm-lock.yaml',
          'pnpm-workspace.yaml',
          '.dockerignore',
        ],
      }),
      service('auth', {
        packageName: 'auth-service',
        workspace: 'app/microservices/backend/services/auth',
        repository: 'hiraya-auth',
        dockerfile: 'app/microservices/backend/services/auth/Dockerfile',
        manifest: 'gitops/k8s/backend/auth.yml',
        pathOwnership: [
          'app/microservices/backend/services/auth/**',
          'app/microservices/backend/shared/**',
          'app/microservices/shared/**',
          'app/microservices/backend/package.json',
        ],
      }),
      service('orders', {
        packageName: 'orders-service',
        workspace: 'app/microservices/backend/services/orders',
        repository: 'hiraya-orders',
        dockerfile: 'app/microservices/backend/services/orders/Dockerfile',
        manifest: 'gitops/k8s/backend/orders.yml',
        pathOwnership: [
          'app/microservices/backend/services/orders/**',
          'app/microservices/backend/shared/**',
          'app/microservices/shared/**',
          'app/microservices/backend/package.json',
        ],
      }),
    ],
  }, null, 2)}\n`);

  return { root, catalogPath };
}

function service(name, overrides) {
  return {
    name,
    packageName: overrides.packageName,
    workspace: overrides.workspace,
    image: { repository: overrides.repository },
    build: {
      context: '.',
      dockerfile: overrides.dockerfile,
    },
    manifest: { path: overrides.manifest },
    pathOwnership: overrides.pathOwnership,
    vintageStorefrontBaseline: { active: true, critical: true },
  };
}

function detect(catalogPath, root, changedFiles, extraArgs = []) {
  const result = spawnSync(process.execPath, [
    scriptPath,
    '--catalog', catalogPath,
    '--root', root,
    ...extraArgs,
    ...changedFiles,
  ], { encoding: 'utf8' });

  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

function serviceNames(matrix) {
  return matrix.include.map((entry) => entry.service);
}

test('emits a GitHub Actions matrix for a changed frontend file', async () => {
  const { root, catalogPath } = await createCatalogFixture();

  const matrix = detect(catalogPath, root, ['app/microservices/frontend/src/App.tsx']);

  assert.deepEqual(serviceNames(matrix), ['frontend']);
  assert.deepEqual(matrix.include[0], {
    service: 'frontend',
    package_name: 'frontend',
    workspace: 'app/microservices/frontend',
    repository: 'hiraya-frontend',
    build_context: '.',
    dockerfile: 'app/microservices/frontend/Dockerfile',
    manifest: 'gitops/k8s/frontend/deployment.yml',
    critical: true,
  });
});

test('maps a backend service path to that service only', async () => {
  const { root, catalogPath } = await createCatalogFixture();

  const matrix = detect(catalogPath, root, ['app/microservices/backend/services/orders/src/index.ts']);

  assert.deepEqual(serviceNames(matrix), ['orders']);
});

test('fails fast for unsupported character class and brace glob syntax', async () => {
  const { root, catalogPath } = await createCatalogFixture();
  const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));

  for (const [pattern, message] of [
    ['app/microservices/frontend/src/*.[tj]s', /Unsupported character class glob syntax/],
    ['app/microservices/frontend/src/*.{ts,tsx}', /Unsupported brace glob syntax/],
  ]) {
    catalog.services[0].pathOwnership = [pattern];
    await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

    const result = spawnSync(process.execPath, [
      scriptPath,
      '--catalog', catalogPath,
      '--root', root,
      'app/microservices/frontend/src/App.tsx',
    ], { encoding: 'utf8' });

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, message);
  }
});

test('fans out shared backend files to backend service owners', async () => {
  const { root, catalogPath } = await createCatalogFixture();

  const matrix = detect(catalogPath, root, ['app/microservices/backend/shared/types.ts']);

  assert.deepEqual(serviceNames(matrix), ['auth', 'orders']);
});

test('fans out shared Storefront contracts to active contract consumers', async () => {
  const { root, catalogPath } = await createCatalogFixture();

  const matrix = detect(catalogPath, root, ['app/microservices/shared/src/index.mjs']);

  assert.deepEqual(serviceNames(matrix), ['frontend', 'auth', 'orders']);
});

test('fans out root image build inputs, workflow, script, and catalog changes to all catalog services', async () => {
  const { root, catalogPath } = await createCatalogFixture();

  for (const changedFile of [
    'package.json',
    'pnpm-lock.yaml',
    'pnpm-workspace.yaml',
    '.dockerignore',
    '.github/utils/services.json',
    '.github/scripts/src/detect-changed-services.mts',
    '.github/workflows/image-ci.yml',
  ]) {
    assert.deepEqual(
      serviceNames(detect(catalogPath, root, [changedFile])),
      ['frontend', 'auth', 'orders'],
      changedFile,
    );
  }
});

test('does not fan out report-only governance script changes to service images', async () => {
  const { root, catalogPath } = await createCatalogFixture();

  assert.deepEqual(
    serviceNames(detect(catalogPath, root, ['.github/scripts/src/permission-controls.mts'])),
    [],
  );
});

test('handles no-change and unknown paths with an empty matrix', async () => {
  const { root, catalogPath } = await createCatalogFixture();
  const emptyChangesPath = path.join(root, 'empty-changes.txt');
  await writeFile(emptyChangesPath, '');

  assert.deepEqual(detect(catalogPath, root, [], ['--files-from', emptyChangesPath]).include, []);
  assert.deepEqual(detect(catalogPath, root, ['README.md']).include, []);
});

test('accepts the npm argument separator before detector options', async () => {
  const { root, catalogPath } = await createCatalogFixture();

  assert.deepEqual(
    serviceNames(detect(catalogPath, root, [], ['--', '--all'])),
    ['frontend', 'auth', 'orders'],
  );
});

test('can read changed paths from stdin and write GitHub outputs', async () => {
  const { root, catalogPath } = await createCatalogFixture();
  const outputPath = path.join(root, 'github-output.txt');
  const result = spawnSync(process.execPath, [
    scriptPath,
    '--catalog', catalogPath,
    '--root', root,
    '--files-from', '-',
    '--github-output', outputPath,
  ], {
    encoding: 'utf8',
    input: 'app/microservices/frontend/package.json\nREADME.md\n',
  });

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(serviceNames(JSON.parse(result.stdout)), ['frontend']);
  const outputs = await readFile(outputPath, 'utf8');
  assert.match(outputs, /^has_changes=true$/m);
  assert.match(outputs, /^services=\["frontend"\]$/m);
  assert.match(outputs, /^matrix=/m);
});
