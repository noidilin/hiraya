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

resource "kubernetes_namespace_v1" "monitoring" {
  metadata {
    name = "monitoring"

    labels = {
      (var.public_gateway_access_label_key) = var.public_gateway_access_label_value
    }
  }
}

resource "random_password" "grafana_admin" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

resource "helm_release" "monitoring" {
  name      = "kube-prometheus-stack"
  namespace = kubernetes_namespace_v1.monitoring.metadata[0].name

  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  version    = "56.21.0"

  timeout          = 600
  create_namespace = false

  values = [
    yamlencode({
      grafana = {
        adminPassword = random_password.grafana_admin.result
        service = {
          type = "ClusterIP"
        }
      }

      prometheus = {
        service = {
          type = "ClusterIP"
        }
      }

      alertmanager = {
        service = {
          type = "ClusterIP"
        }
      }
    })
  ]

  depends_on = [
    kubernetes_namespace_v1.monitoring
  ]
}

resource "helm_release" "grafana_route" {
  name      = "grafana-admin-route"
  namespace = kubernetes_namespace_v1.monitoring.metadata[0].name
  chart     = "${path.module}/admin-route"

  create_namespace = false

  values = [
    yamlencode({
      route = {
        name     = var.grafana_route_name
        hostname = var.grafana_hostname
      }
      gateway = {
        name      = var.gateway_name
        namespace = var.gateway_namespace
      }
      service = {
        name = "kube-prometheus-stack-grafana"
        port = 80
      }
    })
  ]

  depends_on = [
    helm_release.monitoring
  ]
}
