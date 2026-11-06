/**
 * CRITICAL SECURITY TESTS: Tenant Isolation
 *
 * These tests verify that cross-tenant access is impossible.
 * FAILURE of any test = RELEASE BLOCKER
 */

import { prisma } from '../index';
import { userService } from '../services/UserService';
import { organizationService } from '../services/OrganizationService';

describe('Tenant Isolation - Critical Security Tests', () => {
  let org1Id: string;
  let org2Id: string;
  let user1Id: string;
  let user2Id: string;

  beforeAll(async () => {
    // Setup: Create two separate organizations with different users

    // User 1 + Organization 1
    const reg1 = await userService.register({
      email: 'user1@org1.com',
      password: 'SecurePassword123!',
      organizationName: 'Organization One',
    });
    user1Id = reg1.userId;
    org1Id = reg1.organizationId;

    // User 2 + Organization 2
    const reg2 = await userService.register({
      email: 'user2@org2.com',
      password: 'SecurePassword123!',
      organizationName: 'Organization Two',
    });
    user2Id = reg2.userId;
    org2Id = reg2.organizationId;
  });

  describe('Cross-Tenant Access Prevention', () => {
    it('User1 cannot retrieve Organization2 data', async () => {
      const auth1 = {
        userId: user1Id,
        email: 'user1@org1.com',
        organizationId: org1Id,
        organizationRole: 'owner' as const,
        mfaVerified: true,
        isAuthenticated: true,
      };

      // Attempt cross-tenant access
      try {
        await organizationService.getOrganization(org2Id, auth1);
        throw new Error('SECURITY FAILURE: Cross-tenant access allowed');
      } catch (error: any) {
        if (error.message.includes('SECURITY FAILURE')) throw error;
        // Expected to throw "Organization not found"
        expect(error.message).toContain('Organization not found');
      }
    });

    it('User2 cannot retrieve Organization1 data', async () => {
      const auth2 = {
        userId: user2Id,
        email: 'user2@org2.com',
        organizationId: org2Id,
        organizationRole: 'owner' as const,
        mfaVerified: true,
        isAuthenticated: true,
      };

      try {
        await organizationService.getOrganization(org1Id, auth2);
        throw new Error('SECURITY FAILURE: Cross-tenant access allowed');
      } catch (error: any) {
        if (error.message.includes('SECURITY FAILURE')) throw error;
        expect(error.message).toContain('Organization not found');
      }
    });

    it('User1 cannot invite users to Organization2', async () => {
      const auth1 = {
        userId: user1Id,
        email: 'user1@org1.com',
        organizationId: org1Id,
        organizationRole: 'owner' as const,
        mfaVerified: true,
        isAuthenticated: true,
      };

      try {
        await organizationService.inviteMember(org2Id, auth1, {
          email: 'someone@example.com',
          role: 'member',
        });
        throw new Error('SECURITY FAILURE: Cross-tenant invite allowed');
      } catch (error: any) {
        if (error.message.includes('SECURITY FAILURE')) throw error;
        expect(error.message).toContain('Insufficient permissions');
      }
    });

    it('User1 cannot remove users from Organization2', async () => {
      const auth1 = {
        userId: user1Id,
        email: 'user1@org1.com',
        organizationId: org1Id,
        organizationRole: 'owner' as const,
        mfaVerified: true,
        isAuthenticated: true,
      };

      try {
        await organizationService.removeMember(org2Id, auth1, user2Id);
        throw new Error('SECURITY FAILURE: Cross-tenant removal allowed');
      } catch (error: any) {
        if (error.message.includes('SECURITY FAILURE')) throw error;
        expect(error.message).toContain('Insufficient permissions');
      }
    });
  });

  describe('Database-Level Tenant Isolation', () => {
    it('User1 can only see their organization in database queries', async () => {
      const memberships = await prisma.organizationMembership.findMany({
        where: { userId: user1Id },
      });

      expect(memberships).toHaveLength(1);
      expect(memberships[0].organizationId).toBe(org1Id);
      expect(memberships[0].organizationId).not.toBe(org2Id);
    });

    it('Direct database query respects organization boundaries', async () => {
      const org1Members = await prisma.organizationMembership.findMany({
        where: { organizationId: org1Id },
      });

      const org2Members = await prisma.organizationMembership.findMany({
        where: { organizationId: org2Id },
      });

      expect(org1Members).toHaveLength(1);
      expect(org2Members).toHaveLength(1);
      expect(org1Members[0].userId).toBe(user1Id);
      expect(org2Members[0].userId).toBe(user2Id);
    });
  });

  describe('Authorization Enforcement', () => {
    it('Non-member cannot access organization', async () => {
      // Create a third user without organization membership
      const unaffiliated = {
        userId: 'unaffiliated-user',
        email: 'unaffiliated@example.com',
        organizationId: undefined,
        organizationRole: undefined,
        mfaVerified: true,
        isAuthenticated: true,
      };

      try {
        await organizationService.getOrganization(org1Id, unaffiliated);
        throw new Error('SECURITY FAILURE: Non-member access allowed');
      } catch (error: any) {
        if (error.message.includes('SECURITY FAILURE')) throw error;
        expect(error.message).toContain('Organization not found');
      }
    });

    it('Member cannot change roles without owner permission', async () => {
      const memberAuth = {
        userId: user1Id,
        email: 'user1@org1.com',
        organizationId: org1Id,
        organizationRole: 'member' as const,
        mfaVerified: true,
        isAuthenticated: true,
      };

      try {
        await organizationService.updateMemberRole(
          org1Id,
          memberAuth,
          user2Id,
          'admin'
        );
        throw new Error('SECURITY FAILURE: Member role change allowed');
      } catch (error: any) {
        if (error.message.includes('SECURITY FAILURE')) throw error;
        expect(error.message).toContain('Only owner can change member roles');
      }
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.$disconnect();
  });
});

export const testResults = {
  testsRequired: 'MANDATORY - Release blocker',
  failureMode: 'Any failure = do not release',
  purpose: 'Verify cross-tenant access is impossible',
};
