provider "aws" {
  region                      = "ap-northeast-1"
  access_key                  = "test"
  secret_key                  = "test"
  skip_credentials_validation = true
  skip_requesting_account_id  = true
  skip_metadata_api_check     = true
}

run "trusts_exact_external_dns_service_account_and_scopes_hosted_zone" {
  command = plan

  variables {
    cluster_name      = "test-eks"
    oidc_provider_arn = "arn:aws:iam::123456789012:oidc-provider/oidc.eks.ap-northeast-1.amazonaws.com/id/EXAMPLE"
    oidc_issuer_url   = "https://oidc.eks.ap-northeast-1.amazonaws.com/id/EXAMPLE"
    hosted_zone_name  = "hiraya.noidilin.dev"
  }

  override_data {
    target = data.aws_route53_zone.this
    values = {
      arn     = "arn:aws:route53:::hostedzone/Z1234567890"
      zone_id = "Z1234567890"
      name    = "hiraya.noidilin.dev"
    }
  }

  assert {
    condition     = output.namespace == "external-dns" && output.service_account_name == "external-dns"
    error_message = "ExternalDNS IRSA must expose the fixed namespace/service-account contract."
  }

  assert {
    condition     = jsondecode(aws_iam_role.external_dns.assume_role_policy).Statement[0].Condition.StringEquals["oidc.eks.ap-northeast-1.amazonaws.com/id/EXAMPLE:sub"] == "system:serviceaccount:external-dns:external-dns"
    error_message = "ExternalDNS IRSA trust must use the exact service-account subject."
  }

  assert {
    condition = contains(flatten([
      for statement in jsondecode(aws_iam_policy.external_dns.policy).Statement : try(tolist(statement.Resource), [statement.Resource])
    ]), "arn:aws:route53:::hostedzone/Z1234567890")
    error_message = "ExternalDNS policy must scope record mutation to the configured public hosted zone."
  }
}
