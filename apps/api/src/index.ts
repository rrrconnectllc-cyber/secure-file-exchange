import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import organizationRoutes from './routes/organizations';
import fileRoutes from './routes/files';
import roomRoutes from './routes/rooms';
import dashboardRoutes from './routes/dashboard';
import billingRoutes from './routes/billing';
import { createRateLimiter } from './middleware/rateLimit';
import { csrfProtection, corsValidation } from './middleware/csrf';

const app = express();
const port = process.env.API_PORT || 3001;
const prisma = new PrismaClient();

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(corsValidation);
app.use(csrfProtection);
app.use(express.json());
app.use(express.urlencoded({ limit: '10mb' }));
app.use(createRateLimiter(60000, 100)); // 100 requests per minute

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API v1 routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/organizations', organizationRoutes);
app.use('/api/v1/files', upload.single('file'), fileRoutes);
app.use('/api/v1/rooms', roomRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/billing', express.raw({ type: 'application/json' }), billingRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`✓ API server running on port ${port}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
export { prisma };
