import { z } from 'zod';

export type StorefrontSuccessEnvelope<T = unknown> = {
  success: true;
  data: T;
  message?: string;
};

export type StorefrontFailureEnvelope = {
  success: false;
  error: string;
};

export type StorefrontEnvelope<T = unknown> = StorefrontSuccessEnvelope<T> | StorefrontFailureEnvelope;

export declare const storefrontSuccessEnvelopeSchema: z.ZodType<StorefrontSuccessEnvelope>;
export declare const storefrontFailureEnvelopeSchema: z.ZodType<StorefrontFailureEnvelope>;
export declare const storefrontEnvelopeSchema: z.ZodType<StorefrontEnvelope>;

export declare function createStorefrontSuccessEnvelopeSchema<T extends z.ZodType>(
  dataSchema: T,
): z.ZodType<StorefrontSuccessEnvelope<z.infer<T>>>;

export declare function createStorefrontEnvelopeSchema<T extends z.ZodType>(
  dataSchema: T,
): z.ZodType<StorefrontEnvelope<z.infer<T>>>;

export type AuthenticatedUserWire = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin';
  createdAt?: string;
  updatedAt?: string;
};

export type AuthTokenData = {
  user: AuthenticatedUserWire;
  token: string;
};

export declare const authenticatedUserWireSchema: z.ZodType<AuthenticatedUserWire>;
export declare const authTokenDataSchema: z.ZodType<AuthTokenData>;
export declare const authenticatedUserEnvelopeSchema: z.ZodType<StorefrontSuccessEnvelope<AuthenticatedUserWire>>;
export declare const authSuccessEnvelopeSchema: z.ZodType<StorefrontSuccessEnvelope<AuthTokenData>>;
export declare const authFailureEnvelopeSchema: z.ZodType<StorefrontFailureEnvelope>;
export declare const authenticatedUserWireFixture: Readonly<AuthenticatedUserWire>;
export declare const authSuccessEnvelopeFixture: Readonly<StorefrontSuccessEnvelope<AuthTokenData>>;
export declare const authenticatedUserEnvelopeFixture: Readonly<StorefrontSuccessEnvelope<AuthenticatedUserWire>>;
export declare const authFailureEnvelopeFixture: Readonly<StorefrontFailureEnvelope>;

export type ProductWire = {
  id: string;
  name: string;
  description: string;
  price: string;
  compare_price: string | null;
  brand: string | null;
  inventory_quantity: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  category: string;
  image_url: string;
};

export type ProductListData = {
  products: ProductWire[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export declare const productWireSchema: z.ZodType<ProductWire>;
export declare const productListDataSchema: z.ZodType<ProductListData>;
export declare const productDetailEnvelopeSchema: z.ZodType<StorefrontSuccessEnvelope<ProductWire>>;
export declare const productListEnvelopeSchema: z.ZodType<StorefrontSuccessEnvelope<ProductListData>>;
export declare const productWireFixtureSet: readonly ProductWire[];
export declare const productListEnvelopeFixture: Readonly<StorefrontSuccessEnvelope<ProductListData>>;
export declare const productDetailEnvelopeFixture: Readonly<StorefrontSuccessEnvelope<ProductWire>>;

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type OrderLineItemWire = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: string;
  product: ProductWire;
};

export type OrderWire = {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: string;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  items: OrderLineItemWire[];
};

export type OrderHistoryData = {
  orders: OrderWire[];
};

export declare const orderLineItemWireSchema: z.ZodType<OrderLineItemWire>;
export declare const orderWireSchema: z.ZodType<OrderWire>;
export declare const orderHistoryDataSchema: z.ZodType<OrderHistoryData>;
export declare const orderHistoryEnvelopeSchema: z.ZodType<StorefrontSuccessEnvelope<OrderHistoryData>>;
export declare const orderDetailEnvelopeSchema: z.ZodType<StorefrontSuccessEnvelope<OrderWire>>;
export declare const orderWireFixtureSet: readonly OrderWire[];
export declare const orderHistoryEnvelopeFixture: Readonly<StorefrontSuccessEnvelope<OrderHistoryData>>;
export declare const orderDetailEnvelopeFixture: Readonly<StorefrontSuccessEnvelope<OrderWire>>;

export declare const storefrontContractPaths: Readonly<{
  productList: '/api/products';
  productDetailFixture: string;
  authLogin: '/api/auth/login';
  authMe: '/api/auth/me';
  orderCreate: '/api/orders';
  orderHistory: '/api/orders/my-orders';
  orderDetailFixture: string;
}>;

export declare const storefrontContractSchemas: Readonly<{
  storefrontSuccessEnvelope: z.ZodType<StorefrontSuccessEnvelope>;
  storefrontFailureEnvelope: z.ZodType<StorefrontFailureEnvelope>;
  storefrontEnvelope: z.ZodType<StorefrontEnvelope>;
  authenticatedUserWire: z.ZodType<AuthenticatedUserWire>;
  authTokenData: z.ZodType<AuthTokenData>;
  authenticatedUserEnvelope: z.ZodType<StorefrontSuccessEnvelope<AuthenticatedUserWire>>;
  authSuccessEnvelope: z.ZodType<StorefrontSuccessEnvelope<AuthTokenData>>;
  authFailureEnvelope: z.ZodType<StorefrontFailureEnvelope>;
  productWire: z.ZodType<ProductWire>;
  productListData: z.ZodType<ProductListData>;
  productDetailEnvelope: z.ZodType<StorefrontSuccessEnvelope<ProductWire>>;
  productListEnvelope: z.ZodType<StorefrontSuccessEnvelope<ProductListData>>;
  orderLineItemWire: z.ZodType<OrderLineItemWire>;
  orderWire: z.ZodType<OrderWire>;
  orderHistoryData: z.ZodType<OrderHistoryData>;
  orderHistoryEnvelope: z.ZodType<StorefrontSuccessEnvelope<OrderHistoryData>>;
  orderDetailEnvelope: z.ZodType<StorefrontSuccessEnvelope<OrderWire>>;
}>;

export declare const storefrontContractFixtures: Readonly<{
  authenticatedUserWire: Readonly<AuthenticatedUserWire>;
  authSuccessEnvelope: Readonly<StorefrontSuccessEnvelope<AuthTokenData>>;
  authenticatedUserEnvelope: Readonly<StorefrontSuccessEnvelope<AuthenticatedUserWire>>;
  authFailureEnvelope: Readonly<StorefrontFailureEnvelope>;
  productWireSet: readonly ProductWire[];
  productListEnvelope: Readonly<StorefrontSuccessEnvelope<ProductListData>>;
  productDetailEnvelope: Readonly<StorefrontSuccessEnvelope<ProductWire>>;
  orderWireSet: readonly OrderWire[];
  orderHistoryEnvelope: Readonly<StorefrontSuccessEnvelope<OrderHistoryData>>;
  orderDetailEnvelope: Readonly<StorefrontSuccessEnvelope<OrderWire>>;
}>;
