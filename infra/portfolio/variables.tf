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
  description = "Optional Bedrock model ARN override for Hiraya Guide RetrieveAndGenerate. Defaults to a region-matched Nova Lite model ARN."
  type        = string
  default     = null
}

variable "guide_api_reserved_concurrent_executions" {
  description = "Optional reserved concurrency for the Guide API Lambda. Leave null in low-quota dev accounts so Lambda preserves the required unreserved concurrency pool."
  type        = number
  default     = null
  nullable    = true
}

variable "guide_embedding_model_arn" {
  description = "Optional Bedrock embedding model ARN override for the Portfolio Knowledge Base. Must be Titan Text Embeddings v2 because the S3 Vectors index dimension is fixed at 1024. Defaults to a region-matched Titan Text Embeddings v2 ARN."
  type        = string
  default     = null
  nullable    = true

  validation {
    condition     = var.guide_embedding_model_arn == null ? true : can(regex("^arn:aws(-[a-z]+)?:bedrock:[a-z0-9-]+::foundation-model/amazon\\.titan-embed-text-v2:0$", var.guide_embedding_model_arn))
    error_message = "guide_embedding_model_arn must be null or a Titan Text Embeddings v2 foundation-model ARN (amazon.titan-embed-text-v2:0), matching the fixed 1024-dimension S3 Vectors index."
  }
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
