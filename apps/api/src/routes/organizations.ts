import { Router, Request, Response } from 'express';
import {
  requireAuth,
  requireOrganization,
  requireRole,
  validateTenantAccess,
} from '../middleware/auth';
import { organizationService } from '../services/OrganizationService';

const router = Router();

/**
 * GET /api/v1/organizations
 * List all organizations for authenticated user
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.auth) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const organizations = await organizationService.listOrganizations(req.auth);
    res.status(200).json({ organizations });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/organizations/:organizationId
 * Get organization details (with tenant isolation)
 */
router.get(
  '/:organizationId',
  requireAuth,
  validateTenantAccess,
  async (req: Request, res: Response) => {
    try {
      if (!req.auth) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const organization = await organizationService.getOrganization(
        req.params.organizationId,
        req.auth
      );

      res.status(200).json(organization);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
);

/**
 * PUT /api/v1/organizations/:organizationId
 * Update organization (admin/owner only)
 */
router.put(
  '/:organizationId',
  requireAuth,
  validateTenantAccess,
  requireRole(['owner', 'admin']),
  async (req: Request, res: Response) => {
    try {
      if (!req.auth) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { name } = req.body;

      if (!name) {
        res.status(400).json({ error: 'Organization name required' });
        return;
      }

      const organization = await organizationService.updateOrganization(
        req.params.organizationId,
        req.auth,
        { name }
      );

      res.status(200).json(organization);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * GET /api/v1/organizations/:organizationId/members
 * List organization members
 */
router.get(
  '/:organizationId/members',
  requireAuth,
  validateTenantAccess,
  requireOrganization,
  async (req: Request, res: Response) => {
    try {
      if (!req.auth) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const org = await organizationService.getOrganization(
        req.params.organizationId,
        req.auth
      );

      res.status(200).json({ members: org.members });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
);

/**
 * POST /api/v1/organizations/:organizationId/members
 * Invite member to organization (admin/owner only)
 */
router.post(
  '/:organizationId/members',
  requireAuth,
  validateTenantAccess,
  requireRole(['owner', 'admin']),
  async (req: Request, res: Response) => {
    try {
      if (!req.auth) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { email, role } = req.body;

      if (!email || !role) {
        res.status(400).json({ error: 'Email and role required' });
        return;
      }

      if (!['admin', 'member'].includes(role)) {
        res.status(400).json({ error: 'Invalid role' });
        return;
      }

      const result = await organizationService.inviteMember(
        req.params.organizationId,
        req.auth,
        { email, role }
      );

      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * PUT /api/v1/organizations/:organizationId/members/:userId
 * Update member role (owner only)
 */
router.put(
  '/:organizationId/members/:userId',
  requireAuth,
  validateTenantAccess,
  requireRole(['owner']),
  async (req: Request, res: Response) => {
    try {
      if (!req.auth) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { role } = req.body;

      if (!role || !['admin', 'member'].includes(role)) {
        res.status(400).json({ error: 'Invalid role' });
        return;
      }

      const result = await organizationService.updateMemberRole(
        req.params.organizationId,
        req.auth,
        req.params.userId,
        role
      );

      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * DELETE /api/v1/organizations/:organizationId/members/:userId
 * Remove member from organization (admin/owner only)
 */
router.delete(
  '/:organizationId/members/:userId',
  requireAuth,
  validateTenantAccess,
  requireRole(['owner', 'admin']),
  async (req: Request, res: Response) => {
    try {
      if (!req.auth) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const result = await organizationService.removeMember(
        req.params.organizationId,
        req.auth,
        req.params.userId
      );

      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

export default router;
