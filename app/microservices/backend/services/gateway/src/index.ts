import express from 'express';
import type { RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import { metricsMiddleware, setupMetrics } from './metrics';

dotenv.config();

export interface GatewayServices {
  auth: string;
  products: string;
  orders: string;
  users: string;
}

type ProxyFactory = (options: {
  target: string;
  changeOrigin: boolean;
  pathRewrite: Record<string, string>;
}) => RequestHandler;

export interface GatewayAppOptions {
  services?: GatewayServices;
  proxyFactory?: ProxyFactory;
}

export function getServicesFromEnv(): GatewayServices {
  return {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3002',
    products: process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3003',
    orders: process.env.ORDERS_SERVICE_URL || 'http://localhost:3004',
    users: process.env.USERS_SERVICE_URL || 'http://localhost:3005',
  };
}

export function createApp(options: GatewayAppOptions = {}): express.Express {
  const app = express();
  const services = options.services ?? getServicesFromEnv();
  const proxyFactory = options.proxyFactory ?? createProxyMiddleware;

  app.use(helmet());
  app.use(cors());

  setupMetrics(app, { serviceName: 'gateway', serviceVersion: '1.0.0' });

  app.use(metricsMiddleware);

  app.use('/api/auth', proxyFactory({
    target: services.auth,
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '' },
  }));

  app.use('/api/products', proxyFactory({
    target: services.products,
    changeOrigin: true,
    pathRewrite: { '^/api/products': '' },
  }));

  app.use('/api/orders', proxyFactory({
    target: services.orders,
    changeOrigin: true,
    pathRewrite: { '^/api/orders': '' },
  }));

  app.use('/api/users', proxyFactory({
    target: services.users,
    changeOrigin: true,
    pathRewrite: { '^/api/users': '' },
  }));

  app.use((req, res) => {
    res.status(404).json({ error: 'Service not found' });
  });

  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

export function startGateway() {
  const app = createApp();
  const PORT: number = Number(process.env.GATEWAY_PORT) || 3001;
  const services = getServicesFromEnv();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`API Gateway running on port ${PORT}`);
    console.log(`Proxying to services:`, services);
  });
}

if (require.main === module) {
  startGateway();
}
