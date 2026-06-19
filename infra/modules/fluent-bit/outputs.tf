output "namespace" {
  description = "Kubernetes namespace where aws-for-fluent-bit is installed."
  value       = kubernetes_namespace_v1.amazon_cloudwatch.metadata[0].name
}

output "service_account_name" {
  description = "Kubernetes service account annotated for Fluent Bit IRSA."
  value       = local.service_account_name
}

output "iam_role_arn" {
  description = "IAM role ARN assumed by aws-for-fluent-bit through IRSA."
  value       = aws_iam_role.fluent_bit.arn
}

output "log_group_name" {
  description = "CloudWatch Logs log group receiving pod logs."
  value       = aws_cloudwatch_log_group.pod_logs.name
}

output "helm_release_name" {
  description = "Helm release name for aws-for-fluent-bit."
  value       = helm_release.aws_for_fluent_bit.name
}
