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

const moneyStringSchema = z.string().regex(/^\d+\.\d{2}$/);
const timestampStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

export const authenticatedUserWireSchema = z
  .object({
    id: z.string().uuid(),
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    role: z.enum(['customer', 'admin']),
    createdAt: timestampStringSchema.optional(),
    updatedAt: timestampStringSchema.optional(),
  })
  .strict();

export const authTokenDataSchema = z
  .object({
    user: authenticatedUserWireSchema,
    token: z.string().min(1),
  })
  .strict();

export const authenticatedUserEnvelopeSchema = createStorefrontSuccessEnvelopeSchema(authenticatedUserWireSchema);
export const authSuccessEnvelopeSchema = createStorefrontSuccessEnvelopeSchema(authTokenDataSchema);
export const authFailureEnvelopeSchema = storefrontFailureEnvelopeSchema;

export const authenticatedUserWireFixture = Object.freeze({
  id: 'f8b01ff1-9114-4c3e-92a7-45a8d1f2d6e6',
  email: 'demo@hirayavintage.test',
  firstName: 'Demo',
  lastName: 'User',
  role: 'customer',
  createdAt: '2026-02-07T13:04:03.836Z',
  updatedAt: '2026-02-07T13:04:03.836Z',
});

export const authSuccessEnvelopeFixture = Object.freeze({
  success: true,
  data: {
    user: authenticatedUserWireFixture,
    token: 'demo-access-token',
  },
  message: 'Login successful',
});

export const authenticatedUserEnvelopeFixture = Object.freeze({
  success: true,
  data: authenticatedUserWireFixture,
});

export const authFailureEnvelopeFixture = Object.freeze({
  success: false,
  error: 'Invalid credentials',
});

export const productWireSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1),
    description: z.string().min(1),
    price: moneyStringSchema,
    compare_price: moneyStringSchema.nullable(),
    brand: z.string().min(1).nullable(),
    inventory_quantity: z.number().int().nonnegative(),
    is_featured: z.boolean(),
    created_at: timestampStringSchema,
    updated_at: timestampStringSchema,
    category: z.string().min(1),
    image_url: z.string().startsWith('/product-images/'),
  })
  .strict();

export const productListDataSchema = z
  .object({
    products: z.array(productWireSchema),
    pagination: z
      .object({
        currentPage: z.number().int().positive(),
        totalPages: z.number().int().nonnegative(),
        total: z.number().int().nonnegative(),
        hasNext: z.boolean(),
        hasPrev: z.boolean(),
      })
      .strict(),
  })
  .strict();

export const productDetailEnvelopeSchema = createStorefrontSuccessEnvelopeSchema(productWireSchema);
export const productListEnvelopeSchema = createStorefrontSuccessEnvelopeSchema(productListDataSchema);

