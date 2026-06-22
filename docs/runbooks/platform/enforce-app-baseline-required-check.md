# Enforce the Vintage Storefront app baseline required check

This runbook records the branch rule that must be in place before the Vintage Storefront rewrite proceeds.

## Required check

- Protected branch: `main`
- GitHub repository ruleset: `require-vintage-storefront-app-baseline`
- Required status check: `Vintage Storefront app baseline / app-baseline`
- Workflow source: `.github/workflows/app-pr-baseline.yml`
- Configuration surface: GitHub repository **Settings → Rules → Rulesets**

The workflow runs on every pull request so the required check is always emitted. It uses read-only repository permissions and does not request GitHub OIDC, AWS credentials, ECR login, Terraform credentials, Kubernetes credentials, or registry push permission.

AWS-backed checks are not required for ordinary app PRs. The repository rule requires only the no-AWS app baseline status above; image push, manifest update, deploy smoke, Terraform, and infra workflows remain separate gates.

## Automated configuration command

Use a repository-admin token with `gh` authenticated, then run:

```bash
gh api repos/noidilin/hiraya/rulesets \
  --method POST \
  --input - <<'JSON'
{
  "name": "require-vintage-storefront-app-baseline",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": ["~DEFAULT_BRANCH"],
      "exclude": []
    }
  },
  "rules": [
    {
      "type": "pull_request",
      "parameters": {
        "dismiss_stale_reviews_on_push": false,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_approving_review_count": 0,
        "required_review_thread_resolution": false
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": true,
        "required_status_checks": [
          {
            "context": "Vintage Storefront app baseline / app-baseline"
          }
        ]
      }
    }
  ]
}
JSON
```

## Settings evidence

Live repository settings evidence captured on 2026-06-22:

- Ruleset ID: `17977477`
- Settings URL: `https://github.com/noidilin/hiraya/rules/17977477`
- `enforcement`: `active`
- `target`: `branch`
- `conditions.ref_name.include`: `["~DEFAULT_BRANCH"]`
- Required check contexts: `["Vintage Storefront app baseline / app-baseline"]`
- No AWS-backed workflow context is present in the required status checks list.

Verify the live rule with:

```bash
gh api repos/noidilin/hiraya/rulesets/17977477 \
  --jq '{id, name, enforcement, target, conditions, rules, html: ._links.html.href}'
```

Expected evidence:

- `enforcement` is `active`.
- `target` is `branch`.
- `conditions.ref_name.include` contains `~DEFAULT_BRANCH`.
- `rules` contains `required_status_checks`.
- `required_status_checks[].context` is exactly `Vintage Storefront app baseline / app-baseline`.
- No AWS-backed workflow context appears in the required status checks list.
