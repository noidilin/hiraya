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

const product = storefrontContractFixtures.productDetailEnvelope.data;
const productPrice = Number.parseFloat(product.price);

const formatMoney = (amount) => `$${amount.toFixed(2)}`;

const cartTotals = (quantity) => {
  const subtotal = productPrice * quantity;
  const shipping = subtotal > 500 ? 0 : 15;
  const tax = subtotal * 0.08;

  return {
    subtotal: formatMoney(subtotal),
    shipping: shipping === 0 ? 'FREE' : formatMoney(shipping),
    tax: formatMoney(tax),
    total: formatMoney(subtotal + shipping + tax),
  };
};

const routeStorefrontCartApi = async (page) => {
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

const addFixtureProductToCart = async (page) => {
  await page.goto(`/products/${product.id}`);
  await expect(page.getByRole('heading', { name: product.name })).toBeVisible();

  await page.getByRole('button', { name: /add to cart/i }).click();
  await page.getByRole('button', { name: /view cart/i }).click();

  await expect(page).toHaveURL('/cart');
  await expect(page.getByRole('heading', { name: /shopping cart/i })).toBeVisible();
};

test.beforeEach(async ({ page }) => {
  await routeStorefrontCartApi(page);
});

test.describe('Vintage Storefront cart management', () => {
  test('updates cart quantities within inventory limits and recalculates visible totals', async ({ page }) => {
    await addFixtureProductToCart(page);

    const orderSummary = page.getByRole('region', { name: /order summary/i });
    const increaseQuantity = page.getByLabel(`Increase quantity for ${product.name}`);
    const decreaseQuantity = page.getByLabel(`Decrease quantity for ${product.name}`);

    await expect(page.getByText('1 Item in your cart')).toBeVisible();
    await expect(decreaseQuantity).toBeDisabled();
    await expect(orderSummary.getByText(cartTotals(1).subtotal)).toBeVisible();
    await expect(orderSummary.getByText(cartTotals(1).shipping)).toBeVisible();
    await expect(orderSummary.getByText(cartTotals(1).tax)).toBeVisible();
    await expect(orderSummary.getByText(cartTotals(1).total)).toBeVisible();

    await increaseQuantity.click();

    await expect(page.getByText('2 Items in your cart')).toBeVisible();
    await expect(decreaseQuantity).toBeEnabled();
    await expect(orderSummary.getByText(cartTotals(2).subtotal)).toBeVisible();
    await expect(orderSummary.getByText(cartTotals(2).tax)).toBeVisible();
    await expect(orderSummary.getByText(cartTotals(2).total)).toBeVisible();

    for (let quantity = 2; quantity < product.inventory_quantity; quantity += 1) {
      await increaseQuantity.click();
    }

    await expect(page.getByText(`${product.inventory_quantity} Items in your cart`)).toBeVisible();
    await expect(increaseQuantity).toBeDisabled();
    await expect(orderSummary.getByText(cartTotals(product.inventory_quantity).subtotal)).toBeVisible();
    await expect(orderSummary.getByText(cartTotals(product.inventory_quantity).shipping)).toBeVisible();
    await expect(orderSummary.getByText(cartTotals(product.inventory_quantity).tax)).toBeVisible();
    await expect(orderSummary.getByText(cartTotals(product.inventory_quantity).total)).toBeVisible();

    await decreaseQuantity.click();

    await expect(page.getByText(`${product.inventory_quantity - 1} Items in your cart`)).toBeVisible();
    await expect(increaseQuantity).toBeEnabled();
    await expect(orderSummary.getByText(cartTotals(product.inventory_quantity - 1).subtotal)).toBeVisible();
    await expect(orderSummary.getByText(cartTotals(product.inventory_quantity - 1).total)).toBeVisible();
  });

  test('removes a cart item and returns the shopper to the empty-cart state', async ({ page }) => {
    await addFixtureProductToCart(page);

    await expect(page.getByText('1 Item in your cart')).toBeVisible();

    await page.getByRole('button', { name: `Remove ${product.name} from cart` }).click();

    await expect(page.getByRole('heading', { name: /your cart is empty/i })).toBeVisible();
    await expect(page.getByText(/looks like you haven't added any products/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /start shopping/i })).toBeVisible();
    await expect(page.getByText(product.name)).toBeHidden();
  });

  test('clears the cart and shows the empty-cart behavior', async ({ page }) => {
    await addFixtureProductToCart(page);

    await page.getByLabel(`Increase quantity for ${product.name}`).click();
    await expect(page.getByText('2 Items in your cart')).toBeVisible();

    await page.getByRole('button', { name: /clear cart/i }).click();

    await expect(page.getByRole('heading', { name: /your cart is empty/i })).toBeVisible();
    await expect(page.getByText(/looks like you haven't added any products/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /start shopping/i })).toBeVisible();
    await expect(page.getByText(product.name)).toBeHidden();
  });

  test('presents checkout as unavailable without navigating away from the cart', async ({ page }) => {
    await addFixtureProductToCart(page);

    const checkoutButton = page.getByRole('button', { name: /checkout coming soon/i });

    await expect(page.getByText(/coming soon/i).first()).toBeVisible();
    await expect(checkoutButton).toBeDisabled();
    await expect(page.getByText(/checkout is coming soon/i)).toBeVisible();
    await expect(page.getByText(/checkout is unavailable in this demo slice/i)).toBeVisible();
    await expect(page).toHaveURL('/cart');
  });
});
