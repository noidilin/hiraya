output "argocd_namespace" {
  description = "Cluster Bootstrap-owned namespace where Argo CD is installed."
  value       = kubernetes_namespace_v1.argocd.metadata[0].name
}

output "argocd_release_name" {
  description = "Argo CD Helm release installed by Cluster Bootstrap."
  value       = helm_release.argocd.name
}

output "platform_project_name" {
  description = "Argo CD AppProject for Cluster Platform and root app-of-apps resources."
  value       = var.platform_project_name
}

output "workloads_project_name" {
  description = "Argo CD AppProject for workload applications."
  value       = var.workloads_project_name
}

output "root_application_name" {
  description = "Root Argo CD Application handed off to GitOps."
  value       = "hiraya-root"
}
