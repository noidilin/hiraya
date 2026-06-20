terraform {
  required_providers {
    kubernetes = {
      source = "hashicorp/kubernetes"
    }
    helm = {
      source = "hashicorp/helm"
    }
  }
}

resource "kubernetes_namespace_v1" "argocd" {
  metadata {
    name = "argocd"
  }
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
      }
    })
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
