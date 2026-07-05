# First deploy the durable Portfolio Stack

Use this runbook to set up `app/portfolio/` and `infra/portfolio/` for the first dev deployment.

The Portfolio Stack is intentionally separate from the EKS/GitOps Vintage Storefront platform. See [Portfolio Stack architecture](../../architecture/portfolio-stack.md) for the current resource and ownership model.

## Deployment impact

This runbook creates durable AWS resources for the public portfolio site and Hiraya Guide through `infra/portfolio/`. It does **not** deploy to EKS and does **not** change Argo CD desired state.

## Local setup and validation

From the repository root, use the workspace setup and Portfolio validation commands in [`../../references/commands.md`](../../references/commands.md#portfolio).

For local Guide API/frontend development, run the Guide API dev command from the reference, then run the Portfolio frontend package dev command in another terminal. The local frontend opens on `http://localhost:3002` and proxies `/api/*` to the Guide API at `http://localhost:3001`.

## AWS prerequisites

Before first apply, confirm:

- AWS CLI v2 is configured for the dev account.
- Terraform CLI is available; `.mise.toml` pins the repo version.
- `jq` and `zip` are available for manual deploy commands.
- Remote state bucket exists: `devops-hiraya-dev-tf-state`.
- Route 53 public hosted zone exists: `noidilin.dev`.
- Bedrock model access is enabled in `ap-northeast-1` for:
  - `amazon.nova-lite-v1:0`
  - `amazon.titan-embed-text-v2:0`
- IAM permissions boundary exists:
  - `lab-devops-permissions-boundary`
- Project Bootstrap has created the GitHub OIDC Portfolio roles if deploying through GitHub Actions.

Optional model-access check:

```sh
aws bedrock list-foundation-models \
  --region ap-northeast-1 \
  --query "modelSummaries[?modelId=='amazon.nova-lite-v1:0'||modelId=='amazon.titan-embed-text-v2:0'].[modelId]" \
  --output table
```

## Recommended first deployment: GitHub Actions

Use this path for normal dev deployment.

1. Merge the Portfolio changes to `main`.
2. Open GitHub Actions.
3. Run the manual workflow:

   ```text
   portfolio-infra-deploy
   ```

4. Review the pre-approval Terraform plan artifact and summary.
5. Approve the `dev` environment when prompted.
6. Wait for `apply-portfolio-stack` to succeed.
7. If `portfolio-deploy` already failed before infra existed, rerun it. Otherwise, push a small `app/portfolio/**` or `docs/portfolio/**` change to trigger it.

Relevant workflows:

- `.github/workflows/portfolio-pr-baseline.yml`
- `.github/workflows/portfolio-infra-deploy.yml`
- `.github/workflows/portfolio-deploy.yml`

## Manual first deployment alternative

Use this only when intentionally bypassing GitHub Actions.

### 1. Build the Guide API Lambda package

From the repository root:

```sh
export AWS_REGION=ap-northeast-1
export TF_STATE_BUCKET=devops-hiraya-dev-tf-state

pnpm run portfolio:guide-api:package
mkdir -p infra/portfolio/build
cp app/portfolio/guide-api/build/guide-api.zip infra/portfolio/build/guide-api.zip
```

### 2. Initialize and apply Terraform

```sh
.github/scripts/write-terraform-backend.sh portfolio

terraform -chdir=infra/portfolio init -backend-config=backend.hcl -reconfigure
terraform -chdir=infra/portfolio validate
terraform -chdir=infra/portfolio plan
terraform -chdir=infra/portfolio apply
```

### 3. Read stack outputs

```sh
export KNOWLEDGE_BUCKET=$(terraform -chdir=infra/portfolio output -raw knowledge_bucket_name)
export KNOWLEDGE_PREFIX=$(terraform -chdir=infra/portfolio output -raw knowledge_prefix)
export CITATION_MANIFEST_KEY=$(terraform -chdir=infra/portfolio output -raw citation_manifest_key)
export KNOWLEDGE_BASE_ID=$(terraform -chdir=infra/portfolio output -raw bedrock_knowledge_base_id)
export DATA_SOURCE_ID=$(terraform -chdir=infra/portfolio output -raw bedrock_data_source_id)
export SITE_BUCKET=$(terraform -chdir=infra/portfolio output -raw site_bucket_name)
export DISTRIBUTION_ID=$(terraform -chdir=infra/portfolio output -raw cloudfront_distribution_id)
export GUIDE_API_LAMBDA=$(terraform -chdir=infra/portfolio output -raw guide_api_lambda_function_name)
export PORTFOLIO_DOMAIN_NAME=$(terraform -chdir=infra/portfolio output -raw portfolio_domain_name)
```

### 4. Sync curated knowledge and citation manifest

```sh
pnpm run portfolio:knowledge:validate

manifest_path="${TMPDIR:-/tmp}/hiraya-portfolio-citations.json"
staging_dir="${TMPDIR:-/tmp}/hiraya-portfolio-knowledge-staging"

node .github/scripts/generate-portfolio-citation-manifest.mjs --root . --output "$manifest_path"
rm -rf "$staging_dir"
mkdir -p "$staging_dir"
cp docs/portfolio/PROJECT_BRIEF.md "$staging_dir/"
cp docs/portfolio/ARCHITECTURE.md "$staging_dir/"
cp docs/portfolio/CICD.md "$staging_dir/"
cp docs/portfolio/SECURITY_GATES.md "$staging_dir/"
cp docs/portfolio/TEAM_ROLES.md "$staging_dir/"
cp docs/portfolio/DECISIONS.md "$staging_dir/"

aws s3 sync "$staging_dir/" "s3://${KNOWLEDGE_BUCKET}/${KNOWLEDGE_PREFIX}" \
  --delete \
  --cache-control "no-cache"

aws s3 cp "$manifest_path" "s3://${KNOWLEDGE_BUCKET}/${CITATION_MANIFEST_KEY}" \
  --content-type "application/json" \
  --cache-control "no-cache"
```

### 5. Start and wait for Bedrock ingestion

```sh
job_id=$(aws bedrock-agent start-ingestion-job \
  --region "$AWS_REGION" \
  --knowledge-base-id "$KNOWLEDGE_BASE_ID" \
  --data-source-id "$DATA_SOURCE_ID" \
  --description "hiraya-portfolio-manual-$(date +%Y%m%d%H%M%S)" \
  --query 'ingestionJob.ingestionJobId' \
  --output text)

echo "Started Bedrock ingestion job ${job_id}."

for attempt in $(seq 1 60); do
  status=$(aws bedrock-agent get-ingestion-job \
    --region "$AWS_REGION" \
    --knowledge-base-id "$KNOWLEDGE_BASE_ID" \
    --data-source-id "$DATA_SOURCE_ID" \
    --ingestion-job-id "$job_id" \
    --query 'ingestionJob.status' \
    --output text)

  case "$status" in
    COMPLETE)
      echo "Bedrock ingestion job ${job_id} completed."
      break
      ;;
    FAILED|STOPPED)
      aws bedrock-agent get-ingestion-job \
        --region "$AWS_REGION" \
        --knowledge-base-id "$KNOWLEDGE_BASE_ID" \
        --data-source-id "$DATA_SOURCE_ID" \
        --ingestion-job-id "$job_id"
      exit 1
      ;;
  esac

  echo "Waiting for Bedrock ingestion (${attempt}/60); status=${status}."
  sleep 20
done

if [[ "${status:-UNKNOWN}" != "COMPLETE" ]]; then
  echo "Timed out waiting for Bedrock ingestion job ${job_id}; last status=${status:-UNKNOWN}." >&2
  exit 1
fi
```

### 6. Deploy app artifacts

```sh
pnpm run portfolio:frontend:test
pnpm run portfolio:frontend:build
pnpm run portfolio:frontend:lint
pnpm run portfolio:guide-api:test
pnpm run portfolio:guide-api:package

aws lambda update-function-code \
  --region "$AWS_REGION" \
  --function-name "$GUIDE_API_LAMBDA" \
  --zip-file "fileb://app/portfolio/guide-api/build/guide-api.zip" >/dev/null

aws lambda wait function-updated \
  --region "$AWS_REGION" \
  --function-name "$GUIDE_API_LAMBDA"

aws s3 sync app/portfolio/frontend/dist/ "s3://${SITE_BUCKET}/" \
  --delete \
  --exclude 'index.html' \
  --cache-control "public,max-age=31536000,immutable"

aws s3 cp app/portfolio/frontend/dist/index.html "s3://${SITE_BUCKET}/index.html" \
  --content-type "text/html; charset=utf-8" \
  --cache-control "no-cache"

aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/" "/index.html" >/dev/null
```

### 7. Bump Lambda knowledge version

This forces the function configuration to reflect the current knowledge version after ingestion.

```sh
version="manual-$(date +%Y%m%d%H%M%S)"
config=$(aws lambda get-function-configuration \
  --region "$AWS_REGION" \
  --function-name "$GUIDE_API_LAMBDA")

env_file=$(mktemp)
jq -c --arg version "$version" \
  '{Variables: (.Environment.Variables // {} | .KNOWLEDGE_VERSION = $version)}' \
  <<< "$config" > "$env_file"

aws lambda update-function-configuration \
  --region "$AWS_REGION" \
  --function-name "$GUIDE_API_LAMBDA" \
  --environment "file://${env_file}" >/dev/null

aws lambda wait function-updated \
  --region "$AWS_REGION" \
  --function-name "$GUIDE_API_LAMBDA"
```

## Smoke test

CloudFront and Route 53 propagation may take several minutes after first deploy.

```sh
PORTFOLIO_PUBLIC_URL="https://${PORTFOLIO_DOMAIN_NAME:-lazyhiraya.noidilin.dev}" \
node .github/scripts/portfolio-public-smoke.mjs
```

The smoke test checks:

- SPA shell at `/`
- Guide API health at `/api/health`
- answer path through `/api/guide/chat`
- refusal path through `/api/guide/chat`

Do not test the regional API Gateway endpoint directly unless you intentionally provide the CloudFront origin secret header. The public supported entry point is CloudFront at the Portfolio domain.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Terraform cannot initialize backend | `TF_STATE_BUCKET`, `AWS_REGION`, and `infra/portfolio/backend.hcl` generated by `.github/scripts/write-terraform-backend.sh portfolio` |
| ACM validation hangs | Route 53 hosted zone name and certificate validation records |
| Bedrock ingestion fails | S3 object prefix, KB IAM role S3 permissions, S3 Vectors index dimension, Bedrock model access |
| Guide returns `not_ready` | Ingestion job status and Lambda environment variables from Terraform outputs |
| Public URL 403/404 after deploy | CloudFront distribution status, default behavior function association, `aws_cloudfront_function.spa_rewrite`, S3 asset sync, invalidation completion |
| API returns 403 through API Gateway | Direct API Gateway calls lack the CloudFront origin secret header; test through CloudFront |
