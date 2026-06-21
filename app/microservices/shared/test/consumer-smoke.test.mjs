import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  authSuccessEnvelopeFixture,
  authSuccessEnvelopeSchema,
  authenticatedUserEnvelopeFixture,
  authenticatedUserEnvelopeSchema,
  orderHistoryEnvelopeFixture,
  orderHistoryEnvelopeSchema,
  productDetailEnvelopeFixture,
  productDetailEnvelopeSchema,
  productListEnvelopeFixture,
  productListEnvelopeSchema,
  storefrontContractFixtures,
  storefrontContractSchemas,
} from '@hiraya/storefront-contracts';

describe('Storefront contract public consumer imports', () => {
  it('let Vitest-style contract tests validate representative fixtures through package exports', () => {
    const representativeContracts = [
      [storefrontContractSchemas.productListEnvelope, storefrontContractFixtures.productListEnvelope],
      [storefrontContractSchemas.productDetailEnvelope, storefrontContractFixtures.productDetailEnvelope],
      [storefrontContractSchemas.authSuccessEnvelope, storefrontContractFixtures.authSuccessEnvelope],
      [storefrontContractSchemas.authenticatedUserEnvelope, storefrontContractFixtures.authenticatedUserEnvelope],
      [storefrontContractSchemas.orderHistoryEnvelope, storefrontContractFixtures.orderHistoryEnvelope],
      [productListEnvelopeSchema, productListEnvelopeFixture],
      [productDetailEnvelopeSchema, productDetailEnvelopeFixture],
      [authSuccessEnvelopeSchema, authSuccessEnvelopeFixture],
      [authenticatedUserEnvelopeSchema, authenticatedUserEnvelopeFixture],
      [orderHistoryEnvelopeSchema, orderHistoryEnvelopeFixture],
    ];

    for (const [schema, fixture] of representativeContracts) {
      assert.equal(schema.safeParse(fixture).success, true);
    }
  });

  it('let browser-test mocks consume representative fixtures without backend implementation modules', () => {
    const mockedApiResponses = new Map([
      ['/api/products', storefrontContractFixtures.productListEnvelope],
      ['/api/products/67be2d5e-ecfb-4bf9-b751-8474f9d7bcac', storefrontContractFixtures.productDetailEnvelope],
      ['/api/auth/login', storefrontContractFixtures.authSuccessEnvelope],
      ['/api/auth/me', storefrontContractFixtures.authenticatedUserEnvelope],
      ['/api/orders', storefrontContractFixtures.orderHistoryEnvelope],
    ]);

    const fulfillBodyFor = (path) => JSON.stringify(structuredClone(mockedApiResponses.get(path)));

    const productListBody = fulfillBodyFor('/api/products');
    const orderHistoryBody = fulfillBodyFor('/api/orders');

    assert.equal(storefrontContractSchemas.productListEnvelope.safeParse(JSON.parse(productListBody)).success, true);
    assert.equal(storefrontContractSchemas.orderHistoryEnvelope.safeParse(JSON.parse(orderHistoryBody)).success, true);
    assert.equal(JSON.parse(productListBody).data.products[0].image_url.startsWith('/product-images/'), true);
  });
});
