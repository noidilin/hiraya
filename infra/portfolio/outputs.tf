output "site_bucket_name" {
  description = "Private S3 bucket for Hiraya Portfolio SPA assets."
  value       = aws_s3_bucket.site.bucket
}

output "knowledge_bucket_name" {
  description = "S3 bucket used for Curated Project Knowledge and citation manifests."
  value       = aws_s3_bucket.knowledge.bucket
}

output "knowledge_prefix" {
  description = "Prefix ingested by the Bedrock Knowledge Base data source."
  value       = "knowledge/"
}

output "bedrock_knowledge_base_id" {
  description = "Bedrock Knowledge Base ID used by Hiraya Guide."
  value       = aws_bedrockagent_knowledge_base.guide.id
}

output "bedrock_data_source_id" {
  description = "Bedrock Knowledge Base S3 data source ID for knowledge sync ingestion jobs."
  value       = aws_bedrockagent_data_source.guide.data_source_id
}

output "bedrock_guardrail_id" {
  description = "Bedrock Guardrail ID configured for Hiraya Guide."
  value       = aws_bedrock_guardrail.guide.guardrail_id
}

output "bedrock_guardrail_version" {
  description = "Pinned Bedrock Guardrail version configured for Hiraya Guide."
  value       = aws_bedrock_guardrail_version.guide.version
}

output "citation_manifest_key" {
  description = "S3 object key for the citation manifest outside the ingested knowledge prefix."
  value       = "manifests/citations.json"
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID for app deploy invalidations."
  value       = aws_cloudfront_distribution.portfolio.id
}

output "cloudfront_domain_name" {
  description = "Generated CloudFront distribution domain name."
  value       = aws_cloudfront_distribution.portfolio.domain_name
}

output "guide_api_endpoint" {
  description = "Regional API Gateway endpoint; CloudFront is the public entry point."
  value       = aws_apigatewayv2_api.guide.api_endpoint
}

output "guide_api_lambda_function_name" {
  description = "Guide API Lambda function name for code deploys."
  value       = aws_lambda_function.guide_api.function_name
}

output "portfolio_domain_name" {
  description = "Dedicated Hiraya Portfolio hostname."
  value       = local.domain_name
}
