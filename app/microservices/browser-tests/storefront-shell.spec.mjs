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

test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', async (route) => {
    throw new Error(`Unexpected unmocked Storefront API request: ${route.request().url()}`);
  });

  await page.route(`**${storefrontContractPaths.productList}**`, async (route) => {
    const productListEnvelope = storefrontContractSchemas.productListEnvelope.parse(
      storefrontContractFixtures.productListEnvelope,
    );

    await route.fulfill({
      status: 200,
      headers: jsonHeaders,
      json: productListEnvelope,
    });
  });
});

test('Vintage Storefront shell loads with mocked same-origin Storefront API data', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /unearth timeless vintage/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /shop collection/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /featured vintage finds/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: storefrontContractFixtures.productWireSet[0].name })).toBeVisible();
  await expect(page.getByText('$128.00')).toBeVisible();
});
