import apiClient from './api';
import { ApiEnvelope, Product } from '../types';

type ProductListData = {
  products: ProductWire[];
};

type ProductWire = {
  id: string;
  name: string;
  description: string;
  price: string | number;
  compare_price?: string | number;
  originalPrice?: string | number;
  image_url?: string;
  imageUrl?: string;
  category?: string;
  category_id?: string;
  brand?: string;
  inventory_quantity?: number;
  inventory?: number;
  rating?: number;
  reviewCount?: number;
  is_featured?: boolean;
  new_arrival?: boolean;
  discountPercentage?: number;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  images?: Product['images'];
};

const unwrapEnvelope = <T>(envelope: ApiEnvelope<T>): T => {
  if (envelope.success) {
    return envelope.data;
  }

  throw new Error(envelope.error);
};

const toNumber = (value: string | number | undefined): number => {
  if (typeof value === 'number') {
    return value;
  }

  const parsed = Number.parseFloat(value ?? '0');
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeProduct = (product: ProductWire): Product => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price: toNumber(product.price),
  originalPrice: product.compare_price !== undefined
    ? toNumber(product.compare_price)
    : product.originalPrice !== undefined
      ? toNumber(product.originalPrice)
      : undefined,
  imageUrl: product.image_url || product.imageUrl || '/product-images/placeholder.jpg',
  category: product.category || product.category_id || '',
  brand: product.brand,
  inventory: product.inventory_quantity ?? product.inventory ?? 0,
  rating: product.rating,
  reviewCount: product.reviewCount,
  isNew: product.is_featured ?? product.new_arrival,
  discountPercentage: product.discountPercentage,
  createdAt: product.created_at || product.createdAt || '',
  updatedAt: product.updated_at || product.updatedAt || '',
  images: product.images || [],
});

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const response = await apiClient.get<ApiEnvelope<ProductListData>>('/products');
    return unwrapEnvelope(response.data).products.map(normalizeProduct);
  },

  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get<ApiEnvelope<ProductWire>>(`/products/${id}`);
    return normalizeProduct(unwrapEnvelope(response.data));
  },

  getByCategory: async (category: string): Promise<Product[]> => {
    const response = await apiClient.get<ApiEnvelope<ProductListData>>(`/products?category=${category}`);
    return unwrapEnvelope(response.data).products.map(normalizeProduct);
  },

  search: async (query: string): Promise<Product[]> => {
    const response = await apiClient.get<ApiEnvelope<ProductListData>>(`/products?search=${query}`);
    return unwrapEnvelope(response.data).products.map(normalizeProduct);
  },
};
