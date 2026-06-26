#!/usr/bin/env node
import { spawn } from 'node:child_process';
import process from 'node:process';

export const DEFAULT_COMPOSE_FILE = 'app/microservices/docker-compose.yml';
export const DEFAULT_BASE_URL = 'http://localhost:3000';
export const SEEDED_DEMO_USER_ID = 'f8b01ff1-9114-4c3e-92a7-45a8d1f2d6e6';
export const SEEDED_DEMO_EMAIL = 'demo@hirayavintage.test';
export const SEEDED_DEMO_PASSWORD = 'correct horse battery staple';

export const EXPECTED_HIRAYA_PRODUCT_IMAGE_URLS = Object.freeze(new Map([
  ['67be2d5e-ecfb-4bf9-b751-8474f9d7bcac', '/product-images/prairie-midi-dress.jpg'],
  ['e858df02-4a5b-4f8e-a1f4-2b6c28150d0b', '/product-images/washed-linen-work-jacket.jpg'],
  ['760f89d0-c80f-4798-8c75-f26070eb35d8', '/product-images/indigo-straight-denim.jpg'],
  ['99026f04-ced9-42a5-b9e3-9440c4e38902', '/product-images/cotton-lace-night-blouse.jpg'],
  ['d68c49dd-ccfb-4965-8b70-c98d32f77d71', '/product-images/sumi-silk-scarf.jpg'],
  ['b87e70bb-13e1-4200-87ab-d1c7698e43c6', '/product-images/wool-twill-evening-coat.jpg'],
  ['4db3c0fe-b753-42d2-a102-e26c5a9f71f5', '/product-images/patchwork-market-tote.jpg'],
  ['f7b0b8b5-7e1d-4562-9cd4-10ac3f12fe35', '/product-images/linen-tab-collar-shirt.jpg'],
]));

const CHECK_STEPS = Object.freeze([
  'frontend shell',
  'product envelope',
  'product image',
  'demo login',
  'seeded order history',
  'checkout order',
]);

export function diagnosticsLabelForStep(step) {
  switch (step) {
    case 'frontend shell':
      return 'frontend serving';
    case 'product envelope':
      return 'gateway routing/products/seed data';
    case 'product image':
      return 'image assets/frontend serving';
    case 'demo login':
      return 'auth/seed data';
    case 'seeded order history':
      return 'orders/seed data';
    case 'checkout order':
      return 'checkout/orders/products';
    default:
      return 'unknown';
  }
}

function normalizeBaseUrl(value) {
  if (!value || !value.trim()) {
    throw new Error('COMPOSE_SMOKE_BASE_URL must not be empty.');
  }
  return value.trim().replace(/\/+$/, '');
}

function positiveIntegerEnv(name, fallback) {
  const raw = process.env[name] ?? fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return parsed;
}

function nonNegativeIntegerEnv(name, fallback) {
  const raw = process.env[name] ?? fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${name} must be a non-negative integer.`);
  }
  return parsed;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function composeArgs(composeFile, args) {
  return ['compose', '-f', composeFile, ...args];
}

async function runDocker(args, description) {
  console.log(`\n$ docker ${args.join(' ')}`);
  await new Promise((resolve, reject) => {
    const child = spawn('docker', args, { stdio: 'inherit' });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${description} failed with exit code ${code}.`));
      }
    });
  });
}

async function fetchWithTimeout(url, options = {}, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchText(url, timeoutMs) {
  const response = await fetchWithTimeout(
    url,
    {
      method: 'GET',
      headers: { accept: 'text/html,application/xhtml+xml' },
      redirect: 'follow',
    },
    timeoutMs
  );
  return { response, text: await response.text() };
}

async function fetchJson(url, timeoutMs, options = {}) {
  const response = await fetchWithTimeout(
    url,
    {
      redirect: 'follow',
      ...options,
      headers: {
        accept: 'application/json',
        ...(options.body ? { 'content-type': 'application/json' } : {}),
        ...(options.headers ?? {}),
      },
    },
    timeoutMs
  );
  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`${url} did not return JSON: ${text.slice(0, 240)}`);
  }
  return { response, json };
}

function assertOk(response, area, url) {
  if (!response.ok) {
    throw new Error(`${area} request ${url} returned HTTP ${response.status}.`);
  }
}

