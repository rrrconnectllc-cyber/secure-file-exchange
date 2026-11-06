import { describe, it, expect, beforeEach } from '@jest/globals';
import RoomService from '../services/RoomService';

describe('Phase 5: Exchange Rooms', () => {
  const testOrgId = 'test-org-001';
  const testUserId = 'test-user-001';
  const otherUserId = 'test-user-002';

  describe('RoomService: CRUD Operations', () => {
    let roomId: string;

    it('should create a room', async () => {
      const room = await RoomService.createRoom({
        organizationId: testOrgId,
        name: 'Q4 Financial Reports',
        description: 'Quarterly financial exchange',
        createdById: testUserId,
      });

      expect(room.id).toBeDefined();
      expect(room.name).toBe('Q4 Financial Reports');
      expect(room.organizationId).toBe(testOrgId);
      expect(room.members.length).toBeGreaterThan(0);

      roomId = room.id;
    });

    it('should get room details', async () => {
      const room = await RoomService.getRoom(roomId, testOrgId);

      expect(room).toBeDefined();
      expect(room?.name).toBe('Q4 Financial Reports');
      expect(room?.members.length).toBeGreaterThan(0);
    });

    it('should list rooms for organization', async () => {
      const { rooms, total } = await RoomService.listRooms(testOrgId);

      expect(Array.isArray(rooms)).toBe(true);
      expect(total).toBeGreaterThan(0);
      expect(rooms.length).toBeGreaterThan(0);
    });

    it('should update room details', async () => {
      const updated = await RoomService.updateRoom(roomId, testOrgId, {
        name: 'Q4 Financial Reports - Updated',
        description: 'Updated description',
      });

      expect(updated?.name).toBe('Q4 Financial Reports - Updated');
      expect(updated?.description).toBe('Updated description');
    });

    it('should archive room', async () => {
      await RoomService.archiveRoom(roomId, testOrgId);

      const room = await RoomService.getRoom(roomId, testOrgId);
      expect(room?.isArchived).toBe(true);
    });

    it('should list archived rooms separately', async () => {
      const { rooms: active } = await RoomService.listRooms(testOrgId, { archived: false });
      const { rooms: archived } = await RoomService.listRooms(testOrgId, { archived: true });

      expect(archived.length).toBeGreaterThan(0);
      expect(archived.some((r) => r.id === roomId)).toBe(true);
    });

    it('should delete room', async () => {
      await RoomService.deleteRoom(roomId, testOrgId);

      const room = await RoomService.getRoom(roomId, testOrgId);
      expect(room).toBeNull();
    });
  });

  describe('Member Management', () => {
    let roomId: string;

    beforeEach(async () => {
      const room = await RoomService.createRoom({
        organizationId: testOrgId,
        name: 'Member Test Room',
        createdById: testUserId,
      });
      roomId = room.id;
    });

    it('should add internal user as member', async () => {
      const member = await RoomService.addMember({
        roomId,
        userId: otherUserId,
        role: 'member',
      });

      expect(member.id).toBeDefined();
      expect(member.userId).toBe(otherUserId);
      expect(member.role).toBe('member');
    });

    it('should add external guest via email', async () => {
      const member = await RoomService.addMember({
        roomId,
        email: 'guest@example.com',
        role: 'viewer',
        canDownload: true,
      });

      expect(member.email).toBe('guest@example.com');
      expect(member.role).toBe('viewer');
      expect(member.canDownload).toBe(true);
    });

    it('should prevent duplicate member additions', async () => {
      await RoomService.addMember({
        roomId,
        userId: otherUserId,
        role: 'member',
      });

      expect(
        RoomService.addMember({
          roomId,
          userId: otherUserId,
          role: 'member',
        })
      ).rejects.toThrow('Member already added');
    });

    it('should get all room members', async () => {
      await RoomService.addMember({
        roomId,
        userId: otherUserId,
        role: 'member',
      });

      await RoomService.addMember({
        roomId,
        email: 'guest@example.com',
        role: 'viewer',
      });

      const members = await RoomService.getMembers(roomId);

      expect(members.length).toBeGreaterThanOrEqual(2);
      expect(members.some((m) => m.userId === otherUserId)).toBe(true);
      expect(members.some((m) => m.email === 'guest@example.com')).toBe(true);
    });

    it('should update member role and permissions', async () => {
      const member = await RoomService.addMember({
        roomId,
        userId: otherUserId,
        role: 'viewer',
        downloadLimit: 5,
      });

      const updated = await RoomService.updateMember(member.id, {
        role: 'member',
        downloadLimit: 10,
      });

      expect(updated.role).toBe('member');
      expect(updated.downloadLimit).toBe(10);
    });

    it('should enforce download limits', async () => {
      const member = await RoomService.addMember({
        roomId,
        email: 'limited@example.com',
        role: 'viewer',
        downloadLimit: 1,
      });

      expect(member.downloadLimit).toBe(1);
      expect(member.canDownload).toBe(true);
    });

    it('should enforce access expiration', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const member = await RoomService.addMember({
        roomId,
        email: 'expiring@example.com',
        role: 'viewer',
        accessExpiresAt: tomorrow,
      });

      expect(member.accessExpiresAt).toBeDefined();
    });

    it('should remove member from room', async () => {
      const member = await RoomService.addMember({
        roomId,
        userId: otherUserId,
        role: 'member',
      });

      await RoomService.removeMember(member.id);

      const members = await RoomService.getMembers(roomId);
      expect(members.some((m) => m.userId === otherUserId)).toBe(false);
    });
  });

  describe('Access Control', () => {
    let roomId: string;

    beforeEach(async () => {
      const room = await RoomService.createRoom({
        organizationId: testOrgId,
        name: 'Access Test Room',
        createdById: testUserId,
      });
      roomId = room.id;
    });

    it('should grant creator owner access', async () => {
      const hasAccess = await RoomService.hasAccess(roomId, testUserId);
      expect(hasAccess).toBe(true);
    });

    it('should deny access to non-members', async () => {
      const hasAccess = await RoomService.hasAccess(roomId, 'unknown-user');
      expect(hasAccess).toBe(false);
    });

    it('should enforce role-based access control', async () => {
      await RoomService.addMember({
        roomId,
        userId: otherUserId,
        role: 'viewer',
      });

      const hasViewer = await RoomService.hasAccess(roomId, otherUserId, 'viewer');
      expect(hasViewer).toBe(true);

      const hasMember = await RoomService.hasAccess(roomId, otherUserId, 'member');
      expect(hasMember).toBe(false);

      const hasOwner = await RoomService.hasAccess(roomId, otherUserId, 'owner');
      expect(hasOwner).toBe(false);
    });

    it('should enforce access expiration', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await RoomService.addMember({
        roomId,
        userId: otherUserId,
        role: 'member',
        accessExpiresAt: yesterday,
      });

      const hasAccess = await RoomService.hasAccess(roomId, otherUserId);
      expect(hasAccess).toBe(false);
    });
  });

  describe('File Management in Rooms', () => {
    let roomId: string;
    let fileId: string;

    beforeEach(async () => {
      const room = await RoomService.createRoom({
        organizationId: testOrgId,
        name: 'File Management Room',
        createdById: testUserId,
      });
      roomId = room.id;
      fileId = `test-file-${Date.now()}`;
    });

    it('should add file to room', async () => {
      await RoomService.addFileToRoom(fileId, roomId, testOrgId);

      const files = await RoomService.getRoomFiles(roomId);
      expect(files.some((f) => f.id === fileId)).toBe(true);
    });

    it('should get room files', async () => {
      await RoomService.addFileToRoom(fileId, roomId, testOrgId);

      const files = await RoomService.getRoomFiles(roomId);
      expect(Array.isArray(files)).toBe(true);
    });

    it('should remove file from room', async () => {
      await RoomService.addFileToRoom(fileId, roomId, testOrgId);
      await RoomService.removeFileFromRoom(fileId, testOrgId);

      const files = await RoomService.getRoomFiles(roomId);
      expect(files.some((f) => f.id === fileId)).toBe(false);
    });

    it('should track file count in room', async () => {
      const room1 = await RoomService.getRoom(roomId, testOrgId);
      const initialCount = room1?.fileCount || 0;

      await RoomService.addFileToRoom(fileId, roomId, testOrgId);

      const room2 = await RoomService.getRoom(roomId, testOrgId);
      expect(room2?.fileCount).toBeGreaterThan(initialCount);
    });
  });

  describe('Room Expiration & Cleanup', () => {
    it('should set room expiration', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const room = await RoomService.createRoom({
        organizationId: testOrgId,
        name: 'Expiring Room',
        createdById: testUserId,
        expiresAt: tomorrow,
      });

      expect(room.expiresAt).toBeDefined();
    });

    it('should cleanup expired rooms', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await RoomService.createRoom({
        organizationId: testOrgId,
        name: 'Expired Room',
        createdById: testUserId,
        expiresAt: yesterday,
      });

      const count = await RoomService.cleanupExpiredRooms(testOrgId);
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('Tenant Isolation', () => {
    it('should prevent cross-org room access', async () => {
      const room = await RoomService.createRoom({
        organizationId: 'org-1',
        name: 'Org1 Room',
        createdById: testUserId,
      });

      const accessed = await RoomService.getRoom(room.id, 'org-2');
      expect(accessed).toBeNull();
    });

    it('should enforce org isolation on updates', async () => {
      const room = await RoomService.createRoom({
        organizationId: 'org-1',
        name: 'Org1 Room',
        createdById: testUserId,
      });

      expect(
        RoomService.updateRoom(room.id, 'org-2', { name: 'Hacked Room' })
      ).rejects.toThrow();
    });

    it('should enforce org isolation on deletion', async () => {
      const room = await RoomService.createRoom({
        organizationId: 'org-1',
        name: 'Org1 Room',
        createdById: testUserId,
      });

      expect(
        RoomService.deleteRoom(room.id, 'org-2')
      ).rejects.toThrow();
    });
  });
});
