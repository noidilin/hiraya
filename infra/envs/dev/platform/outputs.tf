output "cluster_name" {
  value = module.eks.cluster_name
}

output "vpc_id" {
  description = "Disposable dev platform VPC ID for smoke and destroy verification."
  value       = module.vpc.vpc_id
}

output "edge_gateway_namespace" {
  description = "Namespace containing the shared public Gateway."
  value       = module.edge_gateway.namespace
}

output "edge_gateway_name" {
  description = "Name of the shared public Gateway."
  value       = module.edge_gateway.gateway_name
}

output "edge_load_balancer_name" {
  description = "Name requested for the shared public AWS load balancer."
  value       = "hiraya-dev-public"
}

output "app_hostname" {
  description = "Public Vintage Storefront hostname for route-health smoke checks."
  value       = var.public_domain_name
}

output "grafana_hostname" {
  description = "Public Grafana hostname for route-health smoke checks."
  value       = "grafana.${var.public_domain_name}"
}

output "cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "public_subnet_ids" {
  value = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  value = module.vpc.private_subnet_ids
}

output "s3_gateway_endpoint_id" {
  value = module.vpc.s3_gateway_endpoint_id
}

output "ecr_urls" {
  value = data.terraform_remote_state.bootstrap.outputs.ecr_urls
}

output "pod_log_group_name" {
  value = module.fluent_bit.log_group_name
}

output "fluent_bit_role_arn" {
  value = module.fluent_bit.iam_role_arn
}

output "monitoring_namespace" {
  value = module.monitoring.namespace
}

output "grafana_admin_password" {
  value     = module.monitoring.grafana_admin_password
  sensitive = true
}

output "argocd_namespace" {
  value = module.argocd.namespace
}

output "argocd_application_name" {
  value = module.argocd.gitops_application_name
}

output "argocd_admin_hostname" {
  value = module.argocd.admin_hostname
}

output "argocd_admin_password" {
  value     = module.argocd.admin_password
  sensitive = true
}
