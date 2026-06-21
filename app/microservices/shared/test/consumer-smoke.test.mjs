import { describe, expect, it } from 'vitest';

import {
  authSuccessEnvelopeFixture,
  authSuccessEnvelopeSchema,
  authenticatedUserEnvelopeFixture,
  authenticatedUserEnvelopeSchema,
  orderDetailEnvelopeFixture,
  orderDetailEnvelopeSchema,
  orderHistoryEnvelopeFixture,
  orderHistoryEnvelopeSchema,
  productDetailEnvelopeFixture,
  productDetailEnvelopeSchema,
  productListEnvelopeFixture,
  productListEnvelopeSchema,
  storefrontContractFixtures,
  storefrontContractPaths,
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
      [storefrontContractSchemas.orderDetailEnvelope, storefrontContractFixtures.orderDetailEnvelope],
      [productListEnvelopeSchema, productListEnvelopeFixture],
      [productDetailEnvelopeSchema, productDetailEnvelopeFixture],
      [authSuccessEnvelopeSchema, authSuccessEnvelopeFixture],
      [authenticatedUserEnvelopeSchema, authenticatedUserEnvelopeFixture],
      [orderHistoryEnvelopeSchema, orderHistoryEnvelopeFixture],
      [orderDetailEnvelopeSchema, orderDetailEnvelopeFixture],
    ];

    for (const [schema, fixture] of representativeContracts) {
      expect(schema.safeParse(fixture).success).toBe(true);
    }
  });

  it('let browser-test mocks consume representative fixtures without backend implementation modules', () => {
    const mockedApiResponses = new Map([
      [storefrontContractPaths.productList, storefrontContractFixtures.productListEnvelope],
      [storefrontContractPaths.productDetailFixture, storefrontContractFixtures.productDetailEnvelope],
      [storefrontContractPaths.authLogin, storefrontContractFixtures.authSuccessEnvelope],
      [storefrontContractPaths.authMe, storefrontContractFixtures.authenticatedUserEnvelope],
      [storefrontContractPaths.orderHistory, storefrontContractFixtures.orderHistoryEnvelope],
      [storefrontContractPaths.orderDetailFixture, storefrontContractFixtures.orderDetailEnvelope],
    ]);

    const fulfillBodyFor = (path) => JSON.stringify(structuredClone(mockedApiResponses.get(path)));

    const productListBody = fulfillBodyFor(storefrontContractPaths.productList);
    const orderHistoryBody = fulfillBodyFor(storefrontContractPaths.orderHistory);
    const orderDetailBody = fulfillBodyFor(storefrontContractPaths.orderDetailFixture);

    expect(storefrontContractSchemas.productListEnvelope.safeParse(JSON.parse(productListBody)).success).toBe(true);
    expect(storefrontContractSchemas.orderHistoryEnvelope.safeParse(JSON.parse(orderHistoryBody)).success).toBe(true);
    expect(storefrontContractSchemas.orderDetailEnvelope.safeParse(JSON.parse(orderDetailBody)).success).toBe(true);
    expect(JSON.parse(productListBody).data.products[0].image_url.startsWith('/product-images/')).toBe(true);
  });

  it('exports the current Storefront order history path separately from order creation', () => {
    expect(storefrontContractPaths.orderHistory).toBe('/api/orders/my-orders');
    expect(storefrontContractPaths.orderCreate).toBe('/api/orders');
  });
});
