import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { createApp } from '../../backend/services/product-service/src/index.ts';
import {
  productDetailEnvelopeSchema,
  productListEnvelopeSchema,
  productWireFixtureSet,
  storefrontFailureEnvelopeSchema,
} from '../src/index.mjs';

const categoryListEnvelopeSchema = z
  .object({
    success: z.literal(true),
    data: z.array(
      z
        .object({
          id: z.string().uuid(),
          name: z.string().min(1),
          description: z.string().min(1).nullable(),
          image_url: z.string().startsWith('/product-images/').nullable(),
          product_count: z.string().regex(/^\d+$/),
        })
        .strict()
    ),
  })
  .strict();

const categories = Object.freeze([
  {
    id: '274cfdcb-1d8a-4563-93f3-a62e72c9e6f6',
    name: 'Dresses',
    description: 'Vintage dresses',
    image_url: '/product-images/1970s-prairie-midi-dress.jpg',
    product_count: '3',
  },
]);

function createTestApp({ query = vi.fn() } = {}) {
  return {
    app: createApp({ database: { query } }),
    query,
  };
}

describe('active product service Storefront contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists products through the importable app seam with a mocked database boundary', async () => {
    const { app, query } = createTestApp({
      query: vi
        .fn()
        .mockResolvedValueOnce({ rows: [{ total: String(productWireFixtureSet.length) }] })
        .mockResolvedValueOnce({ rows: productWireFixtureSet }),
    });

    const response = await request(app).get('/').expect(200);

    expect(query).toHaveBeenCalledTimes(2);
    expect(productListEnvelopeSchema.safeParse(response.body).success).toBe(true);
    expect(response.body).toEqual({
      success: true,
      data: {
        products: productWireFixtureSet,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          total: productWireFixtureSet.length,
          hasNext: false,
          hasPrev: false,
        },
      },
    });
  });

  it('lists product categories in the minimal Storefront success envelope', async () => {
    const { app } = createTestApp({ query: vi.fn().mockResolvedValueOnce({ rows: categories }) });

    const response = await request(app).get('/categories').expect(200);

    expect(categoryListEnvelopeSchema.safeParse(response.body).success).toBe(true);
    expect(response.body).toEqual({ success: true, data: categories });
  });

  it('returns product detail with backend wire field naming preserved', async () => {
    const product = productWireFixtureSet[0];
    const { app, query } = createTestApp({ query: vi.fn().mockResolvedValueOnce({ rows: [product] }) });

    const response = await request(app).get(`/${product.id}`).expect(200);

    expect(query).toHaveBeenCalledWith(expect.stringContaining('WHERE p.id = $1'), [product.id]);
    expect(productDetailEnvelopeSchema.safeParse(response.body).success).toBe(true);
    expect(response.body).toEqual({ success: true, data: product });
  });

  it('returns the minimal Storefront failure envelope when product detail is not found', async () => {
    const { app } = createTestApp({ query: vi.fn().mockResolvedValueOnce({ rows: [] }) });

    const response = await request(app).get('/67be2d5e-ecfb-4bf9-b751-8474f9d7bcac').expect(404);

    expect(storefrontFailureEnvelopeSchema.safeParse(response.body).success).toBe(true);
    expect(response.body).toEqual({ success: false, error: 'Product not found' });
  });

  it('returns the minimal Storefront failure envelope when product listing fails', async () => {
    const { app } = createTestApp({ query: vi.fn().mockRejectedValueOnce(new Error('database unavailable')) });

    const response = await request(app).get('/').expect(500);

    expect(storefrontFailureEnvelopeSchema.safeParse(response.body).success).toBe(true);
    expect(response.body).toEqual({ success: false, error: 'Failed to get products' });
  });
});
