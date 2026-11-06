import { prisma } from '../index';
import type { AuthContext } from '../utils/auth';

export interface InviteMemberInput {
  email: string;
  role: 'admin' | 'member';
}

export class OrganizationService {
  async getOrganization(organizationId: string, auth: AuthContext) {
    // CRITICAL: Verify user is member of this organization
    const membership = await prisma.organizationMembership.findFirst({
      where: {
        organizationId,
        userId: auth.userId,
      },
    });

    if (!membership) {
      // Return 404 to prevent enumeration
      throw new Error('Organization not found');
    }

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        memberships: {
          include: { user: { select: { id: true, email: true } } },
        },
      },
    });

    if (!org) {
      throw new Error('Organization not found');
    }

    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      members: org.memberships.map((m) => ({
        userId: m.user.id,
        email: m.user.email,
        role: m.role,
        joinedAt: m.joinedAt,
      })),
    };
  }

  async listOrganizations(auth: AuthContext) {
    const memberships = await prisma.organizationMembership.findMany({
      where: { userId: auth.userId },
      include: {
        organization: true,
      },
    });

    return memberships.map((m) => ({
      id: m.organization.id,
      name: m.organization.name,
      slug: m.organization.slug,
      role: m.role,
    }));
  }

  async updateOrganization(
    organizationId: string,
    auth: AuthContext,
    updates: { name?: string }
  ) {
    // CRITICAL: Only owner/admin can update
    const membership = await prisma.organizationMembership.findFirst({
      where: {
        organizationId,
        userId: auth.userId,
        role: { in: ['owner', 'admin'] },
      },
    });

    if (!membership) {
      throw new Error('Insufficient permissions');
    }

    const org = await prisma.organization.update({
      where: { id: organizationId },
      data: updates,
    });

    return org;
  }

  async inviteMember(
    organizationId: string,
    auth: AuthContext,
    input: InviteMemberInput
  ) {
    // CRITICAL: Only owner/admin can invite
    const membership = await prisma.organizationMembership.findFirst({
      where: {
        organizationId,
        userId: auth.userId,
        role: { in: ['owner', 'admin'] },
      },
    });

    if (!membership) {
      throw new Error('Insufficient permissions');
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      // Create pending invitation (not implemented yet)
      throw new Error('User does not exist. Invitations for non-users not yet implemented.');
    }

    // Check if already a member
    const existingMembership = await prisma.organizationMembership.findFirst({
      where: {
        organizationId,
        userId: user.id,
      },
    });

    if (existingMembership) {
      throw new Error('User is already a member of this organization');
    }

    // Add member
    const newMembership = await prisma.organizationMembership.create({
      data: {
        organizationId,
        userId: user.id,
        role: input.role,
      },
    });

    return {
      userId: user.id,
      email: user.email,
      role: newMembership.role,
      message: 'Member invited successfully',
    };
  }

  async removeMember(organizationId: string, auth: AuthContext, userId: string) {
    // CRITICAL: Only owner/admin can remove
    const membership = await prisma.organizationMembership.findFirst({
      where: {
        organizationId,
        userId: auth.userId,
        role: { in: ['owner', 'admin'] },
      },
    });

    if (!membership) {
      throw new Error('Insufficient permissions');
    }

    // Cannot remove owner
    const targetMembership = await prisma.organizationMembership.findFirst({
      where: {
        organizationId,
        userId,
      },
    });

    if (targetMembership?.role === 'owner') {
      throw new Error('Cannot remove organization owner');
    }

    // Remove member
    await prisma.organizationMembership.deleteMany({
      where: {
        organizationId,
        userId,
      },
    });

    return { message: 'Member removed successfully' };
  }

  async updateMemberRole(
    organizationId: string,
    auth: AuthContext,
    userId: string,
    role: 'admin' | 'member'
  ) {
    // CRITICAL: Only owner can change roles
    const membership = await prisma.organizationMembership.findFirst({
      where: {
        organizationId,
        userId: auth.userId,
        role: 'owner',
      },
    });

    if (!membership) {
      throw new Error('Only owner can change member roles');
    }

    const updated = await prisma.organizationMembership.updateMany({
      where: {
        organizationId,
        userId,
      },
      data: { role },
    });

    return { message: 'Member role updated successfully' };
  }
}

export const organizationService = new OrganizationService();
