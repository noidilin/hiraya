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

variable "managed_domain" {
  description = "DNS suffix ExternalDNS is allowed to reconcile from HTTPRoute hostnames."
  type        = string
}

variable "txt_owner_id" {
  description = "TXT registry owner ID for ExternalDNS record ownership."
  type        = string
}

variable "permissions_boundary_arn" {
  description = "Optional IAM permissions boundary ARN for the ExternalDNS role."
  type        = string
  default     = null
}

variable "chart_version" {
  description = "ExternalDNS Helm chart version."
  type        = string
  default     = "1.20.0"
}

variable "tags" {
  description = "Tags applied to AWS IAM resources."
  type        = map(string)
  default     = {}
}
