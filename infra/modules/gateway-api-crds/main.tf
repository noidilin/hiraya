terraform {
  required_providers {
    helm = {
      source = "hashicorp/helm"
    }
  }
}

resource "helm_release" "this" {
  name      = "gateway-api-crds"
  namespace = var.namespace
  chart     = "${path.module}/chart"

  wait    = true
  timeout = 300

  values = [
    yamlencode({
      validationResources = {
        enabled = var.enable_validation_resources
      }
    })
  ]
}
