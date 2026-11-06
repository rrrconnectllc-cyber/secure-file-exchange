import { Router, Request, Response } from 'express';
import { z } from 'zod';
import RoomService from '../services/RoomService';
import FileStorageService from '../services/FileStorageService';
import { authenticateToken, requireOrganization } from '../middleware/auth';

const router = Router();

// Validation schemas
const createRoomSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  expiresAt: z.string().datetime().optional(),
});

const updateRoomSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  expiresAt: z.string().datetime().optional(),
});

const addMemberSchema = z.object({
  userId: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum(['owner', 'member', 'viewer']).optional(),
  canDownload: z.boolean().optional(),
  downloadLimit: z.number().int().positive().optional(),
  accessExpiresAt: z.string().datetime().optional(),
});

const updateMemberSchema = z.object({
  role: z.enum(['owner', 'member', 'viewer']).optional(),
  canDownload: z.boolean().optional(),
  downloadLimit: z.number().int().positive().optional(),
  accessExpiresAt: z.string().datetime().optional(),
});

/**
 * POST /api/v1/rooms
 * Create a new exchange room
 */
router.post(
  '/',
  authenticateToken,
  requireOrganization,
  async (req: Request, res: Response) => {
    try {
      const { organizationId, userId } = req;

      const input = createRoomSchema.parse(req.body);

      const room = await RoomService.createRoom({
        organizationId,
        name: input.name,
        description: input.description,
        createdById: userId,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
      });

      res.status(201).json({
        success: true,
        room,
      });
    } catch (error) {
      console.error('Create room error:', error);
      res.status(400).json({ error: 'Failed to create room' });
    }
  }
);

/**
 * GET /api/v1/rooms
 * List rooms for organization
 */
router.get(
  '/',
  authenticateToken,
  requireOrganization,
  async (req: Request, res: Response) => {
    try {
      const { organizationId } = req;
      const archived = req.query.archived === 'true';
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const offset = parseInt(req.query.offset as string) || 0;

      const { rooms, total } = await RoomService.listRooms(organizationId, {
        archived,
        limit,
        offset,
      });

      res.json({
        success: true,
        rooms,
        pagination: {
          limit,
          offset,
          total,
        },
      });
    } catch (error) {
      console.error('List rooms error:', error);
      res.status(500).json({ error: 'Failed to list rooms' });
    }
  }
);

/**
 * GET /api/v1/rooms/:roomId
 * Get room details
 */
router.get(
  '/:roomId',
  authenticateToken,
  requireOrganization,
  async (req: Request, res: Response) => {
    try {
      const { organizationId } = req;
      const { roomId } = req.params;

      // Check access
      const hasAccess = await RoomService.hasAccess(roomId, req.userId!);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const room = await RoomService.getRoom(roomId, organizationId);
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }

      res.json({
        success: true,
        room,
      });
    } catch (error) {
      console.error('Get room error:', error);
      res.status(500).json({ error: 'Failed to get room' });
    }
  }
);

/**
 * PATCH /api/v1/rooms/:roomId
 * Update room
 */
router.patch(
  '/:roomId',
  authenticateToken,
  requireOrganization,
  async (req: Request, res: Response) => {
    try {
      const { organizationId, userId } = req;
      const { roomId } = req.params;

      // Check owner access
      const hasOwnerAccess = await RoomService.hasAccess(roomId, userId, 'owner');
      if (!hasOwnerAccess) {
        return res.status(403).json({ error: 'Only room owners can update' });
      }

      const input = updateRoomSchema.parse(req.body);

      const room = await RoomService.updateRoom(roomId, organizationId, {
        name: input.name,
        description: input.description,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
      });

      res.json({
        success: true,
        room,
      });
    } catch (error) {
      console.error('Update room error:', error);
      res.status(400).json({ error: 'Failed to update room' });
    }
  }
);

/**
 * DELETE /api/v1/rooms/:roomId
 * Delete room
 */
router.delete(
  '/:roomId',
  authenticateToken,
  requireOrganization,
  async (req: Request, res: Response) => {
    try {
      const { organizationId, userId } = req;
      const { roomId } = req.params;

      // Check owner access
      const hasOwnerAccess = await RoomService.hasAccess(roomId, userId, 'owner');
      if (!hasOwnerAccess) {
        return res.status(403).json({ error: 'Only room owners can delete' });
      }

      await RoomService.deleteRoom(roomId, organizationId);

      res.json({ success: true });
    } catch (error) {
      console.error('Delete room error:', error);
      res.status(500).json({ error: 'Failed to delete room' });
    }
  }
);

/**
 * POST /api/v1/rooms/:roomId/archive
 * Archive room
 */
