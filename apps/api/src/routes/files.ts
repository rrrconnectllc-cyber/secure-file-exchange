import { Router, Request, Response } from 'express';
import { z } from 'zod';
import FileStorageService from '../services/FileStorageService';
import EncryptionService from '../services/EncryptionService';
import MalwareScanService from '../services/MalwareScanService';
import { authenticateToken, requireOrganization } from '../middleware/auth';

const router = Router();

// Validation schemas
const uploadSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(100),
  expiresAt: z.string().datetime().optional(),
});

/**
 * POST /api/files/upload
 * Upload a file
 */
router.post(
  '/upload',
  authenticateToken,
  requireOrganization,
  async (req: Request, res: Response) => {
    try {
      const { organizationId, userId } = req;

      // Validate request
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      // Validate metadata
      const metadata = uploadSchema.parse({
        filename: req.body.filename || req.file.originalname,
        mimeType: req.body.mimeType || req.file.mimetype,
        expiresAt: req.body.expiresAt,
      });

      // Size limits (100MB for free tier)
      const maxSize = 100 * 1024 * 1024;
      if (req.file.size > maxSize) {
        return res.status(413).json({ error: 'File too large' });
      }

      // Scan for malware
      const scanResult = await MalwareScanService.scanFile(
        req.file.buffer,
        metadata.filename
      );

      if (!scanResult.clean) {
        return res.status(400).json({
          error: 'File failed malware scan',
          threats: scanResult.threats,
        });
      }

      // Encrypt file
      const encryptedData = EncryptionService.encryptFile(
        req.file.buffer,
        organizationId,
        `${organizationId}:${userId}:${metadata.filename}`
      );

      // Create file metadata for storage
      const fileMetadata = await FileStorageService.uploadFile(
        encryptedData.encrypted,
        metadata.filename,
        metadata.mimeType,
        {
          organizationId,
          uploadedBy: userId,
          expiresAt: metadata.expiresAt ? new Date(metadata.expiresAt) : undefined,
        }
      );

      // Return file info with decryption keys
      return res.status(200).json({
        success: true,
        file: {
          key: fileMetadata.key,
          size: fileMetadata.size,
          mimeType: fileMetadata.mimeType,
          checksum: fileMetadata.checksum,
          uploadedAt: fileMetadata.uploadedAt,
          expiresAt: fileMetadata.expiresAt,
        },
        encryption: {
          iv: encryptedData.iv.toString('hex'),
          tag: encryptedData.tag.toString('hex'),
        },
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  }
);

/**
 * GET /api/files/:fileKey/download
 * Download a file
 */
router.get(
  '/:fileKey/download',
  authenticateToken,
  requireOrganization,
  async (req: Request, res: Response) => {
    try {
      const { organizationId } = req;
      const { fileKey } = req.params;
      const { iv, tag } = req.query;

      // Validate parameters
      if (!iv || !tag || typeof iv !== 'string' || typeof tag !== 'string') {
        return res.status(400).json({ error: 'Missing decryption keys' });
      }

      // Check if file exists and belongs to organization
      const fileMetadata = await FileStorageService.getFileMetadata(fileKey);
      if (!fileMetadata || fileMetadata.organizationId !== organizationId) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Check if file has expired
      if (fileMetadata.expiresAt && new Date() > fileMetadata.expiresAt) {
        return res.status(410).json({ error: 'File has expired' });
      }

      // Get encrypted file
      const encryptedFile = await FileStorageService.getFile(fileKey);

      // Decrypt file
      const decrypted = EncryptionService.decryptFile(
        encryptedFile,
        Buffer.from(iv, 'hex'),
        Buffer.from(tag, 'hex'),
        organizationId
      );

      // Return file
      res.set('Content-Type', fileMetadata.mimeType);
      res.set('Content-Disposition', `attachment; filename="${fileMetadata.key}"`);
      res.send(decrypted);
    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({ error: 'Download failed' });
    }
  }
);

/**
 * DELETE /api/files/:fileKey
 * Delete a file
 */
router.delete(
  '/:fileKey',
  authenticateToken,
  requireOrganization,
  async (req: Request, res: Response) => {
    try {
      const { organizationId } = req;
      const { fileKey } = req.params;

      // Verify file belongs to organization
      const fileMetadata = await FileStorageService.getFileMetadata(fileKey);
      if (!fileMetadata || fileMetadata.organizationId !== organizationId) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Delete file
      await FileStorageService.deleteFile(fileKey);

      res.json({ success: true });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ error: 'Delete failed' });
    }
  }
);

export default router;
