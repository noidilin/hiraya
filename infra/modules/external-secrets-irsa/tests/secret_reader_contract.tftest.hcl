provider "aws" {
  region                      = "ap-northeast-1"
  access_key                  = "test"
  secret_key                  = "test"
  skip_credentials_validation = true
  skip_requesting_account_id  = true
  skip_metadata_api_check     = true
}

run "trusts_exact_eso_service_account_and_reads_only_allowlist" {
  command = plan

  variables {
    cluster_name      = "test-eks"
    oidc_provider_arn = "arn:aws:iam::123456789012:oidc-provider/oidc.eks.ap-northeast-1.amazonaws.com/id/EXAMPLE"
    oidc_issuer_url   = "https://oidc.eks.ap-northeast-1.amazonaws.com/id/EXAMPLE"
    secret_arns = [
      "arn:aws:secretsmanager:ap-northeast-1:123456789012:secret:/hiraya/dev/platform/argocd-admin-AbCdEf",
      "arn:aws:secretsmanager:ap-northeast-1:123456789012:secret:/hiraya/dev/platform/grafana-admin-AbCdEf",
      "arn:aws:secretsmanager:ap-northeast-1:123456789012:secret:/hiraya/dev/apps/vintage-AbCdEf",
    ]
  }

  assert {
    condition     = output.namespace == "external-secrets" && output.service_account_name == "external-secrets"
    error_message = "External Secrets Operator IRSA must expose the fixed namespace/service-account contract."
  }

  assert {
    condition     = jsondecode(aws_iam_role.external_secrets.assume_role_policy).Statement[0].Condition.StringEquals["oidc.eks.ap-northeast-1.amazonaws.com/id/EXAMPLE:sub"] == "system:serviceaccount:external-secrets:external-secrets"
    error_message = "External Secrets Operator IRSA trust must use the exact service-account subject."
  }

  assert {
    condition = length(jsondecode(aws_iam_policy.external_secrets.policy).Statement[0].Action) == 2 && alltrue([
      for action in ["secretsmanager:DescribeSecret", "secretsmanager:GetSecretValue"] :
      contains(jsondecode(aws_iam_policy.external_secrets.policy).Statement[0].Action, action)
    ])
    error_message = "External Secrets Operator policy must only allow secret read actions."
  }

  assert {
    condition = length(jsondecode(aws_iam_policy.external_secrets.policy).Statement[0].Resource) == length(var.secret_arns) && alltrue([
      for arn in var.secret_arns : contains(jsondecode(aws_iam_policy.external_secrets.policy).Statement[0].Resource, arn)
    ])
    error_message = "External Secrets Operator policy must be scoped exactly to the allowlisted secret ARNs."
  }
}
