import type { AuthSession } from '@/types';

const SESSION_KEY = 'telemark.auth.session';

export function getStoredSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function setStoredSession(session: AuthSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function updateStoredAccessToken(accessToken: string) {
  const session = getStoredSession();
  if (!session) {
    return;
  }

  setStoredSession({ ...session, accessToken });
}
