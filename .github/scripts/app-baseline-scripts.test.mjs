import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const workspacePackagePath = path.join(repoRoot, 'app/microservices/package.json');

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
