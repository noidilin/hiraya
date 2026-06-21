import apiClient from './api';
import { ApiEnvelope, Order, Product } from '../types';

type OrderHistoryData = {
  orders: OrderWire[];
};

type OrderWire = {
  id: string;
  userId?: string;
  user_id?: string;
  items?: OrderItemWire[];
  totalAmount?: string | number;
  total_amount?: string | number;
  status: Order['status'];
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  shippingAddress?: Order['shippingAddress'];
  shipping_address?: Order['shippingAddress'];
};

type OrderItemWire = {
  id: string;
  productId?: string;
  product_id?: string;
  quantity: number;
  price: string | number;
  product: ProductWire;
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

const emptyAddress = {
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
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

const normalizeOrder = (order: OrderWire): Order => ({
  id: order.id,
  userId: order.userId || order.user_id || '',
  items: (order.items || []).map((item) => ({
    id: item.id,
    productId: item.productId || item.product_id || '',
    quantity: item.quantity,
    price: toNumber(item.price),
    product: normalizeProduct(item.product),
  })),
  totalAmount: toNumber(order.totalAmount ?? order.total_amount),
  status: order.status,
  shippingAddress: order.shippingAddress || order.shipping_address || emptyAddress,
  createdAt: order.createdAt || order.created_at || '',
  updatedAt: order.updatedAt || order.updated_at || '',
});

export const orderService = {
  createOrder: async (orderData: {
    items: { productId: string; quantity: number }[];
    shippingAddress: any;
  }): Promise<Order> => {
    const response = await apiClient.post<ApiEnvelope<OrderWire>>('/orders', orderData);
    return normalizeOrder(unwrapEnvelope(response.data));
  },

  getUserOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get<ApiEnvelope<OrderHistoryData>>('/orders/my-orders');
    return unwrapEnvelope(response.data).orders.map(normalizeOrder);
  },

  getOrderById: async (id: string): Promise<Order> => {
    const response = await apiClient.get<ApiEnvelope<OrderWire>>(`/orders/${id}`);
    return normalizeOrder(unwrapEnvelope(response.data));
  },

  updateOrderStatus: async (id: string, status: string): Promise<Order> => {
    const response = await apiClient.patch<ApiEnvelope<OrderWire>>(`/orders/${id}/status`, { status });
    return normalizeOrder(unwrapEnvelope(response.data));
  },
};
