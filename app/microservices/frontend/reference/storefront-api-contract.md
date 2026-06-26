# Vintage Storefront API contract

Status: reference for frontend rewrite agents  
Scope: existing `app/microservices/frontend` Storefront app and active backend services behind the gateway.  
Related ADRs: [`0003`](../adr/0003-vintage-storefront-order-api-owner.md), [`0004`](../adr/0004-vintage-storefront-api-response-envelope.md)

## Deployment and routing contract

- Browser calls are same-origin under `/api`.
- Local CRA dev proxy: `frontend/src/setupProxy.js` forwards `/api` to `http://localhost:3001`.
- Container nginx: `frontend/nginx.conf` forwards `/api/` to `http://gateway:3001`.
- Gateway path rewrites:
  - `/api/auth/*` -> auth service, stripped to `/*`.
  - `/api/products/*` -> product-service, stripped to `/*`.
  - `/api/orders/*` -> orders service, stripped to `/*`.
- The frontend also supports an override base URL through `REACT_APP_API_URL`; the default is `/api`.

When rewriting with a new stack, preserve the same public route shape (`/api/...`). If the new build tool changes env var naming, map it back to the same base URL behavior.

## Envelope contract

All Storefront APIs use the minimal response envelope from ADR-0004.

```ts
type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
};

type ApiFailure = {
  success: false;
  error: string;
};

type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;
```

Client rule: always check `success` before reading `data`. On `success: false`, show or throw `error`.

## Auth and authorization

Current frontend behavior:

- Stores `accessToken` in `localStorage` after login.
- Sends `Authorization: Bearer <accessToken>` on every request through the shared API client.
- Removes `accessToken` and `refreshToken` on logout or failed identity lookup.

Important current limitations:

- Active auth responses return `token`, not `refreshToken`.
- The frontend contains `/auth/refresh` client logic, but the active auth service does **not** implement `POST /api/auth/refresh`. Do not rely on refresh-token flows unless the backend contract is deliberately extended.
- The active orders service does not validate the bearer token; `/api/orders/my-orders` uses `?userId=` or a demo fallback. Keep protected order pages client-side gated, but do not assume server-side per-token authorization until the backend is changed.

## Consumed endpoint inventory

| Endpoint | Method | Current frontend consumer | Active backend status | Notes |
|---|---:|---|---|---|
| `/api/products` | GET | Home, Products, product service | implemented | Main catalog/featured source. |
| `/api/products/:id` | GET | ProductDetail | implemented | Product detail source. |
| `/api/auth/login` | POST | Login/AuthContext | implemented | Returns signed JWT in `data.token`. |
| `/api/auth/register` | POST | Register | implemented | Registers customer; UI redirects to login. |
| `/api/auth/me` | GET | AuthProvider startup | implemented | Requires valid bearer token. |
| `/api/auth/logout` | POST | AuthContext logout | implemented | No server-side session revocation. |
| `/api/orders/my-orders` | GET | Orders page | implemented | Uses demo/userId query fallback. |
| `/api/orders` | POST | orderService only / future checkout | implemented | Cart checkout currently disabled/missing in UI baseline. |
| `/api/orders/:id/status` | PATCH | orderService only | implemented | Admin-like mutation; no current visible UI consumer. |
| `/api/auth/refresh` | POST | api client interceptor + authService method | **not implemented** | Legacy/client-only expectation; exclude unless backend adds it. |
| `/api/orders/:id` | GET | orderService method only | **not implemented** | Shared fixtures mention detail, but active orders service lacks this route. |

Active but not currently consumed by the Storefront UI: `GET /api/products/categories`.

## Data shapes

### User

```ts
type User = {
  id: string;          // UUID
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin';
  createdAt?: string; // ISO timestamp; omitted by /auth/me in current backend
  updatedAt?: string; // ISO timestamp; omitted by /auth/me in current backend
};
```

### Product wire shape

The backend returns product wire fields in backend JSON naming. Frontend adapters normalize these to UI names.

```ts
type ProductWire = {
  id: string;                    // UUID
  name: string;
  description: string;
  price: string;                 // money string, e.g. "128.00"
  compare_price: string | null;
  brand: string | null;
  inventory_quantity: number;
  is_featured: boolean;
  created_at: string;            // ISO timestamp
  updated_at: string;            // ISO timestamp
  category: string;
  image_url: string;             // usually /product-images/<file>.jpg
};
```

Recommended frontend normalized shape:

```ts
type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  category: string;
  brand?: string;
  inventory: number;
  isNew?: boolean;
  createdAt: string;
  updatedAt: string;
};
```

Normalization rules used today:

- `price` -> number parsed from money string.
- `compare_price` -> `originalPrice` when present.
- `image_url` -> `imageUrl`; default fallback `/product-images/placeholder.jpg`.
- `inventory_quantity` -> `inventory`.
- `is_featured` -> `isNew`.
- `created_at` / `updated_at` -> `createdAt` / `updatedAt`.

