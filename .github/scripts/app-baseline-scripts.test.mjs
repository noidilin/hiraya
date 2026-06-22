import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const workspacePackagePath = path.join(repoRoot, 'app/microservices/package.json');
const frontendPackagePath = path.join(repoRoot, 'app/microservices/frontend/package.json');
const legacyFiltersPath = path.join(repoRoot, '.github/utils/file-filters.yml');
const appWorkspaceReadmePath = path.join(repoRoot, 'app/microservices/README.md');

const appPrBaselineWorkflowPath = path.join(repoRoot, '.github/workflows/app-pr-baseline.yml');

async function readWorkspaceScripts() {
  const packageJson = JSON.parse(await readFile(workspacePackagePath, 'utf8'));
  return packageJson.scripts ?? {};
}

async function readFrontendScripts() {
  const packageJson = JSON.parse(await readFile(frontendPackagePath, 'utf8'));
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
    'storefront:build',
    'storefront:typecheck',
    'storefront:lint',
    'storefront:static',
    'app:baseline',
    'app:test:catalog',
    'app:test:contract',
    'app:test:backend-contract',
    'app:test:frontend',
    'app:test:browser',
  ]) {
    assert.equal(typeof scripts[scriptName], 'string', `${scriptName} should be documented as a package script`);
    assert.notEqual(scripts[scriptName].trim(), '', `${scriptName} should not be empty`);
  }
});

test('Storefront exposes explicit reusable static check commands', async () => {
  const [workspaceScripts, frontendScripts, readme] = await Promise.all([
    readWorkspaceScripts(),
    readFrontendScripts(),
    readFile(appWorkspaceReadmePath, 'utf8'),
  ]);

  for (const scriptName of ['build', 'typecheck', 'lint']) {
    assert.equal(typeof frontendScripts[scriptName], 'string', `frontend ${scriptName} script should exist`);
    assert.notEqual(frontendScripts[scriptName].trim(), '', `frontend ${scriptName} script should not be empty`);
  }

  assert.match(frontendScripts.typecheck, /tsc\b.*--noEmit|--noEmit.*tsc\b/, 'typecheck should run TypeScript without emitting files');
  assert.match(frontendScripts.lint, /eslint\b/, 'lint should run eslint explicitly');
  assert.doesNotMatch(frontendScripts.lint, /--max-warnings\s+0/, 'lint warnings should remain allowed initially');
  assert.match(workspaceScripts['app:static'], /storefront:static/, 'app:static should reuse explicit Storefront static scripts');
  assert.match(readme, /Storefront build, typecheck, and lint/i);
  assert.match(readme, /lint errors block while warnings remain allowed/i);
});

test('Storefront unit tests run through Vitest and are part of the app baseline', async () => {
  const [workspaceScripts, frontendScripts, readme] = await Promise.all([
    readWorkspaceScripts(),
    readFrontendScripts(),
    readFile(appWorkspaceReadmePath, 'utf8'),
  ]);

  assert.match(frontendScripts.test, /vitest\b.*run|vitest\b/, 'frontend test script should run Vitest');
  assert.doesNotMatch(frontendScripts.test, /react-scripts test/, 'frontend tests should not use the CRA/Jest runner');
  assert.match(frontendScripts.test, /jsdom/, 'frontend tests should run in a browser-like DOM environment');
  assert.match(workspaceScripts['app:test:frontend'], /--filter frontend test/, 'workspace should expose the frontend unit-test gate');
  assert.match(workspaceScripts['app:baseline'], /app:test:frontend/, 'app:baseline should fail when Storefront unit tests are broken');
  assert.match(readme, /Storefront Vitest unit tests/i);
});

test('implemented contract and browser baseline commands run shared validation', async () => {
  const scripts = await readWorkspaceScripts();

  assert.match(
    scripts['app:test:contract'],
    /@hiraya\/storefront-contracts test/,
    'app:test:contract should run the shared Storefront contract validation and smoke tests',
  );
  assert.doesNotMatch(scripts['app:test:contract'], /not implemented|exit\(1\)|exit 1/i);

  assert.match(scripts['app:test:browser'], /playwright test --config playwright\.config\.mjs/, 'app:test:browser should run the Storefront Playwright baseline');
  assert.doesNotMatch(scripts['app:test:browser'], /not implemented|exit\(1\)|exit 1/i);
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


test('app PR baseline workflow builds changed service images without AWS or registry push', async () => {
  const workflow = await readFile(appPrBaselineWorkflowPath, 'utf8');

  assert.match(workflow, /outputs:\n\s+matrix: \$\{\{ steps\.changed-services\.outputs\.matrix \}\}\n\s+has_changes: \$\{\{ steps\.changed-services\.outputs\.has_changes \}\}/);
  assert.match(workflow, /id: changed-services/);
  assert.match(workflow, /pnpm run app:changed -- --files-from \/tmp\/hiraya-pr-changed-files\.txt --github-output "\$GITHUB_OUTPUT"/);
  assert.match(workflow, /image-build-only:/);
  assert.match(workflow, /if: \$\{\{ needs\.changed-service-images\.outputs\.has_changes == 'true' \}\}/);
  assert.match(workflow, /matrix: \$\{\{ fromJson\(needs\.changed-service-images\.outputs\.matrix\) \}\}/);
  assert.match(workflow, /docker\/build-push-action@/);
  assert.match(workflow, /context: \$\{\{ matrix\.build_context \}\}/);
  assert.match(workflow, /file: \$\{\{ matrix\.dockerfile \}\}/);
  assert.match(workflow, /push: false/);
  assert.doesNotMatch(workflow, /docker login|aws ecr|get-login-password/);
});

test('app PR baseline workflow is a no-AWS read-only required-check candidate', async () => {
  const [workflow, scripts, readme] = await Promise.all([
    readFile(appPrBaselineWorkflowPath, 'utf8'),
    readWorkspaceScripts(),
    readFile(appWorkspaceReadmePath, 'utf8'),
  ]);

  assert.match(workflow, /^name: Vintage Storefront app baseline$/m);
  assert.match(workflow, /^  pull_request:$/m, 'workflow should run on pull requests');
  for (const pathPattern of [
    'app/microservices/**',
    'gitops/**',
    '.github/workflows/app-pr-baseline.yml',
    '.github/scripts/**',
    '.github/utils/services.json',
  ]) {
    assert.match(workflow, new RegExp(`      - "${pathPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*\\\*/g, '.*')}"`));
  }

  assert.match(workflow, /permissions:\n  contents: read\n/);
  assert.doesNotMatch(workflow, /id-token:\s*write/);
  assert.doesNotMatch(workflow, /configure-aws-credentials|AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|role-to-assume/);
  assert.match(workflow, /node-version-file: app\/microservices\/package\.json/);
  assert.match(workflow, /corepack prepare pnpm@11\.8\.0 --activate/);
  assert.match(workflow, /pnpm run app:install/);
  assert.match(workflow, /pnpm run app:baseline/);
  assert.match(workflow, /pnpm run app:changed -- --files-from/);
  assert.match(scripts['app:baseline'], /app:catalog/);
  assert.match(readme, /Vintage Storefront app baseline \/ app-baseline/i);
  assert.match(readme, /required branch protection/i);
});
