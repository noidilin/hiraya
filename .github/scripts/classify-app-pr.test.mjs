import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  'dist/classify-app-pr.mjs',
);

async function createRepoFixture() {
  const root = await mkdtemp(path.join(tmpdir(), 'hiraya-classify-app-pr-'));
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
          'app/microservices/package.json',
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
          'app/microservices/package.json',
        ],
      }),
    ],
  }, null, 2)}\n`);

  await writeFile(path.join(root, 'README.md'), 'hello\n');
  await mkdir(path.join(root, 'app/microservices/frontend/src'), { recursive: true });
  await writeFile(path.join(root, 'app/microservices/frontend/src/App.tsx'), 'export default function App() { return null; }\n');
  await mkdir(path.join(root, 'app/microservices/backend/services/auth/src'), { recursive: true });
  await writeFile(path.join(root, 'app/microservices/backend/services/auth/src/index.ts'), 'export {};\n');
  await mkdir(path.join(root, 'app/microservices'), { recursive: true });
  await writeFile(path.join(root, 'app/microservices/package.json'), `${JSON.stringify({
    name: 'fixture',
    scripts: {
      'reports:permissions': 'node old-report.mjs',
      'reports:permissions:validate': 'node old-report.mjs --validate-only',
      'app:baseline': 'node baseline.mjs',
    },
  }, null, 2)}\n`);
  await mkdir(path.join(root, 'gitops/k8s/backend'), { recursive: true });
  await writeFile(path.join(root, 'gitops/k8s/backend/auth.yml'), 'image: old-auth\n');
  await mkdir(path.join(root, 'gitops/k8s/frontend'), { recursive: true });
  await writeFile(path.join(root, 'gitops/k8s/frontend/deployment.yml'), 'image: old-frontend\n');
  await mkdir(path.join(root, '.github/actions/setup-app-toolchain'), { recursive: true });
  await writeFile(path.join(root, '.github/actions/setup-app-toolchain/action.yml'), 'name: setup\n');
  await mkdir(path.join(root, '.github/workflows'), { recursive: true });
  await writeFile(path.join(root, '.github/workflows/app-pr-baseline.yml'), 'name: app\n');

  git(root, ['init', '-b', 'main']);
  git(root, ['config', 'user.email', 'ci@example.invalid']);
  git(root, ['config', 'user.name', 'CI']);
  git(root, ['add', '.']);
  git(root, ['commit', '-m', 'base']);
  const base = git(root, ['rev-parse', 'HEAD']).trim();

  return { root, catalogPath, base };
}

function service(name, overrides) {
  return {
    name,
    packageName: overrides.packageName,
    workspace: overrides.workspace,
    image: { repository: overrides.repository },
    build: {
      context: 'app/microservices',
      dockerfile: overrides.dockerfile,
    },
    manifest: { path: overrides.manifest },
    pathOwnership: overrides.pathOwnership,
    vintageStorefrontBaseline: { active: true, critical: true },
  };
}

function git(root, args) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

async function commitChange(root, message) {
  git(root, ['add', '.']);
  git(root, ['commit', '-m', message]);
  return git(root, ['rev-parse', 'HEAD']).trim();
}

function classify({ root, catalogPath, base, head, author = 'contributor', headRef = 'feature/app' }) {
  const result = spawnSync(process.execPath, [
    scriptPath,
    '--catalog', catalogPath,
    '--root', root,
    '--base', base,
    '--head', head,
    '--author', author,
    '--head-ref', headRef,
  ], { encoding: 'utf8' });

  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

function serviceNames(classification) {
  return classification.matrix.include.map((entry) => entry.service);
}

test('classifies docs-only PRs as non-app and skips heavy jobs', async () => {
  const fixture = await createRepoFixture();
  await writeFile(path.join(fixture.root, 'README.md'), 'docs only\n');
  const head = await commitChange(fixture.root, 'docs');

  const classification = classify({ ...fixture, head });

  assert.equal(classification.pr_kind, 'non_app');
  assert.equal(classification.run_app_baseline, false);
  assert.equal(classification.has_changed_service_images, false);
  assert.deepEqual(serviceNames(classification), []);
});

test('uses service catalog pathOwnership for changed service image planning', async () => {
  const fixture = await createRepoFixture();
  await writeFile(path.join(fixture.root, 'app/microservices/frontend/src/App.tsx'), 'export const changed = true;\n');
  const head = await commitChange(fixture.root, 'frontend');

  const classification = classify({ ...fixture, head });

  assert.equal(classification.pr_kind, 'microservice_related');
  assert.equal(classification.run_app_baseline, true);
  assert.equal(classification.has_changed_service_images, true);
  assert.deepEqual(serviceNames(classification), ['frontend']);
});

test('fans out catalog changes to every service image', async () => {
  const fixture = await createRepoFixture();
  const catalog = JSON.parse(await readFile(fixture.catalogPath, 'utf8'));
  catalog.services[0].vintageStorefrontBaseline.critical = false;
  await writeFile(fixture.catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
  const head = await commitChange(fixture.root, 'catalog');

  const classification = classify({ ...fixture, head });

  assert.equal(classification.pr_kind, 'microservice_related');
  assert.deepEqual(serviceNames(classification), ['frontend', 'auth']);
});

test('keeps setup-action changes in the app baseline without forcing image builds', async () => {
  const fixture = await createRepoFixture();
  await writeFile(path.join(fixture.root, '.github/actions/setup-app-toolchain/action.yml'), 'name: changed setup\n');
  const head = await commitChange(fixture.root, 'setup action');

  const classification = classify({ ...fixture, head });

  assert.equal(classification.pr_kind, 'microservice_related');
  assert.equal(classification.run_app_baseline, true);
  assert.equal(classification.has_changed_service_images, false);
  assert.deepEqual(serviceNames(classification), []);
});

test('ignores app package permission-report script-only changes', async () => {
  const fixture = await createRepoFixture();
  await writeFile(path.join(fixture.root, 'app/microservices/package.json'), `${JSON.stringify({
    name: 'fixture',
    scripts: {
      'reports:permissions': 'node new-report.mjs',
      'reports:permissions:validate': 'node new-report.mjs --validate-only',
      'app:baseline': 'node baseline.mjs',
    },
  }, null, 2)}\n`);
  const head = await commitChange(fixture.root, 'permission scripts');

  const classification = classify({ ...fixture, head });

  assert.equal(classification.pr_kind, 'non_app');
  assert.equal(classification.has_changed_service_images, false);
});

test('treats other app package changes as all service image inputs', async () => {
  const fixture = await createRepoFixture();
  await writeFile(path.join(fixture.root, 'app/microservices/package.json'), `${JSON.stringify({
    name: 'fixture',
    version: '2.0.0',
    scripts: {
      'reports:permissions': 'node old-report.mjs',
      'reports:permissions:validate': 'node old-report.mjs --validate-only',
      'app:baseline': 'node baseline.mjs',
    },
  }, null, 2)}\n`);
  const head = await commitChange(fixture.root, 'package');

  const classification = classify({ ...fixture, head });

  assert.equal(classification.pr_kind, 'microservice_related');
  assert.deepEqual(serviceNames(classification), ['frontend', 'auth']);
});

test('fast-paths Hiraya bot GitOps image-tag-only manifest promotions', async () => {
  const fixture = await createRepoFixture();
  await writeFile(path.join(fixture.root, 'gitops/k8s/backend/auth.yml'), 'image: new-auth\n');
  const head = await commitChange(fixture.root, 'promote image');

  const classification = classify({
    ...fixture,
    head,
    author: 'app/hiraya-bot',
    headRef: 'ci/update-manifests-dev',
  });

  assert.equal(classification.pr_kind, 'manifest_promotion_only');
  assert.equal(classification.run_manifest_baseline, true);
  assert.equal(classification.run_app_baseline, false);
  assert.equal(classification.has_changed_service_images, false);
});

test('rejects non-image bot GitOps changes from the manifest-promotion fast path', async () => {
  const fixture = await createRepoFixture();
  await writeFile(path.join(fixture.root, 'gitops/k8s/backend/auth.yml'), 'image: old-auth\nreplicas: 2\n');
  const head = await commitChange(fixture.root, 'change replicas');

  const classification = classify({
    ...fixture,
    head,
    author: 'app/hiraya-bot',
    headRef: 'ci/update-manifests-dev',
  });

  assert.equal(classification.pr_kind, 'microservice_related');
  assert.equal(classification.run_app_baseline, true);
  assert.equal(classification.run_manifest_baseline, false);
});
