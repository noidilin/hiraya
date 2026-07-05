# Vintage Storefront order API owner

- Status: Accepted
- Current architecture: [Runtime flow](../architecture/runtime-flow.md)
- Supersedes: none
- Superseded by: none

The Vintage Storefront `/api/orders` contract is owned by the `orders` backend service, not the older `order-service` backend. This matches the current gateway route shape and GitOps environment wiring, keeps the migration baseline focused on the Storefront's active order history/create-order API, and prevents the duplicate order backends from expanding the frontend rewrite scope; `order-service` remains outside the critical Storefront baseline until it is either retired or deliberately given a separate route.
