#!/usr/bin/env bash
set -euo pipefail

PLAN_FILE=${1:?usage: publish-terraform-plan-comment.sh PLAN_FILE ARTIFACT_NAME}
ARTIFACT_NAME=${2:?usage: publish-terraform-plan-comment.sh PLAN_FILE ARTIFACT_NAME}
MARKER=${TERRAFORM_PLAN_COMMENT_MARKER:-"<!-- hiraya:terraform-plan:dev-platform -->"}
STACK_LABEL=${STACK_LABEL:-"Disposable dev platform"}
PLAN_MODE=${PLAN_MODE:-"Fast PR plan (-refresh=false -lock=false)"}
EXCERPT_BYTES=${PLAN_COMMENT_EXCERPT_BYTES:-55000}

if [[ ! -f "$PLAN_FILE" ]]; then
  echo "Plan file not found: $PLAN_FILE" >&2
  exit 1
fi

summary_line=$(grep -E '^(Plan:|No changes\.)' "$PLAN_FILE" | tail -1 || true)
if [[ -z "$summary_line" ]]; then
  summary_line="Summary unavailable; inspect the uploaded plan artifact."
fi

adds=0
changes=0
destroys=0
if [[ "$summary_line" =~ Plan:[[:space:]]+([0-9]+)[[:space:]]+to[[:space:]]+add,[[:space:]]+([0-9]+)[[:space:]]+to[[:space:]]+change,[[:space:]]+([0-9]+)[[:space:]]+to[[:space:]]+destroy\. ]]; then
  adds=${BASH_REMATCH[1]}
  changes=${BASH_REMATCH[2]}
  destroys=${BASH_REMATCH[3]}
fi

tmp_body=$(mktemp)
{
  echo "$MARKER"
  echo "## Terraform plan: dev platform"
  echo
  echo "| Field | Value |"
  echo "| --- | --- |"
  echo "| Stack | \`$STACK_LABEL\` |"
  echo "| Commit | \`${GITHUB_SHA:-unknown}\` |"
  echo "| Mode | \`$PLAN_MODE\` |"
  echo "| Summary | \`$summary_line\` |"
  echo "| Add | \`$adds\` |"
  echo "| Change | \`$changes\` |"
  echo "| Destroy | \`$destroys\` |"
  echo "| Full plan | Workflow artifact \`$ARTIFACT_NAME\` |"
  echo
  if (( destroys > 0 )); then
    echo "> [!WARNING]"
    echo "> This plan includes **$destroys destroy** operation(s). Hiraya dev platform destroys can be acceptable for disposable-platform changes, but review them carefully."
    echo
  fi
  echo "<details><summary>Show Terraform plan excerpt</summary>"
  echo
  echo '```terraform'
  head -c "$EXCERPT_BYTES" "$PLAN_FILE"
  if [[ $(wc -c <"$PLAN_FILE") -gt "$EXCERPT_BYTES" ]]; then
    echo
    echo "...truncated; see workflow artifact for full plan..."
  fi
  echo
  echo '```'
  echo
  echo "</details>"
} >"$tmp_body"

if [[ "${TERRAFORM_PLAN_COMMENT_DRY_RUN:-false}" == "true" ]]; then
  cat "$tmp_body"
  exit 0
fi

if [[ -z "${GITHUB_REPOSITORY:-}" ]]; then
  echo "GITHUB_REPOSITORY is required to publish the plan comment." >&2
  exit 1
fi

pr_number=${PR_NUMBER:-}
if [[ -z "$pr_number" ]]; then
  if [[ -z "${GITHUB_EVENT_PATH:-}" ]]; then
    echo "PR_NUMBER or GITHUB_EVENT_PATH is required to publish the plan comment." >&2
    exit 1
  fi
  pr_number=$(jq -r '.pull_request.number // empty' "$GITHUB_EVENT_PATH")
fi

if [[ -z "$pr_number" ]]; then
  echo "Unable to determine pull request number." >&2
  exit 1
fi

existing_comment_id=$(gh api \
  "repos/${GITHUB_REPOSITORY}/issues/${pr_number}/comments" \
  --paginate \
  --jq ".[] | select(.user.type == \"Bot\" and (.body | contains(\"$MARKER\"))) | .id" \
  | tail -1)

if [[ -n "$existing_comment_id" ]]; then
  gh api \
    --method PATCH \
    "repos/${GITHUB_REPOSITORY}/issues/comments/${existing_comment_id}" \
    --field "body=@${tmp_body}" >/dev/null
  echo "Updated Terraform plan comment ${existing_comment_id}."
else
  gh api \
    --method POST \
    "repos/${GITHUB_REPOSITORY}/issues/${pr_number}/comments" \
    --field "body=@${tmp_body}" >/dev/null
  echo "Created Terraform plan comment."
fi
