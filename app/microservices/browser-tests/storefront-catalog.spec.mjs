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

const productNames = storefrontContractFixtures.productWireSet.map((product) => product.name);

const routeStorefrontCatalogApi = async (page) => {
  await page.route((url) => url.pathname.startsWith('/api/'), async (route) => {
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
    (url) => url.pathname === `${storefrontContractPaths.productList}/categories`,
    async (route) => {
      await route.fulfill({ status: 200, headers: jsonHeaders, json: categoryEnvelope });
    },
  );

};

test.beforeEach(async ({ page }) => {
  await routeStorefrontCatalogApi(page);
});

test.describe('Vintage Storefront catalog', () => {
  test('renders representative products from mocked enveloped Storefront API data', async ({ page }) => {
    await page.goto('/products');

    await expect(page.getByRole('heading', { name: /shop all/i })).toBeVisible();
    await expect(page.getByText(`${productNames.length} pieces`)).toBeVisible();

    for (const product of storefrontContractFixtures.productWireSet) {
      await expect(page.getByRole('heading', { name: product.name })).toBeVisible();
      await expect(page.getByText(product.category).first()).toBeVisible();
      await expect(page.getByText(`$${product.price}`).first()).toBeVisible();
    }
  });

  test('filters by search query and restores the expected product set when the query changes or clears', async ({ page }) => {
    await page.goto('/products');

    const searchBox = page.getByRole('searchbox', { name: /search archive/i });

    await searchBox.fill('scarf');
    await expect(page.getByText('1 piece')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Sumi Silk Scarf' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Prairie Midi Dress' })).toBeHidden();

    await searchBox.fill('dresses');
    await expect(page.getByText('1 piece')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Prairie Midi Dress' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Sumi Silk Scarf' })).toBeHidden();

    await page.getByRole('button', { name: /clear product filters/i }).click();

    await expect(page.getByText(`${productNames.length} pieces`)).toBeVisible();
    for (const productName of productNames) {
      await expect(page.getByRole('heading', { name: productName })).toBeVisible();
    }
  });

  test('sorts visible products by the selected sort option', async ({ page }) => {
    await page.goto('/products');

    const productHeadings = page.getByRole('heading', { level: 3 });
    await expect(productHeadings).toHaveText(productNames);

    await page.getByRole('combobox', { name: /sort products/i }).click();
    await page.getByRole('option', { name: /price low to high/i }).click();

    await expect(productHeadings).toHaveText([
      'Sumi Silk Scarf',
      'Patchwork Market Tote',
      'Cotton Lace Night Blouse',
      'Linen Tab Collar Shirt',
      'Indigo Straight Denim',
      'Prairie Midi Dress',
      'Washed Linen Work Jacket',
      'Wool Twill Evening Coat',
    ]);

    await page.getByRole('combobox', { name: /sort products/i }).click();
    await page.getByRole('option', { name: /^name$/i }).click();

    await expect(productHeadings).toHaveText([
      'Cotton Lace Night Blouse',
      'Indigo Straight Denim',
      'Linen Tab Collar Shirt',
      'Patchwork Market Tote',
      'Prairie Midi Dress',
      'Sumi Silk Scarf',
      'Washed Linen Work Jacket',
      'Wool Twill Evening Coat',
    ]);
  });
});
