import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const workspacePackagePath = path.join(repoRoot, 'app/microservices/package.json');
const legacyFiltersPath = path.join(repoRoot, '.github/utils/file-filters.yml');
const appWorkspaceReadmePath = path.join(repoRoot, 'app/microservices/README.md');

async function readWorkspaceScripts() {
  const packageJson = JSON.parse(await readFile(workspacePackagePath, 'utf8'));
  return packageJson.scripts ?? {};
}

test('app workspace exposes the reusable baseline command surface', async () => {
  const scripts = await readWorkspaceScripts();

  for (const scriptName of [
    'app:install',
    'app:workspace',
    'scripts:build',
    'app:catalog',
    'app:changed',
    'app:static',
    'app:baseline',
    'app:test:catalog',
    'app:test:contract',
    'app:test:backend-contract',
    'app:test:browser',
  ]) {
    assert.equal(typeof scripts[scriptName], 'string', `${scriptName} should be documented as a package script`);
    assert.notEqual(scripts[scriptName].trim(), '', `${scriptName} should not be empty`);
  }
});

test('implemented contract baseline command runs shared validation while future browser command fails clearly', async () => {
  const scripts = await readWorkspaceScripts();

  assert.match(
    scripts['app:test:contract'],
    /@hiraya\/storefront-contracts test/,
    'app:test:contract should run the shared Storefront contract validation and smoke tests',
  );
  assert.doesNotMatch(scripts['app:test:contract'], /not implemented|exit\(1\)|exit 1/i);

  assert.match(scripts['app:test:browser'], /not implemented/i, 'app:test:browser should explain that the slice is not implemented yet');
  assert.match(scripts['app:test:browser'], /exit\(1\)|exit 1/, 'app:test:browser should fail until implemented');
});

test('backend contract baseline command names and gates each active Storefront suite', async () => {
  const [scripts, readme] = await Promise.all([
    readWorkspaceScripts(),
    readFile(appWorkspaceReadmePath, 'utf8'),
  ]);

  assert.match(
    scripts['app:test:backend-contract'],
    /@hiraya\/storefront-contracts test:backend-contract/,
    'app:test:backend-contract should run the dedicated backend contract baseline',
  );
  assert.match(
    scripts['app:baseline'],
    /app:test:backend-contract/,
    'app:baseline should reuse the backend contract gate for later PR checks',
  );
  assert.match(readme, /gateway, auth, product, and orders contract suites/i);
  assert.match(readme, /mocked database and upstream boundaries/i);
  assert.match(readme, /AWS credentials, PostgreSQL, Kubernetes, or real backend services/i);
});

test('legacy path-filter metadata is documented as transitional', async () => {
  const [legacyFilters, appReadme] = await Promise.all([
    readFile(legacyFiltersPath, 'utf8'),
    readFile(appWorkspaceReadmePath, 'utf8'),
  ]);

  assert.match(legacyFilters, /services\.json/i, 'legacy filters should point agents at the canonical service catalog');
  assert.match(legacyFilters, /transitional|superseded/i, 'legacy filters should be marked transitional or superseded');
  assert.match(appReadme, /service catalog/i, 'app README should document the service catalog transition');
  assert.match(appReadme, /changed-service detector/i, 'app README should name the verified detector path');
  assert.match(appReadme, /compiled runtime/i, 'app README should explain that TypeScript CI scripts run from compiled JavaScript');
  assert.match(appReadme, /legacy path-filter/i, 'app README should tell agents how to handle the legacy filters');
});
