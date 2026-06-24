output "state_bucket" {
  description = "Externally managed S3 bucket name for Terraform remote state."
  value       = var.state_bucket_name
}

output "ecr_urls" {
  description = "Durable ECR repository URLs."
  value       = module.ecr.repository_urls
}

output "github_oidc_provider_arn" {
  description = "ARN of the GitHub Actions OIDC provider."
  value       = data.aws_iam_openid_connect_provider.github.arn
}

output "github_image_push_role_arn" {
  description = "GitHub Actions OIDC role ARN for pushing images to ECR."
  value       = aws_iam_role.github_image_push.arn
}

output "github_infra_plan_role_arn" {
  description = "GitHub Actions OIDC role ARN for trusted Terraform platform plans."
  value       = aws_iam_role.github_infra_plan.arn
}

output "github_infra_apply_role_arn" {
  description = "GitHub Actions OIDC role ARN for approved Platform Core apply and destroy workflows."
  value       = aws_iam_role.github_infra_apply.arn
}

output "github_cluster_bootstrap_role_arn" {
  description = "GitHub Actions OIDC role ARN for Cluster Bootstrap apply, GitOps cleanup, and smoke checks."
  value       = aws_iam_role.github_cluster_bootstrap.arn
}

output "vintage_secret_name" {
  description = "Stable AWS Secrets Manager name for durable Vintage Storefront dev runtime secrets."
  value       = aws_secretsmanager_secret.vintage.name
}

output "vintage_secret_arn" {
  description = "ARN of the durable Vintage Storefront dev runtime secret. Secret values are not output."
  value       = aws_secretsmanager_secret.vintage.arn
}

output "backend_configs" {
  description = "Backend config values for downstream Terraform states keyed by stack name."
  value       = local.backend_configs
}

output "platform_core_backend_config" {
  description = "Backend config values for ../platform-core/backend.hcl."
  value       = local.backend_configs["platform-core"]
}

output "cluster_bootstrap_backend_config" {
  description = "Backend config values for ../cluster-bootstrap/backend.hcl."
  value       = local.backend_configs["cluster-bootstrap"]
}

output "backend_config" {
  description = "Deprecated compatibility alias for platform_core_backend_config."
  value       = local.backend_configs["platform-core"]
}
