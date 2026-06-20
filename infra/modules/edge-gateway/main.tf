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

resource "kubernetes_namespace_v1" "edge" {
  metadata {
    name = var.namespace

    labels = {
      (var.allowed_namespace_label_key) = var.allowed_namespace_label_value
    }
  }
}

resource "helm_release" "edge_gateway" {
  name      = "edge-gateway"
  namespace = kubernetes_namespace_v1.edge.metadata[0].name
  chart     = "${path.module}/chart"

  wait    = true
  timeout = 300

  values = [
    yamlencode({
      gateway = {
        name      = var.gateway_name
        className = var.gateway_class_name
      }
      loadBalancer = {
        name           = var.load_balancer_name
        certificateArn = var.certificate_arn
      }
      domains = {
        root     = var.domain_name
        wildcard = "*.${var.domain_name}"
      }
      allowedRoutes = {
        namespaceLabelKey   = var.allowed_namespace_label_key
        namespaceLabelValue = var.allowed_namespace_label_value
      }
    })
  ]
}
