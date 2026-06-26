#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   write-terraform-backend.sh [platform-core|cluster-bootstrap|portfolio]
#
# Backward-compatible env mode is still supported by setting TF_STATE_KEY and
# TF_BACKEND_PATH directly. Stack mode derives the layered dev state key and
# backend file path from a shared prefix so workflows can use one backend writer
# for Platform Core, Cluster Bootstrap, and the durable Portfolio Stack.

stack="${1:-${TF_STACK:-}}"

if [[ -n "$stack" ]]; then
  case "$stack" in
    platform-core|cluster-bootstrap)
      : "${TF_BACKEND_PATH:=infra/envs/dev/${stack}/backend.hcl}"
      ;;
    portfolio)
      : "${TF_BACKEND_PATH:=infra/portfolio/backend.hcl}"
      ;;
    *)
      echo "Unsupported Terraform stack '${stack}'. Expected platform-core, cluster-bootstrap, or portfolio." >&2
      exit 2
      ;;
  esac

  : "${TF_STATE_PREFIX:=devops-hiraya-dev/dev}"
  : "${TF_STATE_KEY:=${TF_STATE_PREFIX}/${stack}/terraform.tfstate}"
fi

: "${TF_STATE_BUCKET:?TF_STATE_BUCKET is required}"
: "${TF_STATE_KEY:?TF_STATE_KEY is required or pass a stack name}"
: "${AWS_REGION:?AWS_REGION is required}"
: "${TF_BACKEND_PATH:?TF_BACKEND_PATH is required or pass a stack name}"

mkdir -p "$(dirname "$TF_BACKEND_PATH")"
cat > "$TF_BACKEND_PATH" <<EOF_BACKEND
bucket       = "${TF_STATE_BUCKET}"
key          = "${TF_STATE_KEY}"
region       = "${AWS_REGION}"
use_lockfile = true
encrypt      = true
EOF_BACKEND
