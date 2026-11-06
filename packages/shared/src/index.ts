// Shared types, utilities, and constants for SFX

export interface ApiResponse<T> {
  data: T;
  error?: string;
  timestamp: string;
}

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
}

export type UserRole = 'owner' | 'admin' | 'member';

export interface OrganizationMembership {
  id: string;
  organizationId: string;
  userId: string;
  role: UserRole;
}

export const API_ROUTES = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    VERIFY_EMAIL: '/api/auth/verify-email',
    PASSWORD_RESET_REQUEST: '/api/auth/password-reset-request',
    PASSWORD_RESET: '/api/auth/password-reset',
    MFA_SETUP: '/api/auth/mfa-setup',
    MFA_VERIFY: '/api/auth/mfa-verify',
  },
  ORGANIZATIONS: {
    CREATE: '/api/organizations',
    GET: '/api/organizations/:id',
    UPDATE: '/api/organizations/:id',
    MEMBERS: '/api/organizations/:id/members',
    INVITE: '/api/organizations/:id/invitations',
  },
  FILES: {
    INITIALIZE_UPLOAD: '/api/files/initialize-upload',
    COMPLETE_UPLOAD: '/api/files/complete-upload',
    DOWNLOAD: '/api/files/:id/download',
    INFO: '/api/files/:id',
  },
} as const;
