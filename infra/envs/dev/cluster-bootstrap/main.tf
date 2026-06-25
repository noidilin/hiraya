data "terraform_remote_state" "bootstrap" {
  backend = "s3"

  config = {
    bucket = var.bootstrap_state_bucket
    key    = var.bootstrap_state_key
    region = var.bootstrap_state_region
  }
}

data "terraform_remote_state" "platform_core" {
  backend = "s3"

  config = data.terraform_remote_state.bootstrap.outputs.platform_core_backend_config
}

data "aws_secretsmanager_secret_version" "argocd_admin" {
  secret_id = data.terraform_remote_state.platform_core.outputs.argocd_admin_secret_name
}

locals {
  argocd_admin_secret = jsondecode(data.aws_secretsmanager_secret_version.argocd_admin.secret_string)

  argocd_admin_bcrypt_hash    = local.argocd_admin_secret[var.argocd_admin_secret_bcrypt_hash_key]
  argocd_admin_password_mtime = local.argocd_admin_secret[var.argocd_admin_secret_password_mtime_key]

  public_gateway_access_label_key   = data.terraform_remote_state.platform_core.outputs.public_gateway_access_label_key
  public_gateway_access_label_value = data.terraform_remote_state.platform_core.outputs.public_gateway_access_label_value
}

resource "kubernetes_namespace_v1" "argocd" {
  metadata {
    name = var.argocd_namespace

    labels = {
      (local.public_gateway_access_label_key) = local.public_gateway_access_label_value
    }
  }
}

resource "helm_release" "argocd" {
  name       = "argocd"
  namespace  = kubernetes_namespace_v1.argocd.metadata[0].name
  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-cd"
  version    = var.argocd_chart_version

  create_namespace = false
  timeout          = 600

  values = [
    yamlencode({
      server = {
        service = {
          type = "ClusterIP"
        }
      }
      configs = {
        params = {
          "server.insecure" = true
        }
        secret = {
          argocdServerAdminPassword      = local.argocd_admin_bcrypt_hash
          argocdServerAdminPasswordMtime = local.argocd_admin_password_mtime
        }
      }
    })
  ]
}

resource "helm_release" "argocd_bootstrap" {
  name      = "argocd-bootstrap"
  namespace = kubernetes_namespace_v1.argocd.metadata[0].name
  chart     = "${path.module}/chart"

  wait    = true
  timeout = 300

  values = [
    yamlencode({
      resources = [
        {
          apiVersion = "argoproj.io/v1alpha1"
          kind       = "AppProject"
          metadata = {
            name      = var.platform_project_name
            namespace = var.argocd_namespace
          }
          spec = {
            description = "Cluster Platform and root app-of-apps resources for Hiraya dev."
            sourceRepos = var.platform_project_source_repos
            destinations = [
              {
                namespace = "*"
                server    = "https://kubernetes.default.svc"
              }
            ]
            clusterResourceWhitelist = [
              {
                group = "*"
                kind  = "*"
              }
            ]
            namespaceResourceWhitelist = [
              {
                group = "*"
                kind  = "*"
              }
            ]
          }
        },
        {
          apiVersion = "argoproj.io/v1alpha1"
          kind       = "AppProject"
          metadata = {
            name      = var.workloads_project_name
            namespace = var.argocd_namespace
          }
          spec = {
            description = "Hiraya workload applications."
            sourceRepos = [var.root_application_repo_url]
            destinations = [
              for namespace in var.workload_namespaces : {
                namespace = namespace
                server    = "https://kubernetes.default.svc"
              }
            ]
            namespaceResourceWhitelist = [
              {
                group = "*"
                kind  = "*"
              }
            ]
          }
        },
        {
          apiVersion = "argoproj.io/v1alpha1"
          kind       = "Application"
          metadata = {
            name      = "hiraya-root"
            namespace = var.argocd_namespace
          }
          spec = {
            project = var.platform_project_name
            source = {
              repoURL        = var.root_application_repo_url
              targetRevision = var.root_application_target_revision
              path           = var.root_application_path
            }
            destination = {
              server    = "https://kubernetes.default.svc"
              namespace = var.argocd_namespace
            }
            syncPolicy = {
              automated = {
                prune    = true
                selfHeal = true
              }
            }
          }
        },
      ]
    })
  ]

  depends_on = [helm_release.argocd]
}
