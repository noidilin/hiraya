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
  assert.match(main, /aws_cloudfront_function" "spa_rewrite"/, 'SPA fallback should use a viewer-request rewrite instead of global error remapping');
  assert.match(main, /function_association[\s\S]*event_type\s+=\s+"viewer-request"[\s\S]*function_arn\s+=\s+aws_cloudfront_function\.spa_rewrite\.arn/, 'default site behavior should attach the SPA rewrite function');
  assert.match(main, /uri === '\/api'[\s\S]*uri\.indexOf\('\/api\/'\) === 0/, 'SPA rewrite must skip API requests');
  assert.match(main, /uri === '\/' \|\| lastSegment\.indexOf\('\.'\) === -1[\s\S]*request\.uri = '\/index\.html'/, 'SPA rewrite should send route-like paths, including trailing-slash client routes, to root index.html');
  assert.doesNotMatch(main, /request\.uri = uri \+ 'index\.html'/, 'SPA rewrite must not append nested index.html for trailing-slash client routes');
  assert.doesNotMatch(main, /custom_error_response[\s\S]*response_page_path\s+=\s+"\/index\.html"/, 'SPA fallback must not be distribution-wide');
});

test('Portfolio Terraform validation is included in credential-free infra CI', async () => {
  const workflow = await readFile(infraCiWorkflow, 'utf8');

  assert.match(workflow, /infra\/portfolio/, 'infra CI should validate the Portfolio Stack root');
  assert.match(workflow, /terraform -chdir="\$stack" init -backend=false/, 'Portfolio validation should avoid backend credentials');
});

test('Portfolio Stack uses Terraform-managed S3 Vectors for the Bedrock Knowledge Base', async () => {
  const main = await readFile(portfolioMain, 'utf8');

  assert.match(main, /resource "aws_s3vectors_vector_bucket" "knowledge"/, 'S3 Vectors vector bucket should be declared');
  assert.doesNotMatch(main, /resource "aws_s3vectors_vector_bucket_policy" "knowledge"/, 'S3 Vectors access should be scoped through the Bedrock KB IAM role policy, not a separate vector bucket policy');
  assert.match(main, /resource "aws_iam_role_policy" "bedrock_knowledge_base"[\s\S]*"s3vectors:QueryVectors"[\s\S]*Resource\s+=\s+aws_s3vectors_index\.knowledge\.index_arn/, 'Bedrock KB IAM role policy should scope S3 Vectors access to the index');
  assert.match(main, /resource "aws_s3vectors_index" "knowledge"[\s\S]*data_type\s+=\s+"float32"/, 'S3 Vectors index should use float32 vectors');
  assert.match(main, /resource "aws_s3vectors_index" "knowledge"[\s\S]*dimension\s+=\s+1024/, 'S3 Vectors index should match Titan Text Embeddings V2 default dimensions');
  assert.match(main, /resource "aws_s3vectors_index" "knowledge"[\s\S]*distance_metric\s+=\s+"cosine"/, 'S3 Vectors index should use cosine distance');
  assert.match(main, /storage_configuration[\s\S]*type\s+=\s+"S3_VECTORS"[\s\S]*s3_vectors_configuration[\s\S]*index_arn\s+=\s+aws_s3vectors_index\.knowledge\.index_arn/, 'Bedrock KB should use S3 Vectors storage');
  assert.doesNotMatch(main, /aws_opensearchserverless_|OPENSEARCH_SERVERLESS|aoss:/, 'OpenSearch Serverless resources and permissions should be removed');
  assert.match(main, /aws:SourceAccount/, 'Bedrock KB role trust should include confused-deputy SourceAccount protection');
  assert.match(main, /aws:SourceArn/, 'Bedrock KB role trust should include confused-deputy SourceArn protection');
});

test('manual Portfolio infra deploy plans before approval and applies after dev approval', async () => {
  const workflow = await readFile(portfolioWorkflow, 'utf8');

  assert.match(workflow, /^on:\n\s+workflow_dispatch:/m, 'Portfolio infra deploy should be manual only');
  assert.match(workflow, /preflight-plan:/, 'workflow should create PR-style plan evidence before approval');
  assert.match(workflow, /terraform -chdir="\$\{PORTFOLIO_DIR\}" plan[\s\S]*preflight-plan\.txt/, 'preflight should capture a readable plan');
  assert.match(workflow, /uses: actions\/upload-artifact@/, 'preflight should upload plan evidence');
  assert.match(workflow, /environment: dev/, 'apply should require the dev GitHub environment approval');
  assert.match(workflow, /PORTFOLIO_APPLY_ROLE_ARN/, 'apply should use the dedicated Portfolio apply role');
  assert.match(workflow, /^\s+TF_STATE_BUCKET: devops-hiraya-dev-tf-state/m, 'Portfolio infra deploy should define the Terraform state bucket');
  assert.match(workflow, /pnpm run portfolio:guide-api:package[\s\S]*cp app\/portfolio\/guide-api\/build\/guide-api\.zip "\$\{PORTFOLIO_DIR\}\/build\/guide-api\.zip"/, 'workflow should package the Lambda bundle before planning/applying');
  assert.match(workflow, /terraform -chdir="\$\{PORTFOLIO_DIR\}" apply/, 'workflow should apply the approved Portfolio plan');
});
