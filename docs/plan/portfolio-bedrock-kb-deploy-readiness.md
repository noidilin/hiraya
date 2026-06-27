# Portfolio Bedrock KB Deploy Readiness Remediation Plan

Status: planned
Date: 2026-06-27
Related plan: [`portfolio-bedrock-KB.md`](./portfolio-bedrock-KB.md)
Related ADR: [`../adr/0008-durable-portfolio-stack.md`](../adr/0008-durable-portfolio-stack.md)
Related issue: <https://github.com/noidilin/hiraya/issues/130>

## Goal

Make the current Hiraya Portfolio + Hiraya Guide implementation deploy-ready before its first AWS deployment.

This plan fixes the review blockers found after the initial implementation while preserving the accepted durable Portfolio Stack architecture:

- Portfolio remains outside EKS.
- CloudFront continues to serve one public same-origin SPA/API surface.
- Guide API continues to use Bedrock Knowledge Bases `RetrieveAndGenerate` with explicit output token limits.
- Curated Markdown under `docs/portfolio/` remains the only v1 knowledge source.

## Resolved design decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Vector store | **Amazon S3 Vectors** instead of OpenSearch Serverless | Lower idle cost and lower operational complexity for a tiny, low-traffic portfolio KB. Current app does not need OpenSearch hybrid search or advanced filtering. |
| Vector resources | **Terraform-managed** vector bucket and index | Keeps first deploy reproducible and avoids console-created drift. |
| Vector encryption | **SSE-S3** | Matches the current dev portfolio posture and avoids extra KMS policy/cost complexity. |
| Terraform state | **Pre-deploy schema change** | `infra/portfolio` has not been applied yet, so AOSS resources can be removed directly without state migration. |
| KB chunking | **Default Bedrock chunking** | Keep data source behavior simple for first deploy. Revisit only if retrieval quality is poor. |
| Lambda package | **esbuild bundled CommonJS artifact** | Avoids Lambda ESM/package metadata pitfalls and bundles AWS SDK v3 dependencies. |
| Citation manifest | **Clean canonical `sources` record schema** | No backward compatibility needed because the app has not been deployed. Runtime lookup should match generated manifest directly. |
| Knowledge sync | **Generated staging directory** containing only required curated docs | Prevents accidental ingestion of `README.md` or future non-curated Markdown files. |
| Architecture docs | **Update ADR + plan** | S3 Vectors changes the accepted storage choice and must be documented with rationale. |

## Non-goals

- Do not deploy or apply AWS changes as part of this plan unless explicitly requested later.
- Do not migrate live Terraform state; there is no deployed Portfolio stack to migrate.
- Do not add WAF, broad CORS, persistent chat history, or live AWS/GitHub/tool access to Hiraya Guide.
- Do not ingest `docs/portfolio/README.md`, raw repo files, reports, generated graph artifacts, or anything outside the six curated Markdown documents.
- Do not alter Vintage Storefront routes, `app:baseline`, or EKS/GitOps behavior.
- Do not copy literal AWS account IDs or role ARNs into public-facing notes beyond existing source files.

## Target end state

