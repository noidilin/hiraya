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

const loginPassword = 'correct-horse-battery-staple';

const fulfillJson = async (route, schema, fixture) => {
  const envelope = schema.parse(fixture);

  await route.fulfill({
    status: 200,
    headers: jsonHeaders,
    json: envelope,
  });
};

const rejectUnmockedStorefrontApi = async (route) => {
  throw new Error(`Unexpected unmocked Storefront API request: ${route.request().url()}`);
};

const routeLoginApi = async (page, submittedCredentials) => {
  await page.route('**/api/**', rejectUnmockedStorefrontApi);

  await page.route(
    (url) => url.pathname === storefrontContractPaths.authLogin,
    async (route) => {
      submittedCredentials.push(route.request().postDataJSON());
      await fulfillJson(
        route,
        storefrontContractSchemas.authSuccessEnvelope,
        storefrontContractFixtures.authSuccessEnvelope,
      );
    },
  );
};

const routeAuthenticatedShellApi = async (context) => {
  await context.route('**/api/**', rejectUnmockedStorefrontApi);

  await context.route(
    (url) => url.pathname === storefrontContractPaths.authMe,
    async (route) => {
      await fulfillJson(
        route,
        storefrontContractSchemas.authenticatedUserEnvelope,
        storefrontContractFixtures.authenticatedUserEnvelope,
      );
    },
  );

  await context.route(
    (url) => url.pathname === storefrontContractPaths.orderHistory,
    async (route) => {
      await fulfillJson(
        route,
        storefrontContractSchemas.orderHistoryEnvelope,
        storefrontContractFixtures.orderHistoryEnvelope,
      );
    },
  );
};

const expectProfileShell = async (page) => {
  const user = storefrontContractFixtures.authenticatedUserWire;

  await expect(page).toHaveURL('/profile');
  await expect(page.getByRole('heading', { name: /my profile/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: `${user.firstName} ${user.lastName}` })).toBeVisible();
  await expect(page.getByText(user.email).first()).toBeVisible();
  await expect(page.getByText(/personal information/i)).toBeVisible();
};

const expectOrdersShell = async (page) => {
  const order = storefrontContractFixtures.orderHistoryEnvelope.data.orders[0];

  await expect(page).toHaveURL('/orders');
  await expect(page.getByRole('heading', { name: /my orders/i })).toBeVisible();
  await expect(page.getByText('1 Order')).toBeVisible();
  await expect(page.getByText(`Order #${order.id.slice(-8)}`)).toBeVisible();
  await expect(page.getByText(/delivered/i).first()).toBeVisible();
  await expect(page.getByText('$402.00')).toBeVisible();

  await page.getByRole('button', { name: /2 items \$402\.00/i }).click();
  await expect(page.getByText(order.items[0].product.name)).toBeVisible();
};

test('Vintage Storefront UI login saves authenticated state reused by protected shells', async ({ page, browser }) => {
  const submittedCredentials = [];
  const user = storefrontContractFixtures.authenticatedUserWire;

  await routeLoginApi(page, submittedCredentials);

  await page.goto('/profile');

  await expect(page).toHaveURL('/login');
  await page.getByRole('textbox', { name: /email address/i }).fill(user.email);
  await page.getByLabel(/password/i).fill(loginPassword);
  await page.getByRole('button', { name: /^sign in$/i }).click();

  await expectProfileShell(page);
  expect(submittedCredentials).toEqual([
    {
      email: user.email,
      password: loginPassword,
    },
  ]);

  const authenticatedState = await page.context().storageState();
  const originState = authenticatedState.origins.find((origin) => origin.origin === 'http://127.0.0.1:3000');
  expect(originState?.localStorage).toEqual(
    expect.arrayContaining([
      {
        name: 'accessToken',
        value: storefrontContractFixtures.authSuccessEnvelope.data.token,
      },
    ]),
  );

  const profileContext = await browser.newContext({ storageState: authenticatedState });
  await routeAuthenticatedShellApi(profileContext);
  const protectedProfile = await profileContext.newPage();
  await protectedProfile.goto('/profile');
  await expectProfileShell(protectedProfile);
  await profileContext.close();

  const ordersContext = await browser.newContext({ storageState: authenticatedState });
  await routeAuthenticatedShellApi(ordersContext);
  const protectedOrders = await ordersContext.newPage();
  await protectedOrders.goto('/orders');
  await expectOrdersShell(protectedOrders);
  await ordersContext.close();
});
