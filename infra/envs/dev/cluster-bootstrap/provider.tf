provider "aws" {
  region = var.region

  skip_credentials_validation = var.skip_aws_credentials_validation
  skip_requesting_account_id  = var.skip_aws_credentials_validation
}

provider "kubernetes" {
  host                   = data.terraform_remote_state.platform_core.outputs.cluster_endpoint
  cluster_ca_certificate = base64decode(data.terraform_remote_state.platform_core.outputs.cluster_certificate_authority_data)

  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args = [
      "eks",
      "get-token",
      "--cluster-name",
      data.terraform_remote_state.platform_core.outputs.cluster_name,
      "--region",
      data.terraform_remote_state.platform_core.outputs.region,
    ]
  }
}

provider "helm" {
  kubernetes {
    host                   = data.terraform_remote_state.platform_core.outputs.cluster_endpoint
    cluster_ca_certificate = base64decode(data.terraform_remote_state.platform_core.outputs.cluster_certificate_authority_data)

    exec {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "aws"
      args = [
        "eks",
        "get-token",
        "--cluster-name",
        data.terraform_remote_state.platform_core.outputs.cluster_name,
        "--region",
        data.terraform_remote_state.platform_core.outputs.region,
      ]
    }
  }
}
