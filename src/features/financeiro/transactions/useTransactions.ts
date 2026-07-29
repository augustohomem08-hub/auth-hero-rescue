import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActiveProject } from '@/features/onboarding/useProjectMembership';
import { useRealtimeSync } from '@/lib/realtime';
import {
  createTransaction,
  deleteTransaction,
  deleteTransactions,
  listTransactionsForProject,
  updateTransaction,
  upsertMirrorTransaction,
  type TransactionInput,
} from '@/lib/transactions';
import type { Item } from '@/types/purchases';
import type { Transaction } from '@/types/finance';

/**
 * Query keys for transactions. Stable so realtime invalidation and manual
 * refetches hit the same cache entries.
 */
export const transactionsKeys = {
  all: ['transactions'] as const,
  project: (projectId: string) => ['transactions', 'project', projectId] as const,
};

/**
 * Live list of ALL transactions for the active project. Subscribes to
 * realtime changes on the `transactions` table and invalidates on any event.
 */
export function useTransactions() {
  const { data: active } = useActiveProject();
  const projectId = active?.project.id ?? '';
  const enabled = !!active?.project.id;

  useRealtimeSync('transactions', ['transactions'], enabled);

  return useQuery<Transaction[]>({
    queryKey: transactionsKeys.project(projectId),
    queryFn: () => listTransactionsForProject(projectId),
    enabled,
  });
}

/** Create a transaction with an optimistic insert into the cached list. */
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { data: active } = useActiveProject();
  const projectId = active?.project.id ?? '';

  return useMutation({
    mutationFn: (input: Omit<TransactionInput, 'project_id'>) =>
      createTransaction({ ...input, project_id: projectId }),
    onMutate: async (input) => {
      const key = transactionsKeys.project(projectId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Transaction[]>(key);
      const optimistic: Transaction = {
        id: `temp-${Date.now()}`,
        project_id: projectId,
        title: input.title,
        description: input.description ?? null,
        category: input.category ?? 'outros',
        type: input.type ?? 'expense',
        amount: input.amount ?? 0,
        date: input.date ?? new Date().toISOString().slice(0, 10),
        notes: input.notes ?? null,
        source_item_id: input.source_item_id ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      queryClient.setQueryData<Transaction[]>(key, (old) => [optimistic, ...(old ?? [])]);
      return { previous, key };
    },
    onError: (_e, _v, ctx) => {
      if (ctx) queryClient.setQueryData(ctx.key, ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: transactionsKeys.all });
    },
  });
}

/** Update a transaction with an optimistic patch to the cached list. */
export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  const { data: active } = useActiveProject();
  const projectId = active?.project.id ?? '';

  return useMutation({
    mutationFn: ({ transactionId, patch }: { transactionId: string; patch: Partial<TransactionInput> }) =>
      updateTransaction(transactionId, patch),
    onMutate: async ({ transactionId, patch }) => {
      const key = transactionsKeys.project(projectId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Transaction[]>(key);
      queryClient.setQueryData<Transaction[]>(key, (old) =>
        (old ?? []).map((t) =>
          t.id === transactionId ? { ...t, ...patch, updated_at: new Date().toISOString() } : t
        )
      );
      return { previous, key };
    },
    onError: (_e, _v, ctx) => {
      if (ctx) queryClient.setQueryData(ctx.key, ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: transactionsKeys.all });
    },
  });
}

/** Delete a single transaction with an optimistic removal. */
export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const { data: active } = useActiveProject();
  const projectId = active?.project.id ?? '';

  return useMutation({
    mutationFn: deleteTransaction,
    onMutate: async (transactionId) => {
      const key = transactionsKeys.project(projectId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Transaction[]>(key);
      queryClient.setQueryData<Transaction[]>(key, (old) =>
        (old ?? []).filter((t) => t.id !== transactionId)
      );
      return { previous, key };
    },
    onError: (_e, _v, ctx) => {
      if (ctx) queryClient.setQueryData(ctx.key, ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: transactionsKeys.all });
    },
  });
}

/** Delete multiple transactions at once with an optimistic batch removal. */
export function useDeleteTransactions() {
  const queryClient = useQueryClient();
  const { data: active } = useActiveProject();
  const projectId = active?.project.id ?? '';

  return useMutation({
    mutationFn: deleteTransactions,
    onMutate: async (ids) => {
      const key = transactionsKeys.project(projectId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Transaction[]>(key);
      const remove = new Set(ids);
      queryClient.setQueryData<Transaction[]>(key, (old) =>
        (old ?? []).filter((t) => !remove.has(t.id))
      );
      return { previous, key };
    },
    onError: (_e, _v, ctx) => {
      if (ctx) queryClient.setQueryData(ctx.key, ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: transactionsKeys.all });
    },
  });
}

/**
 * Compras integration: mirror each item's paid_price into a transaction.
 * Runs on mount and whenever the items list changes. For every item with a
 * positive paid_price, upsert a despesa transaction tagged with
 * source_item_id (so it is never duplicated); when paid_price is cleared or
 * zero, remove the mirror. No-op when there is no active project.
 */
export function useSyncComprasMirror(items: Item[] | undefined) {
  const { data: active } = useActiveProject();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const projectId = active?.project.id;
      if (!projectId || !items) return;
      const withPaid = items.filter((i) => i.paid_price != null && i.paid_price > 0);
      const cleared = items.filter((i) => i.paid_price == null || i.paid_price <= 0);
      await Promise.all([
        ...withPaid.map((i) =>
          upsertMirrorTransaction({
            projectId,
            itemId: i.id,
            itemName: i.name,
            amount: i.paid_price as number,
          })
        ),
        ...cleared
          .filter((i) => items.some((x) => x.id === i.id))
          .map((i) => upsertMirrorTransaction({ projectId, itemId: i.id, itemName: i.name, amount: null })),
      ]);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: transactionsKeys.all });
    },
  });
}

/**
 * Derived dashboard metrics computed from the cached transaction list.
 * Recomputes whenever the data changes (incl. realtime updates). Purely
 * client-side aggregation — no extra network round-trip.
 */
export interface FinanceStats {
  budget: number;
  spent: number;
  balance: number;
  savings: number;
  usedPct: number;
  avgTicket: number;
  expenseCount: number;
  incomeCount: number;
  total: number;
  byCategory: { category: string; total: number }[];
  byType: { income: number; expense: number };
}

/** Compute dashboard stats from a list of transactions. */
export function useTransactionsStats(
  transactions: Transaction[] | undefined
): FinanceStats {
  return useMemo(() => {
    const list = transactions ?? [];
    const total = list.length;

    let income = 0;
    let expense = 0;
    let expenseCount = 0;
    let incomeCount = 0;
    const byCatMap = new Map<string, number>();

    list.forEach((t) => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') {
        income += amt;
        incomeCount += 1;
      } else {
        expense += amt;
        expenseCount += 1;
        byCatMap.set(t.category, (byCatMap.get(t.category) ?? 0) + amt);
      }
    });

    const budget = income;
    const spent = expense;
    const balance = income - expense;
    const savings = budget - spent;
    const usedPct = budget === 0 ? 0 : Math.round((spent / budget) * 100);
    const avgTicket = expenseCount === 0 ? 0 : spent / expenseCount;

    const byCategory = Array.from(byCatMap.entries())
      .map(([category, val]) => ({ category, total: val }))
      .sort((a, b) => b.total - a.total);

    return {
      budget,
      spent,
      balance,
      savings,
      usedPct,
      avgTicket,
      expenseCount,
      incomeCount,
      total,
      byCategory,
      byType: { income, expense },
    };
  }, [transactions]);
}
