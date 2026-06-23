#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-ap-northeast-1}"
CLUSTER_NAME="${CLUSTER_NAME:-}"
APP_NAMESPACE="${K8S_APP_NAMESPACE:-vintage}"
ARGOCD_NAMESPACE="${ARGOCD_NAMESPACE:-argocd}"
ARGOCD_APPLICATION="${ARGOCD_APPLICATION:-vintage}"
CLUSTER_ADMIN_PRINCIPAL_ARN="${CLUSTER_ADMIN_PRINCIPAL_ARN:-}"
EKS_CLUSTER_ADMIN_POLICY_ARN="arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"
WAIT_ATTEMPTS="${K8S_EBS_CLEANUP_WAIT_ATTEMPTS:-60}"
WAIT_DELAY_SECONDS="${K8S_EBS_CLEANUP_WAIT_DELAY_SECONDS:-10}"
VOLUME_IDS_FILE="${K8S_EBS_CLEANUP_VOLUME_IDS_FILE:-}"

if [[ -z "$CLUSTER_NAME" ]]; then
  echo "CLUSTER_NAME is required for Kubernetes EBS cleanup." >&2
  exit 1
fi

wait_until() {
  local description="$1"
  shift

  echo "Waiting for ${description}"
  for ((attempt = 1; attempt <= WAIT_ATTEMPTS; attempt++)); do
    if "$@"; then
      echo "Verified: ${description}"
      return 0
    fi

    if (( attempt == WAIT_ATTEMPTS )); then
      echo "Timed out waiting for ${description}" >&2
      return 1
    fi

    echo "Still waiting for ${description} (${attempt}/${WAIT_ATTEMPTS})..."
    sleep "$WAIT_DELAY_SECONDS"
  done
}

cluster_is_active() {
  local status
  set +e
  status=$(aws eks describe-cluster \
    --region "$AWS_REGION" \
    --name "$CLUSTER_NAME" \
    --query 'cluster.status' \
    --output text 2>/dev/null)
  local exit_code=$?
  set -e

  [[ "$exit_code" -eq 0 && "$status" == "ACTIVE" ]]
}

namespace_gone() {
  ! kubectl get namespace "$APP_NAMESPACE" >/dev/null 2>&1
}

app_namespace_pvs_gone() {
  local remaining
  remaining=$(kubectl get pv -o jsonpath='{range .items[*]}{.spec.claimRef.namespace}{"\n"}{end}' 2>/dev/null \
    | awk -v namespace="$APP_NAMESPACE" '$0 == namespace { count++ } END { print count + 0 }')

  [[ "$remaining" == "0" ]]
}

ensure_cluster_admin_access() {
  local output
  local exit_code

  if [[ -z "$CLUSTER_ADMIN_PRINCIPAL_ARN" ]]; then
    echo "CLUSTER_ADMIN_PRINCIPAL_ARN is not set; assuming the current principal already has Kubernetes admin access."
    return 0
  fi

  echo "Ensuring ${CLUSTER_ADMIN_PRINCIPAL_ARN} has cluster-scoped EKS admin access for cleanup."

  set +e
  output=$(aws eks create-access-entry \
    --region "$AWS_REGION" \
    --cluster-name "$CLUSTER_NAME" \
    --principal-arn "$CLUSTER_ADMIN_PRINCIPAL_ARN" \
    --type STANDARD 2>&1)
  exit_code=$?
  set -e

  if [[ "$exit_code" -ne 0 && ! "$output" =~ ResourceInUseException ]]; then
    echo "$output" >&2
    return "$exit_code"
  fi

  set +e
  output=$(aws eks associate-access-policy \
    --region "$AWS_REGION" \
    --cluster-name "$CLUSTER_NAME" \
    --principal-arn "$CLUSTER_ADMIN_PRINCIPAL_ARN" \
    --policy-arn "$EKS_CLUSTER_ADMIN_POLICY_ARN" \
    --access-scope type=cluster 2>&1)
  exit_code=$?
  set -e

  if [[ "$exit_code" -ne 0 && ! "$output" =~ ResourceInUseException ]]; then
    echo "$output" >&2
    return "$exit_code"
  fi
}

kubernetes_api_accessible() {
  kubectl get namespace default >/dev/null 2>&1
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
    if grep -q "InvalidVolume.NotFound" <<<"$output"; then
      return 0
    fi

    echo "$output" >&2
    return 1
  fi

  echo "EBS volume ${volume_id} still exists with state: ${output}"
  return 1
}

