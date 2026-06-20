mock_provider "helm" {}

run "enables_validation_resources_by_default" {
  command = apply

  assert {
    condition     = yamldecode(helm_release.this.values[0]).validationResources.enabled == true
    error_message = "Gateway API validation resources should be enabled by default."
  }
}

run "can_disable_validation_resources" {
  command = apply

  variables {
    enable_validation_resources = false
  }

  assert {
    condition     = yamldecode(helm_release.this.values[0]).validationResources.enabled == false
    error_message = "Operators must be able to disable Gateway API validation resources for Kubernetes compatibility."
  }
}
