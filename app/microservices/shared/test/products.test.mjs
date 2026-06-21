import { describe, expect, it } from 'vitest';

import {
  productDetailEnvelopeFixture,
  productDetailEnvelopeSchema,
  productListEnvelopeFixture,
  productListEnvelopeSchema,
  productWireFixtureSet,
  productWireSchema,
} from '../src/index.mjs';

describe('Vintage Storefront product wire contracts', () => {
  it('validate representative product list and detail envelopes', () => {
    expect(productListEnvelopeSchema.safeParse(productListEnvelopeFixture).success).toBe(true);
    expect(productDetailEnvelopeSchema.safeParse(productDetailEnvelopeFixture).success).toBe(true);
  });

  it('validate every representative product fixture against the backend wire schema', () => {
    for (const product of productWireFixtureSet) {
      expect(productWireSchema.safeParse(product).success, `${product.id} should match product wire schema`).toBe(true);
    }
  });

  it('cover categories, prices, image paths, featured/new state, and low inventory', () => {
    expect(new Set(productWireFixtureSet.map((product) => product.category)).size).toBeGreaterThanOrEqual(3);
    expect(productWireFixtureSet.some((product) => Number.parseFloat(product.price) < 100)).toBe(true);
    expect(productWireFixtureSet.some((product) => Number.parseFloat(product.compare_price) > Number.parseFloat(product.price))).toBe(true);
    expect(productWireFixtureSet.every((product) => product.image_url.startsWith('/product-images/'))).toBe(true);
    expect(productWireFixtureSet.some((product) => product.is_featured)).toBe(true);
    expect(productWireFixtureSet.some((product) => product.created_at > '2026-02-01T00:00:00.000Z')).toBe(true);
    expect(productWireFixtureSet.some((product) => product.inventory_quantity <= 2)).toBe(true);
  });

  it('reject invalid product wire shapes', () => {
    expect(productWireFixtureSet.length, 'productWireFixtureSet must not be empty').toBeGreaterThan(0);
    const seed = productWireFixtureSet[0];
    const invalidProducts = [
      { ...seed, imageUrl: seed.image_url, image_url: undefined },
      { ...seed, comparePrice: seed.compare_price, compare_price: undefined },
      { ...seed, inventory_quantity: '2' },
      { ...seed, createdAt: seed.created_at, created_at: undefined },
    ];

    for (const product of invalidProducts) {
      expect(productWireSchema.safeParse(product).success, 'invalid backend wire shape should fail').toBe(false);
    }
  });
});
