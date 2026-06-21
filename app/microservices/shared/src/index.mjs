import { z } from 'zod';

export const storefrontSuccessEnvelopeSchema = z
  .object({
    success: z.literal(true),
    data: z.unknown(),
    message: z.string().optional(),
  })
  .strict();

export const storefrontFailureEnvelopeSchema = z
  .object({
    success: z.literal(false),
    error: z.string(),
  })
  .strict();

export const storefrontEnvelopeSchema = z.discriminatedUnion('success', [
  storefrontSuccessEnvelopeSchema,
  storefrontFailureEnvelopeSchema,
]);

export function createStorefrontSuccessEnvelopeSchema(dataSchema) {
  return z
    .object({
      success: z.literal(true),
      data: dataSchema,
      message: z.string().optional(),
    })
    .strict();
}

export function createStorefrontEnvelopeSchema(dataSchema) {
  return z.discriminatedUnion('success', [
    createStorefrontSuccessEnvelopeSchema(dataSchema),
    storefrontFailureEnvelopeSchema,
  ]);
}