export function extractProducts(body) {
  if (body?.success !== true) {
    throw new Error(`products response must be a success envelope; got ${JSON.stringify(body).slice(0, 240)}.`);
  }

  const products = Array.isArray(body.data) ? body.data : body.data?.products;
  if (!Array.isArray(products)) {
    throw new Error('products success envelope must contain data.products or data as an array.');
  }
  if (products.length === 0) {
    throw new Error('products response returned no products; check seed data.');
  }

  return products;
}

export function resolveImageUrl(baseUrl, imageUrl) {
  if (typeof imageUrl !== 'string' || imageUrl.length === 0) {
    throw new Error('product image_url must be a non-empty string.');
  }
  return new URL(imageUrl, `${baseUrl}/`).toString();
}

function assertStorefrontShell(baseUrl, response, html) {
  assertOk(response, 'frontend shell', `${baseUrl}/`);
  if (!html.includes('<div id="root"></div>') && !html.includes('id="root"')) {
    throw new Error('frontend shell did not look like the Vintage Storefront shell document.');
  }
}

export function assertHirayaProduct(product) {
  if (product.brand !== 'Hiraya Furugi') {
    throw new Error(`expected a Hiraya Furugi product from seeded catalog; got ${JSON.stringify(product).slice(0, 240)}.`);
  }

  const expectedImageUrl = EXPECTED_HIRAYA_PRODUCT_IMAGE_URLS.get(product.id);
  if (!expectedImageUrl) {
    throw new Error(`expected a known seeded Hiraya Furugi product id; got ${product.id}.`);
  }
  if (product.image_url !== expectedImageUrl) {
    throw new Error(`expected product image_url for ${product.id} to be ${expectedImageUrl}; got ${product.image_url}.`);
  }
}

function assertSuccessEnvelope(body, area) {
  if (body?.success !== true) {
    throw new Error(`${area} response must be a success envelope; got ${JSON.stringify(body).slice(0, 240)}.`);
  }
}

async function runStep(step, fn) {
  try {
    const result = await fn();
    console.log(`✓ ${step}`);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`[${diagnosticsLabelForStep(step)}] ${step} failed: ${message}`);
  }
}

export async function checkStorefrontStack({ baseUrl = DEFAULT_BASE_URL, timeoutMs = 10000 } = {}) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const state = {};

  await runStep('frontend shell', async () => {
    const shell = await fetchText(`${normalizedBaseUrl}/`, timeoutMs);
    assertStorefrontShell(normalizedBaseUrl, shell.response, shell.text);
  });

  await runStep('product envelope', async () => {
    const productsResponse = await fetchJson(`${normalizedBaseUrl}/api/products`, timeoutMs);
    assertOk(productsResponse.response, 'product envelope', `${normalizedBaseUrl}/api/products`);
    const products = extractProducts(productsResponse.json);
    assertHirayaProduct(products[0]);
    state.product = products[0];
  });

  await runStep('product image', async () => {
    const imageUrl = resolveImageUrl(normalizedBaseUrl, state.product.image_url);
    const response = await fetchWithTimeout(imageUrl, { method: 'GET', redirect: 'follow' }, timeoutMs);
    assertOk(response, 'product image', imageUrl);
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.startsWith('image/')) {
      throw new Error(`${imageUrl} returned content-type ${contentType || '<missing>'}.`);
    }
  });

  await runStep('demo login', async () => {
    const login = await fetchJson(`${normalizedBaseUrl}/api/auth/login`, timeoutMs, {
      method: 'POST',
      body: JSON.stringify({ email: SEEDED_DEMO_EMAIL, password: SEEDED_DEMO_PASSWORD }),
    });
    assertOk(login.response, 'demo login', `${normalizedBaseUrl}/api/auth/login`);
    assertSuccessEnvelope(login.json, 'demo login');
    const token = login.json.data?.token;
    const userId = login.json.data?.user?.id;
    if (!token || userId !== SEEDED_DEMO_USER_ID) {
      throw new Error(`demo login returned unexpected user/token: ${JSON.stringify(login.json).slice(0, 240)}.`);
    }
    state.token = token;
  });

  await runStep('seeded order history', async () => {
    const url = `${normalizedBaseUrl}/api/orders/my-orders?userId=${SEEDED_DEMO_USER_ID}`;
    const orders = await fetchJson(url, timeoutMs, {
      method: 'GET',
      headers: { authorization: `Bearer ${state.token}` },
    });
    assertOk(orders.response, 'seeded order history', url);
    assertSuccessEnvelope(orders.json, 'seeded order history');
    const orderList = orders.json.data?.orders;
    if (!Array.isArray(orderList) || orderList.length === 0) {
      throw new Error('seeded demo customer has no order history; check orders seed data.');
    }
  });

  await runStep('checkout order', async () => {
    const checkout = await fetchJson(`${normalizedBaseUrl}/api/orders`, timeoutMs, {
      method: 'POST',
      headers: { authorization: `Bearer ${state.token}` },
      body: JSON.stringify({
        userId: SEEDED_DEMO_USER_ID,
        items: [{ productId: state.product.id, quantity: 1 }],
        shippingAddress: {
          street: '123 Compose Smoke St',
          city: 'Manila',
          state: 'Metro Manila',
          zipCode: '1000',
          country: 'PH',
        },
      }),
    });
    if (checkout.response.status !== 201) {
      throw new Error(`checkout returned HTTP ${checkout.response.status}: ${JSON.stringify(checkout.json).slice(0, 240)}.`);
    }
    assertSuccessEnvelope(checkout.json, 'checkout order');
    if (checkout.json.data?.status !== 'pending') {
      throw new Error(`checkout did not create a pending order: ${JSON.stringify(checkout.json).slice(0, 240)}.`);
    }
  });
}

