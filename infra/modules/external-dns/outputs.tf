output "namespace" {
  description = "Namespace where ExternalDNS is installed."
  value       = kubernetes_namespace_v1.external_dns.metadata[0].name
}

output "service_account_name" {
  description = "ExternalDNS Kubernetes service account name."
  value       = local.service_account_name
}

output "iam_role_arn" {
  description = "IAM role ARN assumed by ExternalDNS through IRSA."
  value       = aws_iam_role.external_dns.arn
}

output "hosted_zone_id" {
  description = "Route 53 hosted zone ID scoped in the ExternalDNS IAM policy."
  value       = data.aws_route53_zone.this.zone_id
}
