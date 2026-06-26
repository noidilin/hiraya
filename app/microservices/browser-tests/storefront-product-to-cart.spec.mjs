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
  await page.route(
    (url) => url.pathname.startsWith('/api/'),
    async (route) => {
      throw new Error(`Unexpected unmocked Storefront API request: ${route.request().url()}`);
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
  await routeStorefrontProductDetailApi(page);
});

test.describe('Vintage Storefront product detail to cart', () => {
  test('defaults detail quantity to one and caps the selected quantity by inventory', async ({ page }) => {
    const product = storefrontContractFixtures.productDetailEnvelope.data;

    await page.goto(`/products/${product.id}`);

    await expect(page.getByRole('heading', { name: product.name })).toBeVisible();
    await expect(page.getByText(`${product.inventory_quantity} available in the archive`)).toBeVisible();

    const quantityInput = page.getByRole('spinbutton', { name: `${product.name} quantity` });
    const decreaseQuantity = page.getByRole('button', { name: `Decrease ${product.name} quantity` });
    const increaseQuantity = page.getByRole('button', { name: `Increase ${product.name} quantity` });

    await expect(quantityInput).toHaveValue('1');
    await expect(decreaseQuantity).toBeDisabled();

    for (let quantity = 1; quantity < product.inventory_quantity; quantity += 1) {
      await increaseQuantity.click();
    }

    await expect(quantityInput).toHaveValue(String(product.inventory_quantity));
    await expect(increaseQuantity).toBeDisabled();

    await quantityInput.fill(String(product.inventory_quantity + 3));
    await expect(quantityInput).toHaveValue(String(product.inventory_quantity));

    await quantityInput.fill('0');
    await expect(quantityInput).toHaveValue('1');
  });

  test('adds the selected detail quantity to persisted cart state without exceeding inventory', async ({ page }) => {
    const product = storefrontContractFixtures.productDetailEnvelope.data;

    await page.goto(`/products/${product.id}`);
    await expect(page.getByRole('heading', { name: product.name })).toBeVisible();

    await page.getByRole('spinbutton', { name: `${product.name} quantity` }).fill('2');
    await page.getByRole('button', { name: `Add ${product.name} to cart` }).click();
    await page.getByRole('link', { name: /view cart/i }).click();

    await expect(page).toHaveURL('/cart');
    await expect(page.getByRole('heading', { name: 'Cart' })).toBeVisible();
    await expect(page.getByRole('link', { name: product.name })).toBeVisible();
    await expect(page.getByRole('spinbutton', { name: `${product.name} quantity` })).toHaveValue('2');

    await page.goto(`/products/${product.id}`);
    await page.getByRole('spinbutton', { name: `${product.name} quantity` }).fill(String(product.inventory_quantity));
    await page.getByRole('button', { name: `Add ${product.name} to cart` }).click();
    await page.getByRole('link', { name: /view cart/i }).click();

    await expect(page.getByRole('spinbutton', { name: `${product.name} quantity` })).toHaveValue(String(product.inventory_quantity));
    await expect(page.getByRole('button', { name: `Increase ${product.name} quantity` })).toBeDisabled();

    await page.reload();

    await expect(page.getByRole('link', { name: product.name })).toBeVisible();
    await expect(page.getByRole('spinbutton', { name: `${product.name} quantity` })).toHaveValue(String(product.inventory_quantity));
  });
});
