variable "region" {
  description = "The name of the region"
  type        = string
}

variable "vpc_name" {
  description = "VPC name"
  type        = string
}

variable "vpc_cidr" {
  description = "VPC CIDR Value"
  type        = string
}

variable "availability_zones" {
  description = "Availability zones used for public edge and private workload subnet groups."
  type        = list(string)
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public edge subnets across availability_zones."
  type        = list(string)
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private workload subnets across availability_zones."
  type        = list(string)
}

variable "enable_vpc_flow_logs" {
  description = "Enable VPC Flow Logs for network debugging. Disabled by default to avoid dev log ingestion cost."
  type        = bool
  default     = false
}

variable "eks_endpoint_public_access" {
  description = "Temporary dev toggle for the public EKS API endpoint."
  type        = bool
  default     = true
}

variable "eks_endpoint_private_access" {
  description = "Enable private EKS API endpoint access from inside the VPC."
  type        = bool
  default     = true
}

variable "eks_endpoint_public_access_cidrs" {
  description = "Explicit temporary dev CIDRs allowed to reach the public EKS API endpoint. Prefer workstation /32 CIDRs over broad access."
  type        = list(string)
}


variable "cluster_name" {
  description = "The name of the Kubernetes Cluster"
  type        = string
}

variable "node_group_name" {
  type        = string
  description = "EKS node group name"
}

variable "instance_types" {
  type        = list(string)
  description = "Instance types for worker nodes (t3.medium, t3.large)"
}

variable "capacity_type" {
  type        = string
  description = "ON_DEMAND or SPOT"
}

variable "desired_size" {
  type        = number
  description = "Desired number of worker nodes"
}

variable "min_size" {
  type        = number
  description = "Minimum number of  worker nodes"
}

variable "max_size" {
  type        = number
  description = "Maximum number of worker nodes"
}

variable "disk_size" {
  type = number
}

variable "bootstrap_state_bucket" {
  description = "Externally managed S3 bucket containing bootstrap Terraform state. Defaults to devops-hiraya-dev-tf-state."
  type        = string
  default     = null
}

variable "bootstrap_state_key" {
  description = "S3 key for bootstrap Terraform state."
  type        = string
  default     = "devops-hiraya-dev/dev/bootstrap/terraform.tfstate"
}

variable "bootstrap_state_region" {
  description = "AWS region for bootstrap Terraform state."
  type        = string
  default     = "ap-northeast-1"
}

variable "pod_log_group_name" {
  description = "CloudWatch Logs log group for Kubernetes pod logs."
  type        = string
  default     = "/eks/vintage/pods"
}

variable "pod_log_retention_days" {
  description = "Retention period in days for Kubernetes pod logs in CloudWatch Logs."
  type        = number
  default     = 14
}

variable "gitops_application_enabled" {
  description = "Whether Terraform should bootstrap the root Argo CD Application during platform provisioning."
  type        = bool
  default     = true
}

variable "public_zone_name" {
  description = "Public Route 53 hosted zone used for shared edge DNS validation."
  type        = string
  default     = "noidilin.dev"
}

variable "public_domain_name" {
  description = "Root public domain served by the shared HTTPS Gateway."
  type        = string
  default     = "hiraya.noidilin.dev"
}

variable "edge_gateway_namespace" {
  description = "Namespace for shared Gateway edge resources."
  type        = string
  default     = "edge"
}

variable "edge_gateway_name" {
  description = "Name of the shared public Gateway."
  type        = string
  default     = "public"
}

variable "public_gateway_access_label_key" {
  description = "Namespace label key required for public route attachment."
  type        = string
  default     = "hiraya.noidilin.dev/public-gateway-access"
}

variable "public_gateway_access_label_value" {
  description = "Namespace label value required for public route attachment."
  type        = string
  default     = "true"
}

variable "external_dns_txt_owner_id" {
  description = "TXT registry owner ID used by ExternalDNS for Route 53 record ownership."
  type        = string
  default     = "hiraya-dev-eks"
}