capture_app_namespace_ebs_volume_ids() {
  kubectl get pv \
    -o jsonpath='{range .items[*]}{.metadata.name}{"|"}{.spec.claimRef.namespace}{"|"}{.spec.csi.driver}{"|"}{.spec.csi.volumeHandle}{"|"}{.spec.awsElasticBlockStore.volumeID}{"\n"}{end}' \
    2>/dev/null \
    | while IFS='|' read -r pv_name claim_namespace csi_driver csi_volume_handle in_tree_volume_id; do
        if [[ "$claim_namespace" != "$APP_NAMESPACE" ]]; then
          continue
        fi

        volume_id=""
        if [[ "$csi_driver" == "ebs.csi.aws.com" && -n "$csi_volume_handle" ]]; then
          volume_id="${csi_volume_handle##*/}"
        elif [[ -n "$in_tree_volume_id" ]]; then
          volume_id="${in_tree_volume_id##*/}"
        fi

        if [[ -n "$volume_id" ]]; then
          echo "$volume_id"
        else
          echo "PV ${pv_name} in namespace ${APP_NAMESPACE} did not expose an EBS volume ID; it will be covered by PV deletion wait only." >&2
        fi
      done \
    | sort -u
}

if ! cluster_is_active; then
  echo "EKS cluster ${CLUSTER_NAME} is not ACTIVE or is already gone; skipping Kubernetes EBS cleanup."
  exit 0
fi

ensure_cluster_admin_access

aws eks update-kubeconfig \
  --region "$AWS_REGION" \
  --name "$CLUSTER_NAME" \
  --alias "$CLUSTER_NAME" >/dev/null

wait_until "Kubernetes API access for cleanup" kubernetes_api_accessible

cleanup_volume_ids_file=false
if [[ -n "$VOLUME_IDS_FILE" ]]; then
  mkdir -p "$(dirname "$VOLUME_IDS_FILE")"
  volume_ids_file="$VOLUME_IDS_FILE"
else
  volume_ids_file=$(mktemp)
  cleanup_volume_ids_file=true
fi

if [[ "$cleanup_volume_ids_file" == "true" ]]; then
  trap 'rm -f "$volume_ids_file"' EXIT
fi

capture_app_namespace_ebs_volume_ids >"$volume_ids_file"

if [[ -s "$volume_ids_file" ]]; then
  echo "Captured Kubernetes EBS volumes for namespace ${APP_NAMESPACE}:"
  sed 's/^/- /' "$volume_ids_file"
else
  echo "No existing EBS-backed PVs found for namespace ${APP_NAMESPACE}."
fi

if kubectl get crd applications.argoproj.io >/dev/null 2>&1 && kubectl get namespace "$ARGOCD_NAMESPACE" >/dev/null 2>&1; then
  echo "Deleting Argo CD Application ${ARGOCD_NAMESPACE}/${ARGOCD_APPLICATION} to stop GitOps reconciliation before namespace cleanup."
  kubectl delete application.argoproj.io "$ARGOCD_APPLICATION" \
    --namespace "$ARGOCD_NAMESPACE" \
    --ignore-not-found=true \
    --wait=false
else
  echo "Argo CD Application CRD or namespace is absent; skipping Application deletion."
fi

if kubectl get namespace "$APP_NAMESPACE" >/dev/null 2>&1; then
  echo "Deleting application namespace ${APP_NAMESPACE}; this deletes its PVCs before Terraform removes EKS."
  kubectl delete namespace "$APP_NAMESPACE" --ignore-not-found=true --wait=false
  wait_until "namespace ${APP_NAMESPACE} to be deleted" namespace_gone
else
  echo "Application namespace ${APP_NAMESPACE} is already absent."
fi

wait_until "PVs claimed by namespace ${APP_NAMESPACE} to be deleted" app_namespace_pvs_gone

if [[ -s "$volume_ids_file" ]]; then
  while IFS= read -r volume_id; do
    [[ -n "$volume_id" ]] || continue
    wait_until "EBS volume ${volume_id} to be deleted by the Kubernetes reclaim policy" volume_deleted "$volume_id"
  done <"$volume_ids_file"
fi

echo "Kubernetes EBS pre-destroy cleanup completed."
