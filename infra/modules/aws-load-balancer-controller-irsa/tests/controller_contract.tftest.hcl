provider "aws" {
  region                      = "ap-northeast-1"
  access_key                  = "test"
  secret_key                  = "test"
  skip_credentials_validation = true
  skip_requesting_account_id  = true
  skip_metadata_api_check     = true
}

run "exposes_fixed_subject_contract_without_deferred_waf_shield" {
  command = plan

  variables {
    cluster_name             = "test-eks"
    oidc_provider_arn        = "arn:aws:iam::123456789012:oidc-provider/oidc.eks.ap-northeast-1.amazonaws.com/id/EXAMPLE"
    oidc_issuer_url          = "https://oidc.eks.ap-northeast-1.amazonaws.com/id/EXAMPLE"
    permissions_boundary_arn = "arn:aws:iam::123456789012:policy/lab-devops-permissions-boundary"
  }

  assert {
    condition     = output.namespace == "kube-system" && output.service_account_name == "aws-load-balancer-controller"
    error_message = "AWS Load Balancer Controller IRSA must expose the fixed namespace/service-account contract."
  }

  assert {
    condition     = jsondecode(aws_iam_role.controller.assume_role_policy).Statement[0].Condition.StringEquals["oidc.eks.ap-northeast-1.amazonaws.com/id/EXAMPLE:sub"] == "system:serviceaccount:kube-system:aws-load-balancer-controller"
    error_message = "AWS Load Balancer Controller IRSA trust must use the exact service-account subject."
  }

  assert {
    condition = !anytrue(flatten([
      for statement in jsondecode(aws_iam_policy.controller.policy).Statement : [
        for action in try(tolist(statement.Action), [statement.Action]) :
        startswith(lower(action), "waf") || startswith(lower(action), "shield")
      ]
    ]))
    error_message = "Deferred WAF and Shield permissions must not be present in the AWS Load Balancer Controller policy."
  }
}
