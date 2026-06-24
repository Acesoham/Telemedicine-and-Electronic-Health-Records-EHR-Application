import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { config } from './configs/config';
import { httpLogger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import ehrRoutes from './routes/ehr.routes';
import auditRoutes from './routes/audit.routes';
import appointmentRoutes from './routes/appointment.routes';
import prescriptionRoutes from './routes/prescription.routes';
import availabilityRoutes from './routes/availability.routes';

const createApp = (): Application => {
  const app = express();

  // ──────────────────────────────────────
  // Security Middleware
  // ──────────────────────────────────────
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", 'https:'],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", 'https:', 'data:'],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
    }),
  );

  // CORS
  app.use(
    cors({
      origin: (origin, callback) => {
        const allowedOrigins = [config.app.clientUrl, 'http://localhost:5173'];
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }),
  );

  // Global rate limiter
  app.use(
    rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: 'Too many requests from this IP. Please try again later.',
      },
    }),
  );

  // ──────────────────────────────────────
  // Parsing & Logging
  // ──────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());
  app.use(httpLogger);

  // Trust proxy (for correct IP behind Nginx)
  app.set('trust proxy', 1);

  // ──────────────────────────────────────
  // Health Check
  // ──────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'healthy',
      service: 'MediVault API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: config.app.nodeEnv,
    });
  });

  // ──────────────────────────────────────
  // API Routes
  // ──────────────────────────────────────
  app.use('/api/auth', authRoutes);
  app.use('/api/ehr', ehrRoutes);
  app.use('/api/audit', auditRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/prescriptions', prescriptionRoutes);
  app.use('/api/availability', availabilityRoutes);
  // /api/doctors is handled inside appointmentRoutes

  // ──────────────────────────────────────
  // Error Handling (must be last)
  // ──────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
