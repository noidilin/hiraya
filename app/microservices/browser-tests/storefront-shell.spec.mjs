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


const categoryEnvelope = {
  success: true,
  data: Array.from(new Set(storefrontContractFixtures.productWireSet.map((product) => product.category))).map((name) => ({
    id: name.toLowerCase().replaceAll(' ', '-'),
    name,
    description: null,
    image_url: null,
    product_count: String(storefrontContractFixtures.productWireSet.filter((product) => product.category === name).length),
  })),
};

test.beforeEach(async ({ page }) => {
  await page.route((url) => url.pathname.startsWith('/api/'), async (route) => {
    throw new Error(`Unexpected unmocked Storefront API request: ${route.request().url()}`);
  });

  await page.route((url) => url.pathname === storefrontContractPaths.productList, async (route) => {
    const productListEnvelope = storefrontContractSchemas.productListEnvelope.parse(
      storefrontContractFixtures.productListEnvelope,
    );

    await route.fulfill({
      status: 200,
      headers: jsonHeaders,
      json: productListEnvelope,
    });
  });

  await page.route(
    (url) => url.pathname === `${storefrontContractPaths.productList}/categories`,
    async (route) => {
      await route.fulfill({ status: 200, headers: jsonHeaders, json: categoryEnvelope });
    },
  );
});

test('Vintage Storefront shell loads with mocked same-origin Storefront API data', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /vintage pieces, edited with restraint/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /enter archive/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /freshly cataloged/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: storefrontContractFixtures.productWireSet[0].name })).toBeVisible();
  await expect(page.getByText('$128.00')).toBeVisible();
});
