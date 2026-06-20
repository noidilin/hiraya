variable "grafana_hostname" {
  description = "Public hostname for the Grafana admin UI HTTPRoute."
  type        = string
  default     = "grafana.hiraya.noidilin.dev"
}

variable "grafana_route_name" {
  description = "Name of the Grafana admin HTTPRoute."
  type        = string
  default     = "grafana"
}

variable "gateway_name" {
  description = "Shared public Gateway name used by the Grafana HTTPRoute."
  type        = string
  default     = "public"
}

variable "gateway_namespace" {
  description = "Shared public Gateway namespace used by the Grafana HTTPRoute."
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
