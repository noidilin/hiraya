import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const workspacePackagePath = path.join(repoRoot, 'package.json');
const frontendPackagePath = path.join(repoRoot, 'app/microservices/frontend/package.json');
const backendPackagePath = path.join(repoRoot, 'app/microservices/backend/package.json');
const legacyAppPackagePath = path.join(repoRoot, 'app/microservices/package.json');
const legacyAppLockfilePath = path.join(repoRoot, 'app/microservices/pnpm-lock.yaml');
const legacyAppWorkspacePath = path.join(repoRoot, 'app/microservices/pnpm-workspace.yaml');
const legacyFiltersPath = path.join(repoRoot, '.github/utils/file-filters.yml');
const appWorkspaceReadmePath = path.join(repoRoot, 'app/microservices/README.md');
const commandReferencePath = path.join(repoRoot, 'docs/references/commands.md');
const workflowReferencePath = path.join(repoRoot, 'docs/references/workflows.md');
const appBaselineRequiredCheckRunbookPath = path.join(repoRoot, 'docs/runbooks/platform/enforce-app-baseline-required-check.md');

const appPrBaselineWorkflowPath = path.join(repoRoot, '.github/workflows/app-pr-baseline.yml');
const setupNodePnpmActionPath = path.join(repoRoot, '.github/actions/setup-node-pnpm/action.yml');
const imageCiWorkflowPath = path.join(repoRoot, '.github/workflows/image-ci.yml');
const infraCiWorkflowPath = path.join(repoRoot, '.github/workflows/infra-ci.yml');
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

async function readBackendScripts() {
  const packageJson = JSON.parse(await readFile(backendPackagePath, 'utf8'));
  return packageJson.scripts ?? {};
}

test('root workspace exposes the reusable baseline command surface', async () => {
  const scripts = await readWorkspaceScripts();

  for (const scriptName of [
    'scripts:build',
    'scripts:test',
    'catalog:validate',
    'services:changed',
    'app:catalog',
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
    'dev',
    'test',
    'build',
    'docker:build',
    'docker:up',
    'docker:down',
  ]) {
    assert.equal(typeof scripts[scriptName], 'string', `${scriptName} should be documented as a package script`);
    assert.notEqual(scripts[scriptName].trim(), '', `${scriptName} should not be empty`);
    assert.doesNotMatch(scripts[scriptName], /corepack pnpm@11\.8\.0/, `${scriptName} should use plain pnpm after setup`);
  }

  for (const obsoleteScriptName of ['app:install', 'app:workspace', 'install:all', 'check:workspace', 'test:catalog', 'catalog:changed', 'app:changed']) {
    assert.equal(scripts[obsoleteScriptName], undefined, `${obsoleteScriptName} should not be preserved on the root command surface`);
  }
});

test('Storefront exposes explicit reusable static check commands', async () => {
  const [workspaceScripts, frontendScripts, commandReference] = await Promise.all([
    readWorkspaceScripts(),
    readFrontendScripts(),
    readFile(commandReferencePath, 'utf8'),
  ]);

  for (const scriptName of ['build', 'typecheck', 'lint']) {
    assert.equal(typeof frontendScripts[scriptName], 'string', `frontend ${scriptName} script should exist`);
    assert.notEqual(frontendScripts[scriptName].trim(), '', `frontend ${scriptName} script should not be empty`);
  }

  assert.match(frontendScripts.typecheck, /tsc\b.*--noEmit|--noEmit.*tsc\b/, 'typecheck should run TypeScript without emitting files');
  assert.match(frontendScripts.lint, /eslint\b/, 'lint should run eslint explicitly');
  assert.doesNotMatch(frontendScripts.lint, /--max-warnings\s+0/, 'lint warnings should remain allowed initially');
  assert.match(workspaceScripts['app:static'], /storefront:static/, 'app:static should reuse explicit Storefront static scripts');
  assert.match(commandReference, /Storefront build, typecheck, and lint/i);
  assert.match(commandReference, /lint errors block while warnings remain allowed/i);
});

