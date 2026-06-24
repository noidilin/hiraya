output "region" {
  description = "AWS region for the dev Platform Core."
  value       = var.region
}

output "cluster_name" {
  value = module.eks.cluster_name
}

output "cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "cluster_certificate_authority_data" {
  value = module.eks.cluster_certificate_authority_data
}

output "vpc_id" {
  description = "Disposable dev Platform Core VPC ID for smoke and destroy verification."
  value       = module.vpc.vpc_id
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

output "public_domain_name" {
  value = var.public_domain_name
}

output "app_hostname" {
  description = "Public Vintage Storefront hostname for route-health smoke checks."
  value       = var.public_domain_name
}

output "argocd_hostname" {
  description = "Public Argo CD hostname."
  value       = "argocd.${var.public_domain_name}"
}

output "grafana_hostname" {
  description = "Public Grafana hostname."
  value       = "grafana.${var.public_domain_name}"
}

output "public_gateway_access_label_key" {
  value = var.public_gateway_access_label_key
}

output "public_gateway_access_label_value" {
  value = var.public_gateway_access_label_value
}

output "edge_gateway_namespace" {
  description = "Namespace expected to contain the shared public Gateway."
  value       = var.edge_gateway_namespace
}

output "edge_gateway_name" {
  description = "Name expected for the shared public Gateway."
  value       = var.edge_gateway_name
}

output "edge_load_balancer_name" {
  description = "Name requested for the shared public AWS load balancer."
  value       = "hiraya-dev-public"
}

output "aws_load_balancer_controller_role_arn" {
  value = module.aws_load_balancer_controller_irsa.role_arn
}

output "aws_load_balancer_controller_namespace" {
  value = module.aws_load_balancer_controller_irsa.namespace
}

output "aws_load_balancer_controller_service_account_name" {
  value = module.aws_load_balancer_controller_irsa.service_account_name
}

output "external_dns_role_arn" {
  value = module.external_dns_irsa.role_arn
}

output "external_dns_namespace" {
  value = module.external_dns_irsa.namespace
}

output "external_dns_service_account_name" {
  value = module.external_dns_irsa.service_account_name
}

output "external_dns_hosted_zone_id" {
  value = module.external_dns_irsa.hosted_zone_id
}

output "external_secrets_role_arn" {
  value = module.external_secrets_irsa.role_arn
}

output "external_secrets_namespace" {
  value = module.external_secrets_irsa.namespace
}

output "external_secrets_service_account_name" {
  value = module.external_secrets_irsa.service_account_name
}

output "fluent_bit_role_arn" {
  value = module.fluent_bit_irsa.role_arn
}

output "fluent_bit_namespace" {
  value = module.fluent_bit_irsa.namespace
}

output "fluent_bit_service_account_name" {
  value = module.fluent_bit_irsa.service_account_name
}

output "pod_log_group_name" {
  value = module.fluent_bit_irsa.log_group_name
}

output "argocd_admin_secret_name" {
  value = module.platform_admin_secrets.argocd_admin_secret_name
}

output "argocd_admin_secret_arn" {
  value = module.platform_admin_secrets.argocd_admin_secret_arn
}

output "grafana_admin_secret_name" {
  value = module.platform_admin_secrets.grafana_admin_secret_name
}

output "grafana_admin_secret_arn" {
  value = module.platform_admin_secrets.grafana_admin_secret_arn
}
