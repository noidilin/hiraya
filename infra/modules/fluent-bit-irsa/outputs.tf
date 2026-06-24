output "namespace" {
  description = "Kubernetes namespace where aws-for-fluent-bit runs."
  value       = local.namespace
}

output "service_account_name" {
  description = "Kubernetes service account annotated for Fluent Bit IRSA."
  value       = local.service_account_name
}

output "role_arn" {
  description = "IAM role ARN assumed by aws-for-fluent-bit through IRSA."
  value       = aws_iam_role.fluent_bit.arn
}

output "log_group_name" {
  description = "CloudWatch Logs log group receiving pod logs."
  value       = aws_cloudwatch_log_group.pod_logs.name
}
