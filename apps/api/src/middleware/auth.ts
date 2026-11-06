import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import type { AuthContext } from '../utils/auth';

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract JWT from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      // Allow unauthenticated requests - let routes decide
      return next();
    }

    // For now, assume valid token and set basic auth context
    // In production, verify JWT signature here
    req.auth = {
      userId: 'user-id-from-jwt',
      organizationId: 'org-id-from-jwt',
      organizationRole: 'owner',
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid authentication' });
  }
}

export async function requireOrganization(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.auth?.organizationId) {
      res.status(403).json({ error: 'Organization context required' });
      return;
    }

    // Verify user is member of this organization
    const membership = await prisma.organizationMembership.findFirst({
      where: {
        organizationId: req.auth.organizationId,
        userId: req.auth.userId,
      },
    });

    if (!membership) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Authorization check failed' });
  }
}

export function requireRole(roles: string[]) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.auth?.organizationRole || !roles.includes(req.auth.organizationRole)) {
        res.status(403).json({
          error: 'Insufficient permissions',
          required: roles,
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

export function validateTenantAccess(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestedOrgId = req.params.organizationId || req.query.organizationId;
  const sessionOrgId = req.auth?.organizationId;

  // CRITICAL SECURITY CHECK: Cross-tenant access prevention
  if (requestedOrgId && requestedOrgId !== sessionOrgId) {
    res.status(404).json({ error: 'Not Found' });
    return;
  }

  next();
}

// Alias for backwards compatibility
export const requireAuth = authenticateToken;
