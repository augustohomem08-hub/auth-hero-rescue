import { supabase } from '@/lib/supabase';

/**
 * Lightweight profile directory. The authoritative display name still lives
 * in the Supabase auth user metadata, but other members of a project cannot
 * read another user's auth record — so each user mirrors their own name and
 * e-mail into `public.profiles`, which co-members are allowed to read.
 */
export interface Profile {
  id: string;
  display_name: string | null;
  email: string | null;
}

const SELECT = 'id, display_name, email';

/** Mirror the signed-in user's name/e-mail into the profiles directory. */
export async function upsertOwnProfile(opts: {
  id: string;
  displayName?: string | null;
  email?: string | null;
}): Promise<void> {
  await supabase.from('profiles').upsert(
    {
      id: opts.id,
      display_name: opts.displayName ?? null,
      email: opts.email ?? null,
    },
    { onConflict: 'id' }
  );
}

/** Fetch the profiles of a set of user ids (RLS limits this to co-members). */
export async function listProfiles(userIds: string[]): Promise<Profile[]> {
  if (userIds.length === 0) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select(SELECT)
    .in('id', userIds);
  if (error) throw error;
  return (data as Profile[]) ?? [];
}

/** Human name from an e-mail's local part ("ana.silva" → "Ana Silva"). */
export function nameFromEmail(email?: string | null): string {
  if (!email) return '';
  const local = email.split('@')[0] ?? '';
  return local.replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Preferred display name: explicit name first, e-mail-derived fallback. */
export function displayNameFor(
  profile?: { display_name?: string | null; email?: string | null } | null,
  fallback = 'Membro'
): string {
  const name = profile?.display_name?.trim();
  if (name) return name;
  const fromEmail = nameFromEmail(profile?.email);
  return fromEmail || fallback;
}
