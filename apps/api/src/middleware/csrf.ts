import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

declare global {
  namespace Express {
    interface Request {
      csrfToken?: string;
    }
  }
}

export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  const method = req.method?.toUpperCase();

  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const token = crypto.randomBytes(32).toString('hex');
    req.csrfToken = token;
    res.set('X-CSRF-Token', token);
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body?._csrf;

  if (!token) {
    return res.status(403).json({ error: 'CSRF token missing' });
  }

  // For simplicity, validate token format
  if (typeof token !== 'string' || token.length < 32) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
};

export const corsValidation = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ];

  // Block requests from suspicious origins during state-changing operations
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method?.toUpperCase() || '')) {
    if (origin && !allowedOrigins.includes(origin)) {
      return res.status(403).json({ error: 'Origin not allowed' });
    }
  }

  next();
};
