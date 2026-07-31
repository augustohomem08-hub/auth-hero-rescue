import { redirect } from '@tanstack/react-router';
import { supabase } from '@/lib/supabase';

/**
 * Route-level authentication guard.
 *
 * Used as `beforeLoad` on every authenticated route so unauthenticated
 * visitors are redirected to `/entrar` BEFORE the page component renders
 * (no content flash). All protected routes declare `ssr: false`, so this
 * runs client-side where the Supabase session lives in localStorage.
 *
 * RLS policies remain the second (authoritative) layer of defence.
 */
export async function requireAuth() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw redirect({ to: '/entrar', replace: true });
  }
  return { user: data.user };
}
