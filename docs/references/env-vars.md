# Environment Variable Reference

This is a lightweight index of environment variables mentioned by local commands and documented workflows. Keep sensitive values out of this file.

## Local smoke and development

| Variable | Used by | Purpose |
|---|---|---|
| `STOREFRONT_PUBLIC_URL` | `pnpm run app:smoke:public` | Overrides the public Storefront URL. Defaults to `https://hiraya.noidilin.dev`. |
| `COMPOSE_SMOKE_KEEP_STACK` | `pnpm run app:smoke:compose` | Set to `1` to leave the Compose stack running after smoke failure/success for debugging. |
| `COMPOSE_SMOKE_CHECK_ONLY` | `pnpm run app:smoke:compose` | Set to `1` to run smoke checks against an already-running Compose stack. |

## Portfolio / Guide API

| Variable | Used by | Purpose |
|---|---|---|
| `PORT` | `pnpm run portfolio:guide-api:dev` | Local Guide API dev server port. Defaults to `3001`. |
| `BEDROCK_KNOWLEDGE_BASE_ID` | `app/portfolio/guide-api/`, `infra/portfolio/` | Enables the Bedrock knowledge-base answer path when paired with `BEDROCK_MODEL_ARN`. |
| `BEDROCK_MODEL_ARN` | `app/portfolio/guide-api/`, `infra/portfolio/` | Foundation model ARN used by the Guide API Bedrock retrieve-and-generate call. |
| `BEDROCK_RETRIEVAL_RESULT_LIMIT` | `app/portfolio/guide-api/`, `infra/portfolio/` | Number of knowledge chunks to retrieve. Source default is `5`; Portfolio Stack sets `8`. |
| `BEDROCK_MAX_OUTPUT_TOKENS` | `app/portfolio/guide-api/`, `infra/portfolio/` | Maximum generated answer tokens. Defaults to `700`. |
| `BEDROCK_GUARDRAIL_ID` / `BEDROCK_GUARDRAIL_VERSION` | `app/portfolio/guide-api/`, `infra/portfolio/` | Optional Bedrock Guardrail binding for Guide answers. |
| `CITATION_MANIFEST_BUCKET` / `CITATION_MANIFEST_KEY` | `app/portfolio/guide-api/`, Portfolio deploy workflow | Optional citation-label manifest lookup. The deploy workflow writes `manifests/citations.json`. |
| `GUIDE_ORIGIN_SECRET_ARN` | `app/portfolio/guide-api/`, `infra/portfolio/` | Secrets Manager reference used by Lambda to verify same-origin Guide API requests. Do not document the secret value. |
| `GUIDE_ORIGIN_SECRET` | Local Guide API tests/dev only | Local secret override for request verification. Do not commit real values. |
| `GUIDE_API_FORCE_ERROR` / `GUIDE_API_NOT_READY` | Guide API smoke/testing paths | Test toggles for forced error and not-ready responses. |

## Terraform / AWS

Terraform backend and AWS authentication are stack/workflow specific. Use stack-local `backend.hcl.example` files and the relevant runbook instead of adding secrets or account-specific values here.

## Maintenance rule

Document variable names, defaults, and non-secret behavior only. Never commit secrets, tokens, session IDs, temporary credentials, or copied secret values.
