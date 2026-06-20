output "namespace" {
  description = "Kubernetes namespace where Argo CD is installed."
  value       = kubernetes_namespace_v1.argocd.metadata[0].name
}

output "gitops_application_name" {
  description = "Name of the bootstrap Argo CD Application."
  value       = var.gitops_application_enabled ? local.gitops_application.metadata.name : null
}

output "admin_hostname" {
  description = "Public hostname for the Argo CD admin UI."
  value       = var.admin_hostname
}

output "admin_password" {
  description = "Generated Argo CD admin password. Stored in Terraform state and marked sensitive in outputs."
  value       = random_password.argocd_admin.result
  sensitive   = true
}
