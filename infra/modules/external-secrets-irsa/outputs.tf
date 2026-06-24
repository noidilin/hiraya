output "namespace" {
  description = "Namespace where External Secrets Operator runs."
  value       = local.namespace
}

output "service_account_name" {
  description = "External Secrets Operator Kubernetes service account name."
  value       = local.service_account_name
}

output "role_arn" {
  description = "IAM role ARN assumed by External Secrets Operator through IRSA."
  value       = aws_iam_role.external_secrets.arn
}
