import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import session from 'express-session';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import rateLimit from 'express-rate-limit';
import * as Sentry from '@sentry/node';

import { logger } from './lib/logger';
import { setupSocketHandlers } from './socket/chat.handler';

// Routes
import authRoutes from './routes/auth.routes';
import conversationRoutes from './routes/conversation.routes';
import knowledgeBaseRoutes from './routes/knowledge-base.routes';
import paymentRoutes from './routes/payment.routes';
import analyticsRoutes from './routes/analytics.routes';
import healthRoutes from './routes/health.routes';
import adminRoutes from './routes/admin.routes';

// Middleware
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    Sentry.httpIntegration(),
    Sentry.nativeNodeFetchIntegration(),
    Sentry.graphqlIntegration(),
    Sentry.mongoIntegration(),
    Sentry.postgresIntegration(),
  ],
  tracesSampleRate: 1.0,
});

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HelpSync API',
      version: '1.0.0',
      description: 'AI-powered customer support chatbot backend API',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

const specs = swaggerJSDoc(options);

const app = express();

// Sentry request handler is automatic with integration
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.MOBILE_APP_URL || '*',
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: process.env.MOBILE_APP_URL || '*',
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session for admin dashboard
app.use(
  session({
    secret: process.env.JWT_SECRET || 'fallback-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' },
  })
);

// View engine setup for admin dashboard
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/knowledge-base', knowledgeBaseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/health', healthRoutes);
app.use('/admin', adminRoutes);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'HelpSync API',
    version: '1.0.0',
    docs: '/api-docs',
  });
});

// Socket.io setup
setupSocketHandlers(io);

// Error handling
app.use(Sentry.expressErrorHandler());
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export { io };
