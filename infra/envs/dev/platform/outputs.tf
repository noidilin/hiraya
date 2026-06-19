output "cluster_name" {
  value = module.eks.cluster_name
}

output "cluster_endpoint" {
  value = module.eks.cluster_endpoint
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