router.post(
  '/:roomId/archive',
  authenticateToken,
  requireOrganization,
  async (req: Request, res: Response) => {
    try {
      const { organizationId, userId } = req;
      const { roomId } = req.params;

      // Check owner access
      const hasOwnerAccess = await RoomService.hasAccess(roomId, userId, 'owner');
      if (!hasOwnerAccess) {
        return res.status(403).json({ error: 'Only room owners can archive' });
      }

      await RoomService.archiveRoom(roomId, organizationId);

      res.json({ success: true });
    } catch (error) {
      console.error('Archive room error:', error);
      res.status(500).json({ error: 'Failed to archive room' });
    }
  }
);

/**
 * GET /api/v1/rooms/:roomId/members
 * Get room members
 */
router.get(
  '/:roomId/members',
  authenticateToken,
  requireOrganization,
  async (req: Request, res: Response) => {
    try {
      const { roomId } = req.params;

      // Check access
      const hasAccess = await RoomService.hasAccess(roomId, req.userId!);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const members = await RoomService.getMembers(roomId);

      res.json({
        success: true,
        members,
      });
    } catch (error) {
      console.error('Get members error:', error);
      res.status(500).json({ error: 'Failed to get members' });
    }
  }
);

/**
 * POST /api/v1/rooms/:roomId/members
 * Add member to room
 */
router.post(
  '/:roomId/members',
  authenticateToken,
  requireOrganization,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req;
      const { roomId } = req.params;

      // Check owner access
      const hasOwnerAccess = await RoomService.hasAccess(roomId, userId, 'owner');
      if (!hasOwnerAccess) {
        return res.status(403).json({ error: 'Only room owners can add members' });
      }

      const input = addMemberSchema.parse(req.body);

      if (!input.userId && !input.email) {
        return res.status(400).json({ error: 'userId or email required' });
      }

      const member = await RoomService.addMember({
        roomId,
        userId: input.userId,
        email: input.email,
        role: input.role,
        canDownload: input.canDownload,
        downloadLimit: input.downloadLimit,
        accessExpiresAt: input.accessExpiresAt ? new Date(input.accessExpiresAt) : undefined,
      });

      res.status(201).json({
        success: true,
        member,
      });
    } catch (error: any) {
      console.error('Add member error:', error);
      res.status(400).json({ error: error.message || 'Failed to add member' });
    }
  }
);

/**
 * PATCH /api/v1/rooms/members/:memberId
 * Update member
 */
router.patch(
  '/members/:memberId',
  authenticateToken,
  requireOrganization,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req;
      const { memberId } = req.params;

      const input = updateMemberSchema.parse(req.body);

      // Verify user is room owner
      const member = await prisma.roomMember.findUnique({
        where: { id: memberId },
        include: { room: true },
      });

      if (!member) {
        return res.status(404).json({ error: 'Member not found' });
      }

      const hasOwnerAccess = await RoomService.hasAccess(member.room.id, userId, 'owner');
      if (!hasOwnerAccess) {
        return res.status(403).json({ error: 'Only room owners can update members' });
      }

      const updated = await RoomService.updateMember(memberId, {
        role: input.role,
        canDownload: input.canDownload,
        downloadLimit: input.downloadLimit,
        accessExpiresAt: input.accessExpiresAt ? new Date(input.accessExpiresAt) : undefined,
      });

      res.json({
        success: true,
        member: updated,
      });
    } catch (error) {
      console.error('Update member error:', error);
      res.status(400).json({ error: 'Failed to update member' });
    }
  }
);

/**
 * DELETE /api/v1/rooms/members/:memberId
 * Remove member from room
 */
router.delete(
  '/members/:memberId',
  authenticateToken,
  requireOrganization,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req;
      const { memberId } = req.params;

      const member = await prisma.roomMember.findUnique({
        where: { id: memberId },
        include: { room: true },
      });

      if (!member) {
        return res.status(404).json({ error: 'Member not found' });
      }

      const hasOwnerAccess = await RoomService.hasAccess(member.room.id, userId, 'owner');
      if (!hasOwnerAccess) {
        return res.status(403).json({ error: 'Only room owners can remove members' });
      }

      await RoomService.removeMember(memberId);

      res.json({ success: true });
    } catch (error) {
      console.error('Remove member error:', error);
      res.status(500).json({ error: 'Failed to remove member' });
    }
  }
);

/**
 * GET /api/v1/rooms/:roomId/files
 * Get room files
 */
router.get(
  '/:roomId/files',
  authenticateToken,
  requireOrganization,
  async (req: Request, res: Response) => {
    try {
      const { roomId } = req.params;

      // Check access
      const hasAccess = await RoomService.hasAccess(roomId, req.userId!);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const files = await RoomService.getRoomFiles(roomId);

      res.json({
        success: true,
        files,
      });
    } catch (error) {
      console.error('Get room files error:', error);
      res.status(500).json({ error: 'Failed to get files' });
    }
  }
);

import { prisma } from '../index';

export default router;
