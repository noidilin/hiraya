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

variable "subnets" {
  description = "List of subnets"
  type = list(object({
    name              = string
    cidr_block        = string
    availability_zone = string
  }))
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