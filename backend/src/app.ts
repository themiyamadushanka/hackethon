import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ENV } from './common/config/env';
import { registerFeatures } from './features';
import { errorHandler } from './common/middlewares/error.middleware';
import { NotFoundError } from './common/errors/app.error';

export const createApp = (): Express => {
  const app = express();

  // Global Security & Logging Middlewares
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (curl, server-to-server, mobile)
        if (!origin) return callback(null, true);

        // Allow configured origin or any localhost/127.0.0.1 port in dev
        if (
          origin === ENV.CLIENT_ORIGIN ||
          /^http:\/\/(localhost|127\.0\.0\.1)(:[0-9]+)?$/.test(origin)
        ) {
          return callback(null, true);
        }

        return callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  if (ENV.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Register Feature Modules
  registerFeatures(app);

  // Catch-all for undefined routes
  app.use((_req, _res, next) => {
    next(new NotFoundError('API route not found'));
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
