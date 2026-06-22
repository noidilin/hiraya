variable "aws_region" {
  description = "AWS region for the Terraform state bucket."
  type        = string
  default     = "ap-northeast-1"
}

variable "project_name" {
  description = "Project name used in backend resource names and tags."
  type        = string
  default     = "hiraya"
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
  default     = "dev"
}

variable "state_bucket_name" {
  description = "Externally managed S3 bucket used for Terraform remote state. This stack does not create or destroy it."
  type        = string
  default     = "devops-hiraya-dev-tf-state"
}

variable "repositories" {
  description = "Durable ECR repositories preserved outside the disposable EKS stack."
  type        = list(string)
  default = [
    "hiraya-frontend",
    "hiraya-gateway",
    "hiraya-auth",
    "hiraya-order-service",
    "hiraya-orders",
    "hiraya-product-service",
    "hiraya-user-service"
  ]
}

variable "github_repository" {
  description = "GitHub owner/repository slug allowed to assume OIDC roles."
  type        = string
  default     = "noidilin/hiraya"
}

variable "platform_cluster_name" {
  description = "Disposable dev EKS cluster that the GitHub infra apply role administers for Terraform Kubernetes and Helm operations."
  type        = string
  default     = "devops-hiraya-dev-eks"
}

variable "manage_platform_cluster_access" {
  description = "Whether bootstrap should register the GitHub infra apply role as a cluster admin on an already-existing disposable dev EKS cluster. Enable only while that cluster exists."
  type        = bool
  default     = false
}

variable "tags" {
  description = "Additional tags for bootstrap resources."
  type        = map(string)
  default     = {}
}

variable "skip_aws_credentials_validation" {
  description = "Skip AWS provider credential validation for static CI checks that must not request AWS credentials."
  type        = bool
  default     = false
}
