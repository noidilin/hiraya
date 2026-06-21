# Storefront contracts

`@hiraya/storefront-contracts` is the shared Vintage Storefront API contract surface for fast Vitest-style contract tests and future browser mocks.

## Public import surface

Import schemas and representative wire fixtures from the package root only:

```js
import {
  storefrontContractFixtures,
  storefrontContractSchemas,
  productListEnvelopeSchema,
  productListEnvelopeFixture,
} from '@hiraya/storefront-contracts';
```

Do not import backend service modules or `src/` files from consumers. The root export is the stable seam for gateway/API contract tests and future Playwright route mocks.

## Gateway/API contract tests

Use schemas to validate real route responses or representative fixtures:

```js
const response = await request(app).get('/api/products');
const result = storefrontContractSchemas.productListEnvelope.safeParse(response.body);
expect(result.success).toBe(true);
```

## Browser mocks

Use the same fixtures for mocked `/api` responses:

```js
await page.route('/api/products', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(storefrontContractFixtures.productListEnvelope),
  });
});
```

Keep frontend/domain normalization outside these fixtures; they preserve backend wire names such as `image_url`, `compare_price`, and `inventory_quantity`.

## Validation command

From `app/microservices` run:

```sh
corepack pnpm@11.8.0 run app:test:contract
```

`app:baseline` also runs this shared contract validation and consumer smoke suite.
