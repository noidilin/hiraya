import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from './api';
import { productService } from './productService';

vi.mock('./api', () => ({
  __esModule: true,
  default: {
    get: vi.fn(),
  },
}));

const mockedApiClient = vi.mocked(apiClient);

const productWire = {
  id: '4ee72b27-86fb-47c1-8212-74fbe0b4a7ae',
  name: '1970s Prairie Midi Dress',
  description: 'Cotton prairie dress with lace trim.',
  price: '128.50',
  compare_price: '160.00',
  image_url: '/product-images/1970s-prairie-midi-dress.jpg',
  category: 'Dresses',
  brand: 'Hiraya Vintage',
  inventory_quantity: 3,
  is_featured: true,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-02T00:00:00.000Z',
};

describe('productService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('unwraps catalog envelopes and normalizes product wire fields for the Storefront UI', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          products: [productWire],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            total: 1,
            hasNext: false,
            hasPrev: false,
          },
        },
      },
    });

    await expect(productService.getAll()).resolves.toEqual([
      expect.objectContaining({
        id: productWire.id,
        name: '1970s Prairie Midi Dress',
        price: 128.5,
        originalPrice: 160,
        imageUrl: '/product-images/1970s-prairie-midi-dress.jpg',
        category: 'Dresses',
        inventory: 3,
        isNew: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      }),
    ]);
    expect(mockedApiClient.get).toHaveBeenCalledWith('/products');
  });

  it('unwraps product detail envelopes and normalizes product wire fields for the Storefront UI', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: productWire,
      },
    });

    await expect(productService.getById(productWire.id)).resolves.toEqual(expect.objectContaining({
      id: productWire.id,
      price: 128.5,
      originalPrice: 160,
      imageUrl: '/product-images/1970s-prairie-midi-dress.jpg',
      inventory: 3,
      isNew: true,
      images: [],
    }));
    expect(mockedApiClient.get).toHaveBeenCalledWith(`/products/${productWire.id}`);
  });

  it('rejects failed product envelopes', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: {
        success: false,
        error: 'Product not found',
      },
    });

    await expect(productService.getById(productWire.id)).rejects.toThrow('Product not found');
  });
});
