import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthContext } from './auth-context';
import type { AuthStatus } from './auth-context';

/**
 * Email/password auth provider. No sign-in UI is shipped here — screens
 * will consume `useAuth()` to drive signUp/signIn. Handles the onAuthStateChange
 * deadlock guard by wrapping async work in an IIFE.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let mounted = true;

    // Bootstrap the current session on mount.
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      setStatus(data.session ? 'authenticated' : 'unauthenticated');
    })();

    // Subscribe to auth state changes. The callback runs synchronously during
    // event processing, so any async work is wrapped to avoid deadlocking.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      (async () => {
        setSession(next);
        setStatus(next ? 'authenticated' : 'unauthenticated');
      })();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: translateAuthError(error) };
    // When e-mail confirmation is enabled no session is returned; tell the user
    // instead of silently sending them to a screen that bounces back.
    if (!data.session) {
      return {
        error: 'Conta criada! Confirme o e-mail enviado para você antes de entrar.',
      };
    }
    return { error: null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? translateAuthError(error) : null };
  }, []);


  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo(
    () => ({
      status,
      session,
      user: session?.user ?? null,
      signUp,
      signIn,
      signOut,
    }),
    [status, session, signUp, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (m.includes('user already registered')) return 'Este e-mail já está cadastrado.';
  if (m.includes('password should be at least'))
    return 'A senha deve ter pelo menos 6 caracteres.';
  if (m.includes('unable to validate email')) return 'E-mail inválido.';
  return 'Não foi possível completar a ação. Tente novamente.';
}

export type { Session, User };
