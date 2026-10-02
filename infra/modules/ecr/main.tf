variable "repositories" {
  description = "ECR repositories keyed by name with repository-specific image retention settings."
  type = map(object({
    tagged_image_count  = optional(number, 5)
    untagged_image_days = optional(number, 7)
  }))

  validation {
    condition = alltrue([
      for repository in values(var.repositories) :
      repository.tagged_image_count > 0 &&
      repository.tagged_image_count == floor(repository.tagged_image_count) &&
      repository.untagged_image_days > 0 &&
      repository.untagged_image_days == floor(repository.untagged_image_days)
    ])
    error_message = "ECR tagged image counts and untagged image retention days must be positive integers."
  }
}

resource "aws_ecr_repository" "repos" {
  for_each = var.repositories

  name         = each.key
  force_delete = false

  image_scanning_configuration {
    scan_on_push = true
  }

  image_tag_mutability = "IMMUTABLE"
}

resource "aws_ecr_lifecycle_policy" "repos" {
  for_each = var.repositories

  repository = aws_ecr_repository.repos[each.key].name
  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Expire untagged images after ${each.value.untagged_image_days} days"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = each.value.untagged_image_days
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Retain the latest ${each.value.tagged_image_count} tagged images"
        selection = {
          tagStatus      = "tagged"
          tagPatternList = ["*"]
          countType      = "imageCountMoreThan"
          countNumber    = each.value.tagged_image_count
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
