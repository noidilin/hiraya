import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const workflowPath = '.github/workflows/portfolio-pr-baseline.yml';
const storefrontWorkflowPath = '.github/workflows/app-pr-baseline.yml';

function jobBlock(workflow, jobName) {
  const start = workflow.indexOf(`  ${jobName}:`);
  assert.notEqual(start, -1, `missing job ${jobName}`);
  const next = workflow.slice(start + 1).match(/\n  [a-zA-Z0-9_-]+:\n/);
  if (!next) return workflow.slice(start);
  return workflow.slice(start, start + 1 + next.index);
}

test('Portfolio PR baseline is a separate path-specific pull request workflow', async () => {
  const workflow = await readFile(workflowPath, 'utf8');
  const storefrontWorkflow = await readFile(storefrontWorkflowPath, 'utf8');

  assert.match(workflow, /^name: portfolio-pr-baseline$/m);
  assert.match(workflow, /^  pull_request:\n\s+branches: \[main\]/m);
  for (const watchedPath of [
    "'app/portfolio/**'",
    "'docs/portfolio/**'",
    "'infra/portfolio/**'",
    "'infra/envs/dev/bootstrap/portfolio_oidc.tf'",
    "'.github/scripts/write-terraform-backend.sh'",
    "'.github/workflows/portfolio-pr-baseline.yml'",
  ]) {
    assert.match(workflow, new RegExp(watchedPath.replaceAll('/', '\\/').replaceAll('.', '\\.').replaceAll('*', '\\*')), `${watchedPath} should trigger Portfolio PR checks`);
  }

  assert.match(workflow, /concurrency:[\s\S]*hiraya-portfolio-pr-baseline/, 'workflow should have Portfolio-specific concurrency');
  assert.doesNotMatch(storefrontWorkflow, /portfolio:frontend|portfolio:guide-api|portfolio:knowledge|infra\/portfolio/, 'Vintage Storefront baseline should remain isolated from Portfolio checks');
});

test('Portfolio PR baseline runs app, knowledge, and backend-free Terraform checks only when relevant', async () => {
  const workflow = await readFile(workflowPath, 'utf8');

  const classify = jobBlock(workflow, 'classify-portfolio-pr');
  assert.match(classify, /app_changed=/, 'classification should expose app changes');
  assert.match(classify, /knowledge_changed=/, 'classification should expose knowledge changes');
  assert.match(classify, /infra_changed=/, 'classification should expose infra changes');

  const app = jobBlock(workflow, 'portfolio-app-baseline');
  assert.match(app, /if: \$\{\{ needs\.classify-portfolio-pr\.outputs\.app_changed == 'true' \}\}/, 'app checks should be relevant-path gated');
  assert.match(app, /pnpm run portfolio:frontend:test/);
  assert.match(app, /pnpm run portfolio:frontend:build/);
  assert.match(app, /pnpm run portfolio:guide-api:test/);
  assert.match(app, /pnpm run portfolio:guide-api:package/);

  const knowledge = jobBlock(workflow, 'portfolio-knowledge-baseline');
  assert.match(knowledge, /if: \$\{\{ needs\.classify-portfolio-pr\.outputs\.knowledge_changed == 'true' \}\}/, 'knowledge checks should be relevant-path gated');
  assert.match(knowledge, /pnpm run portfolio:knowledge:validate/, 'knowledge validation should cover frontmatter, nonempty body, and Markdown lint');

  const terraform = jobBlock(workflow, 'portfolio-terraform-validate');
  assert.match(terraform, /if: \$\{\{ needs\.classify-portfolio-pr\.outputs\.infra_changed == 'true' \}\}/, 'Terraform validation should be relevant-path gated');
  assert.match(terraform, /terraform fmt -check -recursive infra\/portfolio/);
  assert.match(terraform, /terraform -chdir="\$\{PORTFOLIO_DIR\}" init -backend=false/, 'Terraform validation must avoid backend credentials');
  assert.match(terraform, /terraform -chdir="\$\{PORTFOLIO_DIR\}" validate -no-color/);
});

test('trusted same-repository Portfolio infrastructure PRs publish dedicated plan evidence', async () => {
  const workflow = await readFile(workflowPath, 'utf8');
  const plan = jobBlock(workflow, 'trusted-portfolio-plan');

  assert.match(plan, /github\.event\.pull_request\.head\.repo\.full_name == github\.repository/, 'plan should only run for trusted same-repo PRs');
  assert.match(plan, /needs\.classify-portfolio-pr\.outputs\.infra_changed == 'true'/, 'plan should only run for Portfolio infra-relevant edits');
  assert.match(plan, /PORTFOLIO_PLAN_ROLE_ARN: arn:aws:iam::549475122024:role\/devops-hiraya-dev-github-portfolio-plan/, 'plan should use the dedicated Portfolio plan role');
  assert.match(plan, /configure-aws-credentials/);
  assert.match(plan, /write-terraform-backend\.sh portfolio/);
  assert.match(plan, /pnpm run portfolio:guide-api:package[\s\S]*cp app\/portfolio\/guide-api\/build\/guide-api\.zip "\$\{PORTFOLIO_DIR\}\/build\/guide-api\.zip"/, 'plan should use the packaged Lambda artifact');
  assert.match(plan, /terraform -chdir="\$\{PORTFOLIO_DIR\}" plan[\s\S]*-detailed-exitcode[\s\S]*pr-plan\.txt/, 'plan should create readable plan evidence');
  assert.match(plan, /actions\/upload-artifact@/, 'full plan should be uploaded as evidence');
  assert.match(plan, /publish-terraform-plan-comment\.sh "\$\{PORTFOLIO_DIR\}\/pr-plan\.txt" "\$\{PLAN_ARTIFACT_NAME\}"/, 'plan evidence should be published to the PR');
});
