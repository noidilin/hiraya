import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import { createAuthRoutes, AuthRouteDependencies } from './routes/auth';
import { connectDB } from './database/connection';
import { metricsMiddleware, setupMetrics } from './metrics';

dotenv.config();

export interface AuthAppOptions extends AuthRouteDependencies {}

export function createApp(options: AuthAppOptions = {}): express.Express {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  setupMetrics(app, { serviceName: 'auth', serviceVersion: '1.0.0' });

  app.use(metricsMiddleware);

  app.use('', createAuthRoutes(options));

  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Internal server error' });
  });

  return app;
}

export async function startServer() {
  const PORT = process.env.PORT || 3002;

  try {
    await connectDB();
    const app = createApp();
    app.listen(PORT, () => {
      console.log(`Auth service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start auth service:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}
