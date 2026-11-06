import { prisma } from '../index';
import { Prisma } from '@prisma/client';

interface CreateRoomInput {
  organizationId: string;
  name: string;
  description?: string;
  createdById: string;
  expiresAt?: Date;
}

interface UpdateRoomInput {
  name?: string;
  description?: string;
  expiresAt?: Date | null;
}

interface AddMemberInput {
  roomId: string;
  userId?: string;
  email?: string;
  role?: 'owner' | 'member' | 'viewer';
  canDownload?: boolean;
  downloadLimit?: number;
  accessExpiresAt?: Date;
}

interface RoomWithMembers {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  createdById: string;
  expiresAt?: Date;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  members: any[];
  fileCount: number;
}

export class RoomService {
  /**
   * Create a new exchange room
   */
  async createRoom(input: CreateRoomInput): Promise<RoomWithMembers> {
    const room = await prisma.exchangeRoom.create({
      data: {
        organizationId: input.organizationId,
        name: input.name,
        description: input.description,
        createdById: input.createdById,
        expiresAt: input.expiresAt,
      },
      include: {
        members: true,
        files: true,
      },
    });

    // Add creator as owner
    await prisma.roomMember.create({
      data: {
        roomId: room.id,
        userId: input.createdById,
        role: 'owner',
      },
    });

    return {
      ...room,
      fileCount: room.files.length,
    };
  }

  /**
   * Get room with members and files
   */
  async getRoom(roomId: string, organizationId: string): Promise<RoomWithMembers | null> {
    const room = await prisma.exchangeRoom.findFirst({
      where: {
        id: roomId,
        organizationId,
      },
      include: {
        members: true,
        files: {
          select: {
            id: true,
            filename: true,
            sizeBytes: true,
            createdAt: true,
            status: true,
          },
        },
      },
    });

    if (!room) return null;

    return {
      ...room,
      fileCount: room.files.length,
    };
  }

  /**
   * List rooms for organization
   */
  async listRooms(
    organizationId: string,
    options?: {
      archived?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ rooms: RoomWithMembers[]; total: number }> {
    const where: Prisma.ExchangeRoomWhereInput = {
      organizationId,
      isArchived: options?.archived ?? false,
    };

    const rooms = await prisma.exchangeRoom.findMany({
      where,
      include: {
        members: true,
        files: true,
      },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.exchangeRoom.count({ where });

    return {
      rooms: rooms.map((room) => ({
        ...room,
        fileCount: room.files.length,
      })),
      total,
    };
  }

  /**
   * Update room
   */
  async updateRoom(
    roomId: string,
    organizationId: string,
    input: UpdateRoomInput
  ): Promise<RoomWithMembers | null> {
    const room = await prisma.exchangeRoom.update({
      where: {
        id: roomId,
        organizationId,
      },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.expiresAt !== undefined && { expiresAt: input.expiresAt }),
      },
      include: {
        members: true,
        files: true,
      },
    });

    return {
      ...room,
      fileCount: room.files.length,
    };
  }

  /**
   * Archive room
   */
  async archiveRoom(roomId: string, organizationId: string): Promise<void> {
    await prisma.exchangeRoom.update({
      where: {
        id: roomId,
        organizationId,
      },
      data: {
        isArchived: true,
      },
    });
  }

  /**
   * Delete room (and all files/members)
   */
  async deleteRoom(roomId: string, organizationId: string): Promise<void> {
    await prisma.exchangeRoom.delete({
      where: {
        id: roomId,
        organizationId,
      },
    });
  }

  /**
   * Add member to room
   */
  async addMember(input: AddMemberInput): Promise<any> {
    // Verify room exists
    const room = await prisma.exchangeRoom.findUnique({
      where: { id: input.roomId },
    });

    if (!room) {
      throw new Error('Room not found');
    }

    // Check if member already exists
    const existing = await prisma.roomMember.findFirst({
      where: {
        roomId: input.roomId,
        OR: [
          ...(input.userId ? [{ userId: input.userId }] : []),
          ...(input.email ? [{ email: input.email }] : []),
        ],
      },
    });

    if (existing) {
      throw new Error('Member already added to room');
    }

    return prisma.roomMember.create({
      data: {
        roomId: input.roomId,
        userId: input.userId,
        email: input.email,
        role: input.role ?? 'viewer',
        canDownload: input.canDownload ?? true,
        downloadLimit: input.downloadLimit,
        accessExpiresAt: input.accessExpiresAt,
      },
    });
  }

  /**
   * Update member role/permissions
   */
  async updateMember(
    memberId: string,
    updates: {
      role?: string;
      canDownload?: boolean;
      downloadLimit?: number | null;
      accessExpiresAt?: Date | null;
    }
  ): Promise<any> {
    return prisma.roomMember.update({
      where: { id: memberId },
      data: updates,
    });
  }

  /**
   * Remove member from room
   */
  async removeMember(memberId: string): Promise<void> {
    await prisma.roomMember.delete({
      where: { id: memberId },
    });
  }

  /**
   * Get room members
   */
  async getMembers(roomId: string): Promise<any[]> {
    return prisma.roomMember.findMany({
      where: { roomId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Check if user has access to room
   */
  async hasAccess(
    roomId: string,
    userId: string,
    requiredRole?: 'owner' | 'member' | 'viewer'
  ): Promise<boolean> {
    const member = await prisma.roomMember.findFirst({
      where: {
        roomId,
        userId,
      },
    });

    if (!member) return false;

    // Check if access has expired
    if (member.accessExpiresAt && new Date() > member.accessExpiresAt) {
      return false;
    }

    // Check role hierarchy: owner > member > viewer
    if (requiredRole) {
      const roleHierarchy = { owner: 3, member: 2, viewer: 1 };
      const userLevel = roleHierarchy[member.role as keyof typeof roleHierarchy] || 0;
      const requiredLevel = roleHierarchy[requiredRole] || 0;
      return userLevel >= requiredLevel;
    }

    return true;
  }

  /**
   * Add file to room
   */
  async addFileToRoom(fileId: string, roomId: string, organizationId: string): Promise<void> {
    await prisma.file.update({
      where: {
        id: fileId,
        organizationId,
      },
      data: {
        roomId,
      },
    });
  }

  /**
   * Remove file from room
   */
  async removeFileFromRoom(fileId: string, organizationId: string): Promise<void> {
    await prisma.file.update({
      where: {
        id: fileId,
        organizationId,
      },
      data: {
        roomId: null,
      },
    });
  }

  /**
   * Get room files
   */
  async getRoomFiles(roomId: string): Promise<any[]> {
    return prisma.file.findMany({
      where: { roomId },
      select: {
        id: true,
        filename: true,
        sizeBytes: true,
        mimeType: true,
        status: true,
        createdAt: true,
        createdBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Cleanup expired rooms (call periodically)
   */
  async cleanupExpiredRooms(organizationId: string): Promise<number> {
    const now = new Date();
    const result = await prisma.exchangeRoom.updateMany({
      where: {
        organizationId,
        expiresAt: {
          lt: now,
        },
        isArchived: false,
      },
      data: {
        isArchived: true,
      },
    });

    return result.count;
  }
}

export default new RoomService();
