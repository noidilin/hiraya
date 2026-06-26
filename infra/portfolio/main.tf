data "aws_caller_identity" "current" {}

data "aws_route53_zone" "public" {
  name         = var.hosted_zone_name
  private_zone = false
}

data "aws_cloudfront_cache_policy" "disabled" {
  name = "Managed-CachingDisabled"
}

data "aws_cloudfront_cache_policy" "optimized" {
  name = "Managed-CachingOptimized"
}

locals {
  name_prefix          = "devops-${var.project_name}-${var.environment}-portfolio"
  site_origin_id       = "portfolio-site-s3"
  api_origin_id        = "portfolio-guide-api"
  domain_name          = trimsuffix(var.domain_name, ".")
  api_origin_domain    = replace(aws_apigatewayv2_api.guide.api_endpoint, "https://", "")
  origin_secret_name   = "/hiraya/${var.environment}/portfolio/origin-secret"
  runtime_boundary_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/lab-devops-permissions-boundary"

  common_tags = merge(var.tags, {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    Component   = "portfolio"
  })
}

resource "aws_s3_bucket" "site" {
  bucket = "${local.name_prefix}-site"

  tags = local.common_tags
}

resource "aws_s3_bucket_public_access_block" "site" {
  bucket = aws_s3_bucket.site.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "site" {
  bucket = aws_s3_bucket.site.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "site" {
  bucket = aws_s3_bucket.site.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket" "knowledge" {
  bucket = "${local.name_prefix}-knowledge"

  tags = local.common_tags
}

resource "aws_s3_bucket_public_access_block" "knowledge" {
  bucket = aws_s3_bucket.knowledge.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "knowledge" {
  bucket = aws_s3_bucket.knowledge.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_iam_role" "bedrock_knowledge_base" {
  name                 = "${local.name_prefix}-kb"
  permissions_boundary = local.runtime_boundary_arn
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "bedrock.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "bedrock_knowledge_base" {
  name = "${local.name_prefix}-kb"
  role = aws_iam_role.bedrock_knowledge_base.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.knowledge.arn,
          "${aws_s3_bucket.knowledge.arn}/knowledge/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel"
        ]
        Resource = var.guide_embedding_model_arn
      },
      {
        Effect = "Allow"
        Action = [
          "aoss:APIAccessAll"
        ]
        Resource = aws_opensearchserverless_collection.knowledge.arn
      }
    ]
  })
}

resource "aws_opensearchserverless_security_policy" "knowledge_encryption" {
  name = "${var.project_name}-${var.environment}-portfolio-kb"
  type = "encryption"
  policy = jsonencode({
    Rules = [{
      ResourceType = "collection"
      Resource     = ["collection/${var.project_name}-${var.environment}-portfolio-kb"]
    }]
    AWSOwnedKey = true
  })
}

resource "aws_opensearchserverless_security_policy" "knowledge_network" {
  name = "${var.project_name}-${var.environment}-portfolio-kb"
  type = "network"
  policy = jsonencode([{
    Rules = [
      {
        ResourceType = "collection"
        Resource     = ["collection/${var.project_name}-${var.environment}-portfolio-kb"]
      },
      {
        ResourceType = "dashboard"
        Resource     = ["collection/${var.project_name}-${var.environment}-portfolio-kb"]
      }
    ]
    AllowFromPublic = true
  }])
}

resource "aws_opensearchserverless_collection" "knowledge" {
  name = "${var.project_name}-${var.environment}-portfolio-kb"
  type = "VECTORSEARCH"

  depends_on = [
    aws_opensearchserverless_security_policy.knowledge_encryption,
    aws_opensearchserverless_security_policy.knowledge_network,
  ]

  tags = local.common_tags
}

resource "aws_opensearchserverless_access_policy" "knowledge" {
  name = "${var.project_name}-${var.environment}-portfolio-kb"
  type = "data"
  policy = jsonencode([{
    Rules = [
      {
        ResourceType = "collection"
        Resource     = ["collection/${aws_opensearchserverless_collection.knowledge.name}"]
        Permission   = ["aoss:CreateCollectionItems", "aoss:DescribeCollectionItems", "aoss:UpdateCollectionItems"]
      },
      {
        ResourceType = "index"
        Resource     = ["index/${aws_opensearchserverless_collection.knowledge.name}/*"]
        Permission   = ["aoss:CreateIndex", "aoss:DeleteIndex", "aoss:DescribeIndex", "aoss:ReadDocument", "aoss:UpdateIndex", "aoss:WriteDocument"]
      }
    ]
    Principal = [aws_iam_role.bedrock_knowledge_base.arn]
  }])
}

