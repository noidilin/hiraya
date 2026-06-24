#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-ap-northeast-1}"
PLATFORM_DIR="${PLATFORM_DIR:-infra/envs/dev/platform-core}"

ARGO_APPLICATIONS=(
  hiraya-root
  platform-namespaces
  platform-gateway-api-crds
  platform-aws-load-balancer-controller
  platform-external-dns
  platform-external-secrets
  platform-edge
  platform-logging
  platform-monitoring
  platform-argocd-access
  vintage
)

REQUIRED_NAMESPACES=(
  argocd
  edge
  monitoring
  vintage
  external-dns
  external-secrets
  amazon-cloudwatch
)

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

wait_for_argocd_application() {
  local app_name="$1"
  local attempts="${2:-60}"
  local delay_seconds="${3:-10}"

  echo "Waiting for Argo Application ${app_name} to be Synced and Healthy."
  for ((attempt = 1; attempt <= attempts; attempt++)); do
    local sync_status health_status
    sync_status=$(kubectl get applications.argoproj.io -n argocd "$app_name" -o jsonpath='{.status.sync.status}' 2>/dev/null || true)
    health_status=$(kubectl get applications.argoproj.io -n argocd "$app_name" -o jsonpath='{.status.health.status}' 2>/dev/null || true)

    if [[ "$sync_status" == "Synced" && "$health_status" == "Healthy" ]]; then
      echo "Argo Application ${app_name} is Synced and Healthy."
      return 0
    fi

    if (( attempt == attempts )); then
      echo "Argo Application ${app_name} did not converge. sync=${sync_status:-missing} health=${health_status:-missing}" >&2
      kubectl get applications.argoproj.io -n argocd "$app_name" -o yaml >&2 || true
      return 1
    fi

    echo "Waiting for ${app_name} (${attempt}/${attempts}); sync=${sync_status:-missing} health=${health_status:-missing}."
    sleep "$delay_seconds"
  done
}

wait_for_http_routes_accepted() {
  local attempts="${1:-30}"
  local delay_seconds="${2:-20}"

  echo "Waiting for all HTTPRoutes to report Accepted=True."
  for ((attempt = 1; attempt <= attempts; attempt++)); do
    local routes_json route_count accepted_count
    routes_json=$(kubectl get httproute -A -o json 2>/dev/null || true)
    route_count=$(jq '.items | length' <<<"${routes_json:-{\"items\":[]}}")
    accepted_count=$(jq '[.items[] | select(any(.status.parents[]?.conditions[]?; .type == "Accepted" and .status == "True"))] | length' <<<"${routes_json:-{\"items\":[]}}")

    if (( route_count > 0 && accepted_count == route_count )); then
      echo "All ${route_count} HTTPRoutes are Accepted."
      return 0
    fi

    if (( attempt == attempts )); then
      echo "HTTPRoutes did not all become Accepted. accepted=${accepted_count} total=${route_count}" >&2
      kubectl get httproute -A -o yaml >&2 || true
      return 1
    fi

    echo "Waiting for HTTPRoutes (${attempt}/${attempts}); accepted=${accepted_count} total=${route_count}."
    sleep "$delay_seconds"
  done
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
ARGOCD_HOSTNAME=$(require_output argocd_hostname)
GRAFANA_HOSTNAME=$(require_output grafana_hostname)

APP_URL="https://${APP_HOSTNAME}"
ARGOCD_URL="https://${ARGOCD_HOSTNAME}"
GRAFANA_URL="https://${GRAFANA_HOSTNAME}"

echo "Updating kubeconfig for EKS cluster ${CLUSTER_NAME} in ${AWS_REGION}."
aws eks update-kubeconfig --region "$AWS_REGION" --name "$CLUSTER_NAME" >/dev/null

echo "Verifying EKS API and node readiness."
kubectl get nodes -o wide
kubectl wait node --all --for=condition=Ready --timeout=10m

echo "Verifying Argo CD Applications through Kubernetes."
for app_name in "${ARGO_APPLICATIONS[@]}"; do
  wait_for_argocd_application "$app_name"
done
kubectl get applications.argoproj.io -n argocd

echo "Verifying expected namespaces are visible."
for namespace in "${REQUIRED_NAMESPACES[@]}"; do
  kubectl get namespace "$namespace" --show-labels
done

echo "Verifying core Kubernetes workload visibility."
kubectl get pods -A

echo "Verifying shared Gateway readiness."
kubectl get gateway -A
kubectl get httproute -A
kubectl wait gateway -n "$EDGE_GATEWAY_NAMESPACE" "$EDGE_GATEWAY_NAME" --for=condition=Programmed --timeout=10m
kubectl get gateway -n "$EDGE_GATEWAY_NAMESPACE" "$EDGE_GATEWAY_NAME" -o wide
wait_for_http_routes_accepted

# Do not read or print sensitive Terraform outputs such as Argo CD or Grafana admin passwords.
wait_for_http_route "Vintage Storefront" "$APP_URL" "200 204 301 302"
wait_for_http_route "Argo CD" "$ARGOCD_URL" "200 301 302 401 403"
wait_for_http_route "Grafana" "$GRAFANA_URL" "200 301 302 401 403"

echo "Dev platform route-health smoke checks passed."
