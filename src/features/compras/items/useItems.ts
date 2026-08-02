import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActiveProject } from '@/features/onboarding/useProjectMembership';
import { useRealtimeSync } from '@/lib/realtime';
import {
  createItem,
  deleteItem,
  deleteItems,
  duplicateItem,
  listItemsForProject,
  moveItems,
  updateItem,
  type ItemInput,
} from '@/lib/items';
import type { Item, ItemPriority, ItemStatus } from '@/types/purchases';

/**
 * Query keys for items. Stable so realtime invalidation and manual
 * refetches hit the same cache entries.
 */
export const itemsKeys = {
  all: ['items'] as const,
  project: (projectId: string) => ['items', 'project', projectId] as const,
};

/**
 * Live list of ALL items for the active project (regardless of selected
 * room). Filtering by room happens client-side in the UI, so the dashboard
 * and the room list stay in sync from one cache entry. Subscribes to
 * realtime changes on the `items` table and invalidates on any event.
 */
export function useItems() {
  const { data: active } = useActiveProject();
  const projectId = active?.project.id ?? '';
  const enabled = !!active?.project.id;

  useRealtimeSync('items', ['items'], enabled);

  return useQuery<Item[]>({
    queryKey: itemsKeys.project(projectId),
    queryFn: () => listItemsForProject(projectId),
    enabled,
  });
}

/** Create an item with an optimistic insert into the cached list. */
export function useCreateItem() {
  const queryClient = useQueryClient();
  const { data: active } = useActiveProject();
  const projectId = active?.project.id ?? '';

  return useMutation({
    mutationFn: createItem,
    onMutate: async (input) => {
      const key = itemsKeys.project(projectId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Item[]>(key);
      const optimistic: Item = {
        id: `temp-${Date.now()}`,
        room_id: input.room_id,
        name: input.name,
        description: input.description ?? null,
        priority: (input.priority ?? 'medium') as ItemPriority,
        status: (input.status ?? 'planned') as ItemStatus,
        notes: input.notes ?? null,
        sort_order: input.sort_order ?? 0,
        category: input.category ?? null,
        quantity: input.quantity ?? 1,
        unit: input.unit ?? null,
        estimated_price: input.estimated_price ?? null,
        paid_price: input.paid_price ?? null,
        store: input.store ?? null,
        link: input.link ?? null,
        image: input.image ?? null,
        celebrated_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      queryClient.setQueryData<Item[]>(key, (old) => [optimistic, ...(old ?? [])]);
      return { previous, key };
    },
    onError: (_e, _v, ctx) => {
      if (ctx) queryClient.setQueryData(ctx.key, ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: itemsKeys.all });
    },
  });
}

/** Update an item with an optimistic patch to the cached list. */
export function useUpdateItem() {
  const queryClient = useQueryClient();
  const { data: active } = useActiveProject();
  const projectId = active?.project.id ?? '';

  return useMutation({
    mutationFn: ({ itemId, patch }: { itemId: string; patch: Partial<ItemInput> }) =>
      updateItem(itemId, patch),
    onMutate: async ({ itemId, patch }) => {
      const key = itemsKeys.project(projectId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Item[]>(key);
      queryClient.setQueryData<Item[]>(key, (old) =>
        (old ?? []).map((it) =>
          it.id === itemId ? { ...it, ...patch, updated_at: new Date().toISOString() } : it
        )
      );
      return { previous, key };
    },
    onError: (_e, _v, ctx) => {
      if (ctx) queryClient.setQueryData(ctx.key, ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: itemsKeys.all });
    },
  });
}

/** Delete a single item with an optimistic removal. */
export function useDeleteItem() {
  const queryClient = useQueryClient();
  const { data: active } = useActiveProject();
  const projectId = active?.project.id ?? '';

  return useMutation({
    mutationFn: deleteItem,
    onMutate: async (itemId) => {
      const key = itemsKeys.project(projectId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Item[]>(key);
      queryClient.setQueryData<Item[]>(key, (old) => (old ?? []).filter((it) => it.id !== itemId));
      return { previous, key };
    },
    onError: (_e, _v, ctx) => {
      if (ctx) queryClient.setQueryData(ctx.key, ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: itemsKeys.all });
    },
  });
}

/** Delete multiple items at once with an optimistic batch removal. */
export function useDeleteItems() {
  const queryClient = useQueryClient();
  const { data: active } = useActiveProject();
  const projectId = active?.project.id ?? '';

  return useMutation({
    mutationFn: deleteItems,
    onMutate: async (itemIds) => {
      const key = itemsKeys.project(projectId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Item[]>(key);
      const remove = new Set(itemIds);
      queryClient.setQueryData<Item[]>(key, (old) => (old ?? []).filter((it) => !remove.has(it.id)));
      return { previous, key };
    },
    onError: (_e, _v, ctx) => {
      if (ctx) queryClient.setQueryData(ctx.key, ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: itemsKeys.all });
    },
  });
}

/** Duplicate an item (server returns the new row; optimistic append). */
export function useDuplicateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: duplicateItem,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: itemsKeys.all });
    },
  });
}

