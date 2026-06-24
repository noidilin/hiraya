# Vintage Storefront in-place Vite migration

Status: accepted

Hiraya will migrate the Hiraya Furugi React/Vite rewrite into the existing `app/microservices/frontend` Vintage Storefront service instead of introducing a parallel frontend service. This keeps the deployed service name, ECR repository, GitOps manifests, public HTTPRoute, and `/api` same-origin contract stable while replacing the internal frontend stack; the trade-off is that rollback depends on reverting the app change or promoting the prior `hiraya-frontend` image tag rather than switching traffic between two live frontend services.

## Considered Options

- **In-place replacement**: smallest CI/CD and GitOps change surface; preserves existing deployment identity.
- **Parallel service**: safer traffic-switch rollback path, but adds service catalog, ECR, manifest, HTTPRoute, and CI/CD complexity for a temporary migration boundary.
