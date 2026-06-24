variable "cluster_name" {
  description = "EKS cluster name used to name ExternalDNS IAM resources."
  type        = string
}

variable "oidc_provider_arn" {
  description = "ARN of the EKS OIDC provider for IRSA."
  type        = string
}

variable "oidc_issuer_url" {
  description = "Issuer URL of the EKS OIDC provider for IRSA trust conditions."
  type        = string
}

variable "hosted_zone_name" {
  description = "Public Route 53 hosted zone where ExternalDNS may manage records."
  type        = string
}

variable "permissions_boundary_arn" {
  description = "Optional IAM permissions boundary ARN for the ExternalDNS role."
  type        = string
  default     = null
}

variable "tags" {
  description = "Tags applied to AWS IAM resources."
  type        = map(string)
  default     = {}
}
