variable "cluster_name" {
  description = "EKS cluster name used to name External Secrets IAM resources."
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

variable "secret_arns" {
  description = "Secrets Manager ARNs that External Secrets Operator may read."
  type        = list(string)

  validation {
    condition     = length(var.secret_arns) > 0
    error_message = "At least one secret ARN must be allowlisted."
  }
}

variable "permissions_boundary_arn" {
  description = "Optional IAM permissions boundary ARN for the External Secrets role."
  type        = string
  default     = null
}

variable "tags" {
  description = "Tags applied to AWS IAM resources."
  type        = map(string)
  default     = {}
}
