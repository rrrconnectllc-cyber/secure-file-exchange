import { Request, Response, NextFunction } from 'express';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
}

// In-memory rate limit store
const requestCounts = new Map<string, number[]>();

export const rateLimitMiddleware = (config: RateLimitConfig) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = `${config.keyPrefix || 'rate-limit'}:${req.ip || 'unknown'}`;
      const now = Date.now();
      const windowStart = now - config.windowMs;

      // Get or create request list for this IP
      let requests = requestCounts.get(key) || [];

      // Remove requests outside the window
      requests = requests.filter((time) => time > windowStart);

      // Add current request
      requests.push(now);

      // Store updated requests
      requestCounts.set(key, requests);

      // Clean up old entries periodically
      if (Math.random() < 0.01) {
        for (const [k] of requestCounts) {
          const reqs = requestCounts.get(k) || [];
          const filtered = reqs.filter((t) => t > windowStart);
          if (filtered.length > 0) {
            requestCounts.set(k, filtered);
          } else {
            requestCounts.delete(k);
          }
        }
      }

      res.set('X-RateLimit-Limit', config.maxRequests.toString());
      res.set('X-RateLimit-Remaining', Math.max(0, config.maxRequests - requests.length).toString());

      if (requests.length > config.maxRequests) {
        return res.status(429).json({
          error: 'Too Many Requests',
          retryAfter: Math.ceil(config.windowMs / 1000),
        });
      }

      next();
    } catch (error) {
      console.error('Rate limit error:', error);
      next();
    }
  };
};

export const createRateLimiter = (windowMs: number = 60000, maxRequests: number = 100) => {
  return rateLimitMiddleware({
    windowMs,
    maxRequests,
    keyPrefix: 'rl',
  });
};
