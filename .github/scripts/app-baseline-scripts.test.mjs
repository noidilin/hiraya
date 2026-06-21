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
    'app:catalog',
    'app:changed',
    'app:static',
    'app:baseline',
    'app:test:catalog',
    'app:test:contract',
    'app:test:browser',
  ]) {
    assert.equal(typeof scripts[scriptName], 'string', `${scriptName} should be documented as a package script`);
    assert.notEqual(scripts[scriptName].trim(), '', `${scriptName} should not be empty`);
  }
});

test('future-facing baseline test commands fail clearly instead of silently passing', async () => {
  const scripts = await readWorkspaceScripts();

  for (const scriptName of ['app:test:contract', 'app:test:browser']) {
    assert.match(scripts[scriptName], /not implemented/i, `${scriptName} should explain that the slice is not implemented yet`);
    assert.match(scripts[scriptName], /exit\(1\)|exit 1/, `${scriptName} should fail until implemented`);
  }
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
  assert.match(appReadme, /legacy path-filter/i, 'app README should tell agents how to handle the legacy filters');
});
