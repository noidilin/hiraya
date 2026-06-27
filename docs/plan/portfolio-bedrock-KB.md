# Hiraya Portfolio and Bedrock Knowledge Base Implementation Plan

Status: in progress
Related ADR: [`docs/adr/0008-durable-portfolio-stack.md`](../adr/0008-durable-portfolio-stack.md)

## Goal

Build **Hiraya Portfolio** as a durable public project-introduction web app at:

```text
https://lazyhiraya.noidilin.dev
```

The app lives outside the disposable EKS platform so it remains reachable when Platform Core and Cluster Bootstrap are destroyed to save cost. Its assistant feature, **Hiraya Guide**, answers Portfolio Visitor questions from **Curated Project Knowledge** using Amazon Bedrock Knowledge Bases.

## Non-goals

- Do not deploy Hiraya Portfolio to EKS.
- Do not replace or modify the existing `hiraya.noidilin.dev` / Vintage Storefront route.
- Do not ingest the whole repository or generated graph artifacts in v1.
- Do not give Hiraya Guide live AWS, GitHub, Kubernetes, CloudWatch, or Prometheus access.
- Do not persist chat transcripts server-side.
- Do not expose a broad public CORS API.
- Do not add WAF in v1 unless public abuse appears.

## Progress notes

- 2026-06-27: Basic frontend baseline scaffolded under `app/portfolio/frontend` with React + Vite, Tailwind CSS, shadcn registry config, prompt-kit alias support, relative `/api/guide/chat` wiring, browser-scoped Guide session handling, and root `portfolio:*` scripts. This gives the Portfolio UI a concrete baseline for later narrative/UX polish and Guide API integration.

## Target architecture

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

Regional placement:

- `ap-northeast-1`: S3 buckets, API Gateway HTTP API, Lambda, Secrets Manager, Bedrock KB, Guardrail, regional IAM/CloudWatch resources.
- `us-east-1`: ACM certificate for CloudFront viewer TLS only.

The Portfolio Stack is a single durable stack under:

```text
infra/portfolio
```

It is not part of the normal EKS deploy/destroy lifecycle.

## Source-of-truth model

Curated Project Knowledge lives in reviewed Markdown under:

```text
docs/portfolio/
  PROJECT_BRIEF.md
  ARCHITECTURE.md
  CICD.md
  SECURITY_GATES.md
  TEAM_ROLES.md
  DECISIONS.md
```

Each file uses lightweight frontmatter:

```yaml
---
title: CI/CD Workflow
audience: portfolio_visitor
category: cicd
last_reviewed: 2026-06-26
---
```

Rules:

- Markdown is the source of truth for Hiraya Guide answers.
- `docs/reports/data/**` remains upstream evidence only; summarize it into visitor-facing Markdown instead of ingesting raw JSON.
- Include implemented controls, gaps, and accepted risks honestly.
- `TEAM_ROLES.md` may describe the **Target Team Permission Model**, but must label it as target-state and avoid claiming it is fully implemented.
- Generated artifacts such as Graphify output are deferred and must remain derived, not authoritative.

## Guide API contract

### `GET /api/health`

Returns minimal public health only:

```json
{ "ok": true, "service": "hiraya-guide-api" }
```

Do not include account IDs, region, model ID, KB ID, git SHA, or config values.

### `POST /api/guide/chat`

Request:

```json
{
  "message": "How does Hiraya deploy infrastructure?",
  "sessionId": "optional-bedrock-session-id"
}
```

Response:

```json
{
  "status": "answered",
  "answer": "...",
  "sessionId": "bedrock-session-id",
  "citations": [
    {
      "title": "CI/CD Workflow",
      "source": "docs/portfolio/CICD.md"
    }
  ]
}
```

`status` values:

- `answered`: answer has curated evidence and normalized citations.
- `refused`: no sufficient curated evidence; return HTTP 200 with helpful pointers.
- `not_ready`: KB/data source is not ingested or not available yet; return HTTP 200 with a friendly preparation message.
- `error`: unexpected service failure; use an appropriate 5xx response.

Validation:

- Accept JSON `POST` only for chat.
- Reject missing/empty `message`.
- Reject messages over the configured cap; start around 1,000 characters to align with Bedrock `RetrieveAndGenerate` input limits.
- Reject invalid `sessionId` type or unreasonable length.
- Reject non-JSON bodies.
- Use same-origin only; no broad CORS and no explicit OPTIONS route in v1.

Conversation behavior:

