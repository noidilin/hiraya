terraform {
  # Optional after the first local bootstrap apply creates the bucket:
  # terraform init -migrate-state -backend-config=backend.hcl
  backend "s3" {}
}
