import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));

test('Vintage Storefront keeps the existing frontend package identity', () => {
  assert.equal(packageJson.name, 'frontend');
  assert.equal(packageJson.engines?.node, '24.x');
});

test('Vintage Storefront exposes the root workspace script contract', () => {
  for (const scriptName of ['start', 'dev', 'build', 'typecheck', 'lint', 'test', 'preview']) {
    assert.equal(typeof packageJson.scripts?.[scriptName], 'string', `${scriptName} script should exist`);
    assert.notEqual(packageJson.scripts[scriptName].trim(), '', `${scriptName} script should not be empty`);
  }

  assert.match(packageJson.scripts.start, /--host\s+0\.0\.0\.0/);
  assert.match(packageJson.scripts.start, /--port\s+3000/);
  assert.match(packageJson.scripts.typecheck, /tsc -b --pretty false/);
});
