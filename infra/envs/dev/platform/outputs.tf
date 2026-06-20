output "cluster_name" {
  value = module.eks.cluster_name
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

output "argocd_namespace" {
  value = module.argocd.namespace
}

output "argocd_application_name" {
  value = module.argocd.gitops_application_name
}
