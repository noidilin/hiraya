variable "cluster_name" {
  description = "Name of the EKS cluster shipping pod logs."
  type        = string
}

variable "region" {
  description = "AWS region for CloudWatch Logs and the Fluent Bit CloudWatch output."
  type        = string
}

variable "oidc_provider_arn" {
  description = "ARN of the EKS cluster IAM OIDC provider used for IRSA."
  type        = string
}

variable "oidc_issuer_url" {
  description = "Issuer URL of the EKS cluster IAM OIDC provider."
  type        = string
}

variable "log_group_name" {
  description = "CloudWatch Logs log group that receives Kubernetes pod logs."
  type        = string
  default     = "/eks/vintage/pods"
}

variable "log_retention_days" {
  description = "Retention period in days for the pod log group."
  type        = number
  default     = 14
}

variable "log_stream_prefix" {
  description = "Prefix for CloudWatch Logs streams created by aws-for-fluent-bit."
  type        = string
  default     = "from-fluent-bit-"
}

variable "chart_version" {
  description = "aws-for-fluent-bit Helm chart version."
  type        = string
  default     = "0.2.0"
}

variable "permissions_boundary_arn" {
  description = "Optional IAM permissions boundary for the Fluent Bit IRSA role. Defaults to the project lab boundary."
  type        = string
  default     = null
}

variable "tags" {
  description = "Tags to apply to AWS resources created by this module."
  type        = map(string)
  default     = {}
}
