output "namespace" {
  description = "Namespace containing shared edge Gateway resources."
  value       = kubernetes_namespace_v1.edge.metadata[0].name
}

output "gateway_name" {
  description = "Shared public Gateway name."
  value       = var.gateway_name
}
