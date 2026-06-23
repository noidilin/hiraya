---
description: "Weekly permission control audit from canonical JSON report data."
emoji: "🔐"
labels: [security, audit, reporting]
tracker-id: weekly-permission-audit
private: true
on: weekly on monday
permissions:
  contents: read
  issues: read
  copilot-requests: write
engine: copilot
network: defaults
tools:
  bash:
    - "node"
    - "find"
    - "grep"
    - "sed"
  github:
    toolsets: [issues]
safe-outputs:
  create-issue:
    title-prefix: "[permission-audit] "
    labels: [security, audit, automated]
    max: 1
    deduplicate-by-title: true
    expires: false
  update-issue:
    target: "*"
    body:
    title-prefix: "[permission-audit] "
    max: 1
max-ai-credits: 500
---

# Weekly Permission Control Audit

Review the canonical permission-control data in this repository and maintain one rolling audit issue for humans.

Use these source files as the source of truth:

- `docs/reports/data/controls/*.json`
- `docs/reports/schema/permission-controls.schema.json`
- `.github/scripts/src/permission-controls.mts`

Do not edit files and do not open pull requests. Your only allowed outputs are creating the rolling audit issue if it does not exist, or appending a new weekly audit section to the existing rolling issue.

## Required analysis

1. Read all control JSON files under `docs/reports/data/controls/`.
2. Count controls by status: `implemented`, `partial`, `not_implemented`, `accepted_risk`, and `external_dependency`.
3. Count report views for:
   - `sdlc_permission_lifecycle`
   - `security_permission_design`
4. Identify the top priority gaps by using the same scoring convention as the deterministic generator:
   - `riskScore = impact * likelihood * exposure`
   - `priorityScore = riskScore - effort - deploymentRisk`
   - Rank non-implemented controls by highest `priorityScore`, then highest `riskScore`.
5. Highlight any obvious drift or suspicious data quality issue, for example:
   - missing or duplicated control IDs
   - missing expected report views
   - evidence paths that look obsolete
   - controls with high risk but low visibility

## Rolling issue behavior

Search open issues for the title prefix `[permission-audit] Weekly permission controls audit`.

- If one exists, append a new section to that issue body using the `update_issue` safe output with `operation: append`.
- If none exists, create a new issue titled `[permission-audit] Weekly permission controls audit`.

## Issue content format

Use concise Markdown:

```markdown
## Weekly audit — YYYY-MM-DD

### Summary

| Metric | Value |
| --- | ---: |
| Controls | ... |
| SDLC report views | ... |
| Security report views | ... |

### Status counts

| Status | Count |
| --- | ---: |
| implemented | ... |
| partial | ... |
| not_implemented | ... |
| accepted_risk | ... |
| external_dependency | ... |

### Top priority gaps

| Rank | Control | Status | Risk | Priority | Why it matters |
| ---: | --- | --- | ---: | ---: | --- |
| 1 | `control.id` | partial | 80 | 73 | short reason |

### Notes for maintainers

- 2–4 concise observations.
- Mention if no action is needed.
```

Keep the audit issue factual. Do not invent implementation status beyond what is present in JSON. If you cannot read enough data, use the `missing-data` safe output instead of creating a misleading audit.
