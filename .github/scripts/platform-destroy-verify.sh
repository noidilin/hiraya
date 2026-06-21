#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-ap-northeast-1}"
TF_STATE_BUCKET="${TF_STATE_BUCKET:-devops-hiraya-dev-tf-state}"
CLUSTER_NAME="${CLUSTER_NAME:-}"
VPC_ID="${VPC_ID:-}"
EDGE_LOAD_BALANCER_NAME="${EDGE_LOAD_BALANCER_NAME:-hiraya-dev-public}"

ECR_REPOSITORIES=(
  hiraya-frontend
  hiraya-gateway
  hiraya-auth
  hiraya-order-service
  hiraya-orders
  hiraya-product-service
  hiraya-user-service
)

require_value() {
  local name="$1"
  local value="$2"
  if [[ -z "$value" ]]; then
    echo "Required pre-destroy identifier ${name} was empty; cannot verify platform removal." >&2
    exit 1
  fi
}

wait_until() {
  local description="$1"
  local attempts="${2:-40}"
  local delay_seconds="${3:-30}"
  shift 3

  echo "Verifying: ${description}"
  for ((attempt = 1; attempt <= attempts; attempt++)); do
    if "$@"; then
      echo "Verified: ${description}"
      return 0
    fi

    if (( attempt == attempts )); then
      echo "Timed out verifying: ${description}" >&2
      return 1
    fi

    echo "Waiting for ${description} (${attempt}/${attempts})..."
    sleep "$delay_seconds"
  done
}

cluster_gone_or_inactive() {
  local status
  set +e
  status=$(aws eks describe-cluster \
    --region "$AWS_REGION" \
    --name "$CLUSTER_NAME" \
    --query 'cluster.status' \
    --output text 2>/dev/null)
  local exit_code=$?
  set -e

  if [[ "$exit_code" -ne 0 ]]; then
    return 0
  fi

  [[ "$status" != "ACTIVE" ]]
}

vpc_gone() {
  local count
  count=$(aws ec2 describe-vpcs \
    --region "$AWS_REGION" \
    --vpc-ids "$VPC_ID" \
    --query 'length(Vpcs)' \
    --output text 2>/dev/null || echo 0)

  [[ "$count" == "0" ]]
}

load_balancer_gone() {
  ! aws elbv2 describe-load-balancers \
    --region "$AWS_REGION" \
    --names "$EDGE_LOAD_BALANCER_NAME" \
    --query 'LoadBalancers[0].State.Code' \
    --output text >/dev/null 2>&1
}

require_value CLUSTER_NAME "$CLUSTER_NAME"
require_value VPC_ID "$VPC_ID"
require_value EDGE_LOAD_BALANCER_NAME "$EDGE_LOAD_BALANCER_NAME"

wait_until "EKS cluster ${CLUSTER_NAME} is gone or not ACTIVE" 60 30 cluster_gone_or_inactive
wait_until "VPC ${VPC_ID} is deleted" 60 30 vpc_gone
wait_until "shared public load balancer ${EDGE_LOAD_BALANCER_NAME} is deleted" 60 30 load_balancer_gone

echo "Verifying Terraform remote-state bucket remains accessible: ${TF_STATE_BUCKET}"
aws s3api head-bucket --bucket "$TF_STATE_BUCKET" >/dev/null

echo "Verifying durable ECR repositories remain accessible"
aws ecr describe-repositories \
  --region "$AWS_REGION" \
  --repository-names "${ECR_REPOSITORIES[@]}" >/dev/null

echo "Dev platform destroy verification passed. Disposable platform is gone and durable bootstrap resources remain."
