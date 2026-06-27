locals {
  name_prefix               = "devops-${var.project_name}-${var.environment}"
  runtime_boundary_arn      = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/lab-devops-permissions-boundary"
  gitops_apply_boundary_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/lab-gitops-oidc-apply-permissions-boundary"

  terraform_state_keys = {
    bootstrap         = "${local.name_prefix}/${var.environment}/bootstrap/terraform.tfstate"
    platform_core     = "${local.name_prefix}/${var.environment}/platform-core/terraform.tfstate"
    cluster_bootstrap = "${local.name_prefix}/${var.environment}/cluster-bootstrap/terraform.tfstate"
    portfolio         = "${local.name_prefix}/${var.environment}/portfolio/terraform.tfstate"
  }

  terraform_state_lockfile_keys = {
    for name, key in local.terraform_state_keys : name => "${key}.tflock"
  }

  platform_state_list_prefixes = [
    local.terraform_state_keys.bootstrap,
    local.terraform_state_keys.platform_core,
    local.terraform_state_keys.cluster_bootstrap,
    local.terraform_state_lockfile_keys.bootstrap,
    local.terraform_state_lockfile_keys.platform_core,
    local.terraform_state_lockfile_keys.cluster_bootstrap,
  ]

  portfolio_state_list_prefixes = [
    local.terraform_state_keys.bootstrap,
    local.terraform_state_keys.portfolio,
    local.terraform_state_lockfile_keys.bootstrap,
    local.terraform_state_lockfile_keys.portfolio,
  ]

  terraform_state_object_arns = {
    for name, key in local.terraform_state_keys : name => "arn:aws:s3:::${var.state_bucket_name}/${key}"
  }

  terraform_state_lockfile_object_arns = {
    for name, key in local.terraform_state_lockfile_keys : name => "arn:aws:s3:::${var.state_bucket_name}/${key}"
  }

  platform_core_state_mutation_object_arns = [
    local.terraform_state_object_arns.platform_core,
    local.terraform_state_lockfile_object_arns.platform_core,
  ]

  platform_core_state_read_object_arns = [
    local.terraform_state_object_arns.bootstrap,
    local.terraform_state_object_arns.platform_core,
  ]

  cluster_bootstrap_state_mutation_object_arns = [
    local.terraform_state_object_arns.cluster_bootstrap,
    local.terraform_state_lockfile_object_arns.cluster_bootstrap,
  ]

  cluster_bootstrap_state_read_object_arns = [
    local.terraform_state_object_arns.bootstrap,
    local.terraform_state_object_arns.platform_core,
  ]

  portfolio_state_mutation_object_arns = [
    local.terraform_state_object_arns.portfolio,
    local.terraform_state_lockfile_object_arns.portfolio,
  ]

  portfolio_state_read_object_arns = [
    local.terraform_state_object_arns.bootstrap,
    local.terraform_state_object_arns.portfolio,
  ]

  portfolio_role_arn_pattern            = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${local.name_prefix}-portfolio-*"
  portfolio_policy_arn_pattern          = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/${local.name_prefix}-portfolio-*"
  portfolio_lambda_arn_pattern          = "arn:aws:lambda:${var.aws_region}:${data.aws_caller_identity.current.account_id}:function:${local.name_prefix}-portfolio-*"
  portfolio_site_bucket_arn             = "arn:aws:s3:::${local.name_prefix}-portfolio-site"
  portfolio_site_object_arn             = "arn:aws:s3:::${local.name_prefix}-portfolio-site/*"
  portfolio_knowledge_bucket_arn        = "arn:aws:s3:::${local.name_prefix}-portfolio-knowledge"
  portfolio_knowledge_object_arn        = "arn:aws:s3:::${local.name_prefix}-portfolio-knowledge/*"
  portfolio_vector_bucket_arn           = "arn:aws:s3vectors:${var.aws_region}:${data.aws_caller_identity.current.account_id}:bucket/${local.name_prefix}-portfolio-vectors"
  portfolio_vector_index_arn            = "${local.portfolio_vector_bucket_arn}/index/hiraya-guide-index"
  portfolio_acm_certificate_arn_pattern = "arn:aws:acm:us-east-1:${data.aws_caller_identity.current.account_id}:certificate/*"
  portfolio_apigateway_arn_pattern      = "arn:aws:apigateway:${var.aws_region}::/apis*"
  portfolio_bedrock_arn_patterns        = ["arn:aws:bedrock:${var.aws_region}:${data.aws_caller_identity.current.account_id}:knowledge-base/*", "arn:aws:bedrock:${var.aws_region}:${data.aws_caller_identity.current.account_id}:guardrail/*"]
  portfolio_cloudfront_arn_patterns     = ["arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:distribution/*", "arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:origin-access-control/*", "arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:function/${local.name_prefix}-portfolio-*"]
  portfolio_log_group_arn_pattern       = "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${local.name_prefix}-portfolio-*"
  portfolio_origin_secret_arn_pattern   = "arn:aws:secretsmanager:${var.aws_region}:${data.aws_caller_identity.current.account_id}:secret:/hiraya/${var.environment}/portfolio/*"

  platform_role_arn_pattern          = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${local.name_prefix}-*"
  platform_policy_arn_pattern        = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/${local.name_prefix}-*"
  platform_oidc_provider_arn_pattern = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/oidc.eks.${var.aws_region}.amazonaws.com/id/*"
  argocd_admin_secret_arn_pattern    = "arn:aws:secretsmanager:${var.aws_region}:${data.aws_caller_identity.current.account_id}:secret:/hiraya/${var.environment}/platform/argocd-admin-*"

  backend_configs = {
    platform-core = {
      bucket       = var.state_bucket_name
      key          = local.terraform_state_keys.platform_core
      region       = var.aws_region
      use_lockfile = true
      encrypt      = true
    }
    cluster-bootstrap = {
      bucket       = var.state_bucket_name
      key          = local.terraform_state_keys.cluster_bootstrap
      region       = var.aws_region
      use_lockfile = true
      encrypt      = true
    }
    portfolio = {
      bucket       = var.state_bucket_name
      key          = local.terraform_state_keys.portfolio
      region       = var.aws_region
      use_lockfile = true
      encrypt      = true
    }
  }

  vintage_secret_name = "/hiraya/${var.environment}/apps/vintage"

  common_tags = merge(var.tags, {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    Component   = "bootstrap"
  })
}