async function waitForStack(options) {
  const { attempts, delayMs } = options;
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await checkStorefrontStack(options);
      return;
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      if (attempt === attempts) {
        break;
      }
      console.log(`Waiting for Compose smoke (${attempt}/${attempts}): ${message}`);
      await sleep(delayMs);
    }
  }

  throw new Error(`Compose Storefront smoke failed after ${attempts} attempt(s): ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}

async function main() {
  const composeFile = process.env.COMPOSE_SMOKE_COMPOSE_FILE ?? DEFAULT_COMPOSE_FILE;
  const baseUrl = normalizeBaseUrl(process.env.COMPOSE_SMOKE_BASE_URL ?? DEFAULT_BASE_URL);
  const attempts = positiveIntegerEnv('COMPOSE_SMOKE_ATTEMPTS', '30');
  const delayMs = nonNegativeIntegerEnv('COMPOSE_SMOKE_DELAY_MS', '5000');
  const timeoutMs = positiveIntegerEnv('COMPOSE_SMOKE_TIMEOUT_MS', '10000');
  const checkOnly = process.env.COMPOSE_SMOKE_CHECK_ONLY === '1';
  const keepStack = process.env.COMPOSE_SMOKE_KEEP_STACK === '1';

  if (checkOnly) {
    await waitForStack({ baseUrl, attempts, delayMs, timeoutMs });
    console.log(`Compose Storefront smoke checks passed for ${baseUrl}.`);
    return;
  }

  let started = false;
  try {
    console.log('Resetting Compose stack and named volumes for a clean Vintage Storefront database state.');
    await runDocker(composeArgs(composeFile, ['down', '--volumes', '--remove-orphans']), 'Compose reset');
    await runDocker(composeArgs(composeFile, ['up', '-d', '--build']), 'Compose startup');
    started = true;
    await waitForStack({ baseUrl, attempts, delayMs, timeoutMs });
    console.log(`Compose Storefront smoke passed for ${baseUrl}.`);
  } finally {
    if (started && !keepStack) {
      console.log('Tearing down Compose stack and named volumes after smoke.');
      await runDocker(composeArgs(composeFile, ['down', '--volumes', '--remove-orphans']), 'Compose teardown');
    } else if (started && keepStack) {
      console.log('COMPOSE_SMOKE_KEEP_STACK=1 set; leaving Compose stack running for debugging.');
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    console.error(`Failure areas checked: ${CHECK_STEPS.map((step) => `${step}=${diagnosticsLabelForStep(step)}`).join('; ')}`);
    process.exit(1);
  });
}
