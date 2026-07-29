import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActiveProject } from '@/features/onboarding/useProjectMembership';
import { useAuth } from '@/contexts/auth-context';
import { useRealtimeSync } from '@/lib/realtime';
import {
  createMemory,
  createMemoryWithImage,
  deleteMemory,
  listMemoriesForProject,
  updateMemory,
  type MemoryInput,
} from '@/lib/memories';
import type { Memory } from '@/types/jornada';

export const memoriesKeys = {
  all: ['memories'] as const,
  project: (projectId: string) => ['memories', 'project', projectId] as const,
};

/** Live list of memories for the active project with realtime sync. */
export function useMemories() {
  const { data: active } = useActiveProject();
  const projectId = active?.project.id ?? '';
  const enabled = !!active?.project.id;

  useRealtimeSync('memories', ['memories'], enabled);

  return useQuery<Memory[]>({
    queryKey: memoriesKeys.project(projectId),
    queryFn: () => listMemoriesForProject(projectId),
    enabled,
  });
}

/** Create a memory — with image if a file is provided, text-only otherwise. */
export function useCreateMemory() {
  const queryClient = useQueryClient();
  const { data: active } = useActiveProject();
  const { user } = useAuth();
  const projectId = active?.project.id ?? '';

  return useMutation({
    mutationFn: ({ input, file }: { input: MemoryInput; file?: File | null }) => {
      if (file) {
        return createMemoryWithImage(projectId, file, user?.id ?? '', input);
      }
      return createMemory(projectId, input);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: memoriesKeys.all });
    },
  });
}

export function useUpdateMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memoryId, patch }: { memoryId: string; patch: Partial<MemoryInput> }) =>
      updateMemory(memoryId, patch),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: memoriesKeys.all });
    },
  });
}

export function useDeleteMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMemory,
    onMutate: async (memory) => {
      const key = memoriesKeys.project(memory.project_id);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Memory[]>(key);
      queryClient.setQueryData<Memory[]>(key, (old) =>
        (old ?? []).filter((m) => m.id !== memory.id)
      );
      return { previous, key };
    },
    onError: (_e, _v, ctx) => {
      if (ctx) queryClient.setQueryData(ctx.key, ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: memoriesKeys.all });
    },
  });
}
