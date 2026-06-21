import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

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
    assert.equal(productListEnvelopeSchema.safeParse(productListEnvelopeFixture).success, true);
    assert.equal(productDetailEnvelopeSchema.safeParse(productDetailEnvelopeFixture).success, true);
  });

  it('validate every representative product fixture against the backend wire schema', () => {
    for (const product of productWireFixtureSet) {
      assert.equal(productWireSchema.safeParse(product).success, true, `${product.id} should match product wire schema`);
    }
  });

  it('cover categories, prices, image paths, featured/new state, and low inventory', () => {
    assert.ok(new Set(productWireFixtureSet.map((product) => product.category)).size >= 3);
    assert.ok(productWireFixtureSet.some((product) => Number.parseFloat(product.price) < 100));
    assert.ok(productWireFixtureSet.some((product) => Number.parseFloat(product.compare_price) > Number.parseFloat(product.price)));
    assert.ok(productWireFixtureSet.every((product) => product.image_url.startsWith('/product-images/')));
    assert.ok(productWireFixtureSet.some((product) => product.is_featured));
    assert.ok(productWireFixtureSet.some((product) => product.created_at > '2026-02-01T00:00:00.000Z'));
    assert.ok(productWireFixtureSet.some((product) => product.inventory_quantity <= 2));
  });

  it('reject invalid product wire shapes', () => {
    const invalidProducts = [
      { ...productWireFixtureSet[0], imageUrl: productWireFixtureSet[0].image_url, image_url: undefined },
      { ...productWireFixtureSet[0], comparePrice: productWireFixtureSet[0].compare_price, compare_price: undefined },
      { ...productWireFixtureSet[0], inventory_quantity: '2' },
      { ...productWireFixtureSet[0], createdAt: productWireFixtureSet[0].created_at, created_at: undefined },
    ];

    for (const product of invalidProducts) {
      assert.equal(productWireSchema.safeParse(product).success, false, 'invalid backend wire shape should fail');
    }
  });
});
