export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
}

export interface SessionOrg {
  id: string;
  name?: string;
}

export interface Session {
  token: string;
  user: SessionUser;
  organization: SessionOrg;
}

export interface AuthResponse {
  token: string;
  user: SessionUser;
  organization: SessionOrg;
}

export interface DashboardStats {
  totalFiles: number;
  sharedToday: number;
  activeLinks: number;
  totalDownloads: number;
}

export interface RecentFile {
  id: string;
  name: string;
  size: string;
  sharedDate: string;
  downloads: number;
  status: 'active' | 'expired' | string;
}

export interface FileRecord {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  createdAt: string;
  expiresAt: string;
  downloadCount: number;
  maxDownloads: number;
  requirePassword: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string | null;
  createdAt: string;
  user: { id: string; email: string; name: string | null } | null;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedDate: string;
  status: string;
}

export interface OrgSettings {
  id: string;
  organizationId: string;
  organizationName?: string;
  defaultExpiration: number;
  maxDownloads: number;
  requirePassword: boolean;
  enableEmailNotify: boolean;
  enableTwoFactor: boolean;
}
