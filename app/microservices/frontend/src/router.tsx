import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
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
import { ProfileRoute } from '@/routes/profile';
import { useAuthStore } from '@/stores/auth-store';

const rootRoute = createRootRoute({
  component: AppShell,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomeRoute,
});

async function requireAuth(location: { href: string }) {
  const user = await useAuthStore.getState().bootstrap();

  if (!user) {
    throw redirect({
      to: '/login',
      search: { redirect: location.href },
    });
  }
}

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  beforeLoad: ({ location }) => {
    throw redirect({
      to: '/login',
      search: location.search,
    });
  },
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: () => <AuthRoute initialMode="login" />,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: () => <AuthRoute initialMode="signup" />,
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

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  beforeLoad: async ({ location }) => requireAuth(location),
  component: ProfileRoute,
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders',
  beforeLoad: async ({ location }) => requireAuth(location),
  component: OrdersRoute,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  authRoute,
  loginRoute,
  registerRoute,
  profileRoute,
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
