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
