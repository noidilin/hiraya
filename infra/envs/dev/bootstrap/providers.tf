provider "aws" {
  region = var.aws_region

  skip_credentials_validation = var.skip_aws_credentials_validation
  skip_requesting_account_id  = var.skip_aws_credentials_validation
}
