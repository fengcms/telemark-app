import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { changePassword, login, logout } from '@/api/endpoints';
import {
  clearStoredSession,
  getStoredSession,
  setStoredSession,
} from '@/store/auth';
import type { AuthSession } from '@/types';
import { sha256 } from '@/utils/crypto';

type AuthContextValue = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() =>
    getStoredSession(),
  );

  const signIn = useCallback(async (username: string, password: string) => {
    const hashedPassword = await sha256(password);
    const nextSession = await login(username, hashedPassword);
    setStoredSession(nextSession);
    setSession(nextSession);
  }, []);

  const signOut = useCallback(async () => {
    const currentSession = getStoredSession();

    try {
      if (currentSession?.refreshToken) {
        await logout(currentSession.refreshToken);
      }
    } finally {
      clearStoredSession();
      setSession(null);
    }
  }, []);

  const updatePassword = useCallback(
    async (oldPassword: string, newPassword: string) => {
      await changePassword(
        await sha256(oldPassword),
        await sha256(newPassword),
      );
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session?.accessToken),
      signIn,
      signOut,
      updatePassword,
    }),
    [session, signIn, signOut, updatePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return value;
}
