import crypto from 'crypto';

interface EncryptedData {
  encrypted: Buffer;
  iv: Buffer;
  tag: Buffer;
}

export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private keyLength = 32; // 256 bits
  private ivLength = 12; // 96 bits for GCM
  private tagLength = 16; // 128 bits

  /**
   * Derive encryption key from master key and org ID
   */
  private deriveKey(organizationId: string): Buffer {
    const masterKey = process.env.LOCAL_ENCRYPTION_KEY ||
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

    const salt = crypto.createHash('sha256').update(organizationId).digest();

    // PBKDF2 derivation
    return crypto.pbkdf2Sync(
      masterKey,
      salt,
      100000, // iterations
      this.keyLength,
      'sha256'
    );
  }

  /**
   * Encrypt file data
   */
  encryptFile(
    fileBuffer: Buffer,
    organizationId: string,
    associatedData?: string
  ): EncryptedData {
    const key = this.deriveKey(organizationId);
    const iv = crypto.randomBytes(this.ivLength);

    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    // Add associated data for authentication
    if (associatedData) {
      cipher.setAAD(Buffer.from(associatedData, 'utf8'));
    }

    let encrypted = cipher.update(fileBuffer);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv,
      tag,
    };
  }

  /**
   * Decrypt file data
   */
  decryptFile(
    encrypted: Buffer,
    iv: Buffer,
    tag: Buffer,
    organizationId: string,
    associatedData?: string
  ): Buffer {
    const key = this.deriveKey(organizationId);

    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(tag);

    // Verify associated data
    if (associatedData) {
      decipher.setAAD(Buffer.from(associatedData, 'utf8'));
    }

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted;
  }

  /**
   * Generate HMAC for file integrity verification
   */
  generateHMAC(fileBuffer: Buffer, key: string): string {
    return crypto
      .createHmac('sha256', key)
      .update(fileBuffer)
      .digest('hex');
  }

  /**
   * Verify file integrity
   */
  verifyIntegrity(fileBuffer: Buffer, hmac: string, key: string): boolean {
    const computedHmac = this.generateHMAC(fileBuffer, key);
    return crypto.timingSafeEqual(
      Buffer.from(computedHmac),
      Buffer.from(hmac)
    );
  }

  /**
   * Securely wipe sensitive data from memory
   */
  secureClear(buffer: Buffer): void {
    buffer.fill(0);
  }
}

export default new EncryptionService();
