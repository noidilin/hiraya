resource "random_password" "argocd_admin" {
  length           = 32
  special          = true
  override_special = "_-"

  keepers = {
    rotation_epoch = var.argocd_admin_rotation_epoch
  }
}

resource "random_password" "grafana_admin" {
  length           = 32
  special          = true
  override_special = "_-"

  keepers = {
    rotation_epoch = var.grafana_admin_rotation_epoch
  }
}

resource "aws_secretsmanager_secret" "argocd_admin" {
  name                    = var.argocd_admin_secret_name
  description             = "Disposable ${title(var.environment)} Argo CD admin credential for Cluster Bootstrap and Operators."
  recovery_window_in_days = 0

  tags = merge(var.tags, {
    Component = "platform-core"
    SecretFor = "argocd"
  })
}

resource "aws_secretsmanager_secret_version" "argocd_admin" {
  secret_id = aws_secretsmanager_secret.argocd_admin.id
  secret_string = jsonencode({
    username       = "admin"
    password       = random_password.argocd_admin.result
    bcrypt_hash    = random_password.argocd_admin.bcrypt_hash
    password_mtime = var.argocd_admin_rotation_epoch
  })
}

resource "aws_secretsmanager_secret" "grafana_admin" {
  name                    = var.grafana_admin_secret_name
  description             = "Disposable ${title(var.environment)} Grafana admin credential for External Secrets Operator and Operators."
  recovery_window_in_days = 0

  tags = merge(var.tags, {
    Component = "platform-core"
    SecretFor = "grafana"
  })
}

resource "aws_secretsmanager_secret_version" "grafana_admin" {
  secret_id = aws_secretsmanager_secret.grafana_admin.id
  secret_string = jsonencode({
    "admin-user"     = "admin"
    "admin-password" = random_password.grafana_admin.result
  })
}
