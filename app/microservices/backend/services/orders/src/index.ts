import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import { createOrderRoutes, OrderRouteDependencies } from './routes/orders';
import { connectDB } from './database/connection';
import { metricsMiddleware, setupMetrics } from './metrics';

dotenv.config({ path: './.env' });

export interface OrdersAppOptions extends OrderRouteDependencies {}

export function createApp(options: OrdersAppOptions = {}): express.Express {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  setupMetrics(app, { serviceName: 'orders', serviceVersion: '1.0.0' });

  app.use(metricsMiddleware);

  app.use('', createOrderRoutes(options));

  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Internal server error' });
  });

  return app;
}

export async function startServer() {
  const PORT = process.env.PORT || 3005;

  try {
    await connectDB();
    const app = createApp();
    app.listen(PORT, () => {
      console.log(`Orders service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start orders service:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}
