output "service_account_name" {
  description = "AWS Load Balancer Controller service account name."
  value       = local.service_account_name
}

output "role_arn" {
  description = "IRSA role ARN used by AWS Load Balancer Controller."
  value       = aws_iam_role.controller.arn
}

output "gateway_api_crds_release_name" {
  description = "Helm release that installs Gateway API prerequisites."
  value       = helm_release.gateway_api_crds.name
}