### Address request shape

```ts
type Address = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};
```

### Order wire shape

```ts
type OrderLineItemWire = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: string;          // money string
  product: ProductWire;
};

type OrderWire = {
  id: string;
  userId: string;
  items: OrderLineItemWire[];
  totalAmount: string;    // money string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
};
```

Current active order responses do **not** include `shippingAddress`, even though order creation accepts it and the old frontend domain type has it. New frontend code should not require `shippingAddress` in order responses unless the backend contract is changed.

## Endpoint details

### `GET /api/products`

List products.

Query params supported by backend:

| Param | Type | Default | Notes |
|---|---|---|---|
| `page` | positive integer | `1` | Invalid values fall back to `1`. |
| `limit` | positive integer | `12` | Clamped to max `100`. |
| `sortBy` | enum | `created_at` | Allowed: `created_at`, `updated_at`, `name`, `price`. Unknown values fall back to `created_at`. |
| `category` | string | none | Exact category name match. |
| `search` | string | none | Searches product name or description with SQL `ILIKE`. |
| `minPrice` | number/string | none | Backend forwards to SQL numeric comparison. |
| `maxPrice` | number/string | none | Backend forwards to SQL numeric comparison. |

Current UI mostly calls this endpoint without params and then filters/sorts client-side.

Success response:

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "67be2d5e-ecfb-4bf9-b751-8474f9d7bcac",
        "name": "Prairie Midi Dress",
        "description": "Faded cotton midi dress with a gathered waist, lace-trim neckline, and an easy drape for warm days.",
        "price": "128.00",
        "compare_price": "168.00",
        "brand": "Hiraya Furugi",
        "inventory_quantity": 4,
        "is_featured": true,
        "created_at": "2026-02-07T13:04:03.836Z",
        "updated_at": "2026-02-07T13:04:03.836Z",
        "category": "Dresses",
        "image_url": "/product-images/prairie-midi-dress.jpg"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "total": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

Failure examples:

- `500 { "success": false, "error": "Failed to get products" }`

### `GET /api/products/:id`

Fetch one product by UUID.

Success data: `ProductWire`.

```json
{
  "success": true,
  "data": {
    "id": "67be2d5e-ecfb-4bf9-b751-8474f9d7bcac",
    "name": "Prairie Midi Dress",
    "description": "Faded cotton midi dress with a gathered waist, lace-trim neckline, and an easy drape for warm days.",
    "price": "128.00",
    "compare_price": "168.00",
    "brand": "Hiraya Furugi",
    "inventory_quantity": 4,
    "is_featured": true,
    "created_at": "2026-02-07T13:04:03.836Z",
    "updated_at": "2026-02-07T13:04:03.836Z",
    "category": "Dresses",
    "image_url": "/product-images/prairie-midi-dress.jpg"
  }
}
```

Failures:

- `404 { "success": false, "error": "Product not found" }`
- `500 { "success": false, "error": "Failed to get product" }`

### `GET /api/products/categories`

Not consumed by the current frontend, but implemented.

Success data:

```ts
type CategoryWire = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  product_count: string;
};
```

### `POST /api/auth/register`

Register a customer.

Request:

```json
{
  "email": "demo@hirayavintage.test",
  "password": "correct horse battery staple",
  "firstName": "Demo",
  "lastName": "User"
}
```

