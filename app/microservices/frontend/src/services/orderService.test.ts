import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from './api';
import { orderService } from './orderService';

vi.mock('./api', () => ({
  __esModule: true,
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockedApiClient = vi.mocked(apiClient);

const orderHistoryEnvelope = {
  success: true,
  data: {
    orders: [
      {
        id: '8d46347c-43db-4f01-b6c7-d5d3288f0ecb',
        userId: 'f8b01ff1-9114-4c3e-92a7-45a8d1f2d6e6',
        status: 'delivered',
        totalAmount: '402.00',
        paymentStatus: 'paid',
        createdAt: '2026-02-14T10:22:31.000Z',
        updatedAt: '2026-02-16T15:12:04.000Z',
        items: [
          {
            id: 'b9460644-95f4-47ac-853d-9579ac793f0b',
            orderId: '8d46347c-43db-4f01-b6c7-d5d3288f0ecb',
            productId: '4ee72b27-86fb-47c1-8212-74fbe0b4a7ae',
            quantity: 2,
            price: '201.00',
            product: {
              id: '4ee72b27-86fb-47c1-8212-74fbe0b4a7ae',
              name: 'Vintage Wool Coat',
              description: 'A warm wool coat from the 1970s.',
              price: '201.00',
              image_url: '/product-images/vintage-wool-coat.jpg',
              category: 'Outerwear',
              inventory_quantity: 4,
              created_at: '2026-01-01T00:00:00.000Z',
              updated_at: '2026-01-02T00:00:00.000Z',
            },
          },
        ],
      },
    ],
  },
};

describe('orderService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('unwraps order-history envelopes and normalizes wire data for the Storefront UI', async () => {
    mockedApiClient.get.mockResolvedValueOnce({ data: orderHistoryEnvelope });

    await expect(orderService.getUserOrders()).resolves.toEqual([
      expect.objectContaining({
        id: '8d46347c-43db-4f01-b6c7-d5d3288f0ecb',
        totalAmount: 402,
        createdAt: '2026-02-14T10:22:31.000Z',
        updatedAt: '2026-02-16T15:12:04.000Z',
        items: [
          expect.objectContaining({
            id: 'b9460644-95f4-47ac-853d-9579ac793f0b',
            price: 201,
            product: expect.objectContaining({
              name: 'Vintage Wool Coat',
              imageUrl: '/product-images/vintage-wool-coat.jpg',
              inventory: 4,
              createdAt: '2026-01-01T00:00:00.000Z',
            }),
          }),
        ],
      }),
    ]);
  });

  it('normalizes snake_case order history wire data', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          orders: [
            {
              id: '0cbd6cb8-d59a-47bc-9717-e564f591c94e',
              user_id: 'f8b01ff1-9114-4c3e-92a7-45a8d1f2d6e6',
              status: 'processing',
              total_amount: '75.25',
              shipping_address: {
                street: '12 Vintage Lane',
                city: 'Manila',
              },
              created_at: '2026-03-01T08:00:00.000Z',
              updated_at: '2026-03-02T09:30:00.000Z',
              items: [
                {
                  id: '9a39d7a0-7ec1-4e93-af3a-ddf3819d9e01',
                  product_id: '4ee72b27-86fb-47c1-8212-74fbe0b4a7ae',
                  quantity: 1,
                  price: '75.25',
                  product: {
                    id: '4ee72b27-86fb-47c1-8212-74fbe0b4a7ae',
                    name: 'Silk Scarf',
                    description: 'Printed silk scarf.',
                    price: '75.25',
                    image_url: '/product-images/silk-scarf.jpg',
                    category_id: 'Accessories',
                    inventory_quantity: 7,
                    is_featured: false,
                    new_arrival: true,
                    created_at: '2026-02-01T00:00:00.000Z',
                    updated_at: '2026-02-02T00:00:00.000Z',
                  },
                },
              ],
            },
          ],
        },
      },
    });

    await expect(orderService.getUserOrders()).resolves.toEqual([
      expect.objectContaining({
        userId: 'f8b01ff1-9114-4c3e-92a7-45a8d1f2d6e6',
        totalAmount: 75.25,
        createdAt: '2026-03-01T08:00:00.000Z',
        updatedAt: '2026-03-02T09:30:00.000Z',
        shippingAddress: {
          street: '12 Vintage Lane',
          city: 'Manila',
          state: '',
          zipCode: '',
          country: '',
        },
        items: [
          expect.objectContaining({
            productId: '4ee72b27-86fb-47c1-8212-74fbe0b4a7ae',
            product: expect.objectContaining({
              category: 'Accessories',
              imageUrl: '/product-images/silk-scarf.jpg',
              inventory: 7,
              isNew: true,
            }),
          }),
        ],
      }),
    ]);
  });
});
