import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import {
  createStorefrontEnvelopeSchema,
  createStorefrontSuccessEnvelopeSchema,
  storefrontFailureEnvelopeSchema,
  storefrontSuccessEnvelopeSchema,
} from '../src/index.mjs';

const productSchema = z.object({ id: z.string() }).passthrough();

describe('Storefront API envelope schemas', () => {
  it('accept a successful Storefront envelope with data and optional message', () => {
    const bareResult = storefrontSuccessEnvelopeSchema.safeParse({
      success: true,
      data: [{ id: 'prairie-midi-dress' }],
    });
    const messageResult = storefrontSuccessEnvelopeSchema.safeParse({
      success: true,
      data: { id: 'prairie-midi-dress' },
      message: 'Product loaded',
    });

    expect(bareResult.success).toBe(true);
    expect(messageResult.success).toBe(true);
  });

  it('accept a failed Storefront envelope with an error string', () => {
    const result = storefrontFailureEnvelopeSchema.safeParse({
      success: false,
      error: 'Product not found',
    });

    expect(result.success).toBe(true);
  });

  it('reject representative malformed Storefront envelopes', () => {
    const invalidEnvelopes = [
      { success: true },
      { success: true, data: {}, message: 404 },
      { success: false },
      { success: false, data: {}, error: 'Use only failure shape' },
      { data: {} },
    ];

    for (const envelope of invalidEnvelopes) {
      const successResult = storefrontSuccessEnvelopeSchema.safeParse(envelope);
      const failureResult = storefrontFailureEnvelopeSchema.safeParse(envelope);

      expect(successResult.success, `${JSON.stringify(envelope)} should not be a valid success envelope`).toBe(false);
      expect(failureResult.success, `${JSON.stringify(envelope)} should not be a valid failure envelope`).toBe(false);
    }
  });

  it('can validate Storefront success envelope data with a supplied runtime schema', () => {
    const successSchema = createStorefrontSuccessEnvelopeSchema(productSchema);
    const envelopeSchema = createStorefrontEnvelopeSchema(productSchema);

    expect(successSchema.safeParse({ success: true, data: { id: 'prairie-midi-dress' } }).success).toBe(true);
    expect(successSchema.safeParse({ success: true, data: { sku: 'missing-id' } }).success).toBe(false);
    expect(envelopeSchema.safeParse({ success: false, error: 'Unavailable' }).success).toBe(true);
  });
});
