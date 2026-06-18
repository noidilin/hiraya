module "ecr" {
  source = "../../../modules/ecr"

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

