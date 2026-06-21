#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-ap-northeast-1}"
PLATFORM_DIR="${PLATFORM_DIR:-infra/envs/dev/platform}"

require_output() {
  local name="$1"
  local value
  value=$(terraform -chdir="$PLATFORM_DIR" output -raw "$name" 2>/dev/null || true)
  if [[ -z "$value" ]]; then
    echo "Required Terraform output ${name} was empty; cannot run platform smoke checks." >&2
    exit 1
  fi
  printf '%s' "$value"
}

wait_for_http_route() {
  local name="$1"
  local url="$2"
  local accepted_codes="$3"
  local attempts="${4:-30}"
  local delay_seconds="${5:-20}"

  echo "Checking ${name} route: ${url}"
  for ((attempt = 1; attempt <= attempts; attempt++)); do
    local code
    code=$(curl --silent --show-error --location --max-time 15 --output /dev/null --write-out '%{http_code}' "$url" || true)

    if [[ " ${accepted_codes} " == *" ${code} "* ]]; then
      echo "${name} route is reachable with HTTP ${code}."
      return 0
    fi

    if (( attempt == attempts )); then
      echo "${name} route did not become healthy. Last HTTP status: ${code:-curl-failed}" >&2
      return 1
    fi

    echo "Waiting for ${name} route (${attempt}/${attempts}); last HTTP status: ${code:-curl-failed}."
    sleep "$delay_seconds"
  done
}

CLUSTER_NAME=$(require_output cluster_name)
EDGE_GATEWAY_NAMESPACE=$(require_output edge_gateway_namespace)
EDGE_GATEWAY_NAME=$(require_output edge_gateway_name)
APP_HOSTNAME=$(require_output app_hostname)
ARGOCD_HOSTNAME=$(require_output argocd_admin_hostname)
GRAFANA_HOSTNAME=$(require_output grafana_hostname)

APP_URL="https://${APP_HOSTNAME}"
ARGOCD_URL="https://${ARGOCD_HOSTNAME}"
GRAFANA_URL="https://${GRAFANA_HOSTNAME}"

echo "Updating kubeconfig for EKS cluster ${CLUSTER_NAME} in ${AWS_REGION}."
aws eks update-kubeconfig --region "$AWS_REGION" --name "$CLUSTER_NAME" >/dev/null

echo "Verifying EKS API and node reachability."
kubectl get nodes -o wide

echo "Verifying core Kubernetes workload visibility."
kubectl get pods -A

echo "Verifying shared Gateway visibility."
kubectl get gateway -A
kubectl get httproute -A
kubectl get gateway -n "$EDGE_GATEWAY_NAMESPACE" "$EDGE_GATEWAY_NAME" -o wide

echo "Verifying expected namespaces are visible."
kubectl get namespace vintage argocd monitoring --show-labels

# Do not read or print sensitive Terraform outputs such as Argo CD or Grafana admin passwords.
wait_for_http_route "Vintage Storefront" "$APP_URL" "200 204 301 302"
wait_for_http_route "Argo CD" "$ARGOCD_URL" "200 301 302 401 403"
wait_for_http_route "Grafana" "$GRAFANA_URL" "200 301 302 401 403"

echo "Dev platform route-health smoke checks passed."