- Use Bedrock's returned `sessionId` for browser-scoped Guide Sessions.
- The frontend stores the session ID in browser/app state.
- The app does not create durable user accounts or persistent server-side history.
- Return complete answers, not token streaming, in v1.

## Evidence and citation enforcement

Use two enforcement layers:

1. Prompt rule: answer only from retrieved Curated Project Knowledge.
2. Lambda rule: if Bedrock returns no usable citations/retrieved references, discard generated text and return `status: "refused"`.

Normalize citations before returning to the browser. Do not return raw retrieved chunk text.

Citation manifest:

- Knowledge sync reads Markdown frontmatter and writes a manifest outside the KB-ingested prefix.
- Example S3 layout:

```text
s3://<knowledge-bucket>/knowledge/PROJECT_BRIEF.md
s3://<knowledge-bucket>/knowledge/ARCHITECTURE.md
s3://<knowledge-bucket>/manifests/citations.json
```

- The KB data source ingests only the `knowledge/` prefix.
- Lambda fetches `manifests/citations.json` from S3 on cold start and caches it in memory.
- After successful knowledge sync and ingestion, the workflow bumps a Lambda environment value such as `KNOWLEDGE_VERSION=<commit-sha>` to force fresh execution environments and refresh cached citation metadata.

## Bedrock design

Use Amazon Bedrock Knowledge Bases with `RetrieveAndGenerate`.

- Use a fast/low-cost generation model selected from current `ap-northeast-1` availability.
- Set explicit max output tokens in every model invocation path.
- Use the default embedding model unless implementation-time availability requires adjustment.
- Use Amazon S3 Vectors as the v1 vector store to keep idle cost and operational complexity low for the small curated Markdown corpus.
- Terraform manages the KB, S3 data source, S3 Vectors vector bucket/index, Guardrail, and IAM.
- The workflow only syncs Markdown and starts/polls ingestion.
- First apply may create an empty KB/data source; run knowledge sync after curated docs exist.

Guardrail v1:

- Terraform-managed basic Bedrock Guardrail.
- Focus on blocking prompt attacks.
- Do not use contextual grounding in v1; citation checks handle project-evidence enforcement.
- Pin a numbered Guardrail version for production use.

## Public safety and privacy controls

Use basic public controls in v1:

- CloudFront + API Gateway throttling.
- Lambda strict request validation.
- Lambda timeout and reserved concurrency.
- Explicit model max output token limit.
- Fast/low-cost model.
- No persistent chat storage.
- CloudFront origin custom header checked by Lambda.
- Origin header secret stored in AWS Secrets Manager.
- Lambda reads the origin header secret from Secrets Manager at cold start and caches it.
- No WAF in v1.

Logging:

- Minimal operational logs only: request ID, route, latency, status, citation count, and coarse error type.
- Never log prompts, answers, raw retrieved references, full Bedrock responses, cookies, or request headers.
- If API Gateway access logs are enabled, use an allowlist format that excludes headers and bodies.
- Set CloudWatch log retention explicitly.

Important caveat: the CloudFront custom header value will still be represented in Terraform-managed CloudFront configuration/state even if Secrets Manager is used for runtime retrieval and rotation.

## Static frontend hosting

Frontend stack:

- React + Vite SPA under `app/portfolio/frontend` exists as the current baseline.
- Frontend calls relative path `/api/guide/chat`.
- Local Vite development proxies `/api` to `VITE_GUIDE_API_PROXY_TARGET`, defaulting to `http://localhost:3001`; the local Guide API dev server should use that port unless overridden.
- Single CloudFront distribution routes both SPA and `/api/*`.
- Private S3 site bucket with Block Public Access and CloudFront Origin Access Control.
- SPA fallback maps S3 403/404 to `/index.html`.
- No API caching for `/api/*`.
- Hashed Vite assets receive long immutable cache headers.
- `index.html` receives no-cache or short TTL.
- App deploy invalidates only `/` and `/index.html`.

UI/UX details are deferred. The wiring should support a narrative-first portfolio with Hiraya Guide as an assistant panel/feature.

## Terraform ownership

### Project Bootstrap updates

Project Bootstrap owns durable CI/CD foundations for the Portfolio Stack:

- Add a `portfolio` Terraform state key/backend config.
- Extend backend writer support for `portfolio`.
- Create dedicated GitHub OIDC roles:
  - `github-portfolio-plan`
  - `github-portfolio-apply`
  - `github-portfolio-app-deploy`
  - `github-portfolio-knowledge-sync`

