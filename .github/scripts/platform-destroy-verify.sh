#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-ap-northeast-1}"
TF_STATE_BUCKET="${TF_STATE_BUCKET:-devops-hiraya-dev-tf-state}"
CLUSTER_NAME="${CLUSTER_NAME:-}"
VPC_ID="${VPC_ID:-}"
EDGE_LOAD_BALANCER_NAME="${EDGE_LOAD_BALANCER_NAME:-hiraya-dev-public}"
K8S_EBS_CLEANUP_VOLUME_IDS_FILE="${K8S_EBS_CLEANUP_VOLUME_IDS_FILE:-}"
HIRAYA_EBS_CLUSTER_TAG_KEY="${HIRAYA_EBS_CLUSTER_TAG_KEY:-HirayaCluster}"
DURABLE_VINTAGE_SECRET_ID="${DURABLE_VINTAGE_SECRET_ID:-/hiraya/dev/apps/vintage}"

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

volume_deleted() {
  local volume_id="$1"
  local output
  local exit_code

  set +e
  output=$(aws ec2 describe-volumes \
    --region "$AWS_REGION" \
    --volume-ids "$volume_id" \
    --query 'Volumes[0].State' \
    --output text 2>&1)
  exit_code=$?
  set -e

  if [[ "$exit_code" -ne 0 ]]; then
    grep -q "InvalidVolume.NotFound" <<<"$output"
    return $?
  fi

  echo "EBS volume ${volume_id} still exists with state: ${output}"
  return 1
}

captured_kubernetes_ebs_volumes_gone() {
  if [[ -z "$K8S_EBS_CLEANUP_VOLUME_IDS_FILE" || ! -s "$K8S_EBS_CLEANUP_VOLUME_IDS_FILE" ]]; then
    return 0
  fi

  local volume_id
  while IFS= read -r volume_id; do
    [[ -n "$volume_id" ]] || continue
    if ! volume_deleted "$volume_id"; then
      return 1
    fi
  done <"$K8S_EBS_CLEANUP_VOLUME_IDS_FILE"

  return 0
}

hiraya_tagged_ebs_volumes_gone() {
  local count
  count=$(aws ec2 describe-volumes \
    --region "$AWS_REGION" \
    --filters "Name=tag:${HIRAYA_EBS_CLUSTER_TAG_KEY},Values=${CLUSTER_NAME}" \
    --query 'length(Volumes)' \
    --output text)

  [[ "$count" == "0" ]]
}

legacy_kubernetes_ebs_volumes_gone() {
  local count
  count=$(aws ec2 describe-volumes \
    --region "$AWS_REGION" \
    --filters "Name=tag:kubernetes.io/cluster/${CLUSTER_NAME},Values=owned" \
    --query 'length(Volumes)' \
    --output text)

  [[ "$count" == "0" ]]
}

require_value CLUSTER_NAME "$CLUSTER_NAME"
require_value VPC_ID "$VPC_ID"
require_value EDGE_LOAD_BALANCER_NAME "$EDGE_LOAD_BALANCER_NAME"

wait_until "EKS cluster ${CLUSTER_NAME} is gone or not ACTIVE" 60 30 cluster_gone_or_inactive
wait_until "captured Kubernetes EBS volume IDs are deleted" 20 30 captured_kubernetes_ebs_volumes_gone
wait_until "Hiraya-tagged Kubernetes EBS volumes for cluster ${CLUSTER_NAME} are deleted" 20 30 hiraya_tagged_ebs_volumes_gone
wait_until "legacy Kubernetes EBS volumes tagged for cluster ${CLUSTER_NAME} are deleted" 20 30 legacy_kubernetes_ebs_volumes_gone
wait_until "VPC ${VPC_ID} is deleted" 60 30 vpc_gone
wait_until "shared public load balancer ${EDGE_LOAD_BALANCER_NAME} is deleted" 60 30 load_balancer_gone

echo "Verifying Terraform remote-state bucket remains accessible: ${TF_STATE_BUCKET}"
aws s3api head-bucket --bucket "$TF_STATE_BUCKET" >/dev/null

echo "Verifying durable ECR repositories remain accessible"
aws ecr describe-repositories \
  --region "$AWS_REGION" \
  --repository-names "${ECR_REPOSITORIES[@]}" >/dev/null

echo "Verifying durable Vintage Storefront secret remains accessible: ${DURABLE_VINTAGE_SECRET_ID}"
aws secretsmanager describe-secret \
  --region "$AWS_REGION" \
  --secret-id "$DURABLE_VINTAGE_SECRET_ID" >/dev/null

echo "Dev platform destroy verification passed. Disposable platform is gone and durable bootstrap resources remain."
