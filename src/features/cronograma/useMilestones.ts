import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActiveProject } from '@/features/onboarding/useProjectMembership';
import { useRealtimeSync } from '@/lib/realtime';
import {
  createMilestone,
  deleteMilestone,
  listMilestonesForProject,
  updateMilestone,
  type MilestoneInput,
} from '@/lib/milestones';
import type { Milestone } from '@/types/cronograma';

export const milestonesKeys = {
  all: ['milestones'] as const,
  project: (projectId: string) => ['milestones', 'project', projectId] as const,
};

/** Live list of milestones for the active project with realtime sync. */
export function useMilestones() {
  const { data: active } = useActiveProject();
  const projectId = active?.project.id ?? '';
  const enabled = !!active?.project.id;

  useRealtimeSync('milestones', ['milestones'], enabled);

  return useQuery<Milestone[]>({
    queryKey: milestonesKeys.project(projectId),
    queryFn: () => listMilestonesForProject(projectId),
    enabled,
  });
}

export function useCreateMilestone() {
  const queryClient = useQueryClient();
  const { data: active } = useActiveProject();
  const projectId = active?.project.id ?? '';

  return useMutation({
    mutationFn: (input: MilestoneInput) => createMilestone(projectId, input),
    onMutate: async (input) => {
      const key = milestonesKeys.project(projectId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Milestone[]>(key);
      const optimistic: Milestone = {
        id: `temp-${Date.now()}`,
        project_id: projectId,
        title: input.title,
        description: input.description ?? null,
        date: input.date ?? null,
        status: input.status ?? 'planned',
        owner_id: input.owner_id ?? null,
        sort_order: input.sort_order ?? 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      queryClient.setQueryData<Milestone[]>(key, (old) => [...(old ?? []), optimistic]);
      return { previous, key };
    },
    onError: (_e, _v, ctx) => {
      if (ctx) queryClient.setQueryData(ctx.key, ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: milestonesKeys.all });
    },
  });
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient();
  const { data: active } = useActiveProject();
  const projectId = active?.project.id ?? '';

  return useMutation({
    mutationFn: ({ milestoneId, patch }: { milestoneId: string; patch: Partial<MilestoneInput> }) =>
      updateMilestone(milestoneId, patch),
    onMutate: async ({ milestoneId, patch }) => {
      const key = milestonesKeys.project(projectId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Milestone[]>(key);
      queryClient.setQueryData<Milestone[]>(key, (old) =>
        (old ?? []).map((m) =>
          m.id === milestoneId ? { ...m, ...patch, updated_at: new Date().toISOString() } : m
        )
      );
      return { previous, key };
    },
    onError: (_e, _v, ctx) => {
      if (ctx) queryClient.setQueryData(ctx.key, ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: milestonesKeys.all });
    },
  });
}

export function useDeleteMilestone() {
  const queryClient = useQueryClient();
  const { data: active } = useActiveProject();
  const projectId = active?.project.id ?? '';

  return useMutation({
    mutationFn: deleteMilestone,
    onMutate: async (milestoneId) => {
      const key = milestonesKeys.project(projectId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Milestone[]>(key);
      queryClient.setQueryData<Milestone[]>(key, (old) =>
        (old ?? []).filter((m) => m.id !== milestoneId)
      );
      return { previous, key };
    },
    onError: (_e, _v, ctx) => {
      if (ctx) queryClient.setQueryData(ctx.key, ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: milestonesKeys.all });
    },
  });
}

export interface MilestoneStats {
  total: number;
  done: number;
  inProgress: number;
  planned: number;
  delayed: number;
  progressPct: number;
  upcoming: Milestone | null;
}

export function useMilestoneStats(milestones: Milestone[] | undefined): MilestoneStats {
  return useMemo(() => {
    const list = milestones ?? [];
    const total = list.length;
    const done = list.filter((m) => m.status === 'done').length;
    const inProgress = list.filter((m) => m.status === 'in_progress').length;
    const planned = list.filter((m) => m.status === 'planned').length;
    const delayed = list.filter((m) => m.status === 'delayed').length;
    const progressPct = total === 0 ? 0 : Math.round((done / total) * 100);

    const today = new Date().toISOString().slice(0, 10);
    const upcoming =
      list
        .filter((m) => m.date && m.date >= today && m.status !== 'done' && m.status !== 'cancelled')
        .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))[0] ?? null;

    return { total, done, inProgress, planned, delayed, progressPct, upcoming };
  }, [milestones]);
}
