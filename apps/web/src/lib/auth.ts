import type { Session, SessionOrg, SessionUser } from './types';

const TOKEN_KEY = 'sfx_token';
const SESSION_KEY = 'sfx_session';

interface StoredSession {
  user: SessionUser;
  organization: SessionOrg;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function readSession(): Session | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(TOKEN_KEY);
  const raw = localStorage.getItem(SESSION_KEY);
  if (!token || !raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed.user?.email || !parsed.organization?.id) return null;
    return { token, user: parsed.user, organization: parsed.organization };
  } catch {
    return null;
  }
}

export function saveSession(session: Session, remember: boolean): void {
  const stored: StoredSession = {
    user: session.user,
    organization: session.organization,
  };
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(SESSION_KEY, JSON.stringify(stored));
  const maxAge = remember ? `; max-age=${60 * 60 * 24 * 30}` : '';
  document.cookie = `sfx_session=1; path=/; samesite=lax${maxAge}`;
}

export function updateOrganizationName(name: string): void {
  const session = readSession();
  if (!session) return;
  const stored: StoredSession = {
    user: session.user,
    organization: { ...session.organization, name },
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(stored));
  window.dispatchEvent(new Event('sfx-session'));
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
  document.cookie = 'sfx_session=; path=/; max-age=0; samesite=lax';
}

export function safeRedirect(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/dashboard';
  }
  return value;
}
