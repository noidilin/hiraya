variable "environment" {
  description = "Environment name used in secret descriptions."
  type        = string
  default     = "dev"
}

variable "argocd_admin_secret_name" {
  description = "Stable Secrets Manager name for the Argo CD admin JSON secret."
  type        = string
  default     = "/hiraya/dev/platform/argocd-admin"
}

variable "grafana_admin_secret_name" {
  description = "Stable Secrets Manager name for the Grafana admin JSON secret."
  type        = string
  default     = "/hiraya/dev/platform/grafana-admin"
}

variable "argocd_admin_rotation_epoch" {
  description = "Manual rotation keeper for Argo CD admin credentials."
  type        = string
  default     = "1"
}

variable "grafana_admin_rotation_epoch" {
  description = "Manual rotation keeper for Grafana admin credentials."
  type        = string
  default     = "1"
}

variable "tags" {
  description = "Tags applied to admin secrets."
  type        = map(string)
  default     = {}
}
