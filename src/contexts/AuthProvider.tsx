import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthError, Session, User } from '@supabase/supabase-js';
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
    // Drop every cached project/module query so the next account never sees
    // the previous user's data while its queries refetch.
    queryClient.clear();
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

/**
 * Turns a Supabase AuthError into an actionable pt-BR message.
 *
 * The generic fallback is a last resort only: mapping every unknown error to
 * "não foi possível completar a ação" hid real causes (e.g. the project has
 * leaked-password protection enabled, which rejects weak/pwned passwords).
 */
function translateAuthError(error: AuthError): string {
  const code = error.code ?? '';
  const m = (error.message ?? '').toLowerCase();

  if (code === 'weak_password' || m.includes('password is known to be weak') || m.includes('pwned'))
    return 'Essa senha é muito comum e foi vazada em outros sites. Escolha uma senha mais forte (misture letras, números e símbolos).';
  if (code === 'invalid_credentials' || m.includes('invalid login credentials'))
    return 'E-mail ou senha incorretos.';
  if (code === 'user_already_exists' || m.includes('already registered'))
    return 'Este e-mail já está cadastrado. Faça login.';
  if (code === 'email_exists') return 'Este e-mail já está cadastrado. Faça login.';
  if (code === 'weak_password' || m.includes('password should be at least'))
    return 'A senha deve ter pelo menos 6 caracteres.';
  if (code === 'email_address_invalid' || m.includes('unable to validate email'))
    return 'E-mail inválido.';
  if (code === 'email_not_confirmed') return 'Confirme seu e-mail antes de entrar.';
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit')
    return 'Muitas tentativas. Aguarde alguns instantes e tente novamente.';
  if (code === 'signup_disabled') return 'Cadastro desativado no momento.';
  if (m.includes('failed to fetch') || m.includes('network'))
    return 'Falha de conexão com o servidor. Verifique sua internet e tente novamente.';

  // Surface the real reason instead of hiding it.
  return error.message || 'Não foi possível completar a ação. Tente novamente.';
}


export type { Session, User };
