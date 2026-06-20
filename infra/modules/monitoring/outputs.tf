output "namespace" {
  description = "Kubernetes namespace where kube-prometheus-stack is installed."
  value       = kubernetes_namespace_v1.monitoring.metadata[0].name
}

output "helm_release_name" {
  description = "Helm release name for kube-prometheus-stack."
  value       = helm_release.monitoring.name
}

output "grafana_route_name" {
  description = "Name of the Grafana HTTPRoute Helm release."
  value       = helm_release.grafana_route.name
}

output "grafana_admin_password" {
  description = "Generated Grafana admin password for the dev platform. Stored in Terraform state."
  value       = random_password.grafana_admin.result
  sensitive   = true
}
