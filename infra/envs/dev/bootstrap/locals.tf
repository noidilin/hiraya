locals {
  name_prefix          = "devops-${var.project_name}-${var.environment}"
  runtime_boundary_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/lab-devops-permissions-boundary"

  terraform_state_prefixes = [
    "devops-hiraya-dev/dev/bootstrap/terraform.tfstate",
    "devops-hiraya-dev/dev/platform/terraform.tfstate",
  ]

  terraform_state_object_arns = [
    for key in local.terraform_state_prefixes : "arn:aws:s3:::${var.state_bucket_name}/${key}"
  ]

  platform_role_arn_pattern          = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${local.name_prefix}-*"
  platform_policy_arn_pattern        = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/${local.name_prefix}-*"
  platform_oidc_provider_arn_pattern = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/oidc.eks.${var.aws_region}.amazonaws.com/id/*"

  common_tags = merge(var.tags, {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    Component   = "bootstrap"
  })
}
