data "aws_caller_identity" "current" {}

locals {
  bootstrap_state_bucket = coalesce(var.bootstrap_state_bucket, "devops-hiraya-dev-tf-state")
  runtime_boundary_arn   = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/lab-devops-permissions-boundary"
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
  depends_on                   = [module.vpc]
}

module "edge_certificate" {
  source = "../../../modules/acm-public-cert"

  zone_name                 = var.public_zone_name
  domain_name               = var.public_domain_name
  subject_alternative_names = ["*.${var.public_domain_name}"]
}

data "aws_eks_cluster_auth" "eks" {
  name = module.eks.cluster_name
}

provider "kubernetes" {
  alias                  = "eks"
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
  token                  = data.aws_eks_cluster_auth.eks.token
}

provider "helm" {
  alias = "eks"

  kubernetes = {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
    token                  = data.aws_eks_cluster_auth.eks.token
  }
}

module "gateway_api_crds" {
  source = "../../../modules/gateway-api-crds"

  providers = {
    helm = helm.eks
  }

  depends_on = [module.eks]
}

module "aws_load_balancer_controller" {
  source = "../../../modules/aws-load-balancer-controller"

  providers = {
    aws        = aws
    kubernetes = kubernetes.eks
    helm       = helm.eks
  }

  cluster_name             = var.cluster_name
  region                   = var.region
  vpc_id                   = module.vpc.vpc_id
  oidc_provider_arn        = module.eks.oidc_provider_arn
  oidc_issuer_url          = module.eks.oidc_issuer_url
  permissions_boundary_arn = local.runtime_boundary_arn

  depends_on = [
    module.eks,
    module.gateway_api_crds
  ]
}

module "external_dns" {
  source = "../../../modules/external-dns"

  providers = {
    aws        = aws
    kubernetes = kubernetes.eks
    helm       = helm.eks
  }

  cluster_name             = var.cluster_name
  oidc_provider_arn        = module.eks.oidc_provider_arn
  oidc_issuer_url          = module.eks.oidc_issuer_url
  hosted_zone_name         = var.public_zone_name
  managed_domain           = var.public_domain_name
  txt_owner_id             = var.external_dns_txt_owner_id
  permissions_boundary_arn = local.runtime_boundary_arn

  depends_on = [
    module.eks,
    module.aws_load_balancer_controller
  ]
}

module "edge_gateway" {
  source = "../../../modules/edge-gateway"

  providers = {
    kubernetes = kubernetes.eks
    helm       = helm.eks
  }

  namespace                     = var.edge_gateway_namespace
  gateway_name                  = var.edge_gateway_name
  load_balancer_name            = "hiraya-dev-public"
  certificate_arn               = module.edge_certificate.certificate_arn
  domain_name                   = var.public_domain_name
  allowed_namespace_label_key   = var.public_gateway_access_label_key
  allowed_namespace_label_value = var.public_gateway_access_label_value

  depends_on = [
    module.aws_load_balancer_controller,
    module.edge_certificate,
    module.external_dns
  ]
}

module "fluent_bit" {
  source = "../../../modules/fluent-bit"

  providers = {
    aws        = aws
    kubernetes = kubernetes.eks
    helm       = helm.eks
  }

  cluster_name       = var.cluster_name
  region             = var.region
  oidc_provider_arn  = module.eks.oidc_provider_arn
  oidc_issuer_url    = module.eks.oidc_issuer_url
  log_group_name     = var.pod_log_group_name
  log_retention_days = var.pod_log_retention_days

  depends_on = [module.eks]
}

module "monitoring" {
  source = "../../../modules/monitoring"

  providers = {
    kubernetes = kubernetes.eks
    helm       = helm.eks
  }

  grafana_hostname                  = "grafana.${var.public_domain_name}"
  gateway_name                      = module.edge_gateway.gateway_name
  gateway_namespace                 = module.edge_gateway.namespace
  public_gateway_access_label_key   = var.public_gateway_access_label_key
  public_gateway_access_label_value = var.public_gateway_access_label_value

  depends_on = [module.eks, module.edge_gateway]
}

module "argocd" {
  source = "../../../modules/argocd"

  providers = {
    kubernetes = kubernetes.eks
    helm       = helm.eks
  }

  gitops_application_enabled        = var.gitops_application_enabled
  admin_hostname                    = "argocd.${var.public_domain_name}"
  gateway_name                      = module.edge_gateway.gateway_name
  gateway_namespace                 = module.edge_gateway.namespace
  public_gateway_access_label_key   = var.public_gateway_access_label_key
  public_gateway_access_label_value = var.public_gateway_access_label_value

  # The GitOps app includes a ServiceMonitor, whose CRD is installed by kube-prometheus-stack.
  # Wait for monitoring before creating the Argo CD Application object.
  depends_on = [module.eks, module.monitoring, module.edge_gateway]
}

