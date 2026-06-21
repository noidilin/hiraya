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
