provider "aws" {
  region                      = "ap-northeast-1"
  access_key                  = "test"
  secret_key                  = "test"
  skip_credentials_validation = true
  skip_requesting_account_id  = true
  skip_metadata_api_check     = true
}

run "exposes_fixed_fluent_bit_contract_and_platform_log_group" {
  command = plan

  variables {
    cluster_name      = "test-eks"
    region            = "ap-northeast-1"
    oidc_provider_arn = "arn:aws:iam::123456789012:oidc-provider/oidc.eks.ap-northeast-1.amazonaws.com/id/EXAMPLE"
    oidc_issuer_url   = "https://oidc.eks.ap-northeast-1.amazonaws.com/id/EXAMPLE"
  }

  override_data {
    target = data.aws_caller_identity.current
    values = {
      account_id = "123456789012"
    }
  }

  assert {
    condition     = output.namespace == "amazon-cloudwatch" && output.service_account_name == "aws-for-fluent-bit"
    error_message = "Fluent Bit IRSA must expose the fixed namespace/service-account contract."
  }

  assert {
    condition     = output.log_group_name == "/eks/hiraya/dev/pods"
    error_message = "Fluent Bit must default to the platform-wide Hiraya dev pod log group."
  }

  assert {
    condition     = jsondecode(aws_iam_role.fluent_bit.assume_role_policy).Statement[0].Condition.StringEquals["oidc.eks.ap-northeast-1.amazonaws.com/id/EXAMPLE:sub"] == "system:serviceaccount:amazon-cloudwatch:aws-for-fluent-bit"
    error_message = "Fluent Bit IRSA trust must use the exact service-account subject."
  }

  assert {
    condition = length(jsondecode(aws_iam_role_policy.fluent_bit_cloudwatch.policy).Statement[0].Resource) == 2 && alltrue([
      for arn in [
        "arn:aws:logs:ap-northeast-1:123456789012:log-group:/eks/hiraya/dev/pods",
        "arn:aws:logs:ap-northeast-1:123456789012:log-group:/eks/hiraya/dev/pods:log-stream:*",
      ] : contains(jsondecode(aws_iam_role_policy.fluent_bit_cloudwatch.policy).Statement[0].Resource, arn)
    ])
    error_message = "Fluent Bit CloudWatch writes must be scoped to the configured pod log group."
  }
}
