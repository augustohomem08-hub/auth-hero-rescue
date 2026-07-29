import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { getActiveProject, listProjectsForUser } from '@/lib/project';
import type { ActiveProject, Project } from '@/types/project';

/**
 * Query keys for project-related data. Keep stable so realtime invalidation
 * (src/lib/realtime.ts) and manual refetches hit the same cache entries.
 */
export const projectKeys = {
  all: ['projects'] as const,
  active: () => ['projects', 'active'] as const,
  list: () => ['projects', 'list'] as const,
};

/**
 * The current user's active project + membership + members. Returns null
 * when the user does not belong to any project (the onboarding flow uses
 * this to decide whether to show the Create/Join screen).
 */
export function useActiveProject() {
  const { user, status } = useAuth();

  return useQuery<ActiveProject | null>({
    queryKey: projectKeys.active(),
    queryFn: () => (user ? getActiveProject(user.id) : Promise.resolve(null)),
    enabled: status === 'authenticated' && !!user,
  });
}

/** All projects the current user belongs to. */
export function useProjectsForUser() {
  const { user, status } = useAuth();

  return useQuery<Project[]>({
    queryKey: projectKeys.list(),
    queryFn: () => (user ? listProjectsForUser(user.id) : Promise.resolve([])),
    enabled: status === 'authenticated' && !!user,
  });
}
