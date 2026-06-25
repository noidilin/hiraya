# Vintage E-Commerce Database Setup

This folder contains local database setup assets for the Hiraya Vintage microservices demo.

## Databases

The runnable services keep their existing service-aligned database names:

- `auth_db` — users and authentication data
- `products_db` — categories, products, and product images
- `orders_db` — orders and order items
- `users_db` — user profile data

Obsolete fallback/demo database names use the internal `vintage` identity, for example `vintage_db` or `vintage_auth`.

## Starter Catalog

The seed data represents a compact vintage fashion catalog:

1. `1970s Prairie Midi Dress` → `1970s-prairie-midi-dress.jpg`
2. `1980s Wool Blazer` → `1980s-wool-blazer.jpg`
3. `1990s Leather Shoulder Bag` → `1990s-leather-shoulder-bag.jpg`
4. `Art Deco Pendant Necklace` → `art-deco-pendant-necklace.jpg`
5. `Suede Block Heel Boots` → `suede-block-heel-boots.jpg`

Categories stay fashion-generic: Dresses, Accessories, Bags, Outerwear, and Shoes. Seeded products use `Hiraya Vintage` as their brand value.

## Setup

Docker Compose mounts `database/init/` into the PostgreSQL container, so `20-init-schema.sql` creates the service databases and starter data automatically on first container startup.

For quick manual seeding against an existing products database:

```bash
psql -d products_db -f quick-seed.sql
```

For GitOps restore flows, the Kubernetes ConfigMap uses `gitops/apps/vintage/k8s/database/vintage_full.sql`.