resource "aws_bedrock_guardrail" "guide" {
  name                      = "${local.name_prefix}-guide"
  blocked_input_messaging   = "Hiraya Guide cannot help with prompt attacks or attempts to bypass its curated project knowledge boundary."
  blocked_outputs_messaging = "Hiraya Guide cannot provide that response."
  description               = "Basic prompt-attack guardrail for public Hiraya Guide traffic."

  content_policy_config {
    filters_config {
      input_strength  = "HIGH"
      output_strength = "MEDIUM"
      type            = "PROMPT_ATTACK"
    }
  }

  tags = local.common_tags
}

resource "aws_bedrock_guardrail_version" "guide" {
  guardrail_arn = aws_bedrock_guardrail.guide.guardrail_arn
  description   = "Pinned v1 prompt-attack guardrail for Hiraya Guide."
}

resource "aws_bedrockagent_knowledge_base" "guide" {
  name     = "${local.name_prefix}-guide"
  role_arn = aws_iam_role.bedrock_knowledge_base.arn

  knowledge_base_configuration {
    type = "VECTOR"

    vector_knowledge_base_configuration {
      embedding_model_arn = var.guide_embedding_model_arn
    }
  }

  storage_configuration {
    type = "OPENSEARCH_SERVERLESS"

    opensearch_serverless_configuration {
      collection_arn    = aws_opensearchserverless_collection.knowledge.arn
      vector_index_name = "hiraya-guide-index"

      field_mapping {
        metadata_field = "AMAZON_BEDROCK_METADATA"
        text_field     = "AMAZON_BEDROCK_TEXT_CHUNK"
        vector_field   = "hiraya-guide-vector"
      }
    }
  }

  depends_on = [
    aws_iam_role_policy.bedrock_knowledge_base,
    aws_opensearchserverless_access_policy.knowledge,
  ]

  tags = local.common_tags
}

resource "aws_bedrockagent_data_source" "guide" {
  knowledge_base_id = aws_bedrockagent_knowledge_base.guide.id
  name              = "${local.name_prefix}-guide-s3"

  data_source_configuration {
    type = "S3"

    s3_configuration {
      bucket_arn         = aws_s3_bucket.knowledge.arn
      inclusion_prefixes = ["knowledge/"]
    }
  }
}

resource "aws_acm_certificate" "portfolio" {
  provider = aws.use1

  domain_name       = local.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = local.common_tags
}

resource "aws_route53_record" "portfolio_certificate_validation" {
  for_each = {
    for option in aws_acm_certificate.portfolio.domain_validation_options : option.domain_name => {
      name   = option.resource_record_name
      record = option.resource_record_value
      type   = option.resource_record_type
    }
  }

  zone_id = data.aws_route53_zone.public.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.record]
}

resource "aws_acm_certificate_validation" "portfolio" {
  provider = aws.use1

  certificate_arn         = aws_acm_certificate.portfolio.arn
  validation_record_fqdns = [for record in aws_route53_record.portfolio_certificate_validation : record.fqdn]
}

resource "random_password" "origin_secret" {
  length  = 40
  special = false
}

resource "aws_secretsmanager_secret" "origin_secret" {
  name        = local.origin_secret_name
  description = "CloudFront-to-Guide API origin header secret for Hiraya Portfolio."

  tags = local.common_tags
}

resource "aws_secretsmanager_secret_version" "origin_secret" {
  secret_id     = aws_secretsmanager_secret.origin_secret.id
  secret_string = random_password.origin_secret.result
}

resource "aws_iam_role" "guide_api" {
  name                 = "${local.name_prefix}-guide-api"
  permissions_boundary = local.runtime_boundary_arn
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "guide_api" {
  name = "${local.name_prefix}-guide-api"
  role = aws_iam_role.guide_api.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "${aws_cloudwatch_log_group.guide_api.arn}:*"
      },
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = aws_secretsmanager_secret.origin_secret.arn
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject"
        ]
        Resource = "${aws_s3_bucket.knowledge.arn}/manifests/citations.json"
      },
      {
        Effect = "Allow"
        Action = [
          "bedrock:RetrieveAndGenerate"
        ]
        Resource = aws_bedrockagent_knowledge_base.guide.arn
      },
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel"
        ]
        Resource = var.guide_model_arn
      },
      {
        Effect = "Allow"
        Action = [
          "bedrock:ApplyGuardrail"
        ]
        Resource = aws_bedrock_guardrail.guide.guardrail_arn
      }
    ]
  })
}

resource "aws_cloudwatch_log_group" "guide_api" {
  name              = "/aws/lambda/${local.name_prefix}-guide-api"
  retention_in_days = 14

  tags = local.common_tags
}

