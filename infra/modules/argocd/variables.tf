variable "admin_hostname" {
  description = "Public hostname for the Argo CD admin UI HTTPRoute."
  type        = string
  default     = "argocd.hiraya.noidilin.dev"
}

variable "admin_route_name" {
  description = "Name of the Argo CD admin HTTPRoute."
  type        = string
  default     = "argocd"
}

variable "admin_password_mtime" {
  description = "Timestamp stored with the Argo CD admin password hash. Bump when intentionally rotating the generated password."
  type        = string
  default     = "2026-06-20T00:00:00Z"
}

variable "gateway_name" {
  description = "Shared public Gateway name used by the Argo CD HTTPRoute."
  type        = string
  default     = "public"
}

variable "gateway_namespace" {
  description = "Shared public Gateway namespace used by the Argo CD HTTPRoute."
  type        = string
  default     = "edge"
}

variable "public_gateway_access_label_key" {
  description = "Namespace label key required to attach public HTTPRoutes to the shared Gateway."
  type        = string
  default     = "hiraya.noidilin.dev/public-gateway-access"
}

variable "public_gateway_access_label_value" {
  description = "Namespace label value required to attach public HTTPRoutes to the shared Gateway."
  type        = string
  default     = "true"
}

variable "gitops_application_enabled" {
  description = "Whether Terraform should bootstrap the root GitOps Application after Argo CD is installed."
  type        = bool
  default     = true
}

variable "gitops_application_manifest_path" {
  description = "Path to the Argo CD Application manifest injected into the Argo CD Helm release. Defaults to infra/modules/argocd/application.yml."
  type        = string
  default     = null
}
