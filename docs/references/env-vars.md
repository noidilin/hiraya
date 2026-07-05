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
| Guide API runtime variables | `app/portfolio/guide-api/` and deploy workflow | See app/API source and portfolio runbook before changing. Do not document secret values here. |

## Terraform / AWS

Terraform backend and AWS authentication are stack/workflow specific. Use stack-local `backend.hcl.example` files and the relevant runbook instead of adding secrets or account-specific values here.

## Maintenance rule

Document variable names, defaults, and non-secret behavior only. Never commit secrets, tokens, session IDs, temporary credentials, or copied secret values.
