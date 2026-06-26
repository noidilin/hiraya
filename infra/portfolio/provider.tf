terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }

    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }

  backend "s3" {}
}

provider "aws" {
  region = var.region

  skip_credentials_validation = var.skip_aws_credentials_validation
  skip_requesting_account_id  = var.skip_aws_credentials_validation
}

provider "aws" {
  alias  = "use1"
  region = "us-east-1"

  skip_credentials_validation = var.skip_aws_credentials_validation
  skip_requesting_account_id  = var.skip_aws_credentials_validation
}
