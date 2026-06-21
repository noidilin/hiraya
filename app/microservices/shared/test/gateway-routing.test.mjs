import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../../backend/services/gateway/src/index.ts';

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
});
