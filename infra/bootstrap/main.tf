module "ecr" {
  source = "../modules/ecr"

  repositories = var.repositories
}

resource "aws_iam_role" "github_image_push" {
  name                 = "${local.name_prefix}-github-image-push"
  permissions_boundary = local.runtime_boundary_arn
  assume_role_policy   = data.aws_iam_policy_document.github_image_push_assume_role.json

  tags = local.common_tags
}

resource "aws_iam_policy" "github_image_push" {
  name        = "${local.name_prefix}-github-image-push"
  description = "Push immutable service images to Hiraya ECR repositories."

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "AllowEcrAuthToken"
        Effect   = "Allow"
        Action   = "ecr:GetAuthorizationToken"
        Resource = "*"
      },
      {
        Sid    = "AllowRepositoryPush"
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:BatchGetImage",
          "ecr:CompleteLayerUpload",
          "ecr:DescribeImages",
          "ecr:DescribeRepositories",
          "ecr:GetDownloadUrlForLayer",
          "ecr:InitiateLayerUpload",
          "ecr:PutImage",
          "ecr:UploadLayerPart"
        ]
        Resource = values(module.ecr.repository_arns)
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "github_image_push" {
  role       = aws_iam_role.github_image_push.name
  policy_arn = aws_iam_policy.github_image_push.arn
}

resource "aws_s3_bucket" "terraform_state" {
  bucket = local.state_bucket

  tags = local.common_tags
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
