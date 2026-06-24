data "aws_caller_identity" "current" {}

locals {
  bootstrap_state_bucket = coalesce(var.bootstrap_state_bucket, "devops-hiraya-dev-tf-state")
  runtime_boundary_arn   = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/lab-devops-permissions-boundary"

  common_tags = {
    Project     = "hiraya"
    Environment = "dev"
    ManagedBy   = "terraform"
    Component   = "platform-core"
  }
}

data "terraform_remote_state" "bootstrap" {
  backend = "s3"

  config = {
    bucket = local.bootstrap_state_bucket
    key    = var.bootstrap_state_key
    region = var.bootstrap_state_region
  }
}

module "vpc" {
  source = "../../../modules/vpc"

  vpc_name             = var.vpc_name
  cidr_block           = var.vpc_cidr
  availability_zones   = var.availability_zones
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  cluster_name         = var.cluster_name
  enable_flow_logs     = var.enable_vpc_flow_logs
}

module "eks" {
  source = "../../../modules/eks"

  cluster_name    = var.cluster_name
  node_group_name = var.node_group_name

  instance_types = var.instance_types
  capacity_type  = var.capacity_type
  disk_size      = var.disk_size
  min_size       = var.min_size
  desired_size   = var.desired_size
  max_size       = var.max_size

  subnet_ids                   = module.vpc.private_subnet_ids
  endpoint_private_access      = var.eks_endpoint_private_access
  endpoint_public_access       = var.eks_endpoint_public_access
  endpoint_public_access_cidrs = var.eks_endpoint_public_access_cidrs
  cluster_admin_principal_arns = toset(concat(
    [data.terraform_remote_state.bootstrap.outputs.github_cluster_bootstrap_role_arn],
    var.cluster_admin_principal_arns,
  ))

  depends_on = [module.vpc]
}

module "edge_certificate" {
  source = "../../../modules/acm-public-cert"

  zone_name                 = var.public_zone_name
  domain_name               = var.public_domain_name
  subject_alternative_names = ["*.${var.public_domain_name}"]
}

module "platform_admin_secrets" {
  source = "../../../modules/platform-admin-secrets"

  environment                  = "dev"
  argocd_admin_secret_name     = var.argocd_admin_secret_name
  grafana_admin_secret_name    = var.grafana_admin_secret_name
  argocd_admin_rotation_epoch  = var.argocd_admin_rotation_epoch
  grafana_admin_rotation_epoch = var.grafana_admin_rotation_epoch
  tags                         = local.common_tags
}

module "aws_load_balancer_controller_irsa" {
  source = "../../../modules/aws-load-balancer-controller-irsa"

  cluster_name             = var.cluster_name
  oidc_provider_arn        = module.eks.oidc_provider_arn
  oidc_issuer_url          = module.eks.oidc_issuer_url
  permissions_boundary_arn = local.runtime_boundary_arn
  tags                     = local.common_tags

  depends_on = [module.eks]
}

module "external_dns_irsa" {
  source = "../../../modules/external-dns-irsa"

  cluster_name             = var.cluster_name
  oidc_provider_arn        = module.eks.oidc_provider_arn
  oidc_issuer_url          = module.eks.oidc_issuer_url
  hosted_zone_name         = var.public_zone_name
  permissions_boundary_arn = local.runtime_boundary_arn
  tags                     = local.common_tags

  depends_on = [module.eks]
}

module "fluent_bit_irsa" {
  source = "../../../modules/fluent-bit-irsa"

  cluster_name             = var.cluster_name
  region                   = var.region
  oidc_provider_arn        = module.eks.oidc_provider_arn
  oidc_issuer_url          = module.eks.oidc_issuer_url
  log_group_name           = var.pod_log_group_name
  log_retention_days       = var.pod_log_retention_days
  permissions_boundary_arn = local.runtime_boundary_arn
  tags                     = local.common_tags

  depends_on = [module.eks]
}

module "external_secrets_irsa" {
  source = "../../../modules/external-secrets-irsa"

  cluster_name             = var.cluster_name
  oidc_provider_arn        = module.eks.oidc_provider_arn
  oidc_issuer_url          = module.eks.oidc_issuer_url
  permissions_boundary_arn = local.runtime_boundary_arn
  secret_arns = [
    module.platform_admin_secrets.argocd_admin_secret_arn,
    module.platform_admin_secrets.grafana_admin_secret_arn,
    data.terraform_remote_state.bootstrap.outputs.vintage_secret_arn,
  ]
  tags = local.common_tags

  depends_on = [module.eks, module.platform_admin_secrets]
}
