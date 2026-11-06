import { clearSession, getToken } from './auth';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function api<T>(path: string, options: RequestInit = {}, auth = true): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (auth) {
    const token = getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(path, { ...options, headers });
  const text = await response.text();

  let payload: { error?: string } = {};
  if (text) {
    try {
      payload = JSON.parse(text) as { error?: string };
    } catch {
      payload = { error: 'Unexpected response from the server' };
    }
  }

  if (!response.ok) {
    const invalidToken = response.status === 403 && payload.error === 'Invalid or expired token';
    if (auth && (response.status === 401 || invalidToken) && typeof window !== 'undefined') {
      const pathName = window.location.pathname;
      const onAuthPage = pathName.startsWith('/login') || pathName.startsWith('/signup');
      if (!onAuthPage) {
        clearSession();
        window.location.assign('/login');
      }
    }
    throw new ApiError(payload.error || `Request failed (${response.status})`, response.status);
  }

  return payload as T;
}
