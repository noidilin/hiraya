resource "aws_iam_role" "github_portfolio_plan" {
  name                 = "${local.name_prefix}-github-portfolio-plan"
  permissions_boundary = local.gitops_apply_boundary_arn
  assume_role_policy   = data.aws_iam_policy_document.github_portfolio_plan_assume_role.json

  tags = local.common_tags
}

resource "aws_iam_policy" "github_portfolio_plan" {
  name        = "${local.name_prefix}-github-portfolio-plan"
  description = "Read-only Terraform planning access for Hiraya Portfolio infrastructure."

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowPortfolioStateRead"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion"
        ]
        Resource = local.portfolio_state_read_object_arns
      },
      {
        Sid      = "AllowTerraformStateBucketList"
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = "arn:aws:s3:::${var.state_bucket_name}"
        Condition = {
          StringLike = {
            "s3:prefix" = local.terraform_state_list_prefixes
          }
        }
      },
      {
        Sid    = "AllowPortfolioStateLockfileMutationForPlan"
        Effect = "Allow"
        Action = [
          "s3:DeleteObject",
          "s3:GetObject",
          "s3:PutObject"
        ]
        Resource = [local.terraform_state_lockfile_object_arns.portfolio]
      },
      {
        Sid    = "AllowPortfolioReadInspection"
        Effect = "Allow"
        Action = [
          "acm:Describe*",
          "acm:Get*",
          "acm:List*",
          "apigateway:GET",
          "bedrock:Get*",
          "bedrock:List*",
          "cloudfront:Get*",
          "cloudfront:List*",
          "iam:Get*",
          "iam:List*",
          "lambda:Get*",
          "lambda:List*",
          "logs:Describe*",
          "logs:FilterLogEvents",
          "logs:Get*",
          "logs:List*",
          "route53:Get*",
          "route53:List*",
          "s3:GetBucket*",
          "s3:GetEncryptionConfiguration",
          "s3:GetLifecycleConfiguration",
          "s3:GetObject",
          "s3:GetObjectVersion",
          "s3:GetPublicAccessBlock",
          "s3:ListBucket",
          "secretsmanager:DescribeSecret",
          "secretsmanager:GetResourcePolicy",
          "secretsmanager:ListSecretVersionIds",
          "secretsmanager:ListSecrets"
        ]
        Resource = "*"
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "github_portfolio_plan" {
  role       = aws_iam_role.github_portfolio_plan.name
  policy_arn = aws_iam_policy.github_portfolio_plan.arn
}

resource "aws_iam_role" "github_portfolio_apply" {
  name                 = "${local.name_prefix}-github-portfolio-apply"
  permissions_boundary = local.gitops_apply_boundary_arn
  assume_role_policy   = data.aws_iam_policy_document.github_portfolio_apply_assume_role.json

  tags = local.common_tags
}

resource "aws_iam_policy" "github_portfolio_apply" {
  name        = "${local.name_prefix}-github-portfolio-apply"
  description = "Approved Terraform apply access for durable Hiraya Portfolio infrastructure."

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowPortfolioStateMutation"
        Effect = "Allow"
        Action = [
          "s3:DeleteObject",
          "s3:GetObject",
          "s3:GetObjectVersion",
          "s3:PutObject"
        ]
        Resource = local.portfolio_state_mutation_object_arns
      },
      {
        Sid    = "AllowProjectBootstrapStateRead"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion"
        ]
        Resource = [local.terraform_state_object_arns.bootstrap]
      },
      {
        Sid      = "AllowTerraformStateBucketAccessCheck"
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = "arn:aws:s3:::${var.state_bucket_name}"
      },
      {
        Sid      = "AllowTerraformStateBucketList"
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = "arn:aws:s3:::${var.state_bucket_name}"
        Condition = {
          StringLike = {
            "s3:prefix" = local.terraform_state_list_prefixes
          }
        }
      },
      {
        Sid    = "AllowPortfolioReadInspection"
        Effect = "Allow"
        Action = [
          "acm:Describe*",
          "acm:Get*",
          "acm:List*",
          "apigateway:GET",
          "bedrock:Get*",
          "bedrock:List*",
          "cloudfront:Get*",
          "cloudfront:List*",
          "iam:Get*",
          "iam:List*",
          "lambda:Get*",
          "lambda:List*",
          "logs:Describe*",
          "logs:FilterLogEvents",
          "logs:Get*",
          "logs:List*",
          "route53:Get*",
          "route53:List*",
          "s3:GetBucket*",
          "s3:GetEncryptionConfiguration",
          "s3:GetLifecycleConfiguration",
          "s3:GetObject",
          "s3:GetObjectVersion",
          "s3:GetPublicAccessBlock",
          "s3:ListBucket",
          "secretsmanager:DescribeSecret",
          "secretsmanager:GetResourcePolicy",
          "secretsmanager:ListSecretVersionIds",
          "secretsmanager:ListSecrets"
        ]
        Resource = "*"
      },
      {
        Sid    = "AllowPortfolioInfrastructureMutation"
        Effect = "Allow"
        Action = [
          "acm:AddTagsToCertificate",
          "acm:DeleteCertificate",
          "acm:RemoveTagsFromCertificate",
          "acm:RequestCertificate",
          "apigateway:DELETE",
          "apigateway:PATCH",
          "apigateway:POST",
          "apigateway:PUT",
          "bedrock:Create*",
          "bedrock:Delete*",
          "bedrock:TagResource",
          "bedrock:UntagResource",
          "bedrock:Update*",
          "cloudfront:CreateCloudFrontOriginAccessIdentity",
          "cloudfront:CreateDistribution",
          "cloudfront:CreateInvalidation",
          "cloudfront:CreateOriginAccessControl",
          "cloudfront:DeleteCloudFrontOriginAccessIdentity",
          "cloudfront:DeleteDistribution",
          "cloudfront:DeleteOriginAccessControl",
          "cloudfront:TagResource",
          "cloudfront:UntagResource",
          "cloudfront:UpdateCloudFrontOriginAccessIdentity",
          "cloudfront:UpdateDistribution",
          "cloudfront:UpdateOriginAccessControl",
          "lambda:AddPermission",
          "lambda:CreateFunction",
          "lambda:DeleteFunction",
          "lambda:RemovePermission",
          "lambda:TagResource",
          "lambda:UntagResource",
          "lambda:UpdateFunctionCode",
          "lambda:UpdateFunctionConfiguration",
          "logs:CreateLogGroup",
          "logs:DeleteLogGroup",
          "logs:DeleteRetentionPolicy",
          "logs:PutRetentionPolicy",
          "logs:TagResource",
          "logs:UntagResource",
          "route53:ChangeResourceRecordSets",
          "s3:CreateBucket",
          "s3:DeleteBucket",
          "s3:DeleteBucketPolicy",
          "s3:DeleteObject",
          "s3:PutBucketPolicy",
          "s3:PutBucketPublicAccessBlock",
          "s3:PutBucketTagging",
          "s3:PutBucketVersioning",
          "s3:PutEncryptionConfiguration",
          "s3:PutLifecycleConfiguration",
          "s3:PutObject",
          "s3:PutObjectTagging",
          "secretsmanager:CreateSecret",
          "secretsmanager:DeleteSecret",
          "secretsmanager:PutSecretValue",
          "secretsmanager:TagResource",
          "secretsmanager:UntagResource",
          "secretsmanager:UpdateSecret"
        ]
        Resource = "*"
      },
      {
        Sid    = "AllowPortfolioIamMutation"
        Effect = "Allow"
        Action = [
          "iam:AttachRolePolicy",
          "iam:CreatePolicy",
          "iam:CreatePolicyVersion",
          "iam:CreateRole",
          "iam:DeletePolicy",
          "iam:DeletePolicyVersion",
          "iam:DeleteRole",
          "iam:DeleteRolePolicy",
          "iam:DetachRolePolicy",
          "iam:PutRolePolicy",
          "iam:SetDefaultPolicyVersion",
          "iam:TagPolicy",
          "iam:TagRole",
          "iam:UntagPolicy",
          "iam:UntagRole",
          "iam:UpdateAssumeRolePolicy"
        ]
        Resource = [
          local.portfolio_role_arn_pattern,
          local.portfolio_policy_arn_pattern
        ]
      },
      {
        Sid      = "AllowConstrainedPassRoleForPortfolioServices"
        Effect   = "Allow"
        Action   = ["iam:PassRole"]
        Resource = local.portfolio_role_arn_pattern
        Condition = {
          StringEquals = {
            "iam:PassedToService" = [
              "bedrock.amazonaws.com",
              "lambda.amazonaws.com"
            ]
          }
        }
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "github_portfolio_apply" {
  role       = aws_iam_role.github_portfolio_apply.name
  policy_arn = aws_iam_policy.github_portfolio_apply.arn
}

resource "aws_iam_role" "github_portfolio_app_deploy" {
  name                 = "${local.name_prefix}-github-portfolio-app-deploy"
  permissions_boundary = local.gitops_apply_boundary_arn
  assume_role_policy   = data.aws_iam_policy_document.github_portfolio_app_deploy_assume_role.json

  tags = local.common_tags
}

resource "aws_iam_policy" "github_portfolio_app_deploy" {
  name        = "${local.name_prefix}-github-portfolio-app-deploy"
  description = "Deploy Hiraya Portfolio SPA assets and Guide API Lambda artifacts after merge."

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowPortfolioStateRead"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion"
        ]
        Resource = [local.terraform_state_object_arns.portfolio]
      },
      {
        Sid    = "AllowPortfolioAssetDeploy"
        Effect = "Allow"
        Action = [
          "s3:DeleteObject",
          "s3:GetObject",
          "s3:ListBucket",
          "s3:PutObject",
          "s3:PutObjectTagging"
        ]
        Resource = [
          local.portfolio_s3_bucket_arn,
          local.portfolio_s3_object_arn
        ]
      },
      {
        Sid    = "AllowPortfolioFunctionDeploy"
        Effect = "Allow"
        Action = [
          "lambda:GetFunction",
          "lambda:UpdateFunctionCode",
          "lambda:UpdateFunctionConfiguration"
        ]
        Resource = local.portfolio_lambda_arn_pattern
      },
      {
        Sid    = "AllowPortfolioCloudFrontInvalidation"
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation",
          "cloudfront:GetDistribution",
          "cloudfront:GetInvalidation",
          "cloudfront:ListDistributions"
        ]
        Resource = "*"
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "github_portfolio_app_deploy" {
  role       = aws_iam_role.github_portfolio_app_deploy.name
  policy_arn = aws_iam_policy.github_portfolio_app_deploy.arn
}

