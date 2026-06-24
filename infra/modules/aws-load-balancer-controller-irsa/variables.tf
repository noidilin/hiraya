variable "cluster_name" {
  description = "EKS cluster name."
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
