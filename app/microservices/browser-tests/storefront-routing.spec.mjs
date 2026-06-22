import { expect, test } from '@playwright/test';
import {
  storefrontContractFixtures,
  storefrontContractPaths,
  storefrontContractSchemas,
} from '@hiraya/storefront-contracts';

const jsonHeaders = {
  'access-control-allow-origin': '*',
  'content-type': 'application/json; charset=utf-8',
};

const routeStorefrontApi = async (page) => {
  await page.route('**/api/**', async (route) => {
    throw new Error(`Unexpected unmocked Storefront API request: ${route.request().url()}`);
  });

  await page.route(
    (url) => url.pathname === storefrontContractPaths.productList,
    async (route) => {
      const productListEnvelope = storefrontContractSchemas.productListEnvelope.parse(
        storefrontContractFixtures.productListEnvelope,
      );

      await route.fulfill({
        status: 200,
        headers: jsonHeaders,
        json: productListEnvelope,
      });
    },
  );

  await page.route(
    (url) => url.pathname === storefrontContractPaths.productDetailFixture,
    async (route) => {
      const productDetailEnvelope = storefrontContractSchemas.productDetailEnvelope.parse(
        storefrontContractFixtures.productDetailEnvelope,
      );

      await route.fulfill({
        status: 200,
        headers: jsonHeaders,
        json: productDetailEnvelope,
      });
    },
  );
};

test.beforeEach(async ({ page }) => {
  await routeStorefrontApi(page);
});

test.describe('Vintage Storefront direct routes', () => {
  test('direct loading the home route succeeds', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: /unearth timeless vintage/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /shop collection/i })).toBeVisible();
  });

  test('direct loading the catalog route succeeds', async ({ page }) => {
    await page.goto('/products');

    await expect(page).toHaveURL('/products');
    await expect(page.getByRole('heading', { name: /all vintage finds/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: storefrontContractFixtures.productWireSet[0].name })).toBeVisible();
  });

  test('direct loading a product detail route succeeds with mocked product API data', async ({ page }) => {
    const product = storefrontContractFixtures.productDetailEnvelope.data;

    await page.goto(`/products/${product.id}`);

    await expect(page).toHaveURL(`/products/${product.id}`);
    await expect(page.getByRole('heading', { name: product.name })).toBeVisible();
    await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible();
    await expect(page.getByText(`${product.inventory_quantity} available`)).toBeVisible();
  });

  test('direct loading the cart route succeeds', async ({ page }) => {
    await page.goto('/cart');

    await expect(page).toHaveURL('/cart');
    await expect(page.getByRole('heading', { name: /your cart is empty/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /start shopping/i })).toBeVisible();
  });

  test('direct loading the login route succeeds', async ({ page }) => {
    await page.goto('/login');

    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /email address/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });
});

test.describe('Vintage Storefront auth guards', () => {
  for (const protectedRoute of ['/profile', '/orders']) {
    test(`unauthenticated direct loading ${protectedRoute} redirects to login`, async ({ page }) => {
      await page.goto(protectedRoute);

      await expect(page).toHaveURL('/login');
      await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    });
  }
});
