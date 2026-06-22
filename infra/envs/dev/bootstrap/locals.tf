locals {
  name_prefix          = "devops-${var.project_name}-${var.environment}"
  runtime_boundary_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/lab-devops-permissions-boundary"

  terraform_state_keys = [
    "devops-hiraya-dev/dev/bootstrap/terraform.tfstate",
    "devops-hiraya-dev/dev/platform/terraform.tfstate",
  ]

  terraform_state_lockfile_keys = [
    for key in local.terraform_state_keys : "${key}.tflock"
  ]

  terraform_state_list_prefixes = concat(local.terraform_state_keys, local.terraform_state_lockfile_keys)

  terraform_state_object_arns = [
    for key in local.terraform_state_keys : "arn:aws:s3:::${var.state_bucket_name}/${key}"
  ]

  terraform_state_lockfile_object_arns = [
    for key in local.terraform_state_lockfile_keys : "arn:aws:s3:::${var.state_bucket_name}/${key}"
  ]

  terraform_state_mutation_object_arns = concat(local.terraform_state_object_arns, local.terraform_state_lockfile_object_arns)

  platform_role_arn_pattern          = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${local.name_prefix}-*"
  platform_policy_arn_pattern        = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/${local.name_prefix}-*"
  platform_oidc_provider_arn_pattern = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/oidc.eks.${var.aws_region}.amazonaws.com/id/*"
  eks_cluster_admin_policy_arn       = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"

  common_tags = merge(var.tags, {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    Component   = "bootstrap"
  })
}
