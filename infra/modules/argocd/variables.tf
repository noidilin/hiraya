variable "gitops_application_enabled" {
  description = "Whether the Argo CD Helm release should bootstrap the root GitOps Application."
  type        = bool
  default     = true
}

variable "gitops_application_name" {
  description = "Name of the Argo CD Application that bootstraps application GitOps."
  type        = string
  default     = "vintage"
}

variable "gitops_repo_url" {
  description = "Git repository URL watched by the bootstrap Argo CD Application."
  type        = string
}

variable "gitops_target_revision" {
  description = "Git revision watched by the bootstrap Argo CD Application."
  type        = string
  default     = "main"
}

variable "gitops_path" {
  description = "Repository path containing the Kustomize application manifests."
  type        = string
  default     = "gitops"
}

variable "gitops_destination_namespace" {
  description = "Kubernetes namespace where the bootstrap Argo CD Application deploys workloads."
  type        = string
  default     = "vintage"
}
