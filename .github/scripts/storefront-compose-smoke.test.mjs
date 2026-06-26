import assert from 'node:assert/strict';
import http from 'node:http';
import { test } from 'node:test';

import {
  SEEDED_DEMO_USER_ID,
  checkStorefrontStack,
  diagnosticsLabelForStep,
  extractProducts,
  resolveImageUrl,
} from './storefront-compose-smoke.mjs';

test('extractProducts requires a successful non-empty product envelope', () => {
  const products = extractProducts({
    success: true,
    data: {
      products: [
        {
          id: '67be2d5e-ecfb-4bf9-b751-8474f9d7bcac',
          name: 'Prairie Midi Dress',
          brand: 'Hiraya Furugi',
          image_url: '/product-images/prairie-midi-dress.jpg',
        },
      ],
    },
  });

  assert.equal(products.length, 1);
  assert.equal(products[0].brand, 'Hiraya Furugi');

  assert.throws(
    () => extractProducts({ success: false, error: 'Failed to get products' }),
    /products response must be a success envelope/
  );

  assert.throws(
    () => extractProducts({ success: true, data: { products: [] } }),
    /products response returned no products/
  );
});

test('resolveImageUrl resolves frontend-served product image paths', () => {
  assert.equal(
    resolveImageUrl('http://localhost:3000', '/product-images/prairie-midi-dress.jpg'),
    'http://localhost:3000/product-images/prairie-midi-dress.jpg'
  );
});

test('diagnostics labels identify full-stack failure areas', () => {
  assert.equal(diagnosticsLabelForStep('frontend shell'), 'frontend serving');
  assert.equal(diagnosticsLabelForStep('product envelope'), 'gateway routing/products/seed data');
  assert.equal(diagnosticsLabelForStep('product image'), 'image assets/frontend serving');
  assert.equal(diagnosticsLabelForStep('demo login'), 'auth/seed data');
  assert.equal(diagnosticsLabelForStep('seeded order history'), 'orders/seed data');
  assert.equal(diagnosticsLabelForStep('checkout order'), 'checkout/orders/products');
});

test('checkStorefrontStack exercises shell, catalog, auth, order history, and checkout', async () => {
  const seen = [];
  const server = http.createServer(async (req, res) => {
    seen.push(`${req.method} ${req.url}`);

    if (req.method === 'GET' && req.url === '/') {
      res.writeHead(200, { 'content-type': 'text/html' });
      res.end('<!doctype html><div id="root"></div>');
      return;
    }

    if (req.method === 'GET' && req.url === '/api/products') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: {
          products: [
            {
              id: '67be2d5e-ecfb-4bf9-b751-8474f9d7bcac',
              name: 'Prairie Midi Dress',
              brand: 'Hiraya Furugi',
              image_url: '/product-images/prairie-midi-dress.jpg',
            },
          ],
        },
      }));
      return;
    }

    if (req.method === 'GET' && req.url === '/product-images/prairie-midi-dress.jpg') {
      res.writeHead(200, { 'content-type': 'image/jpeg' });
      res.end('fake-jpeg');
      return;
    }

    if (req.method === 'POST' && req.url === '/api/auth/login') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: {
          token: 'demo-token',
          user: { id: SEEDED_DEMO_USER_ID },
        },
      }));
      return;
    }

    if (req.method === 'GET' && req.url === `/api/orders/my-orders?userId=${SEEDED_DEMO_USER_ID}`) {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: { orders: [{ id: '8d46347c-43db-4f01-b6c7-d5d3288f0ecb' }] },
      }));
      return;
    }

    if (req.method === 'POST' && req.url === '/api/orders') {
      let body = '';
      for await (const chunk of req) {
        body += chunk;
      }
      const parsed = JSON.parse(body);
      assert.equal(parsed.userId, SEEDED_DEMO_USER_ID);
      assert.equal(parsed.items[0].quantity, 1);
      res.writeHead(201, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: { id: 'new-order', status: 'pending' } }));
      return;
    }

    res.writeHead(404, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'not found' }));
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const { port } = server.address();
    await checkStorefrontStack({ baseUrl: `http://127.0.0.1:${port}`, timeoutMs: 1000 });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  assert.deepEqual(seen, [
    'GET /',
    'GET /api/products',
    'GET /product-images/prairie-midi-dress.jpg',
    'POST /api/auth/login',
    `GET /api/orders/my-orders?userId=${SEEDED_DEMO_USER_ID}`,
    'POST /api/orders',
  ]);
});