test('Storefront unit tests run through Vitest and are part of the app baseline', async () => {
  const [workspaceScripts, frontendScripts, commandReference] = await Promise.all([
    readWorkspaceScripts(),
    readFrontendScripts(),
    readFile(commandReferencePath, 'utf8'),
  ]);

  assert.match(frontendScripts.test, /vitest\b.*run|vitest\b/, 'frontend test script should run Vitest');
  assert.doesNotMatch(frontendScripts.test, /react-scripts test/, 'frontend tests should not use the CRA/Jest runner');
  assert.match(frontendScripts.test, /jsdom/, 'frontend tests should run in a browser-like DOM environment');
  assert.match(workspaceScripts['app:test:frontend'], /--filter frontend test/, 'workspace should expose the frontend unit-test gate');
  assert.match(workspaceScripts['app:baseline'], /app:test:frontend/, 'app:baseline should fail when Storefront unit tests are broken');
  assert.match(commandReference, /Storefront Vitest unit tests/i);
});

test('implemented contract and browser baseline commands run shared validation', async () => {
  const scripts = await readWorkspaceScripts();

  assert.match(
    scripts['app:test:contract'],
    /@hiraya\/storefront-contracts test/,
    'app:test:contract should run the shared Storefront contract validation and smoke tests',
  );
  assert.doesNotMatch(scripts['app:test:contract'], /not implemented|exit\(1\)|exit 1/i);

  assert.match(scripts['app:test:browser'], /playwright test --config app\/microservices\/playwright\.config\.mjs/, 'app:test:browser should run the Storefront Playwright baseline');
  assert.doesNotMatch(scripts['app:test:browser'], /not implemented|exit\(1\)|exit 1/i);
});

