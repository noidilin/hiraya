import { z } from "zod";

import { parseMoney } from "@/lib/money";

export const PLACEHOLDER_PRODUCT_IMAGE = "/product-images/placeholder.jpg";

const moneyStringSchema = z.string().regex(/^-?\d+(\.\d+)?$/);

export function apiEnvelopeSchema<T extends z.ZodType>(dataSchema: T) {
  return z.discriminatedUnion("success", [
    z.object({
      success: z.literal(true),
      data: dataSchema,
      message: z.string().optional(),
    }),
    z.object({
      success: z.literal(false),
      error: z.string(),
    }),
  ]);
}

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum(["customer", "admin"]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const authRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerRequestSchema = authRequestSchema.extend({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export const authResponseSchema = z.object({
  user: userSchema,
  token: z.string(),
});

export const productWireSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: moneyStringSchema,
  compare_price: moneyStringSchema.nullable(),
  brand: z.string().nullable(),
  inventory_quantity: z.number(),
  is_featured: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  category: z.string(),
  image_url: z.string().nullable().optional(),
});

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  originalPrice: z.number().optional(),
  imageUrl: z.string(),
  category: z.string(),
  brand: z.string().optional(),
  inventory: z.number(),
  isNew: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const paginationSchema = z.object({
  currentPage: z.number(),
  totalPages: z.number(),
  total: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

export const productListWireSchema = z.object({
  products: z.array(productWireSchema),
  pagination: paginationSchema,
});

export const productListSchema = z.object({
  products: z.array(productSchema),
  pagination: paginationSchema,
});

export const categoryWireSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  image_url: z.string().nullable(),
  product_count: z.string(),
});

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  productCount: z.number(),
});

export const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  country: z.string(),
});

export const createOrderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});

export const createOrderRequestSchema = z.object({
  userId: z.string().optional(),
  items: z.array(createOrderItemSchema).min(1),
  shippingAddress: addressSchema.optional(),
});

export const orderStatusSchema = z.enum([
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

export const paymentStatusSchema = z.enum(["pending", "paid", "failed", "refunded"]);

export const orderLineItemWireSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  productId: z.string(),
  quantity: z.number(),
  price: moneyStringSchema,
  product: productWireSchema,
});

export const orderWireSchema = z.object({
  id: z.string(),
  userId: z.string(),
  items: z.array(orderLineItemWireSchema),
  totalAmount: moneyStringSchema,
  status: orderStatusSchema,
  paymentStatus: paymentStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const orderLineItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  productId: z.string(),
  quantity: z.number(),
  price: z.number(),
  product: productSchema,
});

export const orderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  items: z.array(orderLineItemSchema),
  totalAmount: z.number(),
  status: orderStatusSchema,
  paymentStatus: paymentStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export function normalizeProduct(product: ProductWire): Product {
  const imageUrl = product.image_url?.trim() || PLACEHOLDER_PRODUCT_IMAGE;
  const originalPrice = product.compare_price ? parseMoney(product.compare_price) : undefined;

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: parseMoney(product.price),
    ...(originalPrice === undefined ? {} : { originalPrice }),
    imageUrl,
    category: product.category,
    ...(product.brand ? { brand: product.brand } : {}),
    inventory: product.inventory_quantity,
    isNew: product.is_featured,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  };
}

export function normalizeProductList(productList: ProductListWire): ProductList {
  return {
    products: productList.products.map(normalizeProduct),
    pagination: productList.pagination,
  };
}

export function normalizeCategory(category: CategoryWire): Category {
  return {
    id: category.id,
    name: category.name,
    ...(category.description ? { description: category.description } : {}),
    ...(category.image_url ? { imageUrl: category.image_url } : {}),
    productCount: Number.parseInt(category.product_count, 10) || 0,
  };
}

export function normalizeOrder(order: OrderWire): Order {
  return {
    id: order.id,
    userId: order.userId,
    items: order.items.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      quantity: item.quantity,
      price: parseMoney(item.price),
      product: normalizeProduct(item.product),
    })),
    totalAmount: parseMoney(order.totalAmount),
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

export type User = z.infer<typeof userSchema>;
export type AuthRequest = z.infer<typeof authRequestSchema>;
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type ProductWire = z.infer<typeof productWireSchema>;
export type Product = z.infer<typeof productSchema>;
export type ProductListWire = z.infer<typeof productListWireSchema>;
export type ProductList = z.infer<typeof productListSchema>;
export type CategoryWire = z.infer<typeof categoryWireSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Address = z.infer<typeof addressSchema>;
export type CreateOrderItem = z.infer<typeof createOrderItemSchema>;
export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type OrderLineItemWire = z.infer<typeof orderLineItemWireSchema>;
export type OrderWire = z.infer<typeof orderWireSchema>;
export type OrderLineItem = z.infer<typeof orderLineItemSchema>;
export type Order = z.infer<typeof orderSchema>;