resource "aws_iam_role" "github_portfolio_knowledge_sync" {
  name                 = "${local.name_prefix}-github-portfolio-knowledge-sync"
  permissions_boundary = local.gitops_apply_boundary_arn
  assume_role_policy   = data.aws_iam_policy_document.github_portfolio_knowledge_sync_assume_role.json

  tags = local.common_tags
}

resource "aws_iam_policy" "github_portfolio_knowledge_sync" {
  name        = "${local.name_prefix}-github-portfolio-knowledge-sync"
  description = "Sync curated Hiraya Portfolio knowledge and start Bedrock Knowledge Base ingestion after merge."

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowPortfolioStateRead"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion"
        ]
        Resource = [local.terraform_state_object_arns.portfolio]
      },
      {
        Sid    = "AllowCuratedKnowledgeSync"
        Effect = "Allow"
        Action = [
          "s3:DeleteObject",
          "s3:GetObject",
          "s3:ListBucket",
          "s3:PutObject",
          "s3:PutObjectTagging"
        ]
        Resource = [
          local.portfolio_s3_bucket_arn,
          local.portfolio_s3_object_arn
        ]
      },
      {
        Sid    = "AllowBedrockKnowledgeIngestion"
        Effect = "Allow"
        Action = [
          "bedrock:GetDataSource",
          "bedrock:GetIngestionJob",
          "bedrock:GetKnowledgeBase",
          "bedrock:ListDataSources",
          "bedrock:ListIngestionJobs",
          "bedrock:StartIngestionJob"
        ]
        Resource = "*"
      },
      {
        Sid    = "AllowKnowledgeVersionRefresh"
        Effect = "Allow"
        Action = [
          "lambda:GetFunctionConfiguration",
          "lambda:UpdateFunctionConfiguration"
        ]
        Resource = local.portfolio_lambda_arn_pattern
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "github_portfolio_knowledge_sync" {
  role       = aws_iam_role.github_portfolio_knowledge_sync.name
  policy_arn = aws_iam_policy.github_portfolio_knowledge_sync.arn
}
