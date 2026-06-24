output "argocd_admin_secret_name" {
  description = "Secrets Manager name for Argo CD admin credentials."
  value       = aws_secretsmanager_secret.argocd_admin.name
}

output "argocd_admin_secret_arn" {
  description = "Secrets Manager ARN for Argo CD admin credentials."
  value       = aws_secretsmanager_secret.argocd_admin.arn
}

output "grafana_admin_secret_name" {
  description = "Secrets Manager name for Grafana admin credentials."
  value       = aws_secretsmanager_secret.grafana_admin.name
}

output "grafana_admin_secret_arn" {
  description = "Secrets Manager ARN for Grafana admin credentials."
  value       = aws_secretsmanager_secret.grafana_admin.arn
}
