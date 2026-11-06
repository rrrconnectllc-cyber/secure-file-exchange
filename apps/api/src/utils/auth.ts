import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const SALT_ROUNDS = 12; // Argon2-strength bcrypt rounds
const TOKEN_BYTES = 32; // 256-bit tokens

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateSecureToken(): string {
  return randomBytes(TOKEN_BYTES).toString('hex');
}

export function hashToken(token: string): string {
  return randomBytes(16).toString('hex') + '_' + token.substring(0, 8);
}

export interface SessionData {
  userId: string;
  email: string;
  organizationId?: string;
  organizationRole?: string;
  mfaVerified: boolean;
  createdAt: Date;
  lastActivityAt: Date;
}

export interface AuthContext {
  userId: string;
  email: string;
  organizationId?: string;
  organizationRole?: 'owner' | 'admin' | 'member';
  mfaVerified: boolean;
  isAuthenticated: boolean;
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 12) {
    errors.push('Password must be at least 12 characters');
  }

  // Additional strength checks can be added here
  // For now, we require minimum 12 chars

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}
