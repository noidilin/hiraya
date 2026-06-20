variable "namespace" {
  description = "Namespace used by the Gateway API CRD Helm release."
  type        = string
  default     = "kube-system"
}

variable "enable_validation_resources" {
  description = "Whether to install upstream Gateway API validation resources."
  type        = bool
  default     = true
}
