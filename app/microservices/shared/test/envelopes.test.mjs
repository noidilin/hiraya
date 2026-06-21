import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
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

    assert.equal(bareResult.success, true);
    assert.equal(messageResult.success, true);
  });

  it('accept a failed Storefront envelope with an error string', () => {
    const result = storefrontFailureEnvelopeSchema.safeParse({
      success: false,
      error: 'Product not found',
    });

    assert.equal(result.success, true);
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

      assert.equal(successResult.success, false, `${JSON.stringify(envelope)} should not be a valid success envelope`);
      assert.equal(failureResult.success, false, `${JSON.stringify(envelope)} should not be a valid failure envelope`);
    }
  });

  it('can validate Storefront success envelope data with a supplied runtime schema', () => {
    const successSchema = createStorefrontSuccessEnvelopeSchema(productSchema);
    const envelopeSchema = createStorefrontEnvelopeSchema(productSchema);

    assert.equal(successSchema.safeParse({ success: true, data: { id: 'prairie-midi-dress' } }).success, true);
    assert.equal(successSchema.safeParse({ success: true, data: { sku: 'missing-id' } }).success, false);
    assert.equal(envelopeSchema.safeParse({ success: false, error: 'Unavailable' }).success, true);
  });
});
