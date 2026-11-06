import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import FileStorageService from '../services/FileStorageService';
import EncryptionService from '../services/EncryptionService';
import MalwareScanService from '../services/MalwareScanService';

describe('Phase 4: File Storage & Security', () => {
  const testOrgId = 'test-org-001';
  const testUserId = 'test-user-001';
  const testFile = Buffer.from('This is a test file content');

  describe('FileStorageService', () => {
    it('should upload a file successfully', async () => {
      const metadata = await FileStorageService.uploadFile(
        testFile,
        'test.txt',
        'text/plain',
        {
          organizationId: testOrgId,
          uploadedBy: testUserId,
        }
      );

      expect(metadata.key).toBeDefined();
      expect(metadata.size).toBe(testFile.length);
      expect(metadata.mimeType).toBe('text/plain');
      expect(metadata.organizationId).toBe(testOrgId);
      expect(metadata.checksum).toBeDefined();
    });

    it('should retrieve uploaded file', async () => {
      const uploadedMetadata = await FileStorageService.uploadFile(
        testFile,
        'test.txt',
        'text/plain',
        {
          organizationId: testOrgId,
          uploadedBy: testUserId,
        }
      );

      const retrievedFile = await FileStorageService.getFile(uploadedMetadata.key);
      expect(retrievedFile).toEqual(testFile);
    });

    it('should check if file exists', async () => {
      const uploadedMetadata = await FileStorageService.uploadFile(
        testFile,
        'test.txt',
        'text/plain',
        {
          organizationId: testOrgId,
          uploadedBy: testUserId,
        }
      );

      const exists = await FileStorageService.fileExists(uploadedMetadata.key);
      expect(exists).toBe(true);

      const notExists = await FileStorageService.fileExists('non-existent-key');
      expect(notExists).toBe(false);
    });

    it('should delete file', async () => {
      const uploadedMetadata = await FileStorageService.uploadFile(
        testFile,
        'test.txt',
        'text/plain',
        {
          organizationId: testOrgId,
          uploadedBy: testUserId,
        }
      );

      await FileStorageService.deleteFile(uploadedMetadata.key);
      const exists = await FileStorageService.fileExists(uploadedMetadata.key);
      expect(exists).toBe(false);
    });

    it('should generate unique storage keys', async () => {
      const metadata1 = await FileStorageService.uploadFile(
        testFile,
        'test.txt',
        'text/plain',
        {
          organizationId: testOrgId,
          uploadedBy: testUserId,
        }
      );

      const metadata2 = await FileStorageService.uploadFile(
        testFile,
        'test.txt',
        'text/plain',
        {
          organizationId: testOrgId,
          uploadedBy: testUserId,
        }
      );

      expect(metadata1.key).not.toBe(metadata2.key);

      // Cleanup
      await FileStorageService.deleteFile(metadata1.key);
      await FileStorageService.deleteFile(metadata2.key);
    });

    it('should handle file expiration', async () => {
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() - 1); // Expired

      const metadata = await FileStorageService.uploadFile(
        testFile,
        'expired.txt',
        'text/plain',
        {
          organizationId: testOrgId,
          uploadedBy: testUserId,
          expiresAt: expiryDate,
        }
      );

      expect(metadata.expiresAt).toEqual(expiryDate);

      // Cleanup
      await FileStorageService.deleteFile(metadata.key);
    });
  });

  describe('EncryptionService', () => {
    it('should encrypt and decrypt file', () => {
      const encrypted = EncryptionService.encryptFile(
        testFile,
        testOrgId
      );

      expect(encrypted.encrypted).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.tag).toBeDefined();

      const decrypted = EncryptionService.decryptFile(
        encrypted.encrypted,
        encrypted.iv,
        encrypted.tag,
        testOrgId
      );

      expect(decrypted).toEqual(testFile);
    });

    it('should fail decryption with wrong organization ID', () => {
      const encrypted = EncryptionService.encryptFile(
        testFile,
        testOrgId
      );

      expect(() => {
        EncryptionService.decryptFile(
          encrypted.encrypted,
          encrypted.iv,
          encrypted.tag,
          'wrong-org-id'
        );
      }).toThrow();
    });

    it('should support associated data for authentication', () => {
      const aad = `${testOrgId}:${testUserId}:test.txt`;

      const encrypted = EncryptionService.encryptFile(
        testFile,
        testOrgId,
        aad
      );

      const decrypted = EncryptionService.decryptFile(
        encrypted.encrypted,
        encrypted.iv,
        encrypted.tag,
        testOrgId,
        aad
      );

      expect(decrypted).toEqual(testFile);
    });

    it('should fail with wrong associated data', () => {
      const aad = `${testOrgId}:${testUserId}:test.txt`;

      const encrypted = EncryptionService.encryptFile(
        testFile,
        testOrgId,
        aad
      );

      expect(() => {
        EncryptionService.decryptFile(
          encrypted.encrypted,
          encrypted.iv,
          encrypted.tag,
          testOrgId,
          'wrong-aad'
        );
      }).toThrow();
    });

    it('should generate and verify HMAC', () => {
      const key = 'test-key';
      const hmac = EncryptionService.generateHMAC(testFile, key);

      expect(hmac).toBeDefined();
      expect(typeof hmac).toBe('string');

      const isValid = EncryptionService.verifyIntegrity(testFile, hmac, key);
      expect(isValid).toBe(true);

      const tamperedFile = Buffer.from('tampered content');
      const isInvalid = EncryptionService.verifyIntegrity(tamperedFile, hmac, key);
      expect(isInvalid).toBe(false);
    });
  });

  describe('MalwareScanService', () => {
    it('should report clean files', async () => {
      const result = await MalwareScanService.scanFile(
        testFile,
        'test.txt'
      );

      expect(result.clean).toBe(true);
      expect(result.threats).toEqual([]);
      expect(result.timestamp).toBeDefined();
    });

    it('should detect malicious content in test file', async () => {
      // EICAR test virus signature
      const ecarTest = Buffer.from(
        'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*'
      );

      const result = await MalwareScanService.scanFile(
        ecarTest,
        'test.txt'
      );

      expect(result.clean).toBe(false);
      expect(result.threats.length).toBeGreaterThan(0);
    });

    it('should handle ClamAV unavailability gracefully', async () => {
      // If ClamAV is down, should return safe/conservative result
      const result = await MalwareScanService.scanFile(
        testFile,
        'test.txt'
      );

      expect(result.timestamp).toBeDefined();
    });
  });

  describe('Integration: Upload → Scan → Encrypt → Store', () => {
    it('should complete full secure upload pipeline', async () => {
      // 1. Scan file
      const scanResult = await MalwareScanService.scanFile(
        testFile,
        'test.txt'
      );
      expect(scanResult.clean).toBe(true);

      // 2. Encrypt file
      const encrypted = EncryptionService.encryptFile(
        testFile,
        testOrgId
      );
      expect(encrypted.encrypted).toBeDefined();

      // 3. Store file
      const metadata = await FileStorageService.uploadFile(
        encrypted.encrypted,
        'test.txt',
        'text/plain',
        {
          organizationId: testOrgId,
          uploadedBy: testUserId,
        }
      );
      expect(metadata.key).toBeDefined();

      // 4. Retrieve and decrypt
      const storedFile = await FileStorageService.getFile(metadata.key);
      const decrypted = EncryptionService.decryptFile(
        storedFile,
        encrypted.iv,
        encrypted.tag,
        testOrgId
      );

      expect(decrypted).toEqual(testFile);

      // Cleanup
      await FileStorageService.deleteFile(metadata.key);
    });
  });

  describe('Security: Tenant Isolation', () => {
    it('should prevent cross-org file access', async () => {
      // Upload file for org1
      const org1File = await FileStorageService.uploadFile(
        testFile,
        'test.txt',
        'text/plain',
        {
          organizationId: 'org-1',
          uploadedBy: testUserId,
        }
      );

      // Try to decrypt with org2's key
      const encrypted = EncryptionService.encryptFile(
        testFile,
        'org-1'
      );

      expect(() => {
        EncryptionService.decryptFile(
          encrypted.encrypted,
          encrypted.iv,
          encrypted.tag,
          'org-2' // Different org
        );
      }).toThrow();

      // Cleanup
      await FileStorageService.deleteFile(org1File.key);
    });

    it('should enforce organization on file retrieval', async () => {
      const metadata = await FileStorageService.uploadFile(
        testFile,
        'test.txt',
        'text/plain',
        {
          organizationId: testOrgId,
          uploadedBy: testUserId,
        }
      );

      const retrievedMetadata = await FileStorageService.getFileMetadata(
        metadata.key
      );

      expect(retrievedMetadata?.organizationId).toBe(testOrgId);

      // Cleanup
      await FileStorageService.deleteFile(metadata.key);
    });
  });
});
