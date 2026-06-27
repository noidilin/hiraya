run "creates_scoped_infra_oidc_roles" {
  command = plan

  variables {
    github_repository = "example/hiraya"
    state_bucket_name = "hiraya-tf-state"
    repositories      = ["hiraya-frontend"]

    skip_aws_credentials_validation = true
  }

  override_data {
    target = data.aws_caller_identity.current
    values = {
      account_id = "123456789012"
    }
  }

  override_data {
    target = data.aws_iam_openid_connect_provider.github
    values = {
      arn = "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com"
    }
  }

  assert {
    condition     = jsondecode(aws_iam_role.github_image_push.assume_role_policy).Statement[0].Condition.StringEquals["token.actions.githubusercontent.com:sub"] == "repo:example/hiraya:ref:refs/heads/main"
    error_message = "The image-push role must remain main-branch-only."
  }

  assert {
    condition = contains(
      jsondecode(aws_iam_role.github_infra_plan.assume_role_policy).Statement[0].Condition.StringEquals["token.actions.githubusercontent.com:sub"],
      "repo:example/hiraya:pull_request"
    )
    error_message = "The plan role must trust same-repository pull_request subjects."
  }

  assert {
    condition = contains(
      jsondecode(aws_iam_role.github_infra_plan.assume_role_policy).Statement[0].Condition.StringEquals["token.actions.githubusercontent.com:sub"],
      "repo:example/hiraya:ref:refs/heads/main"
    )
    error_message = "The plan role must trust main-branch plan subjects."
  }

  assert {
    condition     = jsondecode(aws_iam_role.github_infra_apply.assume_role_policy).Statement[0].Condition.StringEquals["token.actions.githubusercontent.com:sub"] == "repo:example/hiraya:environment:dev"
    error_message = "The apply role must trust only the dev GitHub Environment subject."
  }

  assert {
    condition     = jsondecode(aws_iam_role.github_cluster_bootstrap.assume_role_policy).Statement[0].Condition.StringEquals["token.actions.githubusercontent.com:sub"] == "repo:example/hiraya:environment:dev"
    error_message = "The cluster-bootstrap role must trust only the dev GitHub Environment subject."
  }

  assert {
    condition = alltrue(flatten([
      for statement in jsondecode(aws_iam_policy.github_infra_plan.policy).Statement : [
        for resource in try(tolist(statement.Resource), [statement.Resource]) : endswith(resource, ".tflock")
        if try(contains(tolist(statement.Action), "s3:PutObject"), false) || try(contains(tolist(statement.Action), "s3:DeleteObject"), false)
      ]
    ]))
    error_message = "The plan role must only mutate Terraform S3 native lock-file objects, not state objects."
  }

  assert {
    condition = contains(
      flatten([
        for statement in jsondecode(aws_iam_policy.github_infra_plan.policy).Statement : try(tolist(statement.Resource), [statement.Resource])
        if statement.Sid == "AllowTerraformStateLockfileMutationForPlan"
      ]),
      "arn:aws:s3:::hiraya-tf-state/devops-hiraya-dev/dev/platform-core/terraform.tfstate.tflock"
    )
    error_message = "The plan role must allow Terraform S3 native lock-file mutation for Platform Core preflight plans."
  }

  assert {
    condition = contains(
      flatten([
        for statement in jsondecode(aws_iam_policy.github_infra_plan.policy).Statement : try(tolist(statement.Condition.StringLike["s3:prefix"]), [statement.Condition.StringLike["s3:prefix"]])
        if statement.Sid == "AllowTerraformStateBucketList"
      ]),
      "devops-hiraya-dev/dev/platform-core/terraform.tfstate.tflock"
    )
    error_message = "The plan role must allow listing Terraform S3 native lock-file keys for Platform Core preflight plans."
  }

  assert {
    condition = !anytrue(flatten([
      for statement in jsondecode(aws_iam_policy.github_infra_plan.policy).Statement : [
        for action in try(tolist(statement.Action), [statement.Action]) : action == "eks:AccessKubernetesApi"
      ]
    ]))
    error_message = "The infra plan role must not receive Kubernetes API access."
  }

  assert {
    condition = !anytrue(flatten([
      for statement in jsondecode(aws_iam_policy.github_infra_apply.policy).Statement : [
        for action in try(tolist(statement.Action), [statement.Action]) : action == "eks:AccessKubernetesApi"
      ]
    ]))
    error_message = "The infra apply role must not receive Kubernetes API access."
  }

  assert {
    condition = anytrue(flatten([
      for statement in jsondecode(aws_iam_policy.github_cluster_bootstrap.policy).Statement : [
        for action in try(tolist(statement.Action), [statement.Action]) : action == "eks:AccessKubernetesApi"
      ]
    ]))
    error_message = "The cluster-bootstrap role must receive Kubernetes API access for bootstrap and smoke checks."
  }

  assert {
    condition = alltrue([
      for required_action in [
        "ec2:DescribeVolumes",
        "elasticloadbalancing:DescribeLoadBalancers",
        "route53:ListResourceRecordSets",
        ] : anytrue(flatten([
          for statement in jsondecode(aws_iam_policy.github_cluster_bootstrap.policy).Statement : [
            for action in try(tolist(statement.Action), [statement.Action]) : action == required_action
          ]
      ]))
    ])
    error_message = "The cluster-bootstrap role must allow read-only AWS checks used by ordered GitOps destroy cleanup."
  }

  assert {
    condition = !anytrue(flatten([
      for statement in jsondecode(aws_iam_policy.github_cluster_bootstrap.policy).Statement : [
        for action in try(tolist(statement.Action), [statement.Action]) : contains(["ec2", "elasticloadbalancing", "route53"], split(":", action)[0]) && !anytrue([
          startswith(action, "ec2:Describe"),
          startswith(action, "elasticloadbalancing:Describe"),
          startswith(action, "route53:List"),
          startswith(action, "route53:Get"),
        ])
      ]
    ]))
    error_message = "The cluster-bootstrap role must not receive AWS infrastructure mutation permissions for GitOps cleanup."
  }

  assert {
    condition = contains(
      flatten([
        for statement in jsondecode(aws_iam_policy.github_cluster_bootstrap.policy).Statement : try(tolist(statement.Resource), [statement.Resource])
        if statement.Sid == "AllowClusterBootstrapStateMutation"
      ]),
      "arn:aws:s3:::hiraya-tf-state/devops-hiraya-dev/dev/cluster-bootstrap/terraform.tfstate"
    )
    error_message = "The cluster-bootstrap role must mutate the Cluster Bootstrap state object."
  }

  assert {
    condition = !contains(
      flatten([
        for statement in jsondecode(aws_iam_policy.github_cluster_bootstrap.policy).Statement : try(tolist(statement.Resource), [statement.Resource])
        if statement.Sid == "AllowClusterBootstrapStateMutation"
      ]),
      "arn:aws:s3:::hiraya-tf-state/devops-hiraya-dev/dev/platform-core/terraform.tfstate"
    )
    error_message = "The cluster-bootstrap role must not mutate the Platform Core state object."
  }

  assert {
    condition     = length([for statement in jsondecode(aws_iam_policy.github_infra_apply.policy).Statement : statement if try(contains(tolist(statement.Action), "iam:PassRole"), false) && statement.Resource == "*"]) == 0
    error_message = "The apply policy must not allow wildcard iam:PassRole."
  }

  assert {
    condition = anytrue([
      for statement in jsondecode(aws_iam_policy.github_infra_apply.policy).Statement : try(contains(tolist(statement.Action), "ec2:DisassociateAddress"), false)
      if statement.Sid == "AllowPlatformInfrastructureMutation"
    ])
    error_message = "The apply policy must allow EC2 EIP disassociation during VPC destroy."
  }

  assert {
    condition = anytrue([
      for statement in jsondecode(aws_iam_policy.github_infra_apply.policy).Statement : try(contains(tolist(statement.Action), "logs:TagResource"), false)
      if statement.Sid == "AllowPlatformInfrastructureMutation"
    ])
    error_message = "The apply policy must allow tagging CloudWatch log groups during tagged creation."
  }

  assert {
    condition     = aws_iam_role.github_infra_plan.permissions_boundary != local.runtime_boundary_arn && aws_iam_role.github_infra_apply.permissions_boundary != local.runtime_boundary_arn
    error_message = "The infra plan/apply roles must not attach the runtime permissions boundary because it explicitly denies IAM reads required by Terraform refresh."
  }

  assert {
    condition = length([
      for statement in jsondecode(aws_iam_policy.github_infra_apply.policy).Statement : statement
      if statement.Sid == "AllowTerraformStateBucketAccessCheck" && try(statement.Resource, "") == "arn:aws:s3:::hiraya-tf-state" && !can(statement.Condition)
    ]) == 1
    error_message = "The apply policy must allow unprefixed S3 bucket access checks used by destroy verification."
  }

  assert {
    condition = contains(
      flatten([
        for statement in jsondecode(aws_iam_policy.github_infra_apply.policy).Statement : try(tolist(statement.Condition.StringEquals["iam:AWSServiceName"]), [statement.Condition.StringEquals["iam:AWSServiceName"]])
        if statement.Sid == "AllowPlatformServiceLinkedRoles"
      ]),
      "spot.amazonaws.com"
    )
    error_message = "The apply policy must be able to create the EC2 Spot service-linked role required by SPOT EKS node groups."
  }

  assert {
    condition = contains(
      flatten([
        for statement in jsondecode(aws_iam_policy.github_infra_apply.policy).Statement : try(tolist(statement.Resource), [statement.Resource])
        if statement.Sid == "AllowTerraformStateMutation"
      ]),
      "arn:aws:s3:::hiraya-tf-state/devops-hiraya-dev/dev/platform-core/terraform.tfstate.tflock"
    )
    error_message = "The apply policy must allow Terraform S3 native lock-file mutation for the Platform Core state."
  }

  assert {
    condition = contains(
      flatten([
        for statement in jsondecode(aws_iam_policy.github_infra_apply.policy).Statement : try(tolist(statement.Condition.StringLike["s3:prefix"]), [statement.Condition.StringLike["s3:prefix"]])
        if statement.Sid == "AllowTerraformStateBucketList"
      ]),
      "devops-hiraya-dev/dev/platform-core/terraform.tfstate.tflock"
    )
    error_message = "The apply policy must allow listing Terraform S3 native lock-file keys."
  }

  assert {
    condition     = aws_secretsmanager_secret.vintage.name == "/hiraya/dev/apps/vintage"
    error_message = "Project Bootstrap must own the stable durable Vintage dev secret name."
  }

  assert {
    condition     = output.platform_core_backend_config.key == "devops-hiraya-dev/dev/platform-core/terraform.tfstate"
    error_message = "Project Bootstrap must expose the Platform Core backend key."
  }

  assert {
    condition     = output.cluster_bootstrap_backend_config.key == "devops-hiraya-dev/dev/cluster-bootstrap/terraform.tfstate"
    error_message = "Project Bootstrap must expose the Cluster Bootstrap backend key."
  }

  assert {
    condition     = output.portfolio_backend_config.key == "devops-hiraya-dev/dev/portfolio/terraform.tfstate"
    error_message = "Project Bootstrap must expose the Portfolio Stack backend key."
  }

  assert {
    condition     = jsondecode(aws_iam_role.github_portfolio_plan.assume_role_policy).Statement[0].Condition.StringEquals["token.actions.githubusercontent.com:sub"] == ["repo:example/hiraya:pull_request", "repo:example/hiraya:ref:refs/heads/main"]
    error_message = "The portfolio plan role must trust PR and main plan subjects only."
  }

  assert {
    condition     = jsondecode(aws_iam_role.github_portfolio_apply.assume_role_policy).Statement[0].Condition.StringEquals["token.actions.githubusercontent.com:sub"] == "repo:example/hiraya:environment:dev"
    error_message = "The portfolio apply role must trust only the dev GitHub Environment subject."
  }

  assert {
    condition     = jsondecode(aws_iam_role.github_portfolio_app_deploy.assume_role_policy).Statement[0].Condition.StringEquals["token.actions.githubusercontent.com:sub"] == "repo:example/hiraya:ref:refs/heads/main"
    error_message = "The portfolio app deploy role must be main-branch-only."
  }

  assert {
    condition     = jsondecode(aws_iam_role.github_portfolio_knowledge_sync.assume_role_policy).Statement[0].Condition.StringEquals["token.actions.githubusercontent.com:sub"] == "repo:example/hiraya:ref:refs/heads/main"
    error_message = "The portfolio knowledge sync role must be main-branch-only."
  }

  assert {
    condition = contains(
      flatten([
        for statement in jsondecode(aws_iam_policy.github_portfolio_apply.policy).Statement : try(tolist(statement.Resource), [statement.Resource])
        if statement.Sid == "AllowPortfolioStateMutation"
      ]),
      "arn:aws:s3:::hiraya-tf-state/devops-hiraya-dev/dev/portfolio/terraform.tfstate"
    )
    error_message = "The portfolio apply role must mutate the Portfolio Stack state object."
  }

  assert {
    condition = !contains(
      flatten([
        for statement in jsondecode(aws_iam_policy.github_portfolio_apply.policy).Statement : try(tolist(statement.Resource), [statement.Resource])
        if statement.Sid == "AllowPortfolioStateMutation"
      ]),
      "arn:aws:s3:::hiraya-tf-state/devops-hiraya-dev/dev/platform-core/terraform.tfstate"
    )
    error_message = "The portfolio apply role must not mutate the Platform Core state object."
  }

  assert {
    condition = !anytrue(flatten([
      for policy in [
        aws_iam_policy.github_portfolio_plan.policy,
        aws_iam_policy.github_portfolio_apply.policy,
        aws_iam_policy.github_portfolio_app_deploy.policy,
        aws_iam_policy.github_portfolio_knowledge_sync.policy,
        ] : [
        for statement in jsondecode(policy).Statement : [
          for action in try(tolist(statement.Action), [statement.Action]) : startswith(action, "eks:")
        ]
      ]
    ]))
    error_message = "Portfolio roles must not receive EKS permissions from disposable platform workflows."
  }

  assert {
    condition = length([
      for statement in jsondecode(aws_iam_policy.github_portfolio_app_deploy.policy).Statement : statement
      if anytrue([for action in try(tolist(statement.Action), [statement.Action]) : startswith(action, "bedrock:")])
    ]) == 0
    error_message = "The portfolio app deploy role must not receive Bedrock knowledge sync permissions."
  }

  assert {
    condition = length([
      for statement in jsondecode(aws_iam_policy.github_portfolio_knowledge_sync.policy).Statement : statement
      if anytrue([for action in try(tolist(statement.Action), [statement.Action]) : startswith(action, "cloudfront:")])
    ]) == 0
    error_message = "The portfolio knowledge sync role must not receive CloudFront app deploy permissions."
  }

  assert {
    condition = alltrue([
      for required_action in [
        "s3vectors:GetVectorBucket",
        "s3vectors:GetVectorBucketPolicy",
        "s3vectors:GetIndex",
        "s3vectors:ListVectorBuckets",
        "s3vectors:ListIndexes",
        ] : anytrue(flatten([
          for statement in jsondecode(aws_iam_policy.github_portfolio_plan.policy).Statement : [
            for action in try(tolist(statement.Action), [statement.Action]) : action == required_action
          ]
      ]))
    ])
    error_message = "The portfolio plan role must include S3 Vectors read permissions for Terraform refresh."
  }

  assert {
    condition = alltrue([
      for required_action in [
        "s3vectors:CreateVectorBucket",
        "s3vectors:DeleteVectorBucket",
        "s3vectors:PutVectorBucketPolicy",
        "s3vectors:DeleteVectorBucketPolicy",
        "s3vectors:CreateIndex",
        "s3vectors:DeleteIndex",
        "s3vectors:TagResource",
        "s3vectors:UntagResource",
        ] : anytrue(flatten([
          for statement in jsondecode(aws_iam_policy.github_portfolio_apply.policy).Statement : [
            for action in try(tolist(statement.Action), [statement.Action]) : action == required_action
          ]
      ]))
    ])
    error_message = "The portfolio apply role must include S3 Vectors mutation permissions."
  }

  assert {
    condition = !anytrue(flatten([
      for policy in [aws_iam_policy.github_portfolio_plan.policy, aws_iam_policy.github_portfolio_apply.policy] : [
        for statement in jsondecode(policy).Statement : [
          for action in try(tolist(statement.Action), [statement.Action]) : startswith(action, "aoss:")
        ]
      ]
    ]))
    error_message = "Portfolio Terraform roles must not keep OpenSearch Serverless permissions after the S3 Vectors switch."
  }

  assert {
    condition = contains(flatten([
      for statement in jsondecode(aws_iam_policy.github_portfolio_app_deploy.policy).Statement : try(tolist(statement.Resource), [statement.Resource])
      if statement.Sid == "AllowPortfolioAssetDeploy"
      ]), "arn:aws:s3:::devops-hiraya-dev-portfolio-site") && !contains(flatten([
      for statement in jsondecode(aws_iam_policy.github_portfolio_app_deploy.policy).Statement : try(tolist(statement.Resource), [statement.Resource])
      if statement.Sid == "AllowPortfolioAssetDeploy"
    ]), "arn:aws:s3:::devops-hiraya-dev-portfolio-knowledge")
    error_message = "The portfolio app deploy role must be scoped to the site bucket only."
  }

  assert {
    condition = contains(flatten([
      for statement in jsondecode(aws_iam_policy.github_portfolio_knowledge_sync.policy).Statement : try(tolist(statement.Resource), [statement.Resource])
      if statement.Sid == "AllowCuratedKnowledgeSync"
      ]), "arn:aws:s3:::devops-hiraya-dev-portfolio-knowledge") && !contains(flatten([
      for statement in jsondecode(aws_iam_policy.github_portfolio_knowledge_sync.policy).Statement : try(tolist(statement.Resource), [statement.Resource])
      if statement.Sid == "AllowCuratedKnowledgeSync"
    ]), "arn:aws:s3:::devops-hiraya-dev-portfolio-site")
    error_message = "The portfolio knowledge sync role must be scoped to the knowledge bucket only."
  }

  assert {
    condition = alltrue([
      for required_action in ["lambda:GetFunctionConfiguration", "lambda:UpdateFunctionConfiguration"] : anytrue(flatten([
        for statement in jsondecode(aws_iam_policy.github_portfolio_knowledge_sync.policy).Statement : [
          for action in try(tolist(statement.Action), [statement.Action]) : action == required_action
          if statement.Sid == "AllowKnowledgeVersionRefresh"
        ]
      ]))
    ])
    error_message = "The portfolio knowledge sync role must refresh the Guide API Lambda knowledge version."
  }

  assert {
    condition     = random_password.vintage_postgres.keepers.rotation_epoch == "1"
    error_message = "The Vintage secret must rotate only when the manual rotation epoch changes."
  }
}
