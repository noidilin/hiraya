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
const appBaselineRequiredCheckRunbookPath = path.join(repoRoot, 'docs/runbooks/platform/enforce-app-baseline-required-check.md');

const appPrBaselineWorkflowPath = path.join(repoRoot, '.github/workflows/app-pr-baseline.yml');
const imageCiWorkflowPath = path.join(repoRoot, '.github/workflows/image-ci.yml');
const rollbackWorkflowPath = path.join(repoRoot, '.github/workflows/service-image-dev-rollback.yml');
const deploySmokeWorkflowPath = path.join(repoRoot, '.github/workflows/deploy-smoke.yml');
const publicSmokeScriptPath = path.join(repoRoot, '.github/scripts/storefront-public-smoke.mjs');
const gitopsAssertSourcePath = path.join(repoRoot, '.github/scripts/src/assert-gitops-render.mts');

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
    'app:gitops',
    'app:smoke:public',
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

test('GitOps render assertions cover Storefront deploy invariants', async () => {
  const [scripts, assertSource, readme] = await Promise.all([
    readWorkspaceScripts(),
    readFile(gitopsAssertSourcePath, 'utf8'),
    readFile(appWorkspaceReadmePath, 'utf8'),
  ]);

  assert.match(scripts['app:gitops'], /kubectl kustomize gitops/, 'app:gitops should render desired state without cluster credentials');
  assert.match(scripts['app:gitops'], /assert-gitops-render\.mjs/, 'app:gitops should run targeted render assertions');
  assert.match(assertSource, /hiraya\.noidilin\.dev/, 'assertions should pin the public Storefront hostname');
  assert.match(assertSource, /HTTPRoute\/frontend must target the frontend Service on port/, 'assertions should verify frontend HTTPRoute backend port');
  assert.match(assertSource, /Service\/frontend must remain ClusterIP/, 'assertions should verify frontend Service type');
  assert.match(assertSource, /AUTH_SERVICE_URL/, 'assertions should verify gateway active API wiring');
  assert.match(assertSource, /ORDERS_SERVICE_URL/, 'assertions should verify active orders wiring');
  assert.match(assertSource, /targetPort .* must match a Deployment\//, 'assertions should verify deployed Deployment/Service port consistency');
  assert.match(readme, /GitOps render assertions/i);
  assert.match(readme, /without Kubernetes cluster credentials/i);
});

test('app PR baseline workflow is a no-AWS read-only required-check candidate', async () => {
  const [workflow, scripts, readme] = await Promise.all([
    readFile(appPrBaselineWorkflowPath, 'utf8'),
    readWorkspaceScripts(),
    readFile(appWorkspaceReadmePath, 'utf8'),
  ]);

  assert.match(workflow, /^name: Vintage Storefront app baseline$/m);
  assert.match(workflow, /^  pull_request:$/m, 'workflow should run on pull requests');
  assert.doesNotMatch(workflow, /pull_request:\n\s+paths:/, 'required-check candidate must not be skipped by path filters');

  assert.match(workflow, /permissions:\n  contents: read\n/);
  assert.doesNotMatch(workflow, /id-token:\s*write/);
  assert.doesNotMatch(workflow, /configure-aws-credentials|AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|role-to-assume/);
  assert.match(workflow, /node-version-file: app\/microservices\/package\.json/);
  assert.doesNotMatch(workflow, /cache: pnpm/, 'setup-node pnpm cache requires pnpm before Corepack activation');
  assert.match(workflow, /corepack prepare pnpm@11\.8\.0 --activate/);
  assert.match(workflow, /pnpm run app:install/);
  assert.match(workflow, /pnpm run app:baseline/);
  assert.match(workflow, /pnpm run app:changed -- --files-from/);
  assert.match(scripts['app:baseline'], /app:catalog/);
  assert.match(scripts['app:baseline'], /app:gitops/, 'app:baseline should include the GitOps render assertions');
  assert.match(readme, /required branch protection status is `app-baseline`/i);
  assert.match(readme, /required branch protection/i);
});

test('required app baseline branch rule is documented with non-AWS evidence', async () => {
  const [workflow, readme, runbook] = await Promise.all([
    readFile(appPrBaselineWorkflowPath, 'utf8'),
    readFile(appWorkspaceReadmePath, 'utf8'),
    readFile(appBaselineRequiredCheckRunbookPath, 'utf8'),
  ]);

  const requiredCheck = 'app-baseline';

  assert.match(workflow, /^  pull_request:$/m, 'required check must run on pull requests');
  assert.doesNotMatch(workflow, /pull_request:\n\s+paths:/, 'required check must not depend on path filters');
  assert.match(readme, new RegExp(requiredCheck.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(runbook, /GitHub repository ruleset/i);
  assert.match(runbook, /main/i);
  assert.match(runbook, new RegExp(requiredCheck.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(runbook, /gh api repos\/noidilin\/hiraya\/rulesets/i);
  assert.match(runbook, /required_status_checks/i);
  assert.match(runbook, /AWS-backed checks are not required/i);
  assert.match(runbook, /Settings evidence/i);
});

test('main image CI gates ECR pushes and manifest updates behind the app baseline', async () => {
  const workflow = await readFile(imageCiWorkflowPath, 'utf8');

  assert.doesNotMatch(workflow, /- "gitops\/\*\*"/, 'main image CI should not rerun from its generated GitOps manifest PR merges');
  assert.match(workflow, /\.github\/scripts\/\*\*/, 'main image CI should rerun when baseline helper scripts change');
  assert.match(workflow, /\.github\/utils\/services\.json/, 'main image CI should use service catalog changes as inputs');
  assert.doesNotMatch(workflow, /dorny\/paths-filter/, 'main image CI should not duplicate service mappings through legacy path filters');
  assert.match(workflow, /pnpm run app:changed -- --files-from \/tmp\/hiraya-main-changed-files\.txt --github-output "\$GITHUB_OUTPUT"/);
  assert.doesNotMatch(workflow, /cache: pnpm/, 'setup-node pnpm cache requires pnpm before Corepack activation');
  assert.match(workflow, /app-baseline:/, 'main image CI should have an explicit baseline validation job');
  assert.match(workflow, /name: Run app baseline before image push/);
  assert.match(workflow, /pnpm run app:baseline/);
  assert.match(workflow, /build-and-push:[\s\S]*?needs:\n\s+- detect-changes\n\s+- app-baseline/, 'image push job must need the baseline job');
  assert.match(workflow, /update-manifests:[\s\S]*?needs:[\s\S]*?- app-baseline/, 'manifest update job must also be gated by the baseline job');
  assert.match(workflow, /actions\/create-github-app-token@/, 'manifest promotion should use a GitHub App token so PR checks trigger');
  assert.match(workflow, /PROMOTION_BRANCH: ci\/update-manifests-dev/, 'manifest promotion should use a rolling dev branch');
  assert.match(workflow, /gh pr merge "\$pr_url" --auto --squash --delete-branch/, 'manifest promotion PR should enable squash auto-merge');
  assert.doesNotMatch(workflow, /git push origin HEAD:main/, 'manifest promotion must not push directly to protected main');
  assert.doesNotMatch(workflow, /\[skip ci\]/, 'manifest promotion commits must allow the required PR check to run');
  assert.match(workflow, /Configure AWS credentials with OIDC[\s\S]*?role-to-assume: \$\{\{ env\.IMAGE_PUSH_ROLE_ARN \}\}/);
  assert.match(workflow, /### Main image push baseline validation/);
  assert.match(workflow, /### Image build and push/);
});

test('public Storefront deploy smoke is reusable and read-only', async () => {
  const [scripts, smokeScript, readme] = await Promise.all([
    readWorkspaceScripts(),
    readFile(publicSmokeScriptPath, 'utf8'),
    readFile(appWorkspaceReadmePath, 'utf8'),
  ]);

  assert.match(scripts['app:smoke:public'], /storefront-public-smoke\.mjs/, 'workspace should expose the public deploy smoke script');
  assert.match(smokeScript, /STORE_FRONT_PUBLIC_URL|STOREFRONT_PUBLIC_URL/, 'smoke script should accept a configurable public URL');
  assert.match(smokeScript, /\/api\/products/, 'smoke script should call the public products API route');
  assert.match(smokeScript, /success[\s\S]*true/, 'smoke script should validate the success envelope');
  assert.match(smokeScript, /Array\.isArray/, 'smoke script should validate product data is an array');
  assert.match(smokeScript, /<div id="root"><\/div>|id="root"/, 'smoke script should verify the Storefront shell document');
  assert.doesNotMatch(smokeScript, /aws |kubectl|argocd|terraform|EKS|KUBECONFIG/i, 'public smoke must not require cloud or cluster credentials');
  assert.match(readme, /public deploy smoke/i);
  assert.match(readme, /read-only/i);
});

test('manifest update workflows use protected bot PRs and post-merge smoke', async () => {
  const [imageWorkflow, rollbackWorkflow, smokeWorkflow] = await Promise.all([
    readFile(imageCiWorkflowPath, 'utf8'),
    readFile(rollbackWorkflowPath, 'utf8'),
    readFile(deploySmokeWorkflowPath, 'utf8'),
  ]);

  assert.match(imageWorkflow, /Open or update manifest promotion PR[\s\S]*?gh pr merge "\$pr_url" --auto --squash --delete-branch/, 'main manifest update path should create a squash auto-merge PR');
  assert.match(imageWorkflow, /HIRAYA_BOT_APP_ID[\s\S]*?HIRAYA_BOT_PRIVATE_KEY/, 'main manifest update path should fail fast without GitHub App credentials');
  assert.doesNotMatch(imageWorkflow, /git push origin HEAD:main/, 'main manifest update path must not push directly to protected main');
  assert.match(rollbackWorkflow, /Open rollback PR and enable auto-merge[\s\S]*?gh pr merge "\$pr_url" --auto --squash --delete-branch/, 'manual rollback should create a squash auto-merge PR');
  assert.match(rollbackWorkflow, /ROLLBACK_BRANCH: ci\/rollback-/, 'manual rollback should use unique rollback branches');
  assert.doesNotMatch(rollbackWorkflow, /git push origin HEAD:main/, 'manual rollback must not push directly to protected main');
  assert.doesNotMatch(`${imageWorkflow}\n${rollbackWorkflow}`, /\[skip ci\]/, 'bot PR commits must allow required PR checks to run');

  assert.match(smokeWorkflow, /^name: deploy-smoke$/m);
  assert.match(smokeWorkflow, /push:[\s\S]*?branches: \[main\][\s\S]*?- "gitops\/\*\*"/, 'post-merge smoke should run on GitOps pushes to main');
  assert.match(smokeWorkflow, /pnpm run app:smoke:public/, 'post-merge smoke should reuse the workspace smoke command');
  assert.doesNotMatch(smokeWorkflow, /revert|reset --hard|rollback/i, 'smoke failure should not trigger automatic rollback or manifest revert');
});
