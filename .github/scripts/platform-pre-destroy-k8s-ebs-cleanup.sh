#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-ap-northeast-1}"
CLUSTER_NAME="${CLUSTER_NAME:-}"
APP_NAMESPACE="${K8S_APP_NAMESPACE:-vintage}"
ARGOCD_NAMESPACE="${ARGOCD_NAMESPACE:-argocd}"
ROOT_ARGOCD_APPLICATION="${ROOT_ARGOCD_APPLICATION:-hiraya-root}"
EDGE_LOAD_BALANCER_NAME="${EDGE_LOAD_BALANCER_NAME:-hiraya-dev-public}"
EXTERNAL_DNS_HOSTED_ZONE_ID="${EXTERNAL_DNS_HOSTED_ZONE_ID:-}"
EXTERNAL_DNS_HOSTNAMES="${EXTERNAL_DNS_HOSTNAMES:-hiraya.noidilin.dev argocd.hiraya.noidilin.dev grafana.hiraya.noidilin.dev}"
WAIT_ATTEMPTS="${K8S_EBS_CLEANUP_WAIT_ATTEMPTS:-60}"
WAIT_DELAY_SECONDS="${K8S_EBS_CLEANUP_WAIT_DELAY_SECONDS:-10}"
VOLUME_IDS_FILE="${K8S_EBS_CLEANUP_VOLUME_IDS_FILE:-}"

if [[ -z "$CLUSTER_NAME" ]]; then
  echo "CLUSTER_NAME is required for ordered GitOps cleanup." >&2
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
  local output status exit_code

  set +e
  output=$(aws eks describe-cluster \
    --region "$AWS_REGION" \
    --name "$CLUSTER_NAME" \
    --query 'cluster.status' \
    --output text 2>&1)
  exit_code=$?
  set -e

  if [[ "$exit_code" -ne 0 ]]; then
    if grep -q "ResourceNotFoundException" <<<"$output"; then
      return 1
    fi

    echo "Failed to describe EKS cluster ${CLUSTER_NAME}; refusing to skip GitOps cleanup on an ambiguous AWS API error:" >&2
    echo "$output" >&2
    exit "$exit_code"
  fi

  status=$(awk 'NF { print $1; exit }' <<<"$output")
  if [[ -z "$status" || "$status" == "None" ]]; then
    echo "EKS describe-cluster returned an empty status for ${CLUSTER_NAME}; refusing to skip GitOps cleanup." >&2
    exit 1
  fi

  [[ "$status" == "ACTIVE" ]]
}

kubernetes_api_accessible() {
  kubectl get namespace default >/dev/null 2>&1
}

argocd_app_crd_available() {
  kubectl get crd applications.argoproj.io >/dev/null 2>&1 && kubectl get namespace "$ARGOCD_NAMESPACE" >/dev/null 2>&1
}

application_gone() {
  local app_name="$1"
  ! kubectl get application.argoproj.io "$app_name" --namespace "$ARGOCD_NAMESPACE" >/dev/null 2>&1
}

namespace_gone() {
  local namespace="$1"
  ! kubectl get namespace "$namespace" >/dev/null 2>&1
}

app_namespace_pvs_gone() {
  local remaining
  remaining=$(kubectl get pv -o jsonpath='{range .items[*]}{.spec.claimRef.namespace}{"\n"}{end}' 2>/dev/null \
    | awk -v target_namespace="$APP_NAMESPACE" '$0 == target_namespace { count++ } END { print count + 0 }')

  [[ "$remaining" == "0" ]]
}

