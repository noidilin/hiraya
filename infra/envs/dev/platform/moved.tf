moved {
  from = module.argocd.kubernetes_namespace_v1.monitoring
  to   = module.monitoring.kubernetes_namespace_v1.monitoring
}

moved {
  from = module.argocd.helm_release.monitoring
  to   = module.monitoring.helm_release.monitoring
}
