import { describe, expect, it } from 'vitest';

import {
  authFailureEnvelopeFixture,
  authFailureEnvelopeSchema,
  authSuccessEnvelopeFixture,
  authSuccessEnvelopeSchema,
  authTokenDataSchema,
  authenticatedUserEnvelopeFixture,
  authenticatedUserEnvelopeSchema,
  authenticatedUserWireFixture,
  authenticatedUserWireSchema,
} from '../src/index.mjs';

describe('Vintage Storefront auth and user wire contracts', () => {
  it('validate representative auth and authenticated-user success envelopes', () => {
    expect(authSuccessEnvelopeSchema.safeParse(authSuccessEnvelopeFixture).success).toBe(true);
    expect(authenticatedUserEnvelopeSchema.safeParse(authenticatedUserEnvelopeFixture).success).toBe(true);
  });

  it('validate authenticated user identity and token data through shared schemas', () => {
    expect(authenticatedUserWireSchema.safeParse(authenticatedUserWireFixture).success).toBe(true);
    expect(authTokenDataSchema.safeParse(authSuccessEnvelopeFixture.data).success).toBe(true);
  });

  it('validate a representative auth failure envelope', () => {
    expect(authFailureEnvelopeSchema.safeParse(authFailureEnvelopeFixture).success).toBe(true);
  });

  it('reject malformed auth and authenticated-user payloads', () => {
    const invalidUsers = [
      { ...authenticatedUserWireFixture, email: 'not-an-email' },
      { ...authenticatedUserWireFixture, first_name: authenticatedUserWireFixture.firstName, firstName: undefined },
      { ...authenticatedUserWireFixture, role: 'operator' },
    ];
    const invalidAuthResponses = [
      { ...authSuccessEnvelopeFixture, success: false },
      { success: true, data: { user: authenticatedUserWireFixture } },
      { success: true, data: { user: authenticatedUserWireFixture, token: '' } },
      { success: true, data: { user: { ...authenticatedUserWireFixture, id: 'not-a-uuid' }, token: 'demo-access-token' } },
      { success: false, data: authSuccessEnvelopeFixture.data, error: 'Use only failure shape' },
    ];

    for (const user of invalidUsers) {
      expect(authenticatedUserWireSchema.safeParse(user).success, 'invalid authenticated user should fail').toBe(false);
    }

    for (const response of invalidAuthResponses) {
      expect(authSuccessEnvelopeSchema.safeParse(response).success, 'invalid auth response should fail').toBe(false);
    }
  });
});
