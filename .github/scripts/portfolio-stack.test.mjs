import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const portfolioMain = 'infra/portfolio/main.tf';
const portfolioWorkflow = '.github/workflows/portfolio-infra-deploy.yml';
const infraCiWorkflow = '.github/workflows/infra-ci.yml';

test('Portfolio Stack Terraform defines durable SPA and health API routing', async () => {
  const main = await readFile(portfolioMain, 'utf8');

  for (const resource of [
    'aws_s3_bucket" "site"',
    'aws_cloudfront_origin_access_control" "site"',
    'aws_cloudfront_distribution" "portfolio"',
    'aws_apigatewayv2_api" "guide"',
    'aws_apigatewayv2_route" "health"',
    'aws_lambda_function" "guide_api"',
    'aws_acm_certificate" "portfolio"',
    'aws_route53_record" "portfolio"',
  ]) {
    assert.match(main, new RegExp(resource.replaceAll('"', '\\"')), `${resource} should be declared`);
  }

  assert.match(main, /path_pattern\s+=\s+"\/api\/\*"/, 'CloudFront should route /api/* to API Gateway');
  assert.match(main, /target_origin_id\s+=\s+local\.api_origin_id/, 'API cache behavior should use the API origin');
  assert.match(main, /cache_policy_id\s+=\s+data\.aws_cloudfront_cache_policy\.disabled\.id/, 'API responses should not be cached');
  assert.match(main, /custom_header[\s\S]*x-hiraya-origin-secret/, 'CloudFront should inject the origin secret header');
  assert.match(main, /cookie_behavior\s+=\s+"none"/, 'CloudFront should avoid forwarding viewer cookies to the API');
  assert.match(main, /response_code\s+=\s+200[\s\S]*response_page_path\s+=\s+"\/index\.html"/, 'SPA fallback should serve index.html');
});

test('Portfolio Terraform validation is included in credential-free infra CI', async () => {
  const workflow = await readFile(infraCiWorkflow, 'utf8');

  assert.match(workflow, /infra\/portfolio/, 'infra CI should validate the Portfolio Stack root');
  assert.match(workflow, /terraform -chdir="\$stack" init -backend=false/, 'Portfolio validation should avoid backend credentials');
});

test('manual Portfolio infra deploy plans before approval and applies after dev approval', async () => {
  const workflow = await readFile(portfolioWorkflow, 'utf8');

  assert.match(workflow, /^on:\n\s+workflow_dispatch:/m, 'Portfolio infra deploy should be manual only');
  assert.match(workflow, /preflight-plan:/, 'workflow should create PR-style plan evidence before approval');
  assert.match(workflow, /terraform -chdir="\$\{PORTFOLIO_DIR\}" plan[\s\S]*preflight-plan\.txt/, 'preflight should capture a readable plan');
  assert.match(workflow, /uses: actions\/upload-artifact@/, 'preflight should upload plan evidence');
  assert.match(workflow, /environment: dev/, 'apply should require the dev GitHub environment approval');
  assert.match(workflow, /PORTFOLIO_APPLY_ROLE_ARN/, 'apply should use the dedicated Portfolio apply role');
  assert.match(workflow, /terraform -chdir="\$\{PORTFOLIO_DIR\}" apply/, 'workflow should apply the approved Portfolio plan');
});
