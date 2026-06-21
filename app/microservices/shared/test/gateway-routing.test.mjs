import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp, getServicesFromEnv } from '../../backend/services/gateway/src/index.ts';

function createMockProxy(options) {
  return (req, res) => {
    const rewrittenPath = Object.entries(options.pathRewrite ?? {}).reduce(
      (path, [pattern, replacement]) => path.replace(new RegExp(pattern), replacement),
      req.originalUrl,
    );

    res.status(200).json({
      target: options.target,
      rewrittenPath,
    });
  };
}

const serviceUrls = {
  auth: 'http://auth.test',
  products: 'http://products.test',
  orders: 'http://orders.test',
  users: 'http://users.test',
};

describe('Gateway /api routing contract', () => {
  it('uses active local service ports by default', () => {
    delete process.env.AUTH_SERVICE_URL;
    delete process.env.PRODUCTS_SERVICE_URL;
    delete process.env.ORDERS_SERVICE_URL;
    delete process.env.USERS_SERVICE_URL;

    expect(getServicesFromEnv()).toEqual({
      auth: 'http://localhost:3002',
      products: 'http://localhost:3003',
      orders: 'http://localhost:3005',
      users: 'http://localhost:3006',
    });
  });

  it.each([
    ['auth', '/api/auth/login', serviceUrls.auth, '/login'],
    ['products', '/api/products/vintage-jacket', serviceUrls.products, '/vintage-jacket'],
    ['orders', '/api/orders/ord_123/status', serviceUrls.orders, '/ord_123/status'],
    ['users', '/api/users/me', serviceUrls.users, '/me'],
  ])('routes /api/%s requests to the configured upstream with the public prefix removed', async (_name, publicPath, target, rewrittenPath) => {
    const app = createApp({ services: serviceUrls, proxyFactory: createMockProxy });

    const response = await request(app).get(publicPath).expect(200);

    expect(response.body).toEqual({ target, rewrittenPath });
  });

  it('returns the minimal failure envelope for unmatched gateway routes', async () => {
    const app = createApp({ services: serviceUrls, proxyFactory: createMockProxy });

    const response = await request(app).get('/api/not-a-service').expect(404);

    expect(response.body).toEqual({ success: false, error: 'Service not found' });
  });
});
