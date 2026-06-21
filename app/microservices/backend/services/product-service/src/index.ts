import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import path from 'path';
import { createProductRoutes, ProductRouteDependencies } from './routes/products';
import { connectDB } from './database/connection';
import { metricsMiddleware, setupMetrics } from './metrics';

dotenv.config({ path: './.env' });

export interface ProductAppOptions extends ProductRouteDependencies {}

export function createApp(options: ProductAppOptions = {}): express.Express {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  setupMetrics(app, { serviceName: 'product-service', serviceVersion: '1.0.0' });

  app.use(metricsMiddleware);

  // Serve static images from public directory
  app.use('/images', express.static(path.join(__dirname, '../../../public')));

  app.use('', createProductRoutes(options));

  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Internal server error' });
  });

  return app;
}

export async function startServer() {
  const PORT = process.env.PORT || 3003;

  try {
    await connectDB();
    const app = createApp();
    app.listen(PORT, () => {
      console.log(`Product service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start product service:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}
