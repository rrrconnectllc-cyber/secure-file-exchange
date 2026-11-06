import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

// Detect potential XSS payloads
const xssPatterns = [
  /<script[^>]*>.*?<\/script>/gi,
  /on\w+\s*=/gi,
  /<iframe/gi,
  /<embed/gi,
  /<object/gi,
  /javascript:/gi,
  /vbscript:/gi,
];

// Detect potential SQL injection patterns
const sqlInjectionPatterns = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|DECLARE)\b)/gi,
  /(['";])\s*(OR|AND)\s*(['";])/gi,
  /(--|#|\/\*|\*\/)/g,
];

export const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    // Check for XSS patterns
    for (const pattern of xssPatterns) {
      if (pattern.test(input)) {
        throw new Error('XSS pattern detected in input');
      }
    }
    return input.trim();
  }

  if (typeof input === 'object' && input !== null) {
    if (Array.isArray(input)) {
      return input.map(sanitizeInput);
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  return input;
};

export const validateRequestBody = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Sanitize input first
      const sanitized = sanitizeInput(req.body);

      // Validate with schema
      const validated = schema.parse(sanitized);
      req.body = validated;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        });
      }

      if (error instanceof Error && error.message.includes('XSS')) {
        return res.status(400).json({ error: 'Invalid input: potential XSS detected' });
      }

      res.status(400).json({ error: 'Invalid request body' });
    }
  };
};

export const validateQueryParams = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check for SQL injection patterns in query params
      for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === 'string') {
          for (const pattern of sqlInjectionPatterns) {
            if (pattern.test(value)) {
              return res.status(400).json({ error: 'Invalid query parameter' });
            }
          }
        }
      }

      const validated = schema.parse(req.query);
      req.query = validated;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: 'Invalid query parameters' });
      }

      res.status(400).json({ error: 'Invalid request' });
    }
  };
};

export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  // Validate file extension
  const allowedExtensions = [
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'jpg', 'jpeg', 'png', 'gif', 'zip', 'rar', '7z',
  ];

  const filename = req.file.originalname.toLowerCase();
  const extension = filename.split('.').pop();

  if (!extension || !allowedExtensions.includes(extension)) {
    return res.status(415).json({ error: 'File type not allowed' });
  }

  // Check for path traversal attempts
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({ error: 'Invalid filename' });
  }

  // Check file size (100MB max)
  const maxSize = 100 * 1024 * 1024;
  if (req.file.size > maxSize) {
    return res.status(413).json({ error: 'File too large' });
  }

  next();
};
