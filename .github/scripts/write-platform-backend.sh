#!/usr/bin/env bash
set -euo pipefail

cat > infra/envs/dev/platform/backend.hcl <<EOF_BACKEND
bucket       = "${TF_STATE_BUCKET:-devops-hiraya-dev-tf-state}"
key          = "${TF_PLATFORM_STATE_KEY:-devops-hiraya-dev/dev/platform/terraform.tfstate}"
region       = "${AWS_REGION:-ap-northeast-1}"
use_lockfile = true
encrypt      = true
EOF_BACKEND
