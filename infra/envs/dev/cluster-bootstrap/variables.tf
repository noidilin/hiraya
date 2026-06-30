variable "region" {
  description = "AWS region for the dev Cluster Bootstrap stack."
  type        = string
  default     = "ap-northeast-1"
}

variable "bootstrap_state_bucket" {
  description = "Externally managed S3 bucket containing Project Bootstrap Terraform state."
  type        = string
  default     = "devops-hiraya-dev-tf-state"
}

variable "bootstrap_state_key" {
  description = "S3 key for Project Bootstrap Terraform state."
  type        = string
  default     = "devops-hiraya-dev/dev/bootstrap/terraform.tfstate"
}

variable "bootstrap_state_region" {
  description = "AWS region for Project Bootstrap Terraform state."
  type        = string
  default     = "ap-northeast-1"
}

variable "argocd_namespace" {
  description = "Namespace owned by Cluster Bootstrap for the Argo CD installation."
  type        = string
  default     = "argocd"
}

variable "argocd_chart_version" {
  description = "Pinned Argo CD Helm chart version."
  type        = string
  default     = "6.7.0"
}

variable "argocd_admin_secret_password_mtime_key" {
  description = "JSON key in the Argo CD admin secret that contains the admin password modification time."
  type        = string
  default     = "password_mtime"
}

variable "argocd_admin_secret_bcrypt_hash_key" {
  description = "JSON key in the Argo CD admin secret that contains the stable bcrypt hash."
  type        = string
  default     = "bcrypt_hash"
}

variable "root_application_repo_url" {
  description = "Git repository URL watched by the root Argo CD Application."
  type        = string
  default     = "https://github.com/noidilin/hiraya.git"
}

variable "root_application_target_revision" {
  description = "Git revision watched by the root Argo CD Application."
  type        = string
  default     = "main"
}

variable "root_application_path" {
  description = "GitOps app-of-apps path watched by the root Argo CD Application."
  type        = string
  default     = "gitops/clusters/dev/root"
}

variable "platform_project_name" {
  description = "Argo CD AppProject used by Cluster Platform and root app-of-apps resources."
  type        = string
  default     = "hiraya-platform"
}

variable "platform_project_source_repos" {
  description = "Git and Helm repositories that Cluster Platform Applications may source from."
  type        = list(string)
  default = [
    "https://github.com/noidilin/hiraya.git",
    "https://aws.github.io/eks-charts",
    "https://kubernetes-sigs.github.io/external-dns/",
    "https://charts.external-secrets.io",
    "https://charts.jetstack.io",
    "https://prometheus-community.github.io/helm-charts",
  ]
}

variable "workloads_project_name" {
  description = "Argo CD AppProject used by Hiraya workload applications."
  type        = string
  default     = "hiraya-workloads"
}

variable "workload_namespaces" {
  description = "Namespaces where workload AppProject applications may deploy namespaced resources."
  type        = list(string)
  default     = ["vintage"]
}

variable "skip_aws_credentials_validation" {
  description = "Skip AWS provider credential validation for static CI checks that must not request AWS credentials."
  type        = bool
  default     = false
}