Keep these separate from existing Platform Core and Cluster Bootstrap roles.

### `infra/portfolio`

Portfolio Stack Terraform owns:

- Route 53 record for `lazyhiraya.noidilin.dev`.
- ACM certificate in `us-east-1` for CloudFront.
- CloudFront distribution with:
  - S3 SPA origin through OAC.
  - API Gateway origin for `/api/*`.
  - SPA fallback.
  - no API cache behavior.
  - minimal forwarded headers and no cookies.
  - CloudFront-injected origin secret header.
- S3 frontend bucket.
- S3 knowledge bucket/prefix and citation manifest location.
- API Gateway HTTP API and routes:
  - `GET /api/health`
  - `POST /api/guide/chat`
- Node.js TypeScript Guide API Lambda using zip deployment.
- Secrets Manager secret for origin-header verification.
- Lambda execution role and least-privilege policies for:
  - Bedrock KB runtime calls.
  - Secrets Manager read for origin header secret.
  - S3 read for citation manifest.
  - CloudWatch Logs writes.
- Bedrock Knowledge Base, data source, vector store, service role, and Guardrail.
- Outputs needed by workflows:
  - site bucket name.
  - distribution ID/domain.
  - Lambda function name.
  - knowledge bucket/prefix.
  - citation manifest key.
  - KB ID and data source ID.
  - Guardrail ID/version if needed by Lambda env.

Terraform must not upload frontend build artifacts or curated knowledge documents.

## Application layout

Current v1 layout, with `frontend/` and `guide-api/` implemented locally:

```text
app/portfolio/
  frontend/          # existing React + Vite baseline
    package.json
    src/
    vite.config.ts
  guide-api/         # Node.js TypeScript Lambda package bundled with esbuild
    package.json
    src/
      handler.ts
      bedrock.ts
      citations.ts
      validation.ts
    tests/
  README.md
```

Root scripts should be separate from Vintage Storefront scripts:

```json
{
  "portfolio:frontend:build": "...",
  "portfolio:frontend:test": "...",
  "portfolio:guide-api:build": "...",
  "portfolio:guide-api:test": "...",
  "portfolio:guide-api:package": "...",
  "portfolio:knowledge:validate": "...",
  "portfolio:static": "..."
}
```

Do not add Portfolio checks to the existing Vintage `app:baseline` command.

## CI/CD workflows

### Portfolio PR baseline

Create a separate PR workflow for Portfolio paths.

Triggers:

- `app/portfolio/**`
- `docs/portfolio/**`
- `infra/portfolio/**`
- bootstrap role/backend files affected by Portfolio roles/state.
- Portfolio workflow/script files.

Checks:

- Frontend install/build/test.
- Guide API typecheck/build/test.
- Knowledge validation:
  - required frontmatter.
  - non-empty body.
  - Markdown lint.
- Terraform format/validate for `infra/portfolio` without backend credentials.
- Trusted PR Terraform plan for `infra/portfolio` using the dedicated portfolio plan role.

### Portfolio infra deploy

Manual workflow only from `main`:

1. Preflight refreshed Terraform plan for `infra/portfolio`.
2. Upload/summarize plan artifact.
3. Wait for GitHub `dev` environment approval.
4. Apply with the dedicated portfolio apply role.
5. Summarize outputs without exposing secrets.

Do not auto-apply Portfolio infrastructure on merge.

### Portfolio orchestration on `main`

Use one coordinated workflow for app and knowledge changes.

Triggers:

- `app/portfolio/**`
- `docs/portfolio/**`
- relevant workflow/scripts/package files.

Jobs:

1. Detect changed paths.
2. If knowledge changed:
   - validate frontmatter/nonempty/Markdown lint.
   - stage the six curated Markdown files into `${RUNNER_TEMP}/portfolio-knowledge-staging`.
   - mirror that staging directory to S3 `knowledge/` with delete.
   - generate and upload a `sources`-schema citation manifest outside the KB prefix.
   - start Bedrock ingestion job.
   - poll until `COMPLETE` or fail on `FAILED`.
   - bump Lambda `KNOWLEDGE_VERSION` environment value.
3. If app changed:
   - build/test frontend.
   - build/test Guide API.
   - run `pnpm run portfolio:guide-api:package` and deploy the packaged CommonJS Lambda zip.
   - upload frontend assets to S3 with correct cache headers.
   - update Lambda code with `aws lambda update-function-code`.
   - invalidate CloudFront paths `/` and `/index.html`.