Success: `201 ApiEnvelope<{ user: User; token: string }>`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "f8b01ff1-9114-4c3e-92a7-45a8d1f2d6e6",
      "email": "demo@hirayavintage.test",
      "firstName": "Demo",
      "lastName": "User",
      "role": "customer",
      "createdAt": "2026-02-07T13:04:03.836Z",
      "updatedAt": "2026-02-07T13:04:03.836Z"
    },
    "token": "<jwt>"
  },
  "message": "Registration successful"
}
```

Failures:

- `400 { "success": false, "error": "Missing required registration fields" }`
- `400 { "success": false, "error": "User already exists" }`
- `500 { "success": false, "error": "Registration failed" }`

### `POST /api/auth/login`

Authenticate with email/password.

Request:

```json
{
  "email": "demo@hirayavintage.test",
  "password": "correct horse battery staple"
}
```

Success: `200 ApiEnvelope<{ user: User; token: string }>` with `message: "Login successful"`.

Failures:

- `400 { "success": false, "error": "Missing email or password" }`
- `401 { "success": false, "error": "Invalid credentials" }`
- `500 { "success": false, "error": "Login failed" }`

### `GET /api/auth/me`

Return current authenticated user.

Headers:

```http
Authorization: Bearer <jwt>
```

Success:

```json
{
  "success": true,
  "data": {
    "id": "f8b01ff1-9114-4c3e-92a7-45a8d1f2d6e6",
    "email": "demo@hirayavintage.test",
    "firstName": "Demo",
    "lastName": "User",
    "role": "customer"
  }
}
```

Failures:

- `401 { "success": false, "error": "Not logged in" }`
- `401 { "success": false, "error": "User not found" }`
- `500 { "success": false, "error": "Failed to get user" }`

### `POST /api/auth/logout`

Current logout endpoint returns success and does not revoke a persisted server session.

Headers optional. If an `Authorization: Bearer ...` header is present and invalid, backend returns 401.

Success:

```json
{
  "success": true,
  "data": null,
  "message": "Logged out successfully"
}
```

Failure:

- `401 { "success": false, "error": "Not logged in" }`

### `GET /api/orders/my-orders`

List order history.

Current frontend calls this after client-side auth says a user exists. It sends the bearer token because the shared API client adds it, but the active orders backend uses:

- query `userId` if provided, else
- fallback string `demo-user-id`.

Success: `200 ApiEnvelope<{ orders: OrderWire[] }>`

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "8d46347c-43db-4f01-b6c7-d5d3288f0ecb",
        "userId": "f8b01ff1-9114-4c3e-92a7-45a8d1f2d6e6",
        "status": "delivered",
        "totalAmount": "402.00",
        "paymentStatus": "paid",
        "createdAt": "2026-02-14T10:22:31.000Z",
        "updatedAt": "2026-02-16T15:12:04.000Z",
        "items": [
          {
            "id": "b9460644-95f4-47ac-853d-9579ac793f0b",
            "orderId": "8d46347c-43db-4f01-b6c7-d5d3288f0ecb",
            "productId": "67be2d5e-ecfb-4bf9-b751-8474f9d7bcac",
            "quantity": 2,
            "price": "128.00",
            "product": { "...": "ProductWire" }
          }
        ]
      }
    ]
  }
}
```

Failure:

- `500 { "success": false, "error": "Failed to get orders" }`

### `POST /api/orders`

Create an order. Implemented by `app/microservices/backend/services/orders`, not the legacy `order-service`.

Request:

```json
{
  "userId": "f8b01ff1-9114-4c3e-92a7-45a8d1f2d6e6",
  "items": [
    { "productId": "67be2d5e-ecfb-4bf9-b751-8474f9d7bcac", "quantity": 2 }
  ],
  "shippingAddress": {
    "street": "123 Demo St",
    "city": "Manila",
    "state": "Metro Manila",
    "zipCode": "1000",
    "country": "PH"
  }
}
```

`userId` is optional in current backend and defaults to `demo-user-id`.

Success: `201 ApiEnvelope<OrderWire>`.

Failures:

- `400 { "success": false, "error": "Order requires at least one item" }`
- `400 { "success": false, "error": "Order items require a productId and positive integer quantity" }`
- `400 { "success": false, "error": "Product not found" }`
- `502 { "success": false, "error": "Invalid product price" }`
- `500 { "success": false, "error": "Failed to create order" }`

### `PATCH /api/orders/:id/status`

Update order status.

Request:

```json
{ "status": "shipped" }
```

Allowed statuses: `pending`, `processing`, `shipped`, `delivered`, `cancelled`.

Success data is a partial order status shape without `items`:

```json
{
  "success": true,
  "data": {
    "id": "8d46347c-43db-4f01-b6c7-d5d3288f0ecb",
    "userId": "f8b01ff1-9114-4c3e-92a7-45a8d1f2d6e6",
    "totalAmount": "402.00",
    "status": "shipped",
    "paymentStatus": "paid",
    "createdAt": "2026-02-14T10:22:31.000Z",
    "updatedAt": "2026-02-16T15:12:04.000Z"
  }
}
```

Failures:

- `400 { "success": false, "error": "Invalid order status" }`
- `404 { "success": false, "error": "Order not found" }`
- `500 { "success": false, "error": "Failed to update order status" }`

## Frontend rewrite adapter guidance

1. Keep all API calls behind a small adapter layer; do not scatter `fetch` calls through UI components.
2. Preserve envelope unwrapping and centralized bearer-token injection.
3. Normalize backend snake_case product fields at the boundary.
4. Treat money as strings on the wire and numbers in UI calculations.
5. Treat `/auth/refresh` and `GET /orders/:id` as non-contract until backend routes exist.
6. Keep cart state client-side; current cart does not consume an API.
7. Static product images are served by the frontend public assets under `/product-images/...`.

## Existing source-of-truth files

- Frontend API client: `app/microservices/frontend/src/services/api.ts`
- Auth adapter: `app/microservices/frontend/src/services/authService.ts`
- Product adapter: `app/microservices/frontend/src/services/productService.ts`
- Order adapter: `app/microservices/frontend/src/services/orderService.ts`
- Shared schemas/fixtures: `app/microservices/shared/src/index.mjs`
- Contract tests:
  - `app/microservices/shared/test/auth-api-contract.test.mjs`
  - `app/microservices/shared/test/product-api-contract.test.mjs`
  - `app/microservices/shared/test/orders-api-contract.test.mjs`
  - `app/microservices/shared/test/gateway-routing.test.mjs`
