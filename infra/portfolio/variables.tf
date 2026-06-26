variable "region" {
  description = "Primary AWS region for the durable Portfolio Stack."
  type        = string
  default     = "ap-northeast-1"
}

variable "project_name" {
  description = "Project tag and name prefix component."
  type        = string
  default     = "hiraya"
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
  default     = "dev"
}

variable "domain_name" {
  description = "Dedicated Hiraya Portfolio public hostname."
  type        = string
  default     = "lazyhiraya.noidilin.dev"
}

variable "hosted_zone_name" {
  description = "Route 53 public hosted zone name containing the Portfolio hostname."
  type        = string
  default     = "noidilin.dev"
}

variable "guide_api_zip_path" {
  description = "Path to the built Guide API Lambda zip artifact."
  type        = string
  default     = "build/guide-api.zip"
}

variable "guide_model_arn" {
  description = "Fast, low-cost Bedrock model ARN used by Hiraya Guide RetrieveAndGenerate."
  type        = string
  default     = "arn:aws:bedrock:ap-northeast-1::foundation-model/amazon.nova-lite-v1:0"
}

variable "guide_embedding_model_arn" {
  description = "Bedrock embedding model ARN used by the Portfolio Knowledge Base."
  type        = string
  default     = "arn:aws:bedrock:ap-northeast-1::foundation-model/amazon.titan-embed-text-v2:0"
}

variable "skip_aws_credentials_validation" {
  description = "Skip AWS account validation for credential-free Terraform validate in PR checks."
  type        = bool
  default     = false
}

variable "tags" {
  description = "Additional tags to apply to Portfolio Stack resources."
  type        = map(string)
  default     = {}
}
