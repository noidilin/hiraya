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
    condition     = length([for statement in jsondecode(aws_iam_policy.github_infra_plan.policy).Statement : statement if try(contains(tolist(statement.Action), "s3:PutObject"), false) || try(contains(tolist(statement.Action), "s3:DeleteObject"), false)]) == 0
    error_message = "The plan role must not have Terraform state mutation access."
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
    condition     = aws_iam_role.github_infra_plan.permissions_boundary == null && aws_iam_role.github_infra_apply.permissions_boundary == null
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
        for statement in jsondecode(aws_iam_policy.github_infra_apply.policy).Statement : try(tolist(statement.Resource), [statement.Resource])
        if statement.Sid == "AllowTerraformStateMutation"
      ]),
      "arn:aws:s3:::hiraya-tf-state/devops-hiraya-dev/dev/platform/terraform.tfstate.tflock"
    )
    error_message = "The apply policy must allow Terraform S3 native lock-file mutation for the platform state."
  }

  assert {
    condition = contains(
      flatten([
        for statement in jsondecode(aws_iam_policy.github_infra_apply.policy).Statement : try(tolist(statement.Condition.StringLike["s3:prefix"]), [statement.Condition.StringLike["s3:prefix"]])
        if statement.Sid == "AllowTerraformStateBucketList"
      ]),
      "devops-hiraya-dev/dev/platform/terraform.tfstate.tflock"
    )
    error_message = "The apply policy must allow listing Terraform S3 native lock-file keys."
  }
}
