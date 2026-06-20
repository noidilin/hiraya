mock_provider "kubernetes" {}
mock_provider "helm" {}

run "configures_ip_targets_for_clusterip_backends" {
  command = apply

  variables {
    load_balancer_name = "test-public-alb"
    certificate_arn    = "arn:aws:acm:ap-northeast-1:123456789012:certificate/test"
    domain_name        = "example.test"
  }

  assert {
    condition     = yamldecode(helm_release.edge_gateway.values[0]).targetGroup.targetType == "ip"
    error_message = "The shared Gateway must use ALB IP targets so ClusterIP backend Services do not need NodePort exposure."
  }
}
