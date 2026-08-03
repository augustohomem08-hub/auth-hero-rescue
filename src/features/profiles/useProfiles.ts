import { useQuery } from '@tanstack/react-query';
import { listProfiles, type Profile } from '@/lib/profiles';

export const profileKeys = {
  all: ['profiles'] as const,
  list: (ids: string[]) => ['profiles', 'list', [...ids].sort().join(',')] as const,
};

/**
 * Profiles for a set of user ids, returned as a lookup map so components can
 * render real names instead of generic role labels.
 */
export function useProfiles(userIds: string[]) {
  const ids = [...new Set(userIds)].filter(Boolean);

  const query = useQuery<Profile[]>({
    queryKey: profileKeys.list(ids),
    queryFn: () => listProfiles(ids),
    enabled: ids.length > 0,
    staleTime: 60_000,
  });

  const map = new Map<string, Profile>();
  (query.data ?? []).forEach((p) => map.set(p.id, p));

  return { ...query, profiles: map };
}
