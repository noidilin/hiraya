variable "vpc_name" {
  type = string
}

variable "cidr_block" {
  type = string
}

variable "availability_zones" {
  type = list(string)
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public edge subnets. One subnet is created per availability zone."
  type        = list(string)

  validation {
    condition     = length(var.public_subnet_cidrs) == length(var.availability_zones)
    error_message = "public_subnet_cidrs must have one CIDR per availability zone."
  }
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private workload subnets. One subnet is created per availability zone."
  type        = list(string)

  validation {
    condition     = length(var.private_subnet_cidrs) == length(var.availability_zones)
    error_message = "private_subnet_cidrs must have one CIDR per availability zone."
  }
}

variable "cluster_name" {
  description = "EKS cluster name for subnet tagging"
  type        = string
}

variable "enable_flow_logs" {
  description = "Whether to enable VPC Flow Logs. Disabled by default to avoid dev log ingestion cost."
  type        = bool
  default     = false
}

variable "flow_logs_destination_type" {
  description = "VPC Flow Logs destination type. Use cloud-watch-logs unless an alternate destination ARN is provided."
  type        = string
  default     = "cloud-watch-logs"

  validation {
    condition     = contains(["cloud-watch-logs", "s3", "kinesis-data-firehose"], var.flow_logs_destination_type)
    error_message = "flow_logs_destination_type must be cloud-watch-logs, s3, or kinesis-data-firehose."
  }
}

variable "flow_logs_destination_arn" {
  description = "Optional pre-existing VPC Flow Logs destination ARN. When null and flow logs are enabled, this module creates a CloudWatch Logs group and IAM role."
  type        = string
  default     = null
}

variable "flow_logs_log_group_name" {
  description = "Optional CloudWatch Logs log group name for module-created VPC Flow Logs."
  type        = string
  default     = null
}

variable "flow_logs_retention_days" {
  description = "Retention period in days for module-created VPC Flow Logs log group."
  type        = number
  default     = 14
}

variable "flow_logs_traffic_type" {
  description = "Traffic type captured by VPC Flow Logs."
  type        = string
  default     = "ALL"

  validation {
    condition     = contains(["ACCEPT", "REJECT", "ALL"], var.flow_logs_traffic_type)
    error_message = "flow_logs_traffic_type must be ACCEPT, REJECT, or ALL."
  }
}

variable "flow_logs_permissions_boundary_arn" {
  description = "Optional permissions boundary for the module-created VPC Flow Logs IAM role."
  type        = string
  default     = null
}

variable "tags" {
  description = "Tags applied to VPC resources."
  type        = map(string)
  default     = {}
}
