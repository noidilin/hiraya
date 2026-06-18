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

output "backend_config" {
  description = "Backend config values for ../platform/backend.hcl."
  value = {
    bucket       = var.state_bucket_name
    key          = "devops-hiraya-dev/dev/platform/terraform.tfstate"
    region       = var.aws_region
    use_lockfile = true
    encrypt      = true
  }
}
