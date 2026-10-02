mock_provider "aws" {}

run "plans_repository_retention_policies" {
  command = plan

  variables {
    repositories = {
      "hiraya-active"   = {}
      "hiraya-inactive" = { tagged_image_count = 2 }
    }
  }

  assert {
    condition     = length(aws_ecr_lifecycle_policy.repos) == 2
    error_message = "Every ECR repository must receive a lifecycle policy."
  }

  assert {
    condition     = jsondecode(aws_ecr_lifecycle_policy.repos["hiraya-active"].policy).rules[0].selection.countNumber == 7
    error_message = "Untagged images must expire after the default seven-day retention period."
  }

  assert {
    condition     = jsondecode(aws_ecr_lifecycle_policy.repos["hiraya-active"].policy).rules[1].selection.countNumber == 5
    error_message = "Repositories must retain five tagged images by default."
  }

  assert {
    condition     = jsondecode(aws_ecr_lifecycle_policy.repos["hiraya-inactive"].policy).rules[1].selection.countNumber == 2
    error_message = "A repository-specific tagged image retention count must override the default."
  }

  assert {
    condition = jsondecode(aws_ecr_lifecycle_policy.repos["hiraya-active"].policy).rules == [
      {
        rulePriority = 1
        description  = "Expire untagged images after 7 days"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 7
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Retain the latest 5 tagged images"
        selection = {
          tagStatus      = "tagged"
          tagPatternList = ["*"]
          countType      = "imageCountMoreThan"
          countNumber    = 5
        }
        action = {
          type = "expire"
        }
      }
    ]
    error_message = "The lifecycle policy must expire old untagged images before limiting tagged image count."
  }
}
