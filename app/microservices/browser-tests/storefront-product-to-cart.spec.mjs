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

const routeStorefrontProductDetailApi = async (page) => {
  await page.route('**/api/**', async (route) => {
    throw new Error(`Unexpected unmocked Storefront API request: ${route.request().url()}`);
  });

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
  await routeStorefrontProductDetailApi(page);
});

test.describe('Vintage Storefront product detail to cart', () => {
  test('respects product inventory while adding detail quantity to the cart', async ({ page }) => {
    const product = storefrontContractFixtures.productDetailEnvelope.data;

    await page.goto(`/products/${product.id}`);

    await expect(page.getByRole('heading', { name: product.name })).toBeVisible();
    await expect(page.getByText(`${product.inventory_quantity} available`)).toBeVisible();

    const decreaseQuantity = page.getByRole('button', { name: /decrease quantity/i });
    const increaseQuantity = page.getByRole('button', { name: /increase quantity/i });

    await expect(decreaseQuantity).toBeDisabled();

    for (let quantity = 1; quantity < product.inventory_quantity; quantity += 1) {
      await increaseQuantity.click();
    }

    await expect(increaseQuantity).toBeDisabled();

    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.getByRole('button', { name: /view cart/i }).click();

    await expect(page).toHaveURL('/cart');
    await expect(page.getByRole('heading', { name: /shopping cart/i })).toBeVisible();
    await expect(page.getByText(`${product.inventory_quantity} Items in your cart`)).toBeVisible();
    await expect(page.getByText(product.name)).toBeVisible();
    await expect(page.getByText(`$${product.price} each`)).toBeVisible();
    await expect(page.getByLabel(`Increase quantity for ${product.name}`)).toBeDisabled();
  });
});
