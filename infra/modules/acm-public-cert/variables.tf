variable "zone_name" {
  description = "Public Route 53 hosted zone name used for ACM DNS validation."
  type        = string
}

variable "domain_name" {
  description = "Primary certificate domain name."
  type        = string
}

variable "subject_alternative_names" {
  description = "Additional certificate subject alternative names."
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "Tags applied to ACM resources."
  type        = map(string)
  default     = {}
}
