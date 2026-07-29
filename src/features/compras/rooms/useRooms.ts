import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActiveProject } from '@/features/onboarding/useProjectMembership';
import { useRealtimeSync } from '@/lib/realtime';
import { createRoom, deleteRoom, listRooms, updateRoom } from '@/lib/rooms';
import type { Room } from '@/types/purchases';

/**
 * Query keys for rooms. Stable so realtime invalidation and manual
 * refetches hit the same cache entries.
 */
export const roomsKeys = {
  all: ['rooms'] as const,
  list: (projectId: string) => ['rooms', 'list', projectId] as const,
};

/**
 * Live list of rooms for the active project. Subscribes to realtime changes
 * on the `rooms` table and invalidates the cache on any event.
 */
export function useRooms() {
  const { data: active } = useActiveProject();
  const projectId = active?.project.id ?? '';
  const enabled = !!active?.project.id;

  useRealtimeSync('rooms', ['rooms'], enabled);

  return useQuery<Room[]>({
    queryKey: roomsKeys.list(projectId),
    queryFn: () => listRooms(projectId),
    enabled,
  });
}

/** Create a room with an optimistic insert into the cached list. */
export function useCreateRoom() {
  const queryClient = useQueryClient();
  const { data: active } = useActiveProject();
  const projectId = active?.project.id ?? '';

  return useMutation({
    mutationFn: createRoom,
    onMutate: async (input) => {
      const key = roomsKeys.list(projectId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Room[]>(key);
      const optimistic: Room = {
        id: `temp-${Date.now()}`,
        project_id: input.projectId,
        name: input.name,
        icon: input.icon ?? 'home',
        color: input.color ?? 'primary',
        sort_order: input.sortOrder ?? 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      queryClient.setQueryData<Room[]>(key, (old) => [...(old ?? []), optimistic]);
      return { previous, key };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx) queryClient.setQueryData(ctx.key, ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: roomsKeys.all });
    },
  });
}

/** Update a room with an optimistic patch to the cached list. */
export function useUpdateRoom() {
  const queryClient = useQueryClient();
  const { data: active } = useActiveProject();
  const projectId = active?.project.id ?? '';

  return useMutation({
    mutationFn: ({ roomId, patch }: { roomId: string; patch: Partial<Pick<Room, 'name' | 'icon' | 'color' | 'sort_order'>> }) =>
      updateRoom(roomId, patch),
    onMutate: async ({ roomId, patch }) => {
      const key = roomsKeys.list(projectId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Room[]>(key);
      queryClient.setQueryData<Room[]>(key, (old) =>
        (old ?? []).map((r) => (r.id === roomId ? { ...r, ...patch, updated_at: new Date().toISOString() } : r))
      );
      return { previous, key };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx) queryClient.setQueryData(ctx.key, ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: roomsKeys.all });
    },
  });
}

/** Delete a room with an optimistic removal from the cached list. */
export function useDeleteRoom() {
  const queryClient = useQueryClient();
  const { data: active } = useActiveProject();
  const projectId = active?.project.id ?? '';

  return useMutation({
    mutationFn: (roomId: string) => deleteRoom(roomId),
    onMutate: async (roomId) => {
      const key = roomsKeys.list(projectId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Room[]>(key);
      queryClient.setQueryData<Room[]>(key, (old) => (old ?? []).filter((r) => r.id !== roomId));
      return { previous, key };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx) queryClient.setQueryData(ctx.key, ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: roomsKeys.all });
    },
  });
}