export const productWireFixtureSet = Object.freeze([
  {
    id: '67be2d5e-ecfb-4bf9-b751-8474f9d7bcac',
    name: 'Prairie Midi Dress',
    description: 'Faded cotton midi dress with a gathered waist, lace-trim neckline, and an easy drape for warm days.',
    price: '128.00',
    compare_price: '168.00',
    brand: 'Hiraya Furugi',
    inventory_quantity: 4,
    is_featured: true,
    created_at: '2026-06-23T00:00:00.000Z',
    updated_at: '2026-06-23T00:00:00.000Z',
    category: 'Dresses',
    image_url: '/product-images/prairie-midi-dress.jpg',
  },
  {
    id: 'e858df02-4a5b-4f8e-a1f4-2b6c28150d0b',
    name: 'Washed Linen Work Jacket',
    description: 'Unlined work jacket in softened linen canvas with utility pockets and a clean, boxy fall.',
    price: '154.00',
    compare_price: null,
    brand: 'Hiraya Furugi',
    inventory_quantity: 3,
    is_featured: true,
    created_at: '2026-06-23T00:00:00.000Z',
    updated_at: '2026-06-23T00:00:00.000Z',
    category: 'Outerwear',
    image_url: '/product-images/washed-linen-work-jacket.jpg',
  },
  {
    id: '760f89d0-c80f-4798-8c75-f26070eb35d8',
    name: 'Indigo Straight Denim',
    description: 'Straight-leg denim with softened fading, sturdy seams, and a worn-in hand without heavy distressing.',
    price: '116.00',
    compare_price: null,
    brand: 'Hiraya Furugi',
    inventory_quantity: 6,
    is_featured: false,
    created_at: '2026-06-23T00:00:00.000Z',
    updated_at: '2026-06-23T00:00:00.000Z',
    category: 'Denim',
    image_url: '/product-images/indigo-straight-denim.jpg',
  },
  {
    id: '99026f04-ced9-42a5-b9e3-9440c4e38902',
    name: 'Cotton Lace Night Blouse',
    description: 'Ivory cotton blouse with fine lace panels, shell buttons, and a relaxed shape for layered dressing.',
    price: '92.00',
    compare_price: '118.00',
    brand: 'Hiraya Furugi',
    inventory_quantity: 5,
    is_featured: true,
    created_at: '2026-06-23T00:00:00.000Z',
    updated_at: '2026-06-23T00:00:00.000Z',
    category: 'Tops',
    image_url: '/product-images/cotton-lace-night-blouse.jpg',
  },
  {
    id: 'd68c49dd-ccfb-4965-8b70-c98d32f77d71',
    name: 'Sumi Silk Scarf',
    description: 'Light silk scarf in a charcoal wash, finished with narrow hems and a subtle natural sheen.',
    price: '64.00',
    compare_price: null,
    brand: 'Hiraya Furugi',
    inventory_quantity: 8,
    is_featured: false,
    created_at: '2026-06-23T00:00:00.000Z',
    updated_at: '2026-06-23T00:00:00.000Z',
    category: 'Accessories',
    image_url: '/product-images/sumi-silk-scarf.jpg',
  },
  {
    id: 'b87e70bb-13e1-4200-87ab-d1c7698e43c6',
    name: 'Wool Twill Evening Coat',
    description: 'Long black wool coat with a narrow lapel, satin-like lining, and a quiet formal line.',
    price: '248.00',
    compare_price: null,
    brand: 'Hiraya Furugi',
    inventory_quantity: 2,
    is_featured: true,
    created_at: '2026-06-23T00:00:00.000Z',
    updated_at: '2026-06-23T00:00:00.000Z',
    category: 'Outerwear',
    image_url: '/product-images/wool-twill-evening-coat.jpg',
  },
  {
    id: '4db3c0fe-b753-42d2-a102-e26c5a9f71f5',
    name: 'Patchwork Market Tote',
    description: 'Daily tote assembled from mixed cotton remnants with reinforced handles and a soft, slouching body.',
    price: '78.00',
    compare_price: null,
    brand: 'Hiraya Furugi',
    inventory_quantity: 7,
    is_featured: false,
    created_at: '2026-06-23T00:00:00.000Z',
    updated_at: '2026-06-23T00:00:00.000Z',
    category: 'Accessories',
    image_url: '/product-images/patchwork-market-tote.jpg',
  },
  {
    id: 'f7b0b8b5-7e1d-4562-9cd4-10ac3f12fe35',
    name: 'Linen Tab Collar Shirt',
    description: 'Bone linen shirt with a small tab collar, generous cuffs, and a dry hand that softens with wear.',
    price: '104.00',
    compare_price: null,
    brand: 'Hiraya Furugi',
    inventory_quantity: 5,
    is_featured: false,
    created_at: '2026-06-23T00:00:00.000Z',
    updated_at: '2026-06-23T00:00:00.000Z',
    category: 'Tops',
    image_url: '/product-images/linen-tab-collar-shirt.jpg',
  }
]);

export const productListEnvelopeFixture = Object.freeze({
  success: true,
  data: {
    products: productWireFixtureSet,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      total: productWireFixtureSet.length,
      hasNext: false,
      hasPrev: false,
    },
  },
});

export const productDetailEnvelopeFixture = Object.freeze({
  success: true,
  data: productWireFixtureSet[0],
});

export const orderLineItemWireSchema = z
  .object({
    id: z.string().uuid(),
    orderId: z.string().uuid(),
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    price: moneyStringSchema,
    product: productWireSchema,
  })
  .strict();

