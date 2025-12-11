import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import orderRoutes from './routes/orderRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import adminRoutes from './routes/adminRoutes';
import dealRoutes from './routes/dealRoutes';
import { startProductCleanupJob } from './services/productCleanup';
import { startOrderCleanupJob } from './services/orderCleanup';
const app = express();

dotenv.config();

import DatabaseConnection from './config/database';

app.use(session({
  secret: process.env.SESSION_SECRET || "1233edhkndlfjkneinr93u943foodrescuesession2024secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 7 * 24 * 60 * 60 // 7 days
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

const PORT = Number(process.env.PORT) || 5000;


//cors
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
    origin: (origin, cb) => cb(null, true), // allow any origin in dev
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  }));
  app.use((req, res, next) => {
    // Log incoming requests in dev to help debug CORS/preflight issues
    // eslint-disable-next-line no-console
    console.debug('[DEV] Incoming request:', req.method, req.originalUrl, 'Origin:', req.headers.origin);
    next();
  });
} else {
  app.use(cors({
    origin: [ 'http://localhost:5173',
      'http://localhost:5000',
      'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  }));
}

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }  // Add this!
}));


app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', async (req, res) => {
  try {

    const dbHealth = await DatabaseConnection.healthCheck();
    
    const overallHealth = dbHealth.status === 'healthy' ? 'healthy' : 'unhealthy';
    
    res.json({
      success: true,
      message: 'FoodRescue API Health Status',
      data: {
        status: overallHealth,
        timestamp: new Date().toISOString(),
        services: {
          database: dbHealth,
          api: {
            status: 'healthy',
            message: 'API server is running'
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Basic API info route
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to FoodRescue API',
    data: {
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    }
  });
});

// Routes 
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/deals', dealRoutes);

// 404 handler 
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    error: {
      code: 'ROUTE_NOT_FOUND',
      path: req.originalUrl
    }
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global Error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    error: {
      code: error.code || 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }
  });
});

async function startServer() {
  try {
    // Connect to database
    console.log('Starting FoodRescue API...');
    await DatabaseConnection.connect();
    
    // Start background cleanup jobs only in non-serverless environment
    // Vercel serverless functions don't support cron jobs
    if (process.env.VERCEL !== '1') {
      startProductCleanupJob();
      startOrderCleanupJob();
    }
    // await emailService.testConnection()
    // Connect to Redis (optional)
    //await RedisConnection.connect();
    
    // Start Express server only if not running on Vercel
    if (process.env.VERCEL !== '1') {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
        //console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        //console.log(`Health check: http://localhost:${PORT}/health`);
        //console.log(`API info: http://localhost:${PORT}/api`);
      });
    }
    
  } catch (error) {
    console.error('Failed to start server:', error);
    if (process.env.VERCEL !== '1') {
      process.exit(1);
    }
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  if (process.env.VERCEL !== '1') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  if (process.env.VERCEL !== '1') {
    process.exit(1);
  }
});

// Connect to database for serverless
if (process.env.VERCEL === '1') {
  DatabaseConnection.connect().catch(console.error);
}

// Start the server (only in non-serverless environment)
if (process.env.VERCEL !== '1') {
  startServer();
}

export default app;