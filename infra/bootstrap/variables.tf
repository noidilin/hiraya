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

variable "repositories" {
  description = "Durable ECR repositories preserved outside the disposable EKS stack."
  type        = list(string)
  default = [
    "frontend",
    "gateway",
    "auth",
    "order-service",
    "orders",
    "product-service",
    "user-service"
  ]
}

variable "github_repository" {
  description = "GitHub owner/repository slug allowed to assume OIDC roles."
  type        = string
  default     = "noidilin/hiraya"
}

variable "tags" {
  description = "Additional tags for bootstrap resources."
  type        = map(string)
  default     = {}
}
