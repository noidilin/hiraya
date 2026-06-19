data "aws_caller_identity" "current" {}

locals {
  bootstrap_state_bucket = coalesce(var.bootstrap_state_bucket, "devops-hiraya-dev-tf-state")
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

  vpc_name           = var.vpc_name
  cidr_block         = var.vpc_cidr
  subnet_cidrs       = [for s in var.subnets : s.cidr_block]
  availability_zones = [for s in var.subnets : s.availability_zone]
  cluster_name       = var.cluster_name
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

  subnet_ids = module.vpc.subnet_ids
  depends_on = [module.vpc]
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

  depends_on = [module.eks]
}

module "argocd" {
  source = "../../../modules/argocd"

  providers = {
    kubernetes = kubernetes.eks
    helm       = helm.eks
  }

  gitops_application_enabled = var.gitops_application_enabled

  # The GitOps app includes a ServiceMonitor, whose CRD is installed by kube-prometheus-stack.
  # Wait for monitoring before creating the Argo CD Application object.
  depends_on = [module.eks, module.monitoring]
}

