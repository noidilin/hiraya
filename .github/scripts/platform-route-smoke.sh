#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-ap-northeast-1}"
PLATFORM_DIR="${PLATFORM_DIR:-infra/envs/dev/platform-core}"

REQUIRED_NAMESPACES=(
  argocd
  edge
  monitoring
  vintage
  external-dns
  external-secrets
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
    local routes_file route_count accepted_count
    routes_file=$(mktemp)

    if ! kubectl get httproute -A -o json >"$routes_file" 2>/dev/null; then
      printf '{"items":[]}' >"$routes_file"
    fi

    if ! route_count=$(jq -r '(.items // []) | length' "$routes_file"); then
      echo "Failed to parse HTTPRoute JSON from kubectl." >&2
      rm -f "$routes_file"
      kubectl get httproute -A -o yaml >&2 || true
      return 1
    fi

    if ! accepted_count=$(jq -r '[.items[]? | select(any(.status.parents[]?.conditions[]?; .type == "Accepted" and .status == "True"))] | length' "$routes_file"); then
      echo "Failed to evaluate HTTPRoute Accepted conditions." >&2
      rm -f "$routes_file"
      kubectl get httproute -A -o yaml >&2 || true
      return 1
    fi

    rm -f "$routes_file"

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

list_expected_argocd_applications() {
  printf '%s\n' hiraya-root
  kubectl kustomize gitops/clusters/dev/root \
    | awk '
      /^kind:[[:space:]]*Application[[:space:]]*$/ { in_app = 1; in_meta = 0; next }
      /^---[[:space:]]*$/ { in_app = 0; in_meta = 0; next }
      in_app && /^metadata:[[:space:]]*$/ { in_meta = 1; next }
      in_app && in_meta && /^[^[:space:]]/ { in_meta = 0 }
      in_app && in_meta && /^[[:space:]]+name:[[:space:]]*/ {
        name = $0
        sub(/^[[:space:]]+name:[[:space:]]*/, "", name)
        gsub(/[\"'"'"']/, "", name)
        print name
      }
    '
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
while IFS= read -r app_name; do
  [[ -n "$app_name" ]] || continue
  wait_for_argocd_application "$app_name"
done < <(list_expected_argocd_applications)
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
