import { describe, expect, it } from 'vitest';

import {
  orderDetailEnvelopeFixture,
  orderDetailEnvelopeSchema,
  orderHistoryEnvelopeFixture,
  orderHistoryEnvelopeSchema,
  orderLineItemWireSchema,
  orderWireFixtureSet,
  orderWireSchema,
  productWireFixtureSet,
} from '../src/index.mjs';

describe('Vintage Storefront order wire contracts', () => {
  it('validates representative order history wrapped in a Storefront success envelope', () => {
    expect(orderHistoryEnvelopeSchema.safeParse(orderHistoryEnvelopeFixture).success).toBe(true);
  });

  it('validates representative order detail wrapped in a Storefront success envelope', () => {
    expect(orderDetailEnvelopeSchema.safeParse(orderDetailEnvelopeFixture).success).toBe(true);
  });

  it('validates every representative order and line item against the backend wire schemas', () => {
    for (const order of orderWireFixtureSet) {
      expect(orderWireSchema.safeParse(order).success, `${order.id} should match order wire schema`).toBe(true);

      for (const item of order.items) {
        expect(orderLineItemWireSchema.safeParse(item).success, `${item.id} should match order line item wire schema`).toBe(true);
      }
    }
  });

  it('ties order line items to representative product fixture data', () => {
    const productsById = new Map(productWireFixtureSet.map((product) => [product.id, product]));

    for (const order of orderWireFixtureSet) {
      for (const item of order.items) {
        const product = productsById.get(item.productId);

        expect(product, `${item.productId} should exist in the representative product fixtures`).toBeTruthy();
        expect(item.product.id).toBe(product.id);
        expect(item.product.name).toBe(product.name);
        expect(item.product.price).toBe(product.price);
        expect(item.product.image_url).toBe(product.image_url);
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
      expect(orderWireSchema.safeParse(order).success, 'invalid order wire shape should fail').toBe(false);
    }

    for (const envelope of invalidEnvelopes) {
      expect(orderHistoryEnvelopeSchema.safeParse(envelope).success, 'invalid order history envelope should fail').toBe(false);
    }
  });
});
