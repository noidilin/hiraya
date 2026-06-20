variable "namespace" {
  description = "Namespace for shared public edge Gateway resources."
  type        = string
  default     = "edge"
}

variable "gateway_name" {
  description = "Shared Gateway name."
  type        = string
  default     = "public"
}

variable "gateway_class_name" {
  description = "GatewayClass name for AWS ALB Gateway reconciliation."
  type        = string
  default     = "aws-alb"
}

variable "load_balancer_name" {
  description = "Stable ALB name requested through LoadBalancerConfiguration."
  type        = string
}

variable "certificate_arn" {
  description = "ACM certificate ARN used as the default HTTPS listener certificate."
  type        = string
}

variable "domain_name" {
  description = "Root public application domain served by this Gateway."
  type        = string
}

variable "target_group_target_type" {
  description = "ALB target group target type for Gateway backends. Use ip so ClusterIP services can stay private behind the shared Gateway."
  type        = string
  default     = "ip"

  validation {
    condition     = contains(["ip", "instance"], var.target_group_target_type)
    error_message = "target_group_target_type must be either ip or instance."
  }
}

variable "allowed_namespace_label_key" {
  description = "Namespace label key required to attach public HTTPRoutes to the shared Gateway."
  type        = string
  default     = "hiraya.noidilin.dev/public-gateway-access"
}

variable "allowed_namespace_label_value" {
  description = "Namespace label value required to attach public HTTPRoutes to the shared Gateway."
  type        = string
  default     = "true"
}