/** Move items to a different room with an optimistic patch. */
export function useMoveItems() {
  const queryClient = useQueryClient();
  const { data: active } = useActiveProject();
  const projectId = active?.project.id ?? '';

  return useMutation({
    mutationFn: ({ itemIds, toRoomId }: { itemIds: string[]; toRoomId: string }) =>
      moveItems(itemIds, toRoomId),
    onMutate: async ({ itemIds, toRoomId }) => {
      const key = itemsKeys.project(projectId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Item[]>(key);
      const move = new Set(itemIds);
      queryClient.setQueryData<Item[]>(key, (old) =>
        (old ?? []).map((it) =>
          move.has(it.id) ? { ...it, room_id: toRoomId, updated_at: new Date().toISOString() } : it
        )
      );
      return { previous, key };
    },
    onError: (_e, _v, ctx) => {
      if (ctx) queryClient.setQueryData(ctx.key, ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: itemsKeys.all });
    },
  });
}

/**
 * Derived dashboard metrics computed from the cached item list. Recomputes
 * whenever the items data changes (incl. realtime updates). No extra
 * network round-trip — purely client-side aggregation.
 */
export interface PurchasesStats {
  total: number;
  purchased: number;
  pending: number;
  progressPct: number;
  budgetEstimated: number;
  budgetPaid: number;
  savings: number;
  byRoom: { roomId: string; roomName: string; count: number }[];
  byCategory: { category: string | null; count: number }[];
}

/** Compute dashboard stats from a list of items + room lookup. */
export function useItemsStats(
  items: Item[] | undefined,
  rooms: { id: string; name: string }[]
): PurchasesStats {
  return useMemo(() => {
    const total = items?.length ?? 0;
    const purchased = items?.filter((i) => i.status === 'purchased' || i.status === 'delivered' || i.status === 'installed').length ?? 0;
    const pending = total - purchased;
    const progressPct = total === 0 ? 0 : Math.round((purchased / total) * 100);

    const budgetEstimated =
      items?.reduce((sum, i) => sum + (i.estimated_price ? Number(i.estimated_price) : 0), 0) ?? 0;
    // Only realized purchases count as spent — a paid_price filled in on a
    // still-planned item is a negotiated estimate, not money out.
    const isRealized = (s: Item['status']) =>
      s === 'purchased' || s === 'delivered' || s === 'installed';
    const budgetPaid =
      items?.reduce(
        (sum, i) => sum + (isRealized(i.status) && i.paid_price ? Number(i.paid_price) : 0),
        0
      ) ?? 0;
    const savings = budgetEstimated - budgetPaid;

    const roomMap = new Map(rooms.map((r) => [r.id, r.name]));
    const byRoomMap = new Map<string, number>();
    items?.forEach((i) => {
      byRoomMap.set(i.room_id, (byRoomMap.get(i.room_id) ?? 0) + 1);
    });
    const byRoom = Array.from(byRoomMap.entries()).map(([roomId, count]) => ({
      roomId,
      roomName: roomMap.get(roomId) ?? 'Ambiente',
      count,
    }));

    const byCatMap = new Map<string | null, number>();
    items?.forEach((i) => {
      const k = i.category ?? null;
      byCatMap.set(k, (byCatMap.get(k) ?? 0) + 1);
    });
    const byCategory = Array.from(byCatMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total,
      purchased,
      pending,
      progressPct,
      budgetEstimated,
      budgetPaid,
      savings,
      byRoom,
      byCategory,
    };
  }, [items, rooms]);
}
