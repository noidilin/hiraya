provider "aws" {
  region                      = "ap-northeast-1"
  access_key                  = "test"
  secret_key                  = "test"
  skip_credentials_validation = true
  skip_requesting_account_id  = true
  skip_metadata_api_check     = true
}

run "creates_disposable_admin_secrets_without_secret_outputs" {
  command = plan

  variables {
    environment                  = "dev"
    argocd_admin_secret_name     = "/hiraya/dev/platform/argocd-admin"
    grafana_admin_secret_name    = "/hiraya/dev/platform/grafana-admin"
    argocd_admin_rotation_epoch  = "7"
    grafana_admin_rotation_epoch = "8"
  }

  override_resource {
    target          = random_password.argocd_admin
    override_during = plan
    values = {
      result      = "argocd-password"
      bcrypt_hash = "$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN"
    }
  }

  override_resource {
    target          = random_password.grafana_admin
    override_during = plan
    values = {
      result = "grafana-password"
    }
  }

  assert {
    condition     = aws_secretsmanager_secret.argocd_admin.name == "/hiraya/dev/platform/argocd-admin" && aws_secretsmanager_secret.grafana_admin.name == "/hiraya/dev/platform/grafana-admin"
    error_message = "Platform admin secrets must use stable Secrets Manager names."
  }

  assert {
    condition     = aws_secretsmanager_secret.argocd_admin.recovery_window_in_days == 0 && aws_secretsmanager_secret.grafana_admin.recovery_window_in_days == 0
    error_message = "Disposable platform admin secrets must be force-deleted on destroy."
  }

  assert {
    condition     = jsondecode(aws_secretsmanager_secret_version.argocd_admin.secret_string).username == "admin" && can(jsondecode(aws_secretsmanager_secret_version.argocd_admin.secret_string).bcrypt_hash)
    error_message = "Argo CD admin secret JSON must contain the admin username and bcrypt hash for Cluster Bootstrap."
  }

  assert {
    condition     = jsondecode(aws_secretsmanager_secret_version.grafana_admin.secret_string)["admin-user"] == "admin" && can(jsondecode(aws_secretsmanager_secret_version.grafana_admin.secret_string)["admin-password"])
    error_message = "Grafana admin secret JSON must contain the admin user and password keys expected by ESO consumers."
  }

  assert {
    condition     = random_password.argocd_admin.keepers.rotation_epoch == "7" && random_password.grafana_admin.keepers.rotation_epoch == "8"
    error_message = "Platform admin credentials must rotate only when their manual rotation epochs change."
  }
}
