terraform {
  required_providers {
    kubernetes = {
      source = "hashicorp/kubernetes"
    }
    helm = {
      source = "hashicorp/helm"
    }
    random = {
      source = "hashicorp/random"
    }
  }
}

resource "kubernetes_namespace_v1" "argocd" {
  metadata {
    name = "argocd"

    labels = {
      (var.public_gateway_access_label_key) = var.public_gateway_access_label_value
    }
  }
}

resource "random_password" "argocd_admin" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

locals {
  gitops_application_manifest_path = coalesce(var.gitops_application_manifest_path, "${path.module}/application.yml")
  gitops_application               = yamldecode(file(local.gitops_application_manifest_path))
}

resource "helm_release" "argocd" {
  name       = "argocd"
  namespace  = kubernetes_namespace_v1.argocd.metadata[0].name
  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-cd"
  version    = "6.7.0"

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
          argocdServerAdminPassword      = random_password.argocd_admin.bcrypt_hash
          argocdServerAdminPasswordMtime = var.admin_password_mtime
        }
      }
    })
  ]
}

resource "helm_release" "admin_route" {
  name      = "argocd-admin-route"
  namespace = kubernetes_namespace_v1.argocd.metadata[0].name
  chart     = "${path.module}/admin-route"

  create_namespace = false

  values = [
    yamlencode({
      route = {
        name     = var.admin_route_name
        hostname = var.admin_hostname
      }
      gateway = {
        name      = var.gateway_name
        namespace = var.gateway_namespace
      }
      service = {
        name = "argocd-server"
        port = 80
      }
    })
  ]

  depends_on = [
    helm_release.argocd
  ]
}

resource "helm_release" "gitops_application" {
  count = var.gitops_application_enabled ? 1 : 0

  name      = "argocd-gitops-application"
  namespace = kubernetes_namespace_v1.argocd.metadata[0].name
  chart     = "${path.module}/gitops-application"

  create_namespace = false

  values = [
    yamlencode({
      application = local.gitops_application
    })
  ]

  depends_on = [
    helm_release.argocd
  ]
}
