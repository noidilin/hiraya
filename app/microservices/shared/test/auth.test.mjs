import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

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
    assert.equal(authSuccessEnvelopeSchema.safeParse(authSuccessEnvelopeFixture).success, true);
    assert.equal(authenticatedUserEnvelopeSchema.safeParse(authenticatedUserEnvelopeFixture).success, true);
  });

  it('validate authenticated user identity and token data through shared schemas', () => {
    assert.equal(authenticatedUserWireSchema.safeParse(authenticatedUserWireFixture).success, true);
    assert.equal(authTokenDataSchema.safeParse(authSuccessEnvelopeFixture.data).success, true);
  });

  it('validate a representative auth failure envelope', () => {
    assert.equal(authFailureEnvelopeSchema.safeParse(authFailureEnvelopeFixture).success, true);
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
      assert.equal(authenticatedUserWireSchema.safeParse(user).success, false, 'invalid authenticated user should fail');
    }

    for (const response of invalidAuthResponses) {
      assert.equal(authSuccessEnvelopeSchema.safeParse(response).success, false, 'invalid auth response should fail');
    }
  });
});
