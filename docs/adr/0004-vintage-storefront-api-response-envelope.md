# Vintage Storefront API response envelope

Status: accepted

All Vintage Storefront backend APIs will use a minimal response envelope so the migration baseline and future UI rewrite share one predictable client contract. Successful responses return `{ "success": true, "data": ... }` with an optional `message`; failed responses return `{ "success": false, "error": "..." }`, preserving the existing product/orders style while requiring auth responses to be wrapped instead of returned raw.
