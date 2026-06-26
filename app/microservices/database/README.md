# Vintage Storefront Database Setup

This folder contains local database setup assets for the Vintage Storefront services.

## Databases

The runnable services keep their existing service-aligned database names:

- `auth_db` — users and authentication data
- `products_db` — categories, products, and product images
- `orders_db` — orders and order items
- `users_db` — user profile data

Obsolete fallback/demo database names use the internal `vintage` identity, for example `vintage_db` or `vintage_auth`.

## Hiraya Furugi Catalog

The seed data represents the Hiraya Furugi Catalog and matches shared Storefront contract fixtures:

1. `Prairie Midi Dress` → `prairie-midi-dress.jpg`
2. `Washed Linen Work Jacket` → `washed-linen-work-jacket.jpg`
3. `Indigo Straight Denim` → `indigo-straight-denim.jpg`
4. `Cotton Lace Night Blouse` → `cotton-lace-night-blouse.jpg`
5. `Sumi Silk Scarf` → `sumi-silk-scarf.jpg`
6. `Wool Twill Evening Coat` → `wool-twill-evening-coat.jpg`
7. `Patchwork Market Tote` → `patchwork-market-tote.jpg`
8. `Linen Tab Collar Shirt` → `linen-tab-collar-shirt.jpg`

Categories are Dresses, Accessories, Outerwear, Denim, and Tops. Seeded products use `Hiraya Furugi` as their brand value. Product image URLs are stored in `product_images`; `/product-images/placeholder.jpg` is reserved for products without a primary image.

The seeded demo customer is `demo@hirayavintage.test` with the Storefront API contract test password. The seed stores only the bcrypt hash and includes one delivered sample order for order-history QA.

## Setup

Docker Compose mounts `database/init/` into the PostgreSQL container, so `20-init-schema.sql` creates the service databases and starter data automatically on first container startup. The local full-stack smoke command (`pnpm run app:smoke:compose`) intentionally runs Compose `down --volumes`, starts from this clean seed state, creates one new pending checkout order, and tears volumes down again.

For quick manual reseeding against an existing products database:

```bash
psql -d products_db -f quick-seed.sql
```

For GitOps restore flows, reset only Vintage app database state and restore with `gitops/apps/vintage/k8s/database/vintage_full.sql`. No Terraform, EKS platform, or GitOps routing reset is required for this catalog migration.
