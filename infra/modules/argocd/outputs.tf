output "namespace" {
  description = "Kubernetes namespace where Argo CD is installed."
  value       = kubernetes_namespace_v1.argocd.metadata[0].name
}

output "gitops_application_name" {
  description = "Name of the bootstrap Argo CD Application."
  value       = var.gitops_application_enabled ? local.gitops_application.metadata.name : null
}
