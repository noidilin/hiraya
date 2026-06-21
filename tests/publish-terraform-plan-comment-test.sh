#!/usr/bin/env bash
set -euo pipefail

SCRIPT="$(pwd)/.github/scripts/publish-terraform-plan-comment.sh"
tmpdir=$(mktemp -d)
trap 'rm -rf "$tmpdir"' EXIT

assert_contains() {
  local haystack=$1
  local needle=$2
  if [[ "$haystack" != *"$needle"* ]]; then
    printf 'Expected output to contain:\n%s\n\nActual output:\n%s\n' "$needle" "$haystack" >&2
    exit 1
  fi
}

cat >"$tmpdir/plan-with-destroy.txt" <<'PLAN'
Terraform will perform the following actions:

  # aws_s3_bucket.example will be destroyed
  - resource "aws_s3_bucket" "example" {}

Plan: 2 to add, 3 to change, 1 to destroy.
PLAN

output=$(TERRAFORM_PLAN_COMMENT_DRY_RUN=true GITHUB_SHA=abc123 "$SCRIPT" "$tmpdir/plan-with-destroy.txt" terraform-pr-plan-dev-platform-7-abc123)
assert_contains "$output" '<!-- hiraya:terraform-plan:dev-platform -->'
assert_contains "$output" '| Add | `2` |'
assert_contains "$output" '| Change | `3` |'
assert_contains "$output" '| Destroy | `1` |'
assert_contains "$output" '> [!WARNING]'
assert_contains "$output" '```terraform'
assert_contains "$output" 'Workflow artifact `terraform-pr-plan-dev-platform-7-abc123`'

cat >"$tmpdir/no-changes.txt" <<'PLAN'
No changes. Your infrastructure matches the configuration.
PLAN

output=$(TERRAFORM_PLAN_COMMENT_DRY_RUN=true GITHUB_SHA=def456 "$SCRIPT" "$tmpdir/no-changes.txt" terraform-pr-plan-dev-platform-8-def456)
assert_contains "$output" '| Summary | `No changes. Your infrastructure matches the configuration.` |'
assert_contains "$output" '| Add | `0` |'
assert_contains "$output" '| Change | `0` |'
assert_contains "$output" '| Destroy | `0` |'
if [[ "$output" == *'> [!WARNING]'* ]]; then
  echo 'Did not expect a destroy warning for a no-op plan.' >&2
  exit 1
fi

cat >"$tmpdir/large-plan.txt" <<'PLAN'
Plan: 0 to add, 0 to change, 0 to destroy.
PLAN
python3 - <<PY
from pathlib import Path
p = Path('$tmpdir/large-plan.txt')
p.write_text(p.read_text() + 'x' * 64)
PY
output=$(TERRAFORM_PLAN_COMMENT_DRY_RUN=true PLAN_COMMENT_EXCERPT_BYTES=16 "$SCRIPT" "$tmpdir/large-plan.txt" terraform-pr-plan-dev-platform-9-large)
assert_contains "$output" '...truncated; see workflow artifact for full plan...'

fakebin="$tmpdir/bin"
mkdir -p "$fakebin"
cat >"$fakebin/gh" <<'GH'
#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' "$*" >>"$GH_FAKE_LOG"
if [[ "$*" == *'/issues/12/comments'* && "$*" != *'--method POST'* ]]; then
  if [[ "${GH_FAKE_EXISTING_COMMENT_ID:-}" != "" ]]; then
    echo "$GH_FAKE_EXISTING_COMMENT_ID"
  fi
fi
GH
chmod +x "$fakebin/gh"
cat >"$tmpdir/event.json" <<'JSON'
{"pull_request":{"number":12}}
JSON

GH_FAKE_LOG="$tmpdir/gh-create.log" PATH="$fakebin:$PATH" GITHUB_REPOSITORY=example/hiraya GITHUB_EVENT_PATH="$tmpdir/event.json" "$SCRIPT" "$tmpdir/no-changes.txt" terraform-pr-plan-dev-platform-12-def456 >/dev/null
assert_contains "$(cat "$tmpdir/gh-create.log")" '--method POST repos/example/hiraya/issues/12/comments'

GH_FAKE_LOG="$tmpdir/gh-update.log" GH_FAKE_EXISTING_COMMENT_ID=456 PATH="$fakebin:$PATH" GITHUB_REPOSITORY=example/hiraya PR_NUMBER=12 "$SCRIPT" "$tmpdir/no-changes.txt" terraform-pr-plan-dev-platform-12-def456 >/dev/null
assert_contains "$(cat "$tmpdir/gh-update.log")" '--method PATCH repos/example/hiraya/issues/comments/456'


echo 'publish-terraform-plan-comment tests passed.'