test('backend contract baseline command names and gates each active Storefront suite', async () => {
  const [scripts, backendScripts, commandReference] = await Promise.all([
    readWorkspaceScripts(),
    readBackendScripts(),
    readFile(commandReferencePath, 'utf8'),
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
  assert.match(
    backendScripts.test,
    /pnpm --dir \.\.\/\.\.\/\.\. run app:test:backend-contract/,
    'backend aggregate test should reuse the implemented contract gate instead of placeholder service tests',
  );
  assert.match(commandReference, /gateway, auth, product, and orders contract suites/i);
  assert.match(commandReference, /mocked database and upstream boundaries/i);
  assert.match(commandReference, /AWS credentials, PostgreSQL, Kubernetes, or real backend services/i);
});

test('legacy duplicated path-filter metadata is removed', async () => {
  await assert.rejects(access(legacyFiltersPath), /ENOENT/);

  const workflowReference = await readFile(workflowReferencePath, 'utf8');
  assert.match(workflowReference, /service catalog/i, 'workflow reference should document the service catalog transition');
  assert.match(workflowReference, /changed-service detector/i, 'workflow reference should name the verified detector path');
  assert.match(workflowReference, /compiled Node runtime/i, 'workflow reference should explain that TypeScript CI scripts run from compiled JavaScript');
  assert.doesNotMatch(workflowReference, /legacy path-filter/i, 'workflow reference should not point agents at removed legacy filters');
});

test('legacy nested app pnpm workspace boundary is removed', async () => {
  await Promise.all([
    assert.rejects(access(legacyAppPackagePath), /ENOENT/),
    assert.rejects(access(legacyAppLockfilePath), /ENOENT/),
    assert.rejects(access(legacyAppWorkspacePath), /ENOENT/),
  ]);

  const [appReadme, commandReference] = await Promise.all([
    readFile(appWorkspaceReadmePath, 'utf8'),
    readFile(commandReferencePath, 'utf8'),
  ]);
  assert.match(commandReference, /Run commands from the repository root/i);
  assert.doesNotMatch(appReadme, /Run commands from `app\/microservices`/);
  assert.doesNotMatch(commandReference, /pnpm run app:install|pnpm run app:workspace|pnpm run app:changed/);
});

test('app PR baseline workflow builds changed service images without AWS or registry push', async () => {
  const workflow = await readFile(appPrBaselineWorkflowPath, 'utf8');

  assert.match(workflow, /plan-app-pr:[\s\S]*?node \.github\/scripts\/dist\/classify-app-pr\.mjs/, 'workflow should delegate PR classification and image planning to the checked-in script');
  assert.match(workflow, /matrix: \$\{\{ steps\.classify-app-pr\.outputs\.matrix \}\}/);
  assert.match(workflow, /has_changed_service_images: \$\{\{ steps\.classify-app-pr\.outputs\.has_changed_service_images \}\}/);
  assert.match(workflow, /uses: \.\/\.github\/actions\/setup-node-pnpm/);
  assert.match(workflow, /image-build-only:/);
  assert.match(workflow, /app-baseline:[\s\S]*?needs:\n\s+- plan-app-pr\n\s+- image-build-only\n\s+- manifest-promotion-baseline\n\s+- run-app-baseline/, 'stable gate must wait for planned image builds');
  assert.match(workflow, /IMAGE_BUILD_ONLY_RESULT: \$\{\{ needs\.image-build-only\.result \}\}/, 'stable gate must inspect the image-build-only result');
  assert.match(workflow, /expected_image_build_only_result="success"/, 'stable gate must require image builds when service images changed');
  assert.match(workflow, /if: \$\{\{ needs\.plan-app-pr\.outputs\.has_changed_service_images == 'true' \}\}/);
  assert.match(workflow, /matrix: \$\{\{ fromJson\(needs\.plan-app-pr\.outputs\.matrix\) \}\}/);
  assert.match(workflow, /docker\/build-push-action@/);
  assert.match(workflow, /context: \$\{\{ matrix\.build_context \}\}/);
  assert.match(workflow, /file: \$\{\{ matrix\.dockerfile \}\}/);
  assert.match(workflow, /push: false/);
  assert.doesNotMatch(workflow, /docker login|aws ecr|get-login-password/);
});

test('GitOps render assertions cover Storefront deploy invariants', async () => {
  const [scripts, assertSource, commandReference] = await Promise.all([
    readWorkspaceScripts(),
    readFile(gitopsAssertSourcePath, 'utf8'),
    readFile(commandReferencePath, 'utf8'),
  ]);

  assert.match(scripts['app:gitops'], /kubectl kustomize gitops/, 'app:gitops should render desired state without cluster credentials');
  assert.match(scripts['app:gitops'], /assert-gitops-render\.mjs/, 'app:gitops should run targeted render assertions');
  assert.match(assertSource, /hiraya\.noidilin\.dev/, 'assertions should pin the public Storefront hostname');
  assert.match(assertSource, /HTTPRoute\/frontend must target the frontend Service on port/, 'assertions should verify frontend HTTPRoute backend port');
  assert.match(assertSource, /Service\/frontend must remain ClusterIP/, 'assertions should verify frontend Service type');
  assert.match(assertSource, /AUTH_SERVICE_URL/, 'assertions should verify gateway active API wiring');
  assert.match(assertSource, /ORDERS_SERVICE_URL/, 'assertions should verify active orders wiring');
  assert.match(assertSource, /targetPort .* must match a Deployment\//, 'assertions should verify deployed Deployment/Service port consistency');
  assert.match(commandReference, /GitOps render assertions/i);
  assert.match(commandReference, /without Kubernetes cluster credentials/i);
});

test('app PR baseline workflow is a no-AWS read-only required-check candidate', async () => {
  const [workflow, setupNodePnpmAction, scripts, workflowReference] = await Promise.all([
    readFile(appPrBaselineWorkflowPath, 'utf8'),
    readFile(setupNodePnpmActionPath, 'utf8'),
    readWorkspaceScripts(),
    readFile(workflowReferencePath, 'utf8'),
  ]);

  assert.match(workflow, /^name: storefront-app-baseline$/m);
  assert.match(workflow, /^  pull_request:$/m, 'workflow should run on pull requests');
  assert.doesNotMatch(workflow, /pull_request:\n\s+paths:/, 'required-check candidate must not be skipped by path filters');

  assert.match(workflow, /permissions:\n  contents: read\n/);
  assert.doesNotMatch(workflow, /id-token:\s*write/);
  assert.doesNotMatch(workflow, /configure-aws-credentials|AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|role-to-assume/);
  assert.match(workflow, /uses: \.\/\.github\/actions\/setup-node-pnpm/, 'workflow should share root Node/pnpm setup through a local composite action');
  assert.match(setupNodePnpmAction, /node-version-file: package\.json/);
  assert.match(setupNodePnpmAction, /hashFiles\('pnpm-lock\.yaml'\)/, 'pnpm store cache should be keyed to the root lockfile');
  assert.doesNotMatch(`${workflow}\n${setupNodePnpmAction}`, /cache: pnpm/, 'setup-node pnpm cache should not run before Corepack activation');
  assert.match(setupNodePnpmAction, /corepack prepare pnpm@11\.8\.0 --activate/);
  assert.match(setupNodePnpmAction, /pnpm store path --silent/, 'workflow should resolve the pnpm store after Corepack activation');
  assert.match(setupNodePnpmAction, /actions\/cache@0057852bfaa89a56745cba8c7296529d2fc39830 # v4/, 'workflow should cache the pnpm store with a pinned action');
  assert.doesNotMatch(setupNodePnpmAction, /pnpm install/, 'setup action must not install dependencies');
  assert.match(workflow, /pnpm install --frozen-lockfile/);
  assert.match(workflow, /pnpm run app:baseline/);
  assert.match(workflow, /run-manifest-promotion-baseline[\s\S]*?kubectl kustomize gitops[\s\S]*?assert-gitops-render\.mjs/, 'bot manifest PRs should have a fast GitOps render baseline');
  assert.match(workflow, /classify-app-pr/, 'PR classification should live in a dedicated planning step');
  assert.match(workflow, /bot_manifest_promotion_only: \$\{\{ steps\.classify-app-pr\.outputs\.bot_manifest_promotion_only \}\}/, 'bot manifest promotion detection should be a job output');
  assert.match(workflow, /manifest-promotion-baseline:[\s\S]*?if: \$\{\{ needs\.plan-app-pr\.outputs\.run_manifest_baseline == 'true' \}\}/, 'bot manifest promotion PRs should branch to a dedicated fast-path job');
  assert.match(workflow, /run-app-baseline:[\s\S]*?if: \$\{\{ needs\.plan-app-pr\.outputs\.run_app_baseline == 'true' \}\}/, 'normal app PRs should branch to a dedicated full baseline job');
  assert.match(workflow, /app-baseline:[\s\S]*?if: \$\{\{ always\(\) \}\}/, 'stable required check should aggregate the branched jobs');
  assert.match(workflow, /PR_AUTHOR: \$\{\{ github\.event\.pull_request\.user\.login \}\}/, 'fast path should pass the PR author through env to avoid script injection');
  assert.match(workflow, /PR_HEAD_REF: \$\{\{ github\.head_ref \}\}/, 'fast path should pass the PR head ref through env to avoid script injection');
  assert.match(workflow, /--author "\$PR_AUTHOR"/, 'fast path should pass author to the classifier without script injection');
  assert.match(workflow, /--head-ref "\$PR_HEAD_REF"/, 'fast path should pass branch to the classifier without script injection');
  assert.match(workflow, /classify-app-pr\.mjs/, 'workflow should use the compiled app PR classifier');
  assert.match(scripts['app:baseline'], /app:catalog/);
  assert.match(scripts['app:baseline'], /app:gitops/, 'app:baseline should include the GitOps render assertions');
  assert.match(workflowReference, /required branch protection status is `app-baseline`/i);
  assert.match(workflowReference, /Required no-AWS PR baseline/i);
});

test('required app baseline branch rule is documented with non-AWS evidence', async () => {
  const [workflow, workflowReference, runbook] = await Promise.all([
    readFile(appPrBaselineWorkflowPath, 'utf8'),
    readFile(workflowReferencePath, 'utf8'),
    readFile(appBaselineRequiredCheckRunbookPath, 'utf8'),
  ]);

  const requiredCheck = 'app-baseline';

  assert.match(workflow, /^  pull_request:$/m, 'required check must run on pull requests');
  assert.doesNotMatch(workflow, /pull_request:\n\s+paths:/, 'required check must not depend on path filters');
  assert.match(workflowReference, new RegExp(requiredCheck.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
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
  const detectChangesJob = workflow.split('\n  app-baseline:')[0];

  assert.doesNotMatch(workflow, /-\s*["']?gitops\/\*\*["']?/, 'main image CI should not rerun from its generated GitOps manifest PR merges');
  assert.doesNotMatch(workflow, /^\s+-\s*["']?\.github\/scripts\/\*\*["']?$/m, 'main image CI should not start for unrelated helper script changes');
  assert.match(workflow, /\.github\/utils\/services\.json/, 'main image CI should use service catalog changes as inputs');
  assert.doesNotMatch(workflow, /dorny\/paths-filter/, 'main image CI should not duplicate service mappings through legacy path filters');
  assert.match(workflow, /package\.json/, 'main image CI should run when the root package changes');
  assert.doesNotMatch(workflow, /^\s+-\s*["']?pnpm-lock\.yaml["']?$/m, 'main image CI should not start for portfolio-only root lockfile changes');
  assert.match(workflow, /pnpm-workspace\.yaml/, 'main image CI should run when the root workspace changes');
  assert.match(workflow, /\.dockerignore/, 'main image CI should run when Docker build ignore rules change');
  assert.match(workflow, /node \.github\/scripts\/dist\/detect-changed-services\.mjs --catalog \.github\/utils\/services\.json --root \. --files-from \/tmp\/hiraya-main-changed-files\.txt --github-output "\$GITHUB_OUTPUT"/);
  assert.match(detectChangesJob, /node-version-file: package\.json[\s\S]*?detect-changed-services/, 'changed-service planning should pin Node from the root toolchain without installing dependencies');
  assert.doesNotMatch(detectChangesJob, /pnpm install/, 'changed-service planning should not install dependencies');
  assert.match(workflow, /uses: \.\/\.github\/actions\/setup-node-pnpm/, 'baseline job should use the shared root Node/pnpm setup action');
  assert.match(workflow, /app-baseline:/, 'main image CI should have an explicit baseline validation job');
  assert.match(workflow, /name: run-app-baseline-before-image-push/);
  assert.match(workflow, /app-baseline:[\s\S]*?if: \$\{\{ needs\.detect-changes\.outputs\.has_changes == 'true' \}\}/, 'baseline job should skip when changed-service detection finds no image inputs');
  assert.match(workflow, /pnpm run app:baseline/);
  assert.match(workflow, /build-and-push:[\s\S]*?needs:\n\s+- detect-changes\n\s+- app-baseline/, 'image push job must need the baseline job');
  assert.match(workflow, /build-and-push:[\s\S]*?timeout-minutes: 25/, 'image push jobs must fail closed instead of hanging indefinitely');
  assert.match(workflow, /build-and-push:[\s\S]*?permissions:\n\s+actions: read\n\s+contents: read\n\s+id-token: write/, 'image push jobs need actions:read for BuildKit GHA cache key checks and OIDC for ECR');
  assert.match(workflow, /max-parallel: 4/, 'image push matrix should limit parallel BuildKit cache pressure');
  assert.match(workflow, /cache-from: type=gha,scope=\$\{\{ matrix\.service \}\},timeout=2m/, 'image push cache imports should have a bounded timeout');
  assert.match(workflow, /cache-to: type=gha,mode=min,scope=\$\{\{ matrix\.service \}\},timeout=2m,ignore-error=true/, 'image push cache exports should be best-effort and bounded');
  assert.match(workflow, /github-token: \$\{\{ github\.token \}\}/, 'BuildKit should receive the GitHub token for cache API mitigation');
  assert.match(workflow, /update-manifests:[\s\S]*?needs:[\s\S]*?- app-baseline/, 'manifest update job must also be gated by the baseline job');
  assert.match(workflow, /actions\/create-github-app-token@/, 'manifest promotion should use a GitHub App token so PR checks trigger');
  assert.match(workflow, /PROMOTION_BRANCH: ci\/update-manifests-dev/, 'manifest promotion should use a rolling dev branch');
  assert.match(workflow, /gh pr merge "\$pr_url" --auto --squash --delete-branch/, 'manifest promotion PR should enable squash auto-merge');
  assert.doesNotMatch(workflow, /git push origin HEAD:main/, 'manifest promotion must not push directly to protected main');
  assert.doesNotMatch(workflow, /\[skip ci\]/, 'manifest promotion commits must allow the required PR check to run');
  assert.match(workflow, /configure-aws-credentials-with-oidc[\s\S]*?role-to-assume: \$\{\{ env\.IMAGE_PUSH_ROLE_ARN \}\}/);
  assert.match(workflow, /### Main image push baseline validation/);
  assert.match(workflow, /### Image build and push/);
});

test('public Storefront deploy smoke is reusable and read-only', async () => {
  const [scripts, smokeScript, commandReference] = await Promise.all([
    readWorkspaceScripts(),
    readFile(publicSmokeScriptPath, 'utf8'),
    readFile(commandReferencePath, 'utf8'),
  ]);

  assert.match(scripts['app:smoke:public'], /storefront-public-smoke\.mjs/, 'workspace should expose the public deploy smoke script');
  assert.match(smokeScript, /STORE_FRONT_PUBLIC_URL|STOREFRONT_PUBLIC_URL/, 'smoke script should accept a configurable public URL');
  assert.match(smokeScript, /\/api\/products/, 'smoke script should call the public products API route');
  assert.match(smokeScript, /success[\s\S]*true/, 'smoke script should validate the success envelope');
  assert.match(smokeScript, /Array\.isArray/, 'smoke script should validate product data is an array');
  assert.match(smokeScript, /<div id="root"><\/div>|id="root"/, 'smoke script should verify the Storefront shell document');
  assert.doesNotMatch(smokeScript, /aws |kubectl|argocd|terraform|EKS|KUBECONFIG/i, 'public smoke must not require cloud or cluster credentials');
  assert.match(commandReference, /public deploy smoke/i);
  assert.match(commandReference, /read-only/i);
});

test('manifest update workflows use protected bot PRs and post-merge smoke', async () => {
  const [imageWorkflow, infraWorkflow, rollbackWorkflow, smokeWorkflow] = await Promise.all([
    readFile(imageCiWorkflowPath, 'utf8'),
    readFile(infraCiWorkflowPath, 'utf8'),
    readFile(rollbackWorkflowPath, 'utf8'),
    readFile(deploySmokeWorkflowPath, 'utf8'),
  ]);

  assert.match(imageWorkflow, /open-or-update-manifest-promotion-pr[\s\S]*?gh pr merge "\$pr_url" --auto --squash --delete-branch/, 'main manifest update path should create a squash auto-merge PR');
  assert.match(imageWorkflow, /HIRAYA_BOT_APP_ID[\s\S]*?HIRAYA_BOT_PRIVATE_KEY/, 'main manifest update path should fail fast without GitHub App credentials');
  assert.doesNotMatch(imageWorkflow, /git push origin HEAD:main/, 'main manifest update path must not push directly to protected main');
  assert.match(rollbackWorkflow, /open-rollback-pr-and-enable-auto-merge[\s\S]*?gh pr merge "\$pr_url" --auto --squash --delete-branch/, 'manual rollback should create a squash auto-merge PR');
  assert.match(rollbackWorkflow, /ROLLBACK_BRANCH: ci\/rollback-/, 'manual rollback should use unique rollback branches');
  assert.doesNotMatch(rollbackWorkflow, /git push origin HEAD:main/, 'manual rollback must not push directly to protected main');
  assert.doesNotMatch(`${imageWorkflow}\n${rollbackWorkflow}`, /\[skip ci\]/, 'bot PR commits must allow required PR checks to run');
  assert.match(infraWorkflow, /github\.head_ref == 'ci\/update-manifests-dev'/, 'bot manifest PRs should not spend time on Terraform planning');
  assert.match(infraWorkflow, /github\.event\.pull_request\.user\.login == 'app\/hiraya-bot'/, 'Terraform plan skip should be scoped to the Hiraya bot');

  assert.match(smokeWorkflow, /^name: deploy-smoke$/m);
  assert.match(smokeWorkflow, /push:[\s\S]*?branches: \[main\][\s\S]*?- "gitops\/\*\*"/, 'post-merge smoke should run on GitOps pushes to main');
  assert.match(smokeWorkflow, /pnpm run app:smoke:public/, 'post-merge smoke should reuse the workspace smoke command');
  assert.doesNotMatch(smokeWorkflow, /revert|reset --hard|rollback/i, 'smoke failure should not trigger automatic rollback or manifest revert');
});
