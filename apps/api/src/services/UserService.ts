import { prisma } from '../index';
import {
  hashPassword,
  verifyPassword,
  generateSecureToken,
  validatePassword,
  validateEmail,
} from '../utils/auth';

export interface RegisterInput {
  email: string;
  password: string;
  organizationName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export class UserService {
  async register(input: RegisterInput) {
    // Validate inputs
    if (!validateEmail(input.email)) {
      throw new Error('Invalid email address');
    }

    const passwordValidation = validatePassword(input.password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    if (!input.organizationName || input.organizationName.trim().length === 0) {
      throw new Error('Organization name is required');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(input.password);

    // Create user and organization in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: input.email,
          passwordHash,
          emailVerified: false,
        },
      });

      // Create organization with slug
      const slug = this.generateSlug(input.organizationName);
      const organization = await tx.organization.create({
        data: {
          name: input.organizationName,
          slug,
          ownerId: user.id,
        },
      });

      // Add user as owner of organization
      await tx.organizationMembership.create({
        data: {
          organizationId: organization.id,
          userId: user.id,
          role: 'owner',
        },
      });

      return { user, organization };
    });

    // Generate email verification token
    const verificationToken = generateSecureToken();
    // TODO: Store token with expiration and send email

    return {
      userId: result.user.id,
      email: result.user.email,
      organizationId: result.organization.id,
      message: 'Registration successful. Please verify your email.',
    };
  }

  async login(input: LoginInput) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      // Don't reveal if user exists
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await verifyPassword(input.password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new Error('Please verify your email before logging in');
    }

    // Get user's organizations
    const memberships = await prisma.organizationMembership.findMany({
      where: { userId: user.id },
      include: { organization: true },
    });

    return {
      userId: user.id,
      email: user.email,
      mfaEnabled: user.mfaEnabled,
      organizations: memberships.map((m) => ({
        id: m.organization.id,
        name: m.organization.name,
        role: m.role,
      })),
    };
  }

  async verifyEmail(userId: string, token: string) {
    // TODO: Verify token and mark email as verified
    const user = await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });

    return { email: user.email, verified: true };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid current password');
    }

    // Validate new password
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Hash and update
    const newHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return { message: 'Password changed successfully' };
  }

  private generateSlug(organizationName: string): string {
    return (
      organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50) +
      '-' +
      Math.random().toString(36).substring(2, 10)
    );
  }
}

export const userService = new UserService();
