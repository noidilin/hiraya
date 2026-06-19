variable "gitops_application_enabled" {
  description = "Whether the Argo CD Helm release should bootstrap the root GitOps Application."
  type        = bool
  default     = true
}

variable "gitops_application_manifest_path" {
  description = "Path to the Argo CD Application manifest injected into the Argo CD Helm release. Defaults to infra/modules/argocd/application.yml."
  type        = string
  default     = null
}
