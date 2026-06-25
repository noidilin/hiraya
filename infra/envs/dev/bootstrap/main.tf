module "ecr" {
  source = "../../../modules/ecr"

  repositories = var.repositories
}

resource "random_password" "vintage_postgres" {
  length           = 32
  special          = true
  override_special = "_-"

  keepers = {
    rotation_epoch = var.vintage_secret_rotation_epoch
  }
}

resource "aws_secretsmanager_secret" "vintage" {
  name                    = local.vintage_secret_name
  description             = "Durable ${title(var.environment)} Vintage Storefront runtime database settings for External Secrets Operator."
  recovery_window_in_days = 30

  tags = merge(local.common_tags, {
    Component = "project-bootstrap"
    Workload  = "vintage"
  })
}

resource "aws_secretsmanager_secret_version" "vintage" {
  secret_id = aws_secretsmanager_secret.vintage.id
  secret_string = jsonencode({
    POSTGRES_DB       = "postgres"
    POSTGRES_USER     = "postgres"
    POSTGRES_PASSWORD = random_password.vintage_postgres.result
    AUTH_DB_URL       = "postgresql://postgres:${random_password.vintage_postgres.result}@vintage-postgres:5432/auth_db"
    PRODUCTS_DB_URL   = "postgresql://postgres:${random_password.vintage_postgres.result}@vintage-postgres:5432/products_db"
    ORDERS_DB_URL     = "postgresql://postgres:${random_password.vintage_postgres.result}@vintage-postgres:5432/orders_db"
    USERS_DB_URL      = "postgresql://postgres:${random_password.vintage_postgres.result}@vintage-postgres:5432/users_db"
  })
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

resource "aws_iam_role" "github_infra_plan" {
  name                 = "${local.name_prefix}-github-infra-plan"
  permissions_boundary = local.gitops_apply_boundary_arn
  assume_role_policy   = data.aws_iam_policy_document.github_infra_plan_assume_role.json

  tags = local.common_tags
}

resource "aws_iam_policy" "github_infra_plan" {
  name        = "${local.name_prefix}-github-infra-plan"
  description = "Read-only Terraform planning access for trusted Hiraya infrastructure pull requests."

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowTerraformStateRead"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion"
        ]
        Resource = local.platform_core_state_read_object_arns
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
        Sid    = "AllowTerraformStateLockfileMutationForPlan"
        Effect = "Allow"
        Action = [
          "s3:DeleteObject",
          "s3:GetObject",
          "s3:PutObject"
        ]
        Resource = [local.terraform_state_lockfile_object_arns.platform_core]
      },
      {
        Sid    = "AllowScopedReadOnlyPlanInspection"
        Effect = "Allow"
        Action = [
          "acm:Describe*",
          "acm:Get*",
          "acm:List*",
          "autoscaling:Describe*",
          "cloudwatch:Describe*",
          "cloudwatch:Get*",
          "cloudwatch:List*",
          "ec2:Describe*",
          "ecr:Describe*",
          "ecr:GetAuthorizationToken",
          "ecr:GetRepositoryPolicy",
          "eks:Describe*",
          "eks:List*",
          "elasticloadbalancing:Describe*",
          "iam:Get*",
          "iam:List*",
          "logs:Describe*",
          "logs:FilterLogEvents",
          "logs:Get*",
          "logs:List*",
          "route53:Get*",
          "route53:List*",
          "s3:GetBucketLocation",
          "secretsmanager:DescribeSecret",
          "secretsmanager:GetSecretValue",
          "secretsmanager:ListSecretVersionIds",
          "secretsmanager:ListSecrets"
        ]
        Resource = "*"
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "github_infra_plan" {
  role       = aws_iam_role.github_infra_plan.name
  policy_arn = aws_iam_policy.github_infra_plan.arn
}

resource "aws_iam_role" "github_cluster_bootstrap" {
  name                 = "${local.name_prefix}-github-cluster-bootstrap"
  permissions_boundary = local.gitops_apply_boundary_arn
  assume_role_policy   = data.aws_iam_policy_document.github_cluster_bootstrap_assume_role.json

  tags = local.common_tags
}

resource "aws_iam_policy" "github_cluster_bootstrap" {
  name        = "${local.name_prefix}-github-cluster-bootstrap"
  description = "Scoped access for Cluster Bootstrap Terraform, Kubernetes bootstrap, smoke checks, and GitOps cleanup."

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowClusterBootstrapStateMutation"
        Effect = "Allow"
        Action = [
          "s3:DeleteObject",
          "s3:GetObject",
          "s3:GetObjectVersion",
          "s3:PutObject"
        ]
        Resource = local.cluster_bootstrap_state_mutation_object_arns
      },
      {
        Sid    = "AllowClusterBootstrapRemoteStateRead"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion"
        ]
        Resource = local.cluster_bootstrap_state_read_object_arns
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
        Sid      = "AllowTerraformStateBucketLocation"
        Effect   = "Allow"
        Action   = ["s3:GetBucketLocation"]
        Resource = "arn:aws:s3:::${var.state_bucket_name}"
      },
      {
        Sid    = "AllowEksBootstrapAndSmokeRead"
        Effect = "Allow"
        Action = [
          "eks:AccessKubernetesApi",
          "eks:DescribeCluster",
          "eks:ListClusters"
        ]
        Resource = "*"
      },
      {
        Sid    = "AllowGitOpsCleanupAwsRead"
        Effect = "Allow"
        Action = [
          "ec2:DescribeVolumes",
          "elasticloadbalancing:DescribeLoadBalancers"
        ]
        Resource = "*"
      },
      {
        Sid      = "AllowGitOpsCleanupRoute53RecordRead"
        Effect   = "Allow"
        Action   = ["route53:ListResourceRecordSets"]
        Resource = "arn:aws:route53:::hostedzone/*"
      },
      {
        Sid    = "AllowArgoAdminSecretRead"
        Effect = "Allow"
        Action = [
          "secretsmanager:DescribeSecret",
          "secretsmanager:GetSecretValue"
        ]
        Resource = local.argocd_admin_secret_arn_pattern
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "github_cluster_bootstrap" {
  role       = aws_iam_role.github_cluster_bootstrap.name
  policy_arn = aws_iam_policy.github_cluster_bootstrap.arn
}

resource "aws_iam_role" "github_infra_apply" {
  name                 = "${local.name_prefix}-github-infra-apply"
  permissions_boundary = local.gitops_apply_boundary_arn
  assume_role_policy   = data.aws_iam_policy_document.github_infra_apply_assume_role.json

  tags = local.common_tags
}

resource "aws_iam_policy" "github_infra_apply" {
  name        = "${local.name_prefix}-github-infra-apply"
  description = "Scoped Terraform apply and destroy access for the disposable Hiraya dev platform."

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowTerraformStateMutation"
        Effect = "Allow"
        Action = [
          "s3:DeleteObject",
          "s3:GetObject",
          "s3:GetObjectVersion",
          "s3:PutObject"
        ]
        Resource = local.platform_core_state_mutation_object_arns
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
        Sid    = "AllowProjectBootstrapStateRead"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion"
        ]
        Resource = [local.terraform_state_object_arns.bootstrap]
      },
      {
        Sid    = "AllowPlatformReadInspection"
        Effect = "Allow"
        Action = [
          "acm:Describe*",
          "acm:Get*",
          "acm:List*",
          "autoscaling:Describe*",
          "cloudwatch:Describe*",
          "cloudwatch:Get*",
          "cloudwatch:List*",
          "ec2:Describe*",
          "ecr:Describe*",
          "ecr:GetAuthorizationToken",
          "ecr:GetRepositoryPolicy",
          "eks:Describe*",
          "eks:List*",
          "elasticloadbalancing:Describe*",
          "iam:Get*",
          "iam:List*",
          "logs:Describe*",
          "logs:FilterLogEvents",
          "logs:Get*",
          "logs:List*",
          "route53:Get*",
          "route53:List*",
          "s3:GetBucketLocation",
          "secretsmanager:DescribeSecret",
          "secretsmanager:GetSecretValue",
          "secretsmanager:ListSecretVersionIds",
          "secretsmanager:ListSecrets"
        ]
        Resource = "*"
      },
      {
        Sid    = "AllowPlatformInfrastructureMutation"
        Effect = "Allow"
        Action = [
          "acm:AddTagsToCertificate",
          "acm:DeleteCertificate",
          "acm:RemoveTagsFromCertificate",
          "acm:RequestCertificate",
          "autoscaling:CreateOrUpdateTags",
          "autoscaling:DeleteTags",
          "autoscaling:SetDesiredCapacity",
          "autoscaling:TerminateInstanceInAutoScalingGroup",
          "ec2:AllocateAddress",
          "ec2:AssociateRouteTable",
          "ec2:AttachInternetGateway",
          "ec2:AuthorizeSecurityGroupEgress",
          "ec2:AuthorizeSecurityGroupIngress",
          "ec2:CreateInternetGateway",
          "ec2:CreateNatGateway",
          "ec2:CreateRoute",
          "ec2:CreateRouteTable",
          "ec2:CreateSecurityGroup",
          "ec2:CreateSubnet",
          "ec2:CreateTags",
          "ec2:CreateVpc",
          "ec2:CreateVpcEndpoint",
          "ec2:DeleteInternetGateway",
          "ec2:DeleteNatGateway",
          "ec2:DeleteRoute",
          "ec2:DeleteRouteTable",
          "ec2:DeleteSecurityGroup",
          "ec2:DeleteSubnet",
          "ec2:DeleteTags",
          "ec2:DeleteVpc",
          "ec2:DeleteVpcEndpoints",
          "ec2:DetachInternetGateway",
          "ec2:DisassociateAddress",
          "ec2:DisassociateRouteTable",
          "ec2:ModifySubnetAttribute",
          "ec2:ModifyVpcAttribute",
          "ec2:ReleaseAddress",
          "ec2:RevokeSecurityGroupEgress",
          "ec2:RevokeSecurityGroupIngress",
          "eks:AssociateAccessPolicy",
          "eks:CreateAccessEntry",
          "eks:CreateAddon",
          "eks:CreateCluster",
          "eks:CreateNodegroup",
          "eks:DeleteAccessEntry",
          "eks:DeleteAddon",
          "eks:DeleteCluster",
          "eks:DeleteNodegroup",
          "eks:DisassociateAccessPolicy",
          "eks:TagResource",
          "eks:UntagResource",
          "eks:UpdateAddon",
          "eks:UpdateClusterConfig",
          "eks:UpdateClusterVersion",
          "eks:UpdateNodegroupConfig",
          "eks:UpdateNodegroupVersion",
          "elasticloadbalancing:AddTags",
          "elasticloadbalancing:CreateListener",
          "elasticloadbalancing:CreateLoadBalancer",
          "elasticloadbalancing:CreateRule",
          "elasticloadbalancing:CreateTargetGroup",
          "elasticloadbalancing:DeleteListener",
          "elasticloadbalancing:DeleteLoadBalancer",
          "elasticloadbalancing:DeleteRule",
          "elasticloadbalancing:DeleteTargetGroup",
          "elasticloadbalancing:ModifyListener",
          "elasticloadbalancing:ModifyLoadBalancerAttributes",
          "elasticloadbalancing:ModifyRule",
          "elasticloadbalancing:ModifyTargetGroup",
          "elasticloadbalancing:ModifyTargetGroupAttributes",
          "elasticloadbalancing:RemoveTags",
          "elasticloadbalancing:SetSecurityGroups",
          "elasticloadbalancing:SetSubnets",
          "logs:AssociateKmsKey",
          "logs:CreateLogGroup",
          "logs:DeleteLogGroup",
          "logs:DeleteRetentionPolicy",
          "logs:DisassociateKmsKey",
          "logs:PutRetentionPolicy",
          "logs:TagResource",
          "logs:UntagResource",
          "route53:ChangeResourceRecordSets",
          "secretsmanager:CreateSecret",
          "secretsmanager:DeleteSecret",
          "secretsmanager:DescribeSecret",
          "secretsmanager:GetSecretValue",
          "secretsmanager:ListSecretVersionIds",
          "secretsmanager:PutSecretValue",
          "secretsmanager:TagResource",
          "secretsmanager:UntagResource",
          "secretsmanager:UpdateSecret"
        ]
        Resource = "*"
      },
      {
        Sid    = "AllowPlatformIamMutation"
        Effect = "Allow"
        Action = [
          "iam:AddRoleToInstanceProfile",
          "iam:AttachRolePolicy",
          "iam:CreateInstanceProfile",
          "iam:CreateOpenIDConnectProvider",
          "iam:CreatePolicy",
          "iam:CreatePolicyVersion",
          "iam:CreateRole",
          "iam:DeleteInstanceProfile",
          "iam:DeleteOpenIDConnectProvider",
          "iam:DeletePolicy",
          "iam:DeletePolicyVersion",
          "iam:DeleteRole",
          "iam:DeleteRolePolicy",
          "iam:DetachRolePolicy",
          "iam:PutRolePolicy",
          "iam:RemoveRoleFromInstanceProfile",
          "iam:SetDefaultPolicyVersion",
          "iam:TagInstanceProfile",
          "iam:TagOpenIDConnectProvider",
          "iam:TagPolicy",
          "iam:TagRole",
          "iam:UntagInstanceProfile",
          "iam:UntagOpenIDConnectProvider",
          "iam:UntagPolicy",
          "iam:UntagRole",
          "iam:UpdateAssumeRolePolicy"
        ]
        Resource = [
          local.platform_role_arn_pattern,
          local.platform_policy_arn_pattern,
          "arn:aws:iam::${data.aws_caller_identity.current.account_id}:instance-profile/${local.name_prefix}-*",
          local.platform_oidc_provider_arn_pattern
        ]
      },
      {
        Sid      = "AllowPlatformServiceLinkedRoles"
        Effect   = "Allow"
        Action   = ["iam:CreateServiceLinkedRole"]
        Resource = "*"
        Condition = {
          StringEquals = {
            "iam:AWSServiceName" = [
              "autoscaling.amazonaws.com",
              "elasticloadbalancing.amazonaws.com",
              "eks.amazonaws.com",
              "spot.amazonaws.com"
            ]
          }
        }
      },
      {
        Sid      = "AllowConstrainedPassRoleForPlatformServices"
        Effect   = "Allow"
        Action   = ["iam:PassRole"]
        Resource = local.platform_role_arn_pattern
        Condition = {
          StringEquals = {
            "iam:PassedToService" = [
              "ec2.amazonaws.com",
              "eks.amazonaws.com",
              "vpc-flow-logs.amazonaws.com"
            ]
          }
        }
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "github_infra_apply" {
  role       = aws_iam_role.github_infra_apply.name
  policy_arn = aws_iam_policy.github_infra_apply.arn
}

