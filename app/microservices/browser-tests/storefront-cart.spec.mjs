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
const user = storefrontContractFixtures.authenticatedUserWire;

const routeProductDetailApi = async (page) => {
  await page.route((url) => url.pathname.startsWith('/api/'), async (route) => {
    throw new Error(`Unexpected unmocked Storefront API request: ${route.request().url()}`);
  });

  await page.route(
    (url) => url.pathname === storefrontContractPaths.productDetailFixture,
    async (route) => {
      await route.fulfill({
        status: 200,
        headers: jsonHeaders,
        json: storefrontContractSchemas.productDetailEnvelope.parse(storefrontContractFixtures.productDetailEnvelope),
      });
    },
  );
};

const addFixtureProductToCart = async (page, quantity = 1) => {
  await page.goto(`/products/${product.id}`);
  await expect(page.getByRole('heading', { name: product.name })).toBeVisible();

  if (quantity > 1) {
    await page.getByRole('spinbutton', { name: `${product.name} quantity` }).fill(String(quantity));
  }

  await page.getByRole('button', { name: `Add ${product.name} to cart` }).click();
  await page.getByRole('link', { name: /view cart/i }).click();

  await expect(page).toHaveURL('/cart');
  await expect(page.getByRole('heading', { name: 'Cart' })).toBeVisible();
};

const fillShippingAddress = async (page) => {
  await page.getByLabel('Street address').fill('123 Demo St');
  await page.getByLabel('City').fill('Manila');
  await page.getByLabel('State or province').fill('Metro Manila');
  await page.getByLabel('Postal code').fill('1000');
  await page.getByLabel('Country').fill('Philippines');
};

test.beforeEach(async ({ page }) => {
  await routeProductDetailApi(page);
});

test.describe('Vintage Storefront checkout cart flow', () => {
  test('logged-out checkout preserves cart state and returns to cart after login', async ({ page }) => {
    await page.route(
      (url) => url.pathname === storefrontContractPaths.authLogin,
      async (route) => {
        await route.fulfill({
          status: 200,
          headers: jsonHeaders,
          json: storefrontContractSchemas.authSuccessEnvelope.parse(storefrontContractFixtures.authSuccessEnvelope),
        });
      },
    );

    await addFixtureProductToCart(page, 2);
    await fillShippingAddress(page);

    await page.getByRole('link', { name: /go to account/i }).click();
    await expect(page).toHaveURL('/login?redirect=%2Fcart');

    await page.getByRole('textbox', { name: /^email$/i }).fill(user.email);
    await page.getByLabel(/password/i).fill('correct-horse-battery-staple');
    await page.getByRole('button', { name: /^sign in$/i }).click();

    await expect(page).toHaveURL('/cart');
    await expect(page.getByRole('link', { name: product.name })).toBeVisible();
    await expect(page.getByRole('spinbutton', { name: `${product.name} quantity` })).toHaveValue('2');
  });

  test('logged-out checkout preserves cart state and returns to cart after registration', async ({ page }) => {
    await page.route(
      (url) => url.pathname === '/api/auth/register',
      async (route) => {
        await route.fulfill({
          status: 201,
          headers: jsonHeaders,
          json: storefrontContractSchemas.authSuccessEnvelope.parse(storefrontContractFixtures.authSuccessEnvelope),
        });
      },
    );

    await addFixtureProductToCart(page, 2);
    await fillShippingAddress(page);

    await page.getByRole('link', { name: /go to account/i }).click();
    await page.goto('/register?redirect=%2Fcart');
    await page.getByLabel('First name').fill(user.firstName);
    await page.getByLabel('Last name').fill(user.lastName);
    await page.getByRole('textbox', { name: /^email$/i }).fill(user.email);
    await page.getByLabel(/password/i).fill('correct-horse-battery-staple');
    await page.getByRole('button', { name: /^create account$/i }).click();

    await expect(page).toHaveURL('/cart');
    await expect(page.getByRole('link', { name: product.name })).toBeVisible();
    await expect(page.getByRole('spinbutton', { name: `${product.name} quantity` })).toHaveValue('2');
  });

  test('logged-in checkout posts a pending order payload and shows confirmation without payment-collected copy', async ({ page }) => {
    const submittedOrders = [];
    const createdOrder = {
      ...storefrontContractFixtures.orderDetailEnvelope,
      data: {
        ...storefrontContractFixtures.orderDetailEnvelope.data,
        userId: user.id,
        status: 'pending',
        paymentStatus: 'pending',
        totalAmount: '256.00',
        items: [
          {
            ...storefrontContractFixtures.orderDetailEnvelope.data.items[0],
            quantity: 2,
            price: product.price,
            product,
          },
        ],
      },
    };

    await page.addInitScript(({ token }) => window.localStorage.setItem('accessToken', token), {
      token: storefrontContractFixtures.authSuccessEnvelope.data.token,
    });

    await page.route(
      (url) => url.pathname === storefrontContractPaths.authMe,
      async (route) => {
        await route.fulfill({
          status: 200,
          headers: jsonHeaders,
          json: storefrontContractSchemas.authenticatedUserEnvelope.parse(storefrontContractFixtures.authenticatedUserEnvelope),
        });
      },
    );

    await page.route(
      (url) => url.pathname === storefrontContractPaths.orderCreate,
      async (route) => {
        submittedOrders.push(route.request().postDataJSON());
        await route.fulfill({
          status: 201,
          headers: jsonHeaders,
          json: storefrontContractSchemas.orderDetailEnvelope.parse(createdOrder),
        });
      },
    );

    await addFixtureProductToCart(page, 2);
    await fillShippingAddress(page);
    await page.getByRole('button', { name: /^place order$/i }).click();

    await expect(page).toHaveURL('/order-confirmed');
    await expect(page.getByRole('heading', { name: /order confirmed/i })).toBeVisible();
    await expect(page.getByText(/reserved and the order record is ready/i)).toBeVisible();
    await expect(page.getByText(/pending/i).first()).toBeVisible();
    await expect(page.getByText(/paid|payment collected|charged/i)).toHaveCount(0);
    expect(submittedOrders).toEqual([
      {
        userId: user.id,
        items: [{ productId: product.id, quantity: 2 }],
        shippingAddress: {
          street: '123 Demo St',
          city: 'Manila',
          state: 'Metro Manila',
          zipCode: '1000',
          country: 'Philippines',
        },
      },
    ]);
  });
});
