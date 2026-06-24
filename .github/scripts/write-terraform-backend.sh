#!/usr/bin/env bash
set -euo pipefail

: "${TF_STATE_BUCKET:?TF_STATE_BUCKET is required}"
: "${TF_STATE_KEY:?TF_STATE_KEY is required}"
: "${AWS_REGION:?AWS_REGION is required}"
: "${TF_BACKEND_PATH:?TF_BACKEND_PATH is required}"

mkdir -p "$(dirname "$TF_BACKEND_PATH")"
cat > "$TF_BACKEND_PATH" <<EOF_BACKEND
bucket       = "${TF_STATE_BUCKET}"
key          = "${TF_STATE_KEY}"
region       = "${AWS_REGION}"
use_lockfile = true
encrypt      = true
EOF_BACKEND
