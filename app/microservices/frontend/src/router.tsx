import {
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';

import { AppShell } from '@/components/layout/app-shell';
import { AuthRoute } from '@/routes/auth';
import { CartRoute } from '@/routes/cart';
import { HomeRoute } from '@/routes/home';
import { ManifestoRoute } from '@/routes/manifesto';
import { OrderConfirmedRoute } from '@/routes/order-confirmed';
import { OrdersRoute } from '@/routes/orders';
import { ProductDetailRoute } from '@/routes/product-detail';
import { ProductsRoute } from '@/routes/products';

const rootRoute = createRootRoute({
  component: AppShell,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomeRoute,
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  component: AuthRoute,
});

const manifestoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/manifesto',
  component: ManifestoRoute,
});

const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products',
  component: ProductsRoute,
});

const productDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products/$productId',
  component: ProductDetailRoute,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: CartRoute,
});

const orderConfirmedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/order-confirmed',
  component: OrderConfirmedRoute,
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders',
  component: OrdersRoute,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  authRoute,
  manifestoRoute,
  productsRoute,
  productDetailRoute,
  cartRoute,
  orderConfirmedRoute,
  ordersRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
