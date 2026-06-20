variable "cluster_name" {
  description = "EKS cluster name."
  type        = string
}

variable "region" {
  description = "AWS region."
  type        = string
}

variable "vpc_id" {
  description = "VPC ID used by the AWS Load Balancer Controller."
  type        = string
}

variable "oidc_provider_arn" {
  description = "EKS OIDC provider ARN for IRSA."
  type        = string
}

variable "oidc_issuer_url" {
  description = "EKS OIDC issuer URL for IRSA trust conditions."
  type        = string
}

variable "chart_version" {
  description = "AWS Load Balancer Controller Helm chart version."
  type        = string
  default     = "3.4.0"
}

variable "gateway_api_version" {
  description = "Gateway API CRD release required by the AWS Load Balancer Controller."
  type        = string
  default     = "v1.5.0"
}

variable "permissions_boundary_arn" {
  description = "Optional IAM permissions boundary for the controller IRSA role."
  type        = string
  default     = null
}

variable "tags" {
  description = "Tags applied to AWS resources."
  type        = map(string)
  default     = {}
}