```text
Portfolio Visitor browser
  -> https://lazyhiraya.noidilin.dev
  -> CloudFront distribution
       |-> / and static assets -> private S3 SPA bucket through CloudFront OAC
       `-> /api/* -> API Gateway HTTP API -> Guide API Lambda
                                      |-> AWS Secrets Manager origin-header secret
                                      |-> S3 citation manifest outside KB prefix
                                      `-> Bedrock Knowledge Bases RetrieveAndGenerate
                                             |-> S3 knowledge data source
                                             |-> S3 Vectors vector bucket/index
                                             `-> Terraform-managed Bedrock Guardrail
```

Knowledge ingestion source:

```text
RUNNER_TEMP/portfolio-knowledge-staging/
  PROJECT_BRIEF.md
  ARCHITECTURE.md
  CICD.md
  SECURITY_GATES.md
  TEAM_ROLES.md
  DECISIONS.md
```

Manifest shape:

```json
{
  "schemaVersion": 1,
  "generatedAt": "2026-06-27T00:00:00.000Z",
  "sources": {
    "knowledge/CICD.md": {
      "title": "CI/CD Workflow",
      "source": "docs/portfolio/CICD.md"
    },
    "docs/portfolio/CICD.md": {
      "title": "CI/CD Workflow",
      "source": "docs/portfolio/CICD.md"
    }
  }
}
```

The generator may include both `knowledge/<file>` and `docs/portfolio/<file>` keys for direct lookup convenience, but `sources` is the canonical top-level field. It should not emit the old `documents` array.

## Implementation phases

### Phase 1 — Add regression coverage first

Add or update tests before implementation changes where practical.

#### 1.1 Workflow backend env tests

Files:

- `.github/scripts/portfolio-orchestration.test.mjs`
- `.github/scripts/portfolio-stack.test.mjs`
- `.github/workflows/portfolio-deploy.yml`
- `.github/workflows/portfolio-infra-deploy.yml`

Tests to add/update:

- Assert both Portfolio deploy workflows define `TF_STATE_BUCKET` in top-level `env:`.
- Assert workflows invoke `.github/scripts/write-terraform-backend.sh portfolio` only in workflows where `TF_STATE_BUCKET` is defined.

Expected failure before patch:

- `portfolio-deploy.yml` and `portfolio-infra-deploy.yml` miss `TF_STATE_BUCKET`.

#### 1.2 Lambda package artifact tests

Files:

- `app/portfolio/guide-api/package.json`
- `app/portfolio/guide-api/tests/*`
- Possibly new `app/portfolio/guide-api/tests/package.test.ts`

Tests to add:

- `pnpm --filter @hiraya/portfolio-guide-api package` creates `build/guide-api/handler.js`.
- The bundled artifact exposes a CommonJS `handler` export when loaded in a Lambda-like way.
- The produced zip contains `handler.js` at the zip root.
- The artifact does not require `node_modules` or package metadata at runtime.

Implementation detail for testability:

- Keep package output deterministic under `app/portfolio/guide-api/build/guide-api/` and `app/portfolio/guide-api/build/guide-api.zip`.
- Workflows can copy or create the Terraform zip from this package output.

#### 1.3 Citation manifest schema tests

Files:

- `.github/scripts/portfolio-orchestration.test.mjs`
- `.github/scripts/generate-portfolio-citation-manifest.mjs`
- `app/portfolio/guide-api/src/citations.ts`
- `app/portfolio/guide-api/tests/*`

Tests to update/add:

- Manifest generator emits top-level `sources`, not `documents`.
- `sources["knowledge/CICD.md"]` and `sources["docs/portfolio/CICD.md"]` both map to safe title/source labels.
- `README.md` is absent from the manifest.
- Lambda citation normalization maps Bedrock S3 URIs like `s3://bucket/knowledge/CICD.md` to `docs/portfolio/CICD.md` using the clean `sources` schema.
- Lambda falls back safely when a source is unknown and never rewrites to raw S3 labels when a manifest mapping exists.

#### 1.4 Knowledge sync staging tests

Files:

- `.github/scripts/portfolio-orchestration.test.mjs`
- `.github/workflows/portfolio-deploy.yml`

Tests to add/update:

- Workflow creates a staging directory for curated knowledge.
- Workflow copies exactly the six required documents into staging.
- Workflow runs `aws s3 sync` from the staging directory, not directly from `docs/portfolio/`.
- Workflow does not include `README.md` in the staging copy/sync path.

#### 1.5 Terraform vector store tests

Files:

- `.github/scripts/portfolio-stack.test.mjs`
- `infra/portfolio/main.tf`
- `infra/portfolio/provider.tf`

Tests to add/update:

- Assert `aws_s3vectors_vector_bucket` exists.
- Assert `aws_s3vectors_index` exists with:
  - `data_type = "float32"`
  - `distance_metric = "cosine"`
  - dimension matching Titan Embeddings V2 default dimension.
- Assert `aws_bedrockagent_knowledge_base.guide` uses `type = "S3_VECTORS"` and `s3_vectors_configuration`.
- Assert no `aws_opensearchserverless_*` resources remain in `infra/portfolio/main.tf`.
- Assert Terraform provider requirements support the S3 Vectors resources already present in the lockfile/provider version.

#### 1.6 Bootstrap IAM separation tests

Files:

- `infra/envs/dev/bootstrap/tests/oidc_roles.tftest.hcl`
- `infra/envs/dev/bootstrap/locals.tf`
- `infra/envs/dev/bootstrap/portfolio_oidc.tf`

Tests to add/update:

- Portfolio plan/apply role includes required read/mutate permissions for S3 Vectors resources.
- Portfolio apply role no longer needs `aoss:*` after the S3 Vectors switch.
- App deploy role can mutate only the Portfolio site bucket/object pattern, not the knowledge bucket/object pattern.
- Knowledge sync role can mutate only the Portfolio knowledge bucket/object pattern, not the site bucket/object pattern.
- Knowledge sync role can call `lambda:GetFunctionConfiguration` and `lambda:UpdateFunctionConfiguration` on the Guide API Lambda naming pattern.
- Portfolio roles still do not receive `eks:*` permissions.

### Phase 2 — Patch workflow backend configuration

Files:

- `.github/workflows/portfolio-deploy.yml`
- `.github/workflows/portfolio-infra-deploy.yml`

Changes:

1. Add top-level env:

   ```yaml
   TF_STATE_BUCKET: devops-hiraya-dev-tf-state
   ```

2. Keep it non-secret and consistent with existing infra workflows.
3. Do not change role ARNs in this phase.

Validation:

```sh
pnpm run scripts:test
```

### Phase 3 — Implement clean citation manifest schema

Files:

- `.github/scripts/generate-portfolio-citation-manifest.mjs`
- `.github/scripts/portfolio-orchestration.test.mjs`
- `app/portfolio/guide-api/src/citations.ts`
- `app/portfolio/guide-api/tests/*`

Changes:

1. Replace generator output from:

   ```json
   { "schemaVersion": 1, "generatedAt": "...", "documents": [] }
   ```

   to:

   ```json
   { "schemaVersion": 1, "generatedAt": "...", "sources": {} }
   ```

2. Generate safe citation values:

   ```ts
   {
     title: frontmatter.title,
     source: `docs/portfolio/${entry.name}`
   }
   ```

3. Generate lookup keys for each required doc:

   - `knowledge/<fileName>`
   - `docs/portfolio/<fileName>`

4. Do not include `README.md`.
5. Update `CitationManifest` to require/expect `sources?: Record<string, GuideCitation>` only.
6. Keep existing S3 URI normalization:

   ```text
   s3://<bucket>/knowledge/CICD.md -> knowledge/CICD.md
   ```

7. Add tests proving real generator output is accepted by `normalizeCitations`.

Validation:

```sh
pnpm run scripts:test
pnpm run portfolio:guide-api:test
```

### Phase 4 — Stage only curated knowledge for sync

Files:

- `.github/workflows/portfolio-deploy.yml`
- `.github/scripts/src/validate-portfolio-knowledge.mts` if a reusable document list export is introduced
- `.github/scripts/portfolio-orchestration.test.mjs`

Workflow change:

Replace direct sync from `docs/portfolio/`:

```sh
aws s3 sync docs/portfolio/ "s3://${KNOWLEDGE_BUCKET}/${KNOWLEDGE_PREFIX}" --delete --exclude '*' --include '*.md' --cache-control "no-cache"
```

with a staging flow:

```sh
staging_dir="${RUNNER_TEMP}/portfolio-knowledge-staging"
rm -rf "$staging_dir"
mkdir -p "$staging_dir"
cp docs/portfolio/PROJECT_BRIEF.md "$staging_dir/"
cp docs/portfolio/ARCHITECTURE.md "$staging_dir/"
cp docs/portfolio/CICD.md "$staging_dir/"
cp docs/portfolio/SECURITY_GATES.md "$staging_dir/"
cp docs/portfolio/TEAM_ROLES.md "$staging_dir/"
cp docs/portfolio/DECISIONS.md "$staging_dir/"
aws s3 sync "$staging_dir/" "s3://${KNOWLEDGE_BUCKET}/${KNOWLEDGE_PREFIX}" --delete --cache-control "no-cache"
```

Notes:

- Keep `--delete` so removed/stale S3 objects are cleaned up.
- Do not sync the manifest into the ingested knowledge prefix.
- Keep manifest upload to `CITATION_MANIFEST_KEY` outside the KB prefix.

Validation:

```sh
pnpm run scripts:test
```

### Phase 5 — Bundle Guide API Lambda with esbuild

Files:

- `app/portfolio/guide-api/package.json`
- `app/portfolio/guide-api/tsconfig.json` if needed
- `app/portfolio/guide-api/tests/*`
- Root `package.json`
- `.github/workflows/portfolio-deploy.yml`
- `.github/workflows/portfolio-infra-deploy.yml`
- `.github/workflows/portfolio-pr-baseline.yml`
- `infra/portfolio/variables.tf` if zip path default changes

Package changes:

1. Add `esbuild` as a dev dependency for `@hiraya/portfolio-guide-api`.
2. Add scripts similar to:

   ```json
   {
     "package": "pnpm run build && node scripts/package-lambda.mjs",
     "package:clean": "rm -rf build"
   }
   ```

3. Add `app/portfolio/guide-api/scripts/package-lambda.mjs` to:

   - remove/create `build/guide-api/`,
   - bundle `src/handler.ts`,
   - target Node 24,
   - platform `node`,
   - format `cjs`,
   - output `build/guide-api/handler.js`,
   - zip `handler.js` into `build/guide-api.zip`.

4. Ensure the CommonJS bundle exports `handler` compatible with Terraform:

   ```hcl
   handler = "handler.handler"
   ```

5. Decide whether AWS SDK v3 is bundled or externalized. For this plan, bundle dependencies to avoid relying on Lambda runtime-provided SDK behavior.

Workflow changes:

- Replace manual zip commands from `dist/src` with:

  ```sh
  pnpm run portfolio:guide-api:package
  cp app/portfolio/guide-api/build/guide-api.zip "${RUNNER_TEMP}/guide-api.zip"
  ```

- For Terraform plan/apply workflows:

  ```sh
  pnpm run portfolio:guide-api:package
  mkdir -p "${PORTFOLIO_DIR}/build"
  cp app/portfolio/guide-api/build/guide-api.zip "${PORTFOLIO_DIR}/build/guide-api.zip"
  ```

Root script changes:

```json
"portfolio:guide-api:package": "pnpm --filter @hiraya/portfolio-guide-api package"
```

Validation:

```sh
pnpm install --frozen-lockfile
pnpm run portfolio:guide-api:test
pnpm run portfolio:guide-api:package
node -e "const h=require('./app/portfolio/guide-api/build/guide-api/handler.js'); if (typeof h.handler !== 'function') process.exit(1)"
```

### Phase 6 — Switch Terraform from AOSS to S3 Vectors

Files:

- `infra/portfolio/main.tf`
- `infra/portfolio/provider.tf`
- `infra/portfolio/variables.tf`
- `infra/portfolio/outputs.tf` if vector outputs are desired
- `.github/scripts/portfolio-stack.test.mjs`

Remove resources:

- `aws_opensearchserverless_security_policy.knowledge_encryption`
- `aws_opensearchserverless_security_policy.knowledge_network`
- `aws_opensearchserverless_collection.knowledge`
- `aws_opensearchserverless_access_policy.knowledge`

Add resources:

```hcl
resource "aws_s3vectors_vector_bucket" "knowledge" {
  vector_bucket_name = "${local.name_prefix}-vectors"
  tags               = local.common_tags
}

resource "aws_s3vectors_index" "knowledge" {
  vector_bucket_name = aws_s3vectors_vector_bucket.knowledge.vector_bucket_name
  index_name         = "hiraya-guide-index"
  data_type          = "float32"
  dimension          = 1024
  distance_metric    = "cosine"

  tags = local.common_tags
}
```

Notes:

- Titan Text Embeddings V2 default dimension is 1024. If `guide_embedding_model_arn` is changed later, confirm dimensions before deployment.
- Use SSE-S3 defaults; do not add KMS configuration in this patch.
- If the Terraform provider exposes slightly different attribute names, use provider schema/docs to adjust before coding.

Change Bedrock KB storage:

```hcl
storage_configuration {
  type = "S3_VECTORS"

  s3_vectors_configuration {
    index_arn = aws_s3vectors_index.knowledge.index_arn
  }
}
```

Update KB service role policy:

- Remove `aoss:APIAccessAll` statement.
- Add S3 Vectors access on the vector index ARN, such as:

```hcl
{
  Effect = "Allow"
  Action = [
    "s3vectors:PutVectors",
    "s3vectors:GetVectors",
    "s3vectors:DeleteVectors",
    "s3vectors:QueryVectors",
    "s3vectors:GetIndex"
  ]
  Resource = aws_s3vectors_index.knowledge.index_arn
}
```

Confirm whether Bedrock also needs vector bucket-level actions/policy in current AWS docs/provider behavior. If it does, scope them to `aws_s3vectors_vector_bucket.knowledge.vector_bucket_arn` and the index ARN only.

Update KB role trust with confused-deputy protection:

```hcl
Condition = {
  StringEquals = {
    "aws:SourceAccount" = data.aws_caller_identity.current.account_id
  }
  ArnLike = {
    "aws:SourceArn" = "arn:aws:bedrock:${var.region}:${data.aws_caller_identity.current.account_id}:knowledge-base/*"
  }
}
```

Keep the wildcard KB ARN for creation to avoid Terraform cycles. Tighten later only if a safe cycle-free pattern is available.

Validation:

```sh
terraform -chdir=infra/portfolio init -backend=false -input=false
terraform -chdir=infra/portfolio validate -no-color
pnpm run scripts:test
```

### Phase 7 — Patch Portfolio OIDC IAM roles

Files:

- `infra/envs/dev/bootstrap/locals.tf`
- `infra/envs/dev/bootstrap/portfolio_oidc.tf`
- `infra/envs/dev/bootstrap/tests/oidc_roles.tftest.hcl`

#### 7.1 Add bucket-specific Portfolio locals

Split broad Portfolio S3 ARNs into site and knowledge patterns.

Example:

```hcl
portfolio_site_bucket_arn       = "arn:aws:s3:::${local.name_prefix}-portfolio-site"
portfolio_site_object_arn       = "arn:aws:s3:::${local.name_prefix}-portfolio-site/*"
portfolio_knowledge_bucket_arn  = "arn:aws:s3:::${local.name_prefix}-portfolio-knowledge"
portfolio_knowledge_object_arn  = "arn:aws:s3:::${local.name_prefix}-portfolio-knowledge/*"
portfolio_vector_bucket_arn     = "arn:aws:s3vectors:${var.aws_region}:${data.aws_caller_identity.current.account_id}:bucket/${local.name_prefix}-portfolio-vectors"
portfolio_vector_index_arn      = "${local.portfolio_vector_bucket_arn}/index/hiraya-guide-index"
```

Check actual S3 Vectors ARN format against provider/docs before implementation.

#### 7.2 App deploy role

Restrict `AllowPortfolioAssetDeploy` to:

- site bucket ARN,
- site object ARN.

Do not allow app deploy to mutate the knowledge bucket or vector store.

#### 7.3 Knowledge sync role

Restrict `AllowCuratedKnowledgeSync` to:

- knowledge bucket ARN,
- knowledge object ARN.

Do not allow knowledge sync to mutate site assets.

Keep:

- Bedrock ingestion read/start actions.
- Lambda env version bump actions.

#### 7.4 Plan/apply roles

Plan role read inspection:

- Add S3 Vectors read/list/get actions required for Terraform refresh.
- Remove any AOSS-specific read actions if they are no longer needed.

Apply role mutation:

- Add S3 Vectors create/update/delete/tag actions required by Terraform-managed vector bucket/index.
- Remove `aoss:*` mutation/read permissions because AOSS is no longer part of the Portfolio Stack.

Likely action families to validate against current AWS IAM docs/provider behavior:

- `s3vectors:CreateVectorBucket`
- `s3vectors:DeleteVectorBucket`
- `s3vectors:GetVectorBucket`
- `s3vectors:ListVectorBuckets`
- `s3vectors:CreateIndex`
- `s3vectors:DeleteIndex`
- `s3vectors:GetIndex`
- `s3vectors:ListIndexes`
- `s3vectors:TagResource`
- `s3vectors:UntagResource`

If Terraform requires broader read/list actions for refresh, prefer scoped resources where supported and wildcard only for list APIs that do not support resource-level permissions.

Validation:

```sh
terraform -chdir=infra/envs/dev/bootstrap init -backend=false -input=false
terraform -chdir=infra/envs/dev/bootstrap test -no-color
```

### Phase 8 — Update documentation and architecture decisions

Files:

- `docs/adr/0008-durable-portfolio-stack.md`
- `docs/plan/portfolio-bedrock-KB.md`
- `docs/portfolio/ARCHITECTURE.md`
- `docs/portfolio/CICD.md`
- `docs/portfolio/README.md`
- Maybe `app/portfolio/README.md` or `infra/portfolio/README.md` if present/created

Changes:

1. Update ADR to say the vector store is S3 Vectors, not OpenSearch Serverless.
2. Add an ADR note explaining the post-acceptance change:

   - lower expected idle cost,
   - simpler Terraform resource model,
   - no need for hybrid search in v1,
   - acceptable semantic-only limitation for curated Markdown.

3. Update the original Portfolio KB plan target architecture to mention S3 Vectors.
4. Update curated docs to distinguish:

   - implemented in repo,
   - deploy-ready but not yet applied,
   - future/target-state gaps.

5. Remove stale “later workflow slice” language from docs that may be ingested.
6. Add local first-deploy/package note:

   ```sh
   pnpm run portfolio:guide-api:package
   terraform -chdir=infra/portfolio plan
   ```

7. Keep README non-ingested, but avoid stale maintainer-confusing statements.

Validation:

```sh
pnpm run portfolio:knowledge:validate
```

### Phase 9 — Full local validation

Run the same validations from the review plus new package checks:

```sh
pnpm run portfolio:knowledge:validate
pnpm run portfolio:guide-api:test
pnpm run portfolio:guide-api:package
pnpm run portfolio:frontend:test
terraform -chdir=infra/portfolio init -backend=false -input=false
terraform -chdir=infra/portfolio validate -no-color
terraform -chdir=infra/envs/dev/bootstrap init -backend=false -input=false
terraform -chdir=infra/envs/dev/bootstrap test -no-color
pnpm run scripts:test
```

If any package-lock changes are required:

```sh
pnpm install --frozen-lockfile
```

should pass after committing the updated lockfile.

### Phase 10 — Optional AWS validation after code review

Only after the code patch is reviewed and the user explicitly wants AWS validation:

1. Run a trusted Portfolio preflight plan with the Portfolio plan role.
2. Inspect that the plan creates:

   - site S3 bucket,
   - knowledge S3 bucket,
   - S3 Vectors vector bucket,
   - S3 Vectors index,
   - Bedrock KB with `S3_VECTORS`,
   - data source,
   - Guardrail/version,
   - Lambda/API Gateway/CloudFront/DNS resources.

3. Confirm no AOSS resources are planned.
4. Confirm no EKS/platform resources are planned.
5. Only then run approved apply through the Portfolio infra workflow.

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| S3 Vectors Terraform provider argument names differ from draft examples | Terraform validate fails | Check provider schema/docs during implementation and adjust HCL. |
| S3 Vectors IAM actions/resource scopes are incomplete | Terraform apply or Bedrock KB creation fails | Add least-privilege actions iteratively; prefer tests for expected action families. |
| Bedrock KB requires vector bucket policy in addition to IAM role policy | KB creation or ingestion fails | Validate docs and add bucket policy scoped to KB service role if required. |
| Titan embedding dimensions change due model change | Vector index incompatible with embeddings | Keep model pinned to Titan Embeddings V2 and document dimension coupling. |
| esbuild bundle accidentally externalizes AWS SDK v3 deps | Lambda runtime import failure | Add package smoke test requiring bundled `handler.js` without `node_modules`. |
| Knowledge staging list drifts from validator list | Required docs missing from ingestion | Keep required doc list duplicated only with tests, or introduce a shared generated list script. |
| Updating curated docs overstates deployment state | Portfolio Guide gives false claims | Explicitly label repo-implemented vs deployed/not-yet-applied status. |

## Done criteria

- Portfolio deploy and infra workflows define `TF_STATE_BUCKET`.
- Guide API package command produces a Lambda-ready CommonJS zip.
- Workflows use the package command instead of zipping `dist/src`.
- Citation manifest uses clean top-level `sources` schema.
- Lambda citation normalization maps generated manifest output to safe citations.
- Knowledge sync stages exactly six curated Markdown docs and excludes `README.md`.
- `infra/portfolio` uses Terraform-managed S3 Vectors and contains no AOSS resources.
- Bedrock KB service role has confused-deputy trust protection.
- Portfolio OIDC roles have S3 Vectors permissions and site/knowledge S3 separation.
- ADR and plan docs record the S3 Vectors decision.
- Curated docs no longer contain stale implementation/future-state claims.
- All local validations in Phase 9 pass.

## Suggested commit structure

1. `test(portfolio): cover deploy readiness regressions`
2. `fix(portfolio): package guide api lambda with esbuild`
3. `fix(portfolio): normalize citation manifest and curated sync`
4. `fix(infra): switch portfolio kb to s3 vectors`
5. `fix(iam): tighten portfolio oidc permissions`
6. `docs(portfolio): record s3 vectors deploy-readiness decision`

Small commits are preferred because the Terraform, workflow, and Lambda packaging changes are independently reviewable.
