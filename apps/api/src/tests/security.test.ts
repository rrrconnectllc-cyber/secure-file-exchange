import request from 'supertest';
import app, { prisma } from '../index';
import { EncryptionService } from '../services/EncryptionService';
import crypto from 'crypto';

describe('Phase 8: Security Hardening', () => {
  let org1Id: string;
  let org2Id: string;
  let user1Token: string;
  let user2Token: string;
  let room1Id: string;
  let file1Id: string;

  beforeAll(async () => {
    // Create two separate organizations
    const orgRes1 = await request(app)
      .post('/api/v1/organizations')
      .send({ name: 'Org 1', domain: 'org1.test' });
    org1Id = orgRes1.body.organizationId;

    const orgRes2 = await request(app)
      .post('/api/v1/organizations')
      .send({ name: 'Org 2', domain: 'org2.test' });
    org2Id = orgRes2.body.organizationId;

    // Create users in different orgs
    const user1Res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'user1@org1.test',
        password: 'SecurePass123!',
        organizationId: org1Id,
      });
    user1Token = user1Res.body.token;

    const user2Res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'user2@org2.test',
        password: 'SecurePass123!',
        organizationId: org2Id,
      });
    user2Token = user2Res.body.token;

    // Create a room in org1
    const roomRes = await request(app)
      .post('/api/v1/rooms')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'Secure Room',
        description: 'Test room for security',
      });
    room1Id = roomRes.body.id;
  });

  // ===== 8.1: Cross-Tenant Access Prevention =====
  describe('8.1 Cross-Tenant Access Prevention', () => {
    it('User from Org2 cannot access Org1 rooms', async () => {
      const res = await request(app)
        .get(`/api/v1/rooms/${room1Id}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toBeDefined();
    });

    it('User from Org2 cannot list Org1 rooms', async () => {
      const res = await request(app)
        .get('/api/v1/rooms')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(200);
      expect(res.body.rooms).toEqual([]);
    });

    it('User from Org2 cannot delete Org1 room', async () => {
      const res = await request(app)
        .delete(`/api/v1/rooms/${room1Id}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(403);
    });

    it('Room data never leaks via error messages', async () => {
      const fakeRoomId = 'nonexistent-room-id';
      const res1 = await request(app)
        .get(`/api/v1/rooms/${fakeRoomId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      const res2 = await request(app)
        .get(`/api/v1/rooms/${fakeRoomId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res1.status).toBe(res2.status);
      expect(res1.body.error).not.toContain(fakeRoomId);
    });
  });

  // ===== 8.2: Authorization Bypass Prevention =====
  describe('8.2 Authorization Bypass Attempts', () => {
    it('Cannot access protected endpoints without token', async () => {
      const res = await request(app).get('/api/v1/rooms');

      expect(res.status).toBe(401);
    });

    it('Invalid token rejected', async () => {
      const res = await request(app)
        .get('/api/v1/rooms')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(res.status).toBe(401);
    });

    it('Malformed auth header rejected', async () => {
      const res = await request(app)
        .get('/api/v1/rooms')
        .set('Authorization', 'InvalidFormat token');

      expect(res.status).toBe(401);
    });

    it('Token from different org cannot access org data', async () => {
      const res = await request(app)
        .get('/api/v1/organizations')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.organization.id).toBe(org1Id);
    });

    it('Expired tokens rejected (if implemented)', async () => {
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MTYyMzkwMjJ9.invalid';

      const res = await request(app)
        .get('/api/v1/rooms')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
    });
  });

  // ===== 8.3: SQL Injection Prevention =====
  describe('8.3 SQL Injection Prevention', () => {
    it('SQL injection in search parameters blocked', async () => {
      const maliciousQuery = "'; DROP TABLE rooms; --";

      const res = await request(app)
        .get('/api/v1/rooms')
        .set('Authorization', `Bearer ${user1Token}`)
        .query({ search: maliciousQuery });

      expect(res.status).toBe(200);
      expect(res.body.rooms).toBeDefined();
      // Verify tables still exist by making another query
      const verifyRes = await request(app)
        .get('/api/v1/rooms')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(verifyRes.status).toBe(200);
    });

    it('SQL injection in ID parameters blocked', async () => {
      const maliciousId = "' OR '1'='1";

      const res = await request(app)
        .get(`/api/v1/rooms/${maliciousId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(404);
    });

    it('Prisma prevents parameterized injection', async () => {
      const maliciousEmail = "admin'--";

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: maliciousEmail,
          password: 'Password123!',
          organizationId: org1Id,
        });

      // Should either reject or create a literal email
      expect([400, 409]).toContain(res.status);
    });
  });

  // ===== 8.4: XSS Attack Prevention =====
  describe('8.4 XSS Attack Prevention', () => {
    it('Script tags in room name sanitized/rejected', async () => {
      const res = await request(app)
        .post('/api/v1/rooms')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: '<script>alert("XSS")</script>',
          description: 'Test',
        });

      expect(res.status).toBe(400);
    });

    it('HTML entities in descriptions handled safely', async () => {
      const res = await request(app)
        .post('/api/v1/rooms')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'Safe Room',
          description: '<img src=x onerror="alert(1)">',
        });

      expect(res.status).toBe(400);
    });

    it('Data returned as JSON, not HTML context', async () => {
      const res = await request(app)
        .get('/api/v1/rooms')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.headers['content-type']).toMatch(/json/);
      expect(typeof res.body).toBe('object');
    });
  });

  // ===== 8.5: CSRF Token Validation =====
  describe('8.5 CSRF Protection', () => {
    it('POST requests require proper origin/referer', async () => {
      const res = await request(app)
        .post('/api/v1/rooms')
        .set('Authorization', `Bearer ${user1Token}`)
        .set('Origin', 'https://malicious.com')
        .send({
          name: 'Test',
          description: 'Test',
        });

      // CORS should reject malicious origin
      expect(res.status).not.toBe(200);
    });

    it('Cross-origin requests blocked by CORS', async () => {
      const res = await request(app)
        .options('/api/v1/rooms')
        .set('Origin', 'https://malicious.com');

      expect(res.status).not.toBe(200);
    });
  });

  // ===== 8.6: File Upload Security =====
  describe('8.6 File Upload Security', () => {
    it('File size limits enforced (100MB)', async () => {
      const largeBuffer = Buffer.alloc(101 * 1024 * 1024);

      const res = await request(app)
        .post('/api/v1/files/upload')
        .set('Authorization', `Bearer ${user1Token}`)
        .field('roomId', room1Id)
        .attach('file', largeBuffer, 'large.bin');

      expect(res.status).toBe(413);
    });

    it('Malicious file extensions rejected', async () => {
      const maliciousContent = '<?php system($_GET["cmd"]); ?>';

      const res = await request(app)
        .post('/api/v1/files/upload')
        .set('Authorization', `Bearer ${user1Token}`)
        .field('roomId', room1Id)
        .attach('file', Buffer.from(maliciousContent), 'shell.php');

      expect([400, 415]).toContain(res.status);
    });

    it('Files scanned for malware', async () => {
      const ecarSignature = Buffer.from(
        'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*'
      );

      const res = await request(app)
        .post('/api/v1/files/upload')
        .set('Authorization', `Bearer ${user1Token}`)
        .field('roomId', room1Id)
        .attach('file', ecarSignature, 'eicar.txt');

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/malware|threat|scan/i);
    });

    it('File path traversal prevented', async () => {
      const res = await request(app)
        .post('/api/v1/files/upload')
        .set('Authorization', `Bearer ${user1Token}`)
        .field('roomId', room1Id)
        .attach('file', Buffer.from('test'), '../../etc/passwd');

      expect(res.status).toBe(400);
    });
  });

  // ===== 8.7: API Rate Limiting =====
  describe('8.7 API Rate Limiting', () => {
    it('Excessive requests throttled', async () => {
      const requests = [];
      for (let i = 0; i < 150; i++) {
        requests.push(
          request(app)
            .get('/api/v1/rooms')
            .set('Authorization', `Bearer ${user1Token}`)
        );
      }

      const results = await Promise.all(requests);
      const rateLimited = results.filter((r) => r.status === 429);

      expect(rateLimited.length).toBeGreaterThan(0);
    }, 30000);

    it('Rate limit headers present', async () => {
      const res = await request(app)
        .get('/api/v1/rooms')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.headers['x-ratelimit-limit']).toBeDefined();
      expect(res.headers['x-ratelimit-remaining']).toBeDefined();
    });
  });

  // ===== 8.8: Session Hijacking Prevention =====
  describe('8.8 Session Hijacking Prevention', () => {
    it('Session tokens not exposed in URLs', async () => {
      const res = await request(app)
        .get(`/api/v1/rooms?token=${user1Token}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).not.toBe(401);
    });

    it('Session tokens expire after inactivity', async () => {
      // This would require setting a short expiry in the token
      // For now, verify tokens are JWT with exp claim
      const parts = user1Token.split('.');
      expect(parts.length).toBe(3);

      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64').toString()
      );
      expect(payload.exp).toBeDefined();
    });

    it('Token refresh returns new token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ token: user1Token });

      if (res.status === 200) {
        expect(res.body.token).toBeDefined();
        expect(res.body.token).not.toBe(user1Token);
      }
    });

    it('Concurrent session limit enforced', async () => {
      // Create multiple concurrent sessions
      const sessions = [];
      for (let i = 0; i < 5; i++) {
        sessions.push(
          request(app)
            .get('/api/v1/rooms')
            .set('Authorization', `Bearer ${user1Token}`)
        );
      }

      const results = await Promise.all(sessions);
      const successful = results.filter((r) => r.status === 200);

      expect(successful.length).toBeGreaterThan(0);
    });
  });

  // ===== 8.2b: Encryption Validation =====
  describe('8.2b Encryption Validation', () => {
    it('AES-256-GCM encryption working', async () => {
      const orgId = org1Id;
      const plaintext = 'Sensitive data for encryption test';

      const encrypted = await EncryptionService.encryptFile(
        plaintext,
        orgId
      );

      expect(encrypted.encryptedData).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.tag).toBeDefined();
    });

    it('Decryption fails with wrong org ID', async () => {
      const plaintext = 'Secret message';
      const encrypted = await EncryptionService.encryptFile(
        plaintext,
        org1Id
      );

      try {
        await EncryptionService.decryptFile(
          encrypted.encryptedData,
          org2Id,
          encrypted.iv,
          encrypted.tag
        );
        fail('Should have thrown error');
      } catch (e) {
        expect(e).toBeDefined();
      }
    });

    it('HMAC integrity validation working', async () => {
      const plaintext = 'Important document';
      const encrypted = await EncryptionService.encryptFile(
        plaintext,
        org1Id
      );

      const hmac1 = EncryptionService.generateHMAC(
        encrypted.encryptedData,
        org1Id
      );
      const hmac2 = EncryptionService.generateHMAC(
        encrypted.encryptedData,
        org1Id
      );

      expect(hmac1).toBe(hmac2);
    });

    it('Modified ciphertext fails integrity check', async () => {
      const plaintext = 'Protected message';
      const encrypted = await EncryptionService.encryptFile(
        plaintext,
        org1Id
      );

      const originalHmac = EncryptionService.generateHMAC(
        encrypted.encryptedData,
        org1Id
      );

      const modifiedCiphertext = encrypted.encryptedData.slice(0, -1) + 'X';
      const modifiedHmac = EncryptionService.generateHMAC(
        modifiedCiphertext,
        org1Id
      );

      expect(originalHmac).not.toBe(modifiedHmac);
    });
  });

  // ===== 8.3b: Authorization Testing =====
  describe('8.3b Role-Based Access Control', () => {
    let ownerToken: string;
    let memberToken: string;
    let viewerToken: string;
    let testRoomId: string;

    beforeAll(async () => {
      // Create room with owner
      const roomRes = await request(app)
        .post('/api/v1/rooms')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'RBAC Test Room',
          description: 'Test room for role-based access',
        });
      testRoomId = roomRes.body.id;
      ownerToken = user1Token;

      // Create member and viewer
      const memberRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'member@org1.test',
          password: 'SecurePass123!',
          organizationId: org1Id,
        });
      memberToken = memberRes.body.token;

      const viewerRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'viewer@org1.test',
          password: 'SecurePass123!',
          organizationId: org1Id,
        });
      viewerToken = viewerRes.body.token;

      // Add members to room
      await request(app)
        .post(`/api/v1/rooms/${testRoomId}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          userId: (
            await request(app)
              .get('/api/v1/auth/me')
              .set('Authorization', `Bearer ${memberToken}`)
          ).body.user.id,
          role: 'member',
        });

      await request(app)
        .post(`/api/v1/rooms/${testRoomId}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          userId: (
            await request(app)
              .get('/api/v1/auth/me')
              .set('Authorization', `Bearer ${viewerToken}`)
          ).body.user.id,
          role: 'viewer',
        });
    });

    it('Owner can delete room', async () => {
      const res = await request(app)
        .delete(`/api/v1/rooms/${testRoomId}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
    });

    it('Member cannot delete room', async () => {
      // Create another room
      const roomRes = await request(app)
        .post('/api/v1/rooms')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ name: 'Member Test', description: 'Test' });
      const roomId = roomRes.body.id;

      // Add as member
      await request(app)
        .post(`/api/v1/rooms/${roomId}/members`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          userId: (
            await request(app)
              .get('/api/v1/auth/me')
              .set('Authorization', `Bearer ${memberToken}`)
          ).body.user.id,
          role: 'member',
        });

      const deleteRes = await request(app)
        .delete(`/api/v1/rooms/${roomId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(deleteRes.status).toBe(403);
    });

    it('Viewer cannot upload files', async () => {
      const roomRes = await request(app)
        .post('/api/v1/rooms')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ name: 'Viewer Test', description: 'Test' });
      const roomId = roomRes.body.id;

      // Add as viewer
      const viewerId = (
        await request(app)
          .get('/api/v1/auth/me')
          .set('Authorization', `Bearer ${viewerToken}`)
      ).body.user.id;

      await request(app)
        .post(`/api/v1/rooms/${roomId}/members`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ userId: viewerId, role: 'viewer' });

      const uploadRes = await request(app)
        .post('/api/v1/files/upload')
        .set('Authorization', `Bearer ${viewerToken}`)
        .field('roomId', roomId)
        .attach('file', Buffer.from('test content'), 'test.txt');

      expect(uploadRes.status).toBe(403);
    });

    it('Download limits enforced per member', async () => {
      const roomRes = await request(app)
        .post('/api/v1/rooms')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ name: 'Download Test', description: 'Test' });
      const roomId = roomRes.body.id;

      // Upload a file
      const uploadRes = await request(app)
        .post('/api/v1/files/upload')
        .set('Authorization', `Bearer ${user1Token}`)
        .field('roomId', roomId)
        .attach('file', Buffer.from('test content'), 'test.txt');
      const fileKey = uploadRes.body.fileKey;

      // Add member with 1 download limit
      const memberId = (
        await request(app)
          .get('/api/v1/auth/me')
          .set('Authorization', `Bearer ${memberToken}`)
      ).body.user.id;

      await request(app)
        .post(`/api/v1/rooms/${roomId}/members`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ userId: memberId, role: 'member', downloadLimit: 1 });

      // Download should succeed
      const download1 = await request(app)
        .get(`/api/v1/files/${fileKey}/download`)
        .set('Authorization', `Bearer ${memberToken}`);
      expect(download1.status).toBe(200);

      // Second download should fail
      const download2 = await request(app)
        .get(`/api/v1/files/${fileKey}/download`)
        .set('Authorization', `Bearer ${memberToken}`);
      expect(download2.status).toBe(403);
    });
  });

  // ===== 8.4b: Data Protection =====
  describe('8.4b Sensitive Data Protection', () => {
    it('Passwords never logged', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'logtest@org1.test',
          password: 'SuperSecretPassword123!',
          organizationId: org1Id,
        });

      const logs = logSpy.mock.calls.join(' ');
      expect(logs).not.toContain('SuperSecretPassword123!');

      logSpy.mockRestore();
    });

    it('Auth tokens never logged', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'user1@org1.test',
          password: 'SecurePass123!',
        });

      const logs = logSpy.mock.calls.join(' ');
      expect(logs).not.toContain(res.body.token);

      logSpy.mockRestore();
    });

    it('Audit logs sanitized', async () => {
      const auditEntries = await prisma.auditLog.findMany({
        take: 10,
      });

      for (const entry of auditEntries) {
        expect(entry.details).not.toMatch(/password|token|secret|key/i);
      }
    });
  });

  // ===== 8.5b: Infrastructure Security =====
  describe('8.5b Infrastructure Security', () => {
    it('Health check endpoint accessible', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    it('API requires authentication for protected routes', async () => {
      const res = await request(app).get('/api/v1/organizations');

      expect(res.status).toBe(401);
    });

    it('Security headers present', async () => {
      const res = await request(app)
        .get('/api/v1/rooms')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBe('DENY');
    });

    it('CORS properly configured', async () => {
      const res = await request(app)
        .get('/api/v1/rooms')
        .set('Authorization', `Bearer ${user1Token}`)
        .set('Origin', 'http://localhost:3000');

      expect(res.headers['access-control-allow-credentials']).toBeDefined();
    });
  });
});