export const orderWireSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
    totalAmount: moneyStringSchema,
    paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']),
    createdAt: timestampStringSchema,
    updatedAt: timestampStringSchema,
    items: z.array(orderLineItemWireSchema).min(1),
  })
  .strict();

export const orderHistoryDataSchema = z
  .object({
    orders: z.array(orderWireSchema),
  })
  .strict();

export const orderHistoryEnvelopeSchema = createStorefrontSuccessEnvelopeSchema(orderHistoryDataSchema);
export const orderDetailEnvelopeSchema = createStorefrontSuccessEnvelopeSchema(orderWireSchema);

export const orderWireFixtureSet = Object.freeze([
  {
    id: '8d46347c-43db-4f01-b6c7-d5d3288f0ecb',
    userId: authenticatedUserWireFixture.id,
    status: 'delivered',
    totalAmount: '410.00',
    paymentStatus: 'paid',
    createdAt: '2026-02-14T10:22:31.000Z',
    updatedAt: '2026-02-16T15:12:04.000Z',
    items: [
      {
        id: 'b9460644-95f4-47ac-853d-9579ac793f0b',
        orderId: '8d46347c-43db-4f01-b6c7-d5d3288f0ecb',
        productId: productWireFixtureSet[0].id,
        quantity: 2,
        price: productWireFixtureSet[0].price,
        product: productWireFixtureSet[0],
      },
      {
        id: '3fa1ac0a-4d34-4e0c-8a5d-7f83f3633c8d',
        orderId: '8d46347c-43db-4f01-b6c7-d5d3288f0ecb',
        productId: productWireFixtureSet[1].id,
        quantity: 1,
        price: productWireFixtureSet[1].price,
        product: productWireFixtureSet[1],
      },
    ],
  },
]);

export const orderHistoryEnvelopeFixture = Object.freeze({
  success: true,
  data: {
    orders: orderWireFixtureSet,
  },
});

export const orderDetailEnvelopeFixture = Object.freeze({
  success: true,
  data: orderWireFixtureSet[0],
});

export const storefrontContractPaths = Object.freeze({
  productList: '/api/products',
  productDetailFixture: `/api/products/${productDetailEnvelopeFixture.data.id}`,
  authLogin: '/api/auth/login',
  authMe: '/api/auth/me',
  orderCreate: '/api/orders',
  orderHistory: '/api/orders/my-orders',
  orderDetailFixture: `/api/orders/${orderDetailEnvelopeFixture.data.id}`,
});

export const storefrontContractSchemas = Object.freeze({
  storefrontSuccessEnvelope: storefrontSuccessEnvelopeSchema,
  storefrontFailureEnvelope: storefrontFailureEnvelopeSchema,
  storefrontEnvelope: storefrontEnvelopeSchema,
  authenticatedUserWire: authenticatedUserWireSchema,
  authTokenData: authTokenDataSchema,
  authenticatedUserEnvelope: authenticatedUserEnvelopeSchema,
  authSuccessEnvelope: authSuccessEnvelopeSchema,
  authFailureEnvelope: authFailureEnvelopeSchema,
  productWire: productWireSchema,
  productListData: productListDataSchema,
  productDetailEnvelope: productDetailEnvelopeSchema,
  productListEnvelope: productListEnvelopeSchema,
  orderLineItemWire: orderLineItemWireSchema,
  orderWire: orderWireSchema,
  orderHistoryData: orderHistoryDataSchema,
  orderHistoryEnvelope: orderHistoryEnvelopeSchema,
  orderDetailEnvelope: orderDetailEnvelopeSchema,
});

export const storefrontContractFixtures = Object.freeze({
  authenticatedUserWire: authenticatedUserWireFixture,
  authSuccessEnvelope: authSuccessEnvelopeFixture,
  authenticatedUserEnvelope: authenticatedUserEnvelopeFixture,
  authFailureEnvelope: authFailureEnvelopeFixture,
  productWireSet: productWireFixtureSet,
  productListEnvelope: productListEnvelopeFixture,
  productDetailEnvelope: productDetailEnvelopeFixture,
  orderWireSet: orderWireFixtureSet,
  orderHistoryEnvelope: orderHistoryEnvelopeFixture,
  orderDetailEnvelope: orderDetailEnvelopeFixture,
});