4. Smoke after app changes and after knowledge-only changes:
   - `GET https://lazyhiraya.noidilin.dev/` returns SPA shell.
   - `GET /api/health` returns minimal health.
   - one low-cost positive Guide question returns `status: "answered"` and at least one citation.
   - one refusal test returns `status: "refused"` without hallucinated project claims.

Ordering rule: when both app and knowledge change in one merge, run knowledge sync/ingestion before final smoke so Guide tests use fresh knowledge.

Use workflow concurrency for Portfolio deploys to avoid overlapping knowledge/app updates.

## Implementation sequence

1. Documentation foundation
   - Create the six `docs/portfolio/*.md` starter files with frontmatter.
   - Add a knowledge validation script for frontmatter/nonempty/Markdown lint.
   - Summarize `docs/reports/` security and role evidence into curated Markdown.

2. Bootstrap foundation
   - Add Portfolio state key/backend config to Project Bootstrap.
   - Add dedicated portfolio OIDC roles and least-privilege policies.
   - Update backend writer to support `portfolio`.
   - Apply Bootstrap locally after review.

3. Portfolio Terraform skeleton
   - Create `infra/portfolio` providers, variables, backend, outputs, and validation.
   - Add site bucket, knowledge bucket, DNS/ACM, CloudFront/OAC, API Gateway, Lambda placeholder package path, Secrets Manager secret, and IAM.
   - Add Bedrock KB/data source/vector store/Guardrail resources.
   - Add manual plan/apply workflow.

4. Guide API implementation
   - Implement Node.js TypeScript Lambda handler.
   - Implement health route.
   - Implement strict validation and origin-header verification.
   - Implement Secrets Manager and citation manifest cold-start caches.
   - Implement Bedrock `RetrieveAndGenerate` call with explicit output limits and Guardrail configuration.
   - Implement refusal/not-ready/error handling and normalized citations.
   - Add unit tests for validation, status mapping, citation normalization, and no-citation refusal.

5. Frontend implementation — baseline scaffold complete
   - Created React + Vite SPA under `app/portfolio/frontend`.
   - Added Tailwind CSS/shadcn-style baseline and prompt-kit registry alias support.
   - Wired chat calls to relative `/api/guide/chat` with browser-scoped session handling.
   - Keep UI minimal; detailed UI/UX polish and deployed API integration remain later passes.

6. Portfolio workflows
   - Add Portfolio PR baseline.
   - Add one `main` orchestration workflow for knowledge sync, app deploy, and smoke.
   - Ensure Lambda zip artifacts come from the deterministic `app/portfolio/guide-api/build/guide-api.zip` package output.

7. First deploy
   - Build the local Lambda artifact before a local plan if not using the workflow:
     ```sh
     pnpm run portfolio:guide-api:package
     terraform -chdir=infra/portfolio plan
     ```
   - Apply Portfolio Stack infrastructure manually after plan approval.
   - Merge/sync curated knowledge.
   - Run Portfolio orchestration workflow.
   - Verify `lazyhiraya.noidilin.dev`, health, positive Guide answer, and refusal behavior.

## Validation checklist

Local/PR:

- `terraform fmt -check -recursive infra/portfolio`
- `terraform -chdir=infra/portfolio init -backend=false`
- `terraform -chdir=infra/portfolio validate`
- frontend build/test pass.
- Guide API build/test/package pass.
- curated Markdown validation and lint pass.

Post-deploy:

- CloudFront serves the SPA over HTTPS at `lazyhiraya.noidilin.dev`.
- S3 site bucket is not public and is readable only through CloudFront OAC.
- `/api/health` returns minimal health.
- Direct API Gateway bypass without the CloudFront origin header is rejected.
- `/api/guide/chat` answers a known project question with citations.
- Unsupported/off-topic project claims return `status: "refused"`.
- Lambda logs contain no prompts, answers, raw chunks, request bodies, cookies, or headers.
- EKS destroy workflow remains platform-only and does not touch Portfolio Stack resources.

## Future enhancements

- Add WAF if public abuse appears.
- Add freshness metadata UI after the first wiring is stable.
- Add richer citation source previews only if safe and useful.
- Add generated graph/index artifacts as derived knowledge after curated Markdown proves insufficient.
- Tune model choice, retrieval result count, and chunking after smoke/evaluation data exists.
- Consider CAPTCHA or invite-code protection only if basic public controls are insufficient.
