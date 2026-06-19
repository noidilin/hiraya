output "namespace" {
  description = "Kubernetes namespace where kube-prometheus-stack is installed."
  value       = kubernetes_namespace_v1.monitoring.metadata[0].name
}

output "helm_release_name" {
  description = "Helm release name for kube-prometheus-stack."
  value       = helm_release.monitoring.name
}
