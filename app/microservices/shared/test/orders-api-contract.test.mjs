import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../../backend/services/orders/src/index.ts';

const product = Object.freeze({
  id: '67be2d5e-ecfb-4bf9-b751-8474f9d7bcac',
  name: 'Prairie Midi Dress',
  description: 'Faded cotton midi dress with a gathered waist, lace-trim neckline, and an easy drape for warm days.',
  price: '128.00',
  compare_price: '168.00',
  brand: 'Hiraya Furugi',
  inventory_quantity: 4,
  is_featured: true,
  created_at: '2026-06-23T00:00:00.000Z',
  updated_at: '2026-06-23T00:00:00.000Z',
  category: 'Dresses',
  image_url: '/product-images/prairie-midi-dress.jpg',
});

const orderRow = Object.freeze({
  id: '8d46347c-43db-4f01-b6c7-d5d3288f0ecb',
  user_id: '31bbbc78-8b8f-4d6e-9c40-026681e7d5d1',
  total_amount: '256.00',
  status: 'pending',
  shipping_address: { street: '123 Demo St', city: 'Manila', state: 'Metro Manila', zipCode: '1000', country: 'PH' },
  payment_status: 'pending',
  created_at: '2026-02-14T10:22:31.000Z',
  updated_at: '2026-02-14T10:22:31.000Z',
});

const itemRow = Object.freeze({
  id: 'b9460644-95f4-47ac-853d-9579ac793f0b',
  product_id: product.id,
  quantity: 2,
  price: product.price,
});

function createTestApp({ query = vi.fn(), getProduct = vi.fn().mockResolvedValue(product) } = {}) {
  return {
    app: createApp({ database: { query }, products: { getProduct } }),
    query,
    getProduct,
  };
}

describe('active orders service Storefront contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates an order through the importable app seam with mocked database and product lookup boundaries', async () => {
    const { app, query, getProduct } = createTestApp({
      query: vi
        .fn()
        .mockResolvedValueOnce({ rows: [orderRow] })
        .mockResolvedValueOnce({ rows: [{ id: itemRow.id }] }),
    });

    const response = await request(app)
      .post('/')
      .send({
        userId: orderRow.user_id,
        items: [{ productId: product.id, quantity: 2 }],
        shippingAddress: orderRow.shipping_address,
      })
      .expect(201);

    expect(getProduct).toHaveBeenCalledWith(product.id);
    expect(query).toHaveBeenCalledTimes(2);
    expect(response.body).toEqual({
      success: true,
      data: {
        id: orderRow.id,
        userId: orderRow.user_id,
        items: [
          {
            id: itemRow.id,
            orderId: orderRow.id,
            productId: product.id,
            quantity: 2,
            price: product.price,
            product,
          },
        ],
        totalAmount: orderRow.total_amount,
        status: orderRow.status,
        paymentStatus: orderRow.payment_status,
        createdAt: orderRow.created_at,
        updatedAt: orderRow.updated_at,
      },
    });
  });

  it('lists a user order history in the minimal Storefront success envelope', async () => {
    const { app, getProduct } = createTestApp({
      query: vi.fn().mockResolvedValueOnce({ rows: [{ ...orderRow, items: [itemRow] }] }),
    });

    const response = await request(app)
      .get('/my-orders')
      .query({ userId: orderRow.user_id })
      .expect(200);

    expect(getProduct).toHaveBeenCalledWith(product.id);
    expect(response.body).toEqual({
      success: true,
      data: {
        orders: [
          {
            id: orderRow.id,
            userId: orderRow.user_id,
            items: [
              {
                id: itemRow.id,
                orderId: orderRow.id,
                productId: product.id,
                quantity: itemRow.quantity,
                price: itemRow.price,
                product,
              },
            ],
            totalAmount: orderRow.total_amount,
            status: orderRow.status,
            paymentStatus: orderRow.payment_status,
            createdAt: orderRow.created_at,
            updatedAt: orderRow.updated_at,
          },
        ],
      },
    });
  });

  it('updates order status in the minimal Storefront success envelope', async () => {
    const updatedOrder = { ...orderRow, status: 'shipped', updated_at: '2026-02-15T11:00:00.000Z' };
    const { app, query } = createTestApp({
      query: vi.fn().mockResolvedValueOnce({ rowCount: 1, rows: [updatedOrder] }),
    });

    const response = await request(app)
      .patch(`/${orderRow.id}/status`)
      .send({ status: 'shipped' })
      .expect(200);

    expect(query).toHaveBeenCalledTimes(1);
    expect(response.body).toEqual({
      success: true,
      data: {
        id: updatedOrder.id,
        userId: updatedOrder.user_id,
        totalAmount: updatedOrder.total_amount,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.payment_status,
        createdAt: updatedOrder.created_at,
        updatedAt: updatedOrder.updated_at,
      },
    });
  });

  it('returns 400 before product lookup for invalid item quantities', async () => {
    const { app, query, getProduct } = createTestApp();

    const response = await request(app)
      .post('/')
      .send({ userId: orderRow.user_id, items: [{ productId: product.id, quantity: 0 }], shippingAddress: orderRow.shipping_address })
      .expect(400);

    expect(query).not.toHaveBeenCalled();
    expect(getProduct).not.toHaveBeenCalled();
    expect(response.body).toEqual({ success: false, error: 'Order items require a productId and positive integer quantity' });
  });

  it('returns 502 when upstream product data contains an invalid price', async () => {
    const { app, query } = createTestApp({ getProduct: vi.fn().mockResolvedValue({ ...product, price: 'not-a-price' }) });

    const response = await request(app)
      .post('/')
      .send({ userId: orderRow.user_id, items: [{ productId: product.id, quantity: 1 }], shippingAddress: orderRow.shipping_address })
      .expect(502);

    expect(query).not.toHaveBeenCalled();
    expect(response.body).toEqual({ success: false, error: 'Invalid product price' });
  });

  it('returns 400 for unsupported order statuses before updating the database', async () => {
    const { app, query } = createTestApp();

    const response = await request(app)
      .patch(`/${orderRow.id}/status`)
      .send({ status: 'refunded' })
      .expect(400);

    expect(query).not.toHaveBeenCalled();
    expect(response.body).toEqual({ success: false, error: 'Invalid order status' });
  });

  it('returns 404 when no order row is updated during status changes', async () => {
    const { app, query } = createTestApp({ query: vi.fn().mockResolvedValueOnce({ rowCount: 0, rows: [] }) });

    const response = await request(app)
      .patch(`/${orderRow.id}/status`)
      .send({ status: 'shipped' })
      .expect(404);

    expect(query).toHaveBeenCalledTimes(1);
    expect(response.body).toEqual({ success: false, error: 'Order not found' });
  });

  it('returns the minimal Storefront failure envelope for an empty cart checkout attempt', async () => {
    const { app, query, getProduct } = createTestApp();

    const response = await request(app)
      .post('/')
      .send({ userId: orderRow.user_id, items: [], shippingAddress: orderRow.shipping_address })
      .expect(400);

    expect(query).not.toHaveBeenCalled();
    expect(getProduct).not.toHaveBeenCalled();
    expect(response.body).toEqual({ success: false, error: 'Order requires at least one item' });
  });
});