resource "aws_lambda_function" "guide_api" {
  function_name = "${local.name_prefix}-guide-api"
  role          = aws_iam_role.guide_api.arn
  handler       = "handler.handler"
  runtime       = "nodejs24.x"
  filename      = var.guide_api_zip_path
  timeout       = 10
  memory_size   = 256

  reserved_concurrent_executions = 5

  environment {
    variables = {
      GUIDE_ORIGIN_SECRET_ARN        = aws_secretsmanager_secret.origin_secret.arn
      CITATION_MANIFEST_BUCKET       = aws_s3_bucket.knowledge.bucket
      CITATION_MANIFEST_KEY          = "manifests/citations.json"
      BEDROCK_KNOWLEDGE_BASE_ID      = aws_bedrockagent_knowledge_base.guide.id
      BEDROCK_MODEL_ARN              = var.guide_model_arn
      BEDROCK_GUARDRAIL_ID           = aws_bedrock_guardrail.guide.guardrail_id
      BEDROCK_GUARDRAIL_VERSION      = aws_bedrock_guardrail_version.guide.version
      BEDROCK_MAX_OUTPUT_TOKENS      = "700"
      BEDROCK_RETRIEVAL_RESULT_LIMIT = "5"
      KNOWLEDGE_VERSION              = "initial"
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.guide_api,
    aws_iam_role_policy.guide_api,
    aws_secretsmanager_secret_version.origin_secret,
  ]

  tags = local.common_tags
}

resource "aws_apigatewayv2_api" "guide" {
  name          = "${local.name_prefix}-guide"
  protocol_type = "HTTP"

  tags = local.common_tags
}

resource "aws_apigatewayv2_integration" "guide_api" {
  api_id                 = aws_apigatewayv2_api.guide.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.guide_api.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "health" {
  api_id    = aws_apigatewayv2_api.guide.id
  route_key = "GET /api/health"
  target    = "integrations/${aws_apigatewayv2_integration.guide_api.id}"
}

resource "aws_apigatewayv2_route" "chat" {
  api_id    = aws_apigatewayv2_api.guide.id
  route_key = "POST /api/guide/chat"
  target    = "integrations/${aws_apigatewayv2_integration.guide_api.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.guide.id
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    throttling_burst_limit = 20
    throttling_rate_limit  = 10
  }

  tags = local.common_tags
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowExecutionFromApiGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.guide_api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.guide.execution_arn}/*/*"
}

resource "aws_cloudfront_origin_access_control" "site" {
  name                              = "${local.name_prefix}-site"
  description                       = "Private S3 OAC for Hiraya Portfolio SPA."
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_origin_request_policy" "api_minimal" {
  name    = "${local.name_prefix}-api-minimal"
  comment = "Forward only JSON content type to the Portfolio Guide API; no cookies."

  cookies_config {
    cookie_behavior = "none"
  }

  headers_config {
    header_behavior = "whitelist"

    headers {
      items = ["content-type"]
    }
  }

  query_strings_config {
    query_string_behavior = "none"
  }
}

resource "aws_cloudfront_distribution" "portfolio" {
  enabled             = true
  comment             = "Durable Hiraya Portfolio SPA and Guide API"
  aliases             = [local.domain_name]
  default_root_object = "index.html"
  price_class         = "PriceClass_100"

  origin {
    origin_id                = local.site_origin_id
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
  }

  origin {
    origin_id   = local.api_origin_id
    domain_name = local.api_origin_domain

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }

    custom_header {
      name  = "x-hiraya-origin-secret"
      value = random_password.origin_secret.result
    }
  }

  default_cache_behavior {
    target_origin_id       = local.site_origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    cache_policy_id        = data.aws_cloudfront_cache_policy.optimized.id
    compress               = true
  }

  ordered_cache_behavior {
    path_pattern           = "/api/*"
    target_origin_id       = local.api_origin_id
    viewer_protocol_policy = "https-only"
    # CloudFront requires the full method set to forward POST. API Gateway defines
    # only GET /api/health and POST /api/guide/chat, with no CORS or OPTIONS route.
    allowed_methods          = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods           = ["GET", "HEAD"]
    cache_policy_id          = data.aws_cloudfront_cache_policy.disabled.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.api_minimal.id
    compress                 = false
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.portfolio.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = local.common_tags
}

data "aws_iam_policy_document" "site_bucket" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.site.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.portfolio.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id
  policy = data.aws_iam_policy_document.site_bucket.json
}

resource "aws_route53_record" "portfolio" {
  zone_id = data.aws_route53_zone.public.zone_id
  name    = local.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.portfolio.domain_name
    zone_id                = aws_cloudfront_distribution.portfolio.hosted_zone_id
    evaluate_target_health = false
  }
}
