output "release_name" {
  description = "Gateway API CRD Helm release name."
  value       = helm_release.this.name
}
