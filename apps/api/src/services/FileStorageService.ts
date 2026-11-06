import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { createReadStream, createWriteStream } from 'fs';
import { randomBytes } from 'crypto';
import path from 'path';

interface UploadOptions {
  organizationId: string;
  uploadedBy: string;
  expiresAt?: Date;
}

interface FileMetadata {
  key: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  expiresAt?: Date;
  organizationId: string;
  uploadedBy: string;
  checksum: string;
}

export class FileStorageService {
  private s3Client: S3Client;
  private bucket: string;

  constructor() {
    this.bucket = process.env.AWS_S3_BUCKET || 'sfx-files';

    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.AWS_S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'minioadmin',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'minioadmin',
      },
      forcePathStyle: true,
    });
  }

  /**
   * Generate secure storage key for file
   */
  private generateStorageKey(organizationId: string, filename: string): string {
    const timestamp = Date.now();
    const random = randomBytes(8).toString('hex');
    const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${organizationId}/${timestamp}-${random}/${sanitized}`;
  }

  /**
   * Upload file to S3/MinIO
   */
  async uploadFile(
    fileBuffer: Buffer,
    filename: string,
    mimeType: string,
    options: UploadOptions
  ): Promise<FileMetadata> {
    const key = this.generateStorageKey(options.organizationId, filename);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
      Metadata: {
        'org-id': options.organizationId,
        'uploaded-by': options.uploadedBy,
        'original-name': filename,
        'upload-time': new Date().toISOString(),
      },
    });

    await this.s3Client.send(command);

    // Calculate checksum
    const crypto = await import('crypto');
    const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    return {
      key,
      size: fileBuffer.length,
      mimeType,
      uploadedAt: new Date(),
      expiresAt: options.expiresAt,
      organizationId: options.organizationId,
      uploadedBy: options.uploadedBy,
      checksum,
    };
  }

  /**
   * Get file from S3/MinIO
   */
  async getFile(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.s3Client.send(command);
    const chunks: Buffer[] = [];

    if (response.Body instanceof Buffer) {
      return response.Body;
    }

    // Handle ReadableStream
    const stream = response.Body as any;
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  /**
   * Delete file from S3/MinIO
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  /**
   * Check if file exists
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.s3Client.send(command);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(key: string): Promise<FileMetadata | null> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      const metadata = response.Metadata || {};

      return {
        key,
        size: response.ContentLength || 0,
        mimeType: response.ContentType || 'application/octet-stream',
        uploadedAt: response.LastModified || new Date(),
        organizationId: metadata['org-id'] || '',
        uploadedBy: metadata['uploaded-by'] || '',
        checksum: response.ETag?.replace(/"/g, '') || '',
      };
    } catch {
      return null;
    }
  }

  /**
   * Cleanup expired files (call periodically)
   */
  async cleanupExpiredFiles(organizationId: string): Promise<number> {
    // This would typically iterate through org files and delete expired ones
    // Implementation depends on S3 listing capabilities
    return 0;
  }
}

export default new FileStorageService();