volume_deleted() {
  local volume_id="$1"
  local output exit_code

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

load_balancer_gone() {
  ! aws elbv2 describe-load-balancers \
    --region "$AWS_REGION" \
    --names "$EDGE_LOAD_BALANCER_NAME" \
    --query 'LoadBalancers[0].State.Code' \
    --output text >/dev/null 2>&1
}

external_dns_records_gone() {
  if [[ -z "$EXTERNAL_DNS_HOSTED_ZONE_ID" ]]; then
    echo "EXTERNAL_DNS_HOSTED_ZONE_ID is empty; cannot verify Route 53 cleanup." >&2
    return 1
  fi

  local hostname record_count
  for hostname in $EXTERNAL_DNS_HOSTNAMES; do
    [[ -n "$hostname" ]] || continue
    record_count=$(aws route53 list-resource-record-sets \
      --hosted-zone-id "$EXTERNAL_DNS_HOSTED_ZONE_ID" \
      --query "length(ResourceRecordSets[?Name == '${hostname}.'])" \
      --output text)
    if [[ "$record_count" != "0" ]]; then
      echo "ExternalDNS record for ${hostname} still exists in hosted zone ${EXTERNAL_DNS_HOSTED_ZONE_ID}."
      return 1
    fi
  done

  return 0
}

suspend_root_application() {
  if ! argocd_app_crd_available; then
    echo "Argo CD Application CRD or namespace is absent; skipping root Application suspension."
    return 0
  fi

  if ! kubectl get application.argoproj.io "$ROOT_ARGOCD_APPLICATION" --namespace "$ARGOCD_NAMESPACE" >/dev/null 2>&1; then
    echo "Root Argo CD Application ${ARGOCD_NAMESPACE}/${ROOT_ARGOCD_APPLICATION} is already absent."
    return 0
  fi

  echo "Suspending root Argo CD Application ${ARGOCD_NAMESPACE}/${ROOT_ARGOCD_APPLICATION} and deleting it without cascading child resources."
  kubectl patch application.argoproj.io "$ROOT_ARGOCD_APPLICATION" \
    --namespace "$ARGOCD_NAMESPACE" \
    --type merge \
    --patch '{"spec":{"syncPolicy":null},"metadata":{"finalizers":null}}' >/dev/null
  kubectl delete application.argoproj.io "$ROOT_ARGOCD_APPLICATION" \
    --namespace "$ARGOCD_NAMESPACE" \
    --ignore-not-found=true \
    --wait=false
  wait_until "root Argo CD Application ${ROOT_ARGOCD_APPLICATION} to be deleted without cascading children" application_gone "$ROOT_ARGOCD_APPLICATION"
}

delete_child_application() {
  local app_name="$1"

  if ! argocd_app_crd_available; then
    echo "Argo CD Application CRD or namespace is absent; skipping child Application ${app_name}."
    return 0
  fi

  if ! kubectl get application.argoproj.io "$app_name" --namespace "$ARGOCD_NAMESPACE" >/dev/null 2>&1; then
    echo "Child Argo CD Application ${ARGOCD_NAMESPACE}/${app_name} is already absent."
    return 0
  fi

  echo "Deleting child Argo CD Application ${ARGOCD_NAMESPACE}/${app_name}."
  kubectl delete application.argoproj.io "$app_name" \
    --namespace "$ARGOCD_NAMESPACE" \
    --ignore-not-found=true \
    --wait=false
  wait_until "child Argo CD Application ${app_name} to prune and disappear" application_gone "$app_name"
}

wait_for_vintage_storage_cleanup() {
  if kubectl get namespace "$APP_NAMESPACE" >/dev/null 2>&1; then
    echo "Deleting Vintage namespace ${APP_NAMESPACE} after workload Application prune to release PVCs."
    kubectl delete namespace "$APP_NAMESPACE" --ignore-not-found=true --wait=false
    wait_until "namespace ${APP_NAMESPACE} to be deleted" namespace_gone "$APP_NAMESPACE"
  else
    echo "Vintage namespace ${APP_NAMESPACE} is already absent."
  fi

  wait_until "PVs claimed by namespace ${APP_NAMESPACE} to be deleted" app_namespace_pvs_gone

  if [[ -s "$volume_ids_file" ]]; then
    while IFS= read -r volume_id; do
      [[ -n "$volume_id" ]] || continue
      wait_until "EBS volume ${volume_id} to be deleted by the Kubernetes reclaim policy" volume_deleted "$volume_id"
    done <"$volume_ids_file"
  fi
}

wait_for_alb_cleanup() {
  wait_until "shared public ALB ${EDGE_LOAD_BALANCER_NAME} to be deleted by AWS Load Balancer Controller" load_balancer_gone
}

wait_for_external_dns_cleanup() {
  wait_until "ExternalDNS-managed public Route 53 records to be deleted" external_dns_records_gone
}

if ! cluster_is_active; then
  echo "EKS cluster ${CLUSTER_NAME} is not ACTIVE or is already gone; skipping ordered GitOps cleanup."
  exit 0
fi

aws eks update-kubeconfig \
  --region "$AWS_REGION" \
  --name "$CLUSTER_NAME" \
  --alias "$CLUSTER_NAME" >/dev/null

wait_until "Kubernetes API access for ordered GitOps cleanup" kubernetes_api_accessible

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

suspend_root_application

# Workloads and routes first, while controllers are still reconciling cleanup.
delete_child_application vintage
wait_for_vintage_storage_cleanup

delete_child_application platform-storage
delete_child_application platform-argocd-access
delete_child_application platform-monitoring
delete_child_application platform-edge
wait_for_alb_cleanup
wait_for_external_dns_cleanup

# Non-edge platform add-ons after controller-managed cloud resources are gone.
delete_child_application platform-logging
delete_child_application platform-external-secrets
delete_child_application platform-external-dns
delete_child_application platform-aws-load-balancer-controller
delete_child_application platform-namespaces
delete_child_application platform-gateway-api-crds

echo "Ordered GitOps pre-destroy cleanup completed."
