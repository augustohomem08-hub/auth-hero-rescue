import { createContext, useContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthContextValue {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  /** Sign up with email + password. Returns error message on failure. */
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  /** Sign in with email + password. Returns error message on failure. */
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  /** End the current session. */
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

/**
 * Hook for screens that require an authenticated session.
 * Use inside a component rendered by AuthProvider. Returns the user once
 * authenticated; while loading or unauthenticated the caller should render
 * its own guard (e.g. redirect to a sign-in screen — to be built later).
 */
export function useRequireAuth(): AuthContextValue {
  return useAuth();
}
