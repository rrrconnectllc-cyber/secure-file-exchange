import { Router, Request, Response } from 'express';
import { z } from 'zod';
import DashboardService from '../services/DashboardService';
import RoomService from '../services/RoomService';
import { authenticateToken, requireOrganization } from '../middleware/auth';

const router = Router();

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member']).optional(),
});

/**
 * GET /api/v1/dashboard/stats
 * Get organization statistics
 */
router.get(
  '/stats',
  authenticateToken,
  requireOrganization,
  async (req: Request, res: Response) => {
    try {
      const { organizationId } = req;

      const stats = await DashboardService.getStats(organizationId);

      res.json(stats);
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }
);

/**
 * GET /api/v1/dashboard/activities
 * Get recent activities
 */
router.get(
  '/activities',
  authenticateToken,
  requireOrganization,
  async (req: Request, res: Response) => {
    try {
      const { organizationId } = req;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

      const activities = await DashboardService.getRecentActivities(organizationId, limit);

      res.json({ activities });
    } catch (error) {
      console.error('Get activities error:', error);
      res.status(500).json({ error: 'Failed to fetch activities' });
    }
  }
);

/**
 * GET /api/v1/dashboard/users
 * Get organization users
 */
router.get(
  '/users',
  authenticateToken,
  requireOrganization,
  async (req: Request, res: Response) => {
    try {
      const { organizationId } = req;

      const users = await DashboardService.getUsers(organizationId);

      res.json({ users });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
);

/**
 * POST /api/v1/dashboard/users/invite
 * Invite user to organization
 */
router.post(
  '/users/invite',
  authenticateToken,
  requireOrganization,
  async (req: Request, res: Response) => {
    try {
      const { organizationId } = req;

      const input = inviteSchema.parse(req.body);

      const result = await DashboardService.inviteUser(
        organizationId,
        input.email,
        input.role || 'member'
      );

      res.status(201).json({ success: true, user: result });
    } catch (error: any) {
      console.error('Invite user error:', error);
      res.status(400).json({ error: error.message || 'Failed to invite user' });
    }
  }
);

/**
 * DELETE /api/v1/dashboard/users/:userId
 * Remove user from organization
 */
router.delete(
  '/users/:userId',
  authenticateToken,
  requireOrganization,
  async (req: Request, res: Response) => {
    try {
      const { organizationId } = req;
      const { userId } = req.params;

      await DashboardService.removeUser(organizationId, userId);

      res.json({ success: true });
    } catch (error) {
      console.error('Remove user error:', error);
      res.status(500).json({ error: 'Failed to remove user' });
    }
  }
);

/**
 * GET /api/v1/dashboard/rooms
 * Get organization rooms
 */
router.get(
  '/rooms',
  authenticateToken,
  requireOrganization,
  async (req: Request, res: Response) => {
    try {
      const { organizationId } = req;
      const archived = req.query.archived === 'true';
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

      const rooms = await DashboardService.getRooms(organizationId, archived, limit);

      res.json({ rooms });
    } catch (error) {
      console.error('Get rooms error:', error);
      res.status(500).json({ error: 'Failed to fetch rooms' });
    }
  }
);

/**
 * POST /api/v1/dashboard/rooms/:roomId/archive
 * Archive room
 */
router.post(
  '/rooms/:roomId/archive',
  authenticateToken,
  requireOrganization,
  async (req: Request, res: Response) => {
    try {
      const { organizationId } = req;
      const { roomId } = req.params;

      await RoomService.archiveRoom(roomId, organizationId);

      res.json({ success: true });
    } catch (error) {
      console.error('Archive room error:', error);
      res.status(500).json({ error: 'Failed to archive room' });
    }
  }
);

/**
 * DELETE /api/v1/dashboard/rooms/:roomId
 * Delete room
 */
router.delete(
  '/rooms/:roomId',
  authenticateToken,
  requireOrganization,
  async (req: Request, res: Response) => {
    try {
      const { organizationId } = req;
      const { roomId } = req.params;

      await RoomService.deleteRoom(roomId, organizationId);

      res.json({ success: true });
    } catch (error) {
      console.error('Delete room error:', error);
      res.status(500).json({ error: 'Failed to delete room' });
    }
  }
);

/**
 * GET /api/v1/dashboard/audit
 * Get audit log
 */
router.get(
  '/audit',
  authenticateToken,
  requireOrganization,
  async (req: Request, res: Response) => {
    try {
      const { organizationId } = req;
      const eventType = req.query.eventType as string | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const offset = (page - 1) * limit;

      const { events, total } = await DashboardService.getAuditEvents(organizationId, {
        eventType,
        limit,
        offset,
      });

      res.json({
        events,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error('Get audit log error:', error);
      res.status(500).json({ error: 'Failed to fetch audit log' });
    }
  }
);

export default router;
