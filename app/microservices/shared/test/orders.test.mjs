import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  orderHistoryEnvelopeFixture,
  orderHistoryEnvelopeSchema,
  orderLineItemWireSchema,
  orderWireFixtureSet,
  orderWireSchema,
  productWireFixtureSet,
} from '../src/index.mjs';

describe('Vintage Storefront order wire contracts', () => {
  it('validates representative order history wrapped in a Storefront success envelope', () => {
    assert.equal(orderHistoryEnvelopeSchema.safeParse(orderHistoryEnvelopeFixture).success, true);
  });

  it('validates every representative order and line item against the backend wire schemas', () => {
    for (const order of orderWireFixtureSet) {
      assert.equal(orderWireSchema.safeParse(order).success, true, `${order.id} should match order wire schema`);

      for (const item of order.items) {
        assert.equal(orderLineItemWireSchema.safeParse(item).success, true, `${item.id} should match order line item wire schema`);
      }
    }
  });

  it('ties order line items to representative product fixture data', () => {
    const productsById = new Map(productWireFixtureSet.map((product) => [product.id, product]));

    for (const order of orderWireFixtureSet) {
      for (const item of order.items) {
        const product = productsById.get(item.productId);

        assert.ok(product, `${item.productId} should exist in the representative product fixtures`);
        assert.equal(item.product.id, product.id);
        assert.equal(item.product.name, product.name);
        assert.equal(item.product.price, product.price);
        assert.equal(item.product.image_url, product.image_url);
      }
    }
  });

  it('rejects malformed order history and order payloads', () => {
    const invalidOrders = [
      { ...orderWireFixtureSet[0], total_amount: orderWireFixtureSet[0].totalAmount, totalAmount: undefined },
      { ...orderWireFixtureSet[0], status: 'returned' },
      { ...orderWireFixtureSet[0], created_at: orderWireFixtureSet[0].createdAt, createdAt: undefined },
      { ...orderWireFixtureSet[0], items: [{ ...orderWireFixtureSet[0].items[0], product_id: orderWireFixtureSet[0].items[0].productId, productId: undefined }] },
    ];
    const invalidEnvelopes = [
      { success: true, data: orderWireFixtureSet },
      { success: true, data: { orders: [{ ...orderWireFixtureSet[0], id: 'not-a-uuid' }] } },
      { success: false, data: { orders: orderWireFixtureSet }, error: 'Use only failure shape' },
    ];

    for (const order of invalidOrders) {
      assert.equal(orderWireSchema.safeParse(order).success, false, 'invalid order wire shape should fail');
    }

    for (const envelope of invalidEnvelopes) {
      assert.equal(orderHistoryEnvelopeSchema.safeParse(envelope).success, false, 'invalid order history envelope should fail');
    }
  });
});
