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

const productNames = storefrontContractFixtures.productWireSet.map((product) => product.name);

const routeStorefrontCatalogApi = async (page) => {
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
};

test.beforeEach(async ({ page }) => {
  await routeStorefrontCatalogApi(page);
});

test.describe('Vintage Storefront catalog', () => {
  test('renders representative products from mocked enveloped Storefront API data', async ({ page }) => {
    await page.goto('/products');

    await expect(page.getByRole('heading', { name: /all vintage finds/i })).toBeVisible();
    await expect(page.getByText(`${productNames.length} Vintage Finds Found`)).toBeVisible();

    for (const product of storefrontContractFixtures.productWireSet) {
      await expect(page.getByRole('heading', { name: product.name })).toBeVisible();
      await expect(page.getByText(product.category).first()).toBeVisible();
      await expect(page.getByText(`$${product.price}`).first()).toBeVisible();
    }
  });

  test('filters by search query and restores the expected product set when the query changes or clears', async ({ page }) => {
    await page.goto('/products');

    const searchBox = page.getByPlaceholder('Search vintage pieces...');

    await searchBox.fill('leather');
    await searchBox.press('Enter');

    await expect(page.getByText('1 Vintage Find Found')).toBeVisible();
    await expect(page.getByRole('heading', { name: '1990s Leather Shoulder Bag' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '1970s Prairie Midi Dress' })).toBeHidden();

    await searchBox.fill('dresses');
    await searchBox.press('Enter');

    await expect(page.getByText('1 Vintage Find Found')).toBeVisible();
    await expect(page.getByRole('heading', { name: '1970s Prairie Midi Dress' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '1990s Leather Shoulder Bag' })).toBeHidden();

    await page.getByRole('button', { name: /clear/i }).click();

    await expect(page.getByText(`${productNames.length} Vintage Finds Found`)).toBeVisible();
    for (const productName of productNames) {
      await expect(page.getByRole('heading', { name: productName })).toBeVisible();
    }
  });

  test('sorts visible products by the selected sort option', async ({ page }) => {
    await page.goto('/products');

    const productResults = page.getByRole('region', { name: /product catalog results/i });
    const productHeadings = productResults.getByRole('heading', { level: 3 });
    await expect(productHeadings).toHaveText(productNames);

    await page.getByRole('combobox', { name: /sort products/i }).click();
    await page.getByRole('option', { name: /price: low to high/i }).click();

    await expect(productHeadings).toHaveText([
      'Art Deco Pendant Necklace',
      '1990s Leather Shoulder Bag',
      '1970s Prairie Midi Dress',
      'Suede Block Heel Boots',
      '1980s Wool Blazer',
    ]);

    await page.getByRole('combobox', { name: /sort products/i }).click();
    await page.getByRole('option', { name: /name: a-z/i }).click();

    await expect(productHeadings).toHaveText([
      '1970s Prairie Midi Dress',
      '1980s Wool Blazer',
      '1990s Leather Shoulder Bag',
      'Art Deco Pendant Necklace',
      'Suede Block Heel Boots',
    ]);
  });
});
