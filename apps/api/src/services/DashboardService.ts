import { prisma } from '../index';

export class DashboardService {
  /**
   * Get organization dashboard statistics
   */
  async getStats(organizationId: string) {
    const [
      totalUsers,
      totalRooms,
      totalFiles,
      filesUploadedMonth,
      fileDownloadsMonth,
      storageData,
      activeUsersCount,
    ] = await Promise.all([
      // Total users in organization
      prisma.organizationMembership.count({
        where: { organizationId },
      }),

      // Total rooms
      prisma.exchangeRoom.count({
        where: { organizationId, isArchived: false },
      }),

      // Total files
      prisma.file.count({
        where: { organizationId },
      }),

      // Files uploaded this month
      prisma.file.count({
        where: {
          organizationId,
          createdAt: {
            gte: new Date(new Date().setDate(1)),
          },
        },
      }),

      // Files downloaded this month
      prisma.auditEvent.count({
        where: {
          organizationId,
          eventType: 'file.downloaded',
          timestamp: {
            gte: new Date(new Date().setDate(1)),
          },
        },
      }),

      // Storage usage
      prisma.file.aggregate({
        where: { organizationId },
        _sum: { sizeBytes: true },
      }),

      // Active users (logged in today)
      prisma.auditEvent.findMany({
        where: {
          organizationId,
          eventType: 'user.login',
          timestamp: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
        distinct: ['actorId'],
        select: { actorId: true },
      }),
    ]);

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { storageQuota: true },
    });

    return {
      totalUsers,
      totalRooms,
      totalFiles,
      filesUploaded: filesUploadedMonth,
      fileDownloads: fileDownloadsMonth,
      activeUsers: activeUsersCount.length,
      storageUsed: storageData._sum.sizeBytes || 0,
      storageQuota: org?.storageQuota || 107374182400, // 100GB default
    };
  }

  /**
   * Get organization users
   */
  async getUsers(organizationId: string) {
    const memberships = await prisma.organizationMembership.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    // Get last login and storage for each user
    const userStats = await Promise.all(
      memberships.map(async (m) => {
        const lastLoginEvent = await prisma.auditEvent.findFirst({
          where: {
            organizationId,
            actorId: m.userId,
            eventType: 'user.login',
          },
          orderBy: { timestamp: 'desc' },
          select: { timestamp: true },
        });

        const storageUsed = await prisma.file.aggregate({
          where: {
            organizationId,
            createdById: m.userId,
          },
          _sum: { sizeBytes: true },
        });

        return {
          id: m.user.id,
          email: m.user.email,
          role: m.role,
          joinedAt: m.joinedAt,
          lastLogin: lastLoginEvent?.timestamp,
          storageUsed: storageUsed._sum.sizeBytes || 0,
        };
      })
    );

    return userStats;
  }

  /**
   * Invite user to organization
   */
  async inviteUser(organizationId: string, email: string, role: string) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Check if already a member
      const existingMembership = await prisma.organizationMembership.findUnique({
        where: {
          organizationId_userId: {
            organizationId,
            userId: existingUser.id,
          },
        },
      });

      if (existingMembership) {
        throw new Error('User is already a member');
      }

      // Add to organization
      return prisma.organizationMembership.create({
        data: {
          organizationId,
          userId: existingUser.id,
          role,
        },
      });
    }

    // For new users, create a placeholder membership that requires signup
    // In a full implementation, send an invitation email
    return {
      email,
      role,
      invitePending: true,
    };
  }

  /**
   * Remove user from organization
   */
  async removeUser(organizationId: string, userId: string) {
    await prisma.organizationMembership.delete({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });
  }

  /**
   * Get organization rooms
   */
  async getRooms(organizationId: string, archived: boolean = false, limit: number = 50) {
    const rooms = await prisma.exchangeRoom.findMany({
      where: {
        organizationId,
        isArchived: archived,
      },
      include: {
        files: { select: { id: true } },
        createdBy: { select: { email: true } },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return rooms.map((room) => ({
      ...room,
      fileCount: room.files.length,
    }));
  }

  /**
   * Get audit events
   */
  async getAuditEvents(
    organizationId: string,
    options?: {
      eventType?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    const where: any = { organizationId };
    if (options?.eventType) {
      where.eventType = options.eventType;
    }

    const events = await prisma.auditEvent.findMany({
      where,
      select: {
        id: true,
        eventType: true,
        resourceType: true,
        resourceId: true,
        timestamp: true,
        actorEmail: true,
        ipAddress: true,
      },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
      orderBy: { timestamp: 'desc' },
    });

    const total = await prisma.auditEvent.count({ where });

    return { events, total };
  }

  /**
   * Get recent activities for dashboard
   */
  async getRecentActivities(organizationId: string, limit: number = 10) {
    return prisma.auditEvent.findMany({
      where: { organizationId },
      select: {
        id: true,
        eventType: true,
        resourceType: true,
        timestamp: true,
        actorEmail: true,
        details: true,
      },
      take: limit,
      orderBy: { timestamp: 'desc' },
    });
  }
}

export default new DashboardService();
