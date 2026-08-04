import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { PartyPopper, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { markItemCelebrated, clearItemCelebration } from '@/lib/items';
import { createMemory, deleteMemory, listMemoriesForProject } from '@/lib/memories';
import { useItems, itemsKeys } from '@/features/compras/items/useItems';
import { useActiveProject } from '@/features/onboarding/useProjectMembership';
import { useQueryClient } from '@tanstack/react-query';
import type { Item } from '@/types/purchases';

/** Only the purchase moment is celebrated (not delivery/installation). */
function isDone(item: Item): boolean {
  return item.status === 'purchased' && item.paid_price != null;
}

/** How long a completed purchase stays on the Home celebration card. */
const CELEBRATION_WINDOW_DAYS = 14;

/**
 * Celebrates finished purchases on the Home screen.
 *
 * When an item reaches "purchased" with a recorded paid price for the first
 * time, we create a Jornada memory for it and stamp `celebrated_at` so it
 * never fires twice. Each row can be dismissed here: that deletes the linked
 * memory, which in turn clears the item's `celebrated_at`.
 */
export function RecentlyCompleted() {
  const { data: active } = useActiveProject();
  const { data: items } = useItems();
  const queryClient = useQueryClient();
  const running = useRef<Set<string>>(new Set());
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const projectId = active?.project.id;

  useEffect(() => {
    if (!projectId || !items) return;
    const pending = items.filter((i) => isDone(i) && !i.celebrated_at && !running.current.has(i.id));
    if (pending.length === 0) return;

    let cancelled = false;
    (async () => {
      for (const item of pending) {
        running.current.add(item.id);
        try {
          await createMemory(projectId, {
            title: `${item.name} comprado!`,
            description:
              item.paid_price != null
                ? `Compra concluída por ${formatCurrency(Number(item.paid_price))}.`
                : 'Compra concluída.',
            date: new Date().toISOString().slice(0, 10),
            is_highlight: true,
            item_id: item.id,
          });
          await markItemCelebrated(item.id);
          if (!cancelled) toast.success(`🎉 Vocês compraram ${item.name}!`);
        } catch {
          running.current.delete(item.id);
        }
      }
      if (!cancelled) {
        queryClient.invalidateQueries({ queryKey: itemsKeys.all });
        queryClient.invalidateQueries({ queryKey: ['memories'] });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [items, projectId, queryClient]);

  /** Removes the celebration: deletes the linked memory (clears celebrated_at). */
  async function handleRemove(itemId: string) {
    if (!projectId) return;
    setRemovingId(itemId);
    try {
      const memories = await listMemoriesForProject(projectId);
      const linked = memories.find((m) => m.item_id === itemId);
      if (linked) {
        await deleteMemory(linked);
      } else {
        await clearItemCelebration(itemId);
      }
      queryClient.invalidateQueries({ queryKey: itemsKeys.all });
      queryClient.invalidateQueries({ queryKey: ['memories'] });
      toast.success('Conquista removida.');
    } catch {
      toast.error('Não foi possível remover a conquista.');
    } finally {
      setRemovingId(null);
      setConfirmingId(null);
    }
  }

  const cutoff = Date.now() - CELEBRATION_WINDOW_DAYS * 86400000;
  const recent = (items ?? [])
    .filter((i) => i.celebrated_at && new Date(i.celebrated_at).getTime() >= cutoff)
    .sort((a, b) => (b.celebrated_at ?? '').localeCompare(a.celebrated_at ?? ''))
    .slice(0, 5);

  if (recent.length === 0) return null;

  return (
    <Card>
      <CardHeader
        title="Conquistas recentes"
        subtitle="Compras concluídas por vocês nas últimas semanas"
      />
      <ul className="mt-4 space-y-3">
        {recent.map((item) => (
          <li key={item.id} className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-success-100 text-success-600 dark:bg-success-900/40 dark:text-success-300">
              <PartyPopper className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-surface-900 dark:text-surface-100">
                🎉 Vocês compraram {item.name}!
              </p>
              <p className="truncate text-xs text-surface-500 dark:text-surface-400">
                {item.celebrated_at ? formatDate(item.celebrated_at.slice(0, 10)) : ''}
                {item.paid_price != null ? ` · ${formatCurrency(Number(item.paid_price))}` : ''}
              </p>
            </div>
            {confirmingId === item.id ? (
              <span className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  disabled={removingId === item.id}
                  className="rounded-lg bg-danger-600 px-2 py-1 text-xs font-medium text-white disabled:opacity-60"
                >
                  {removingId === item.id ? 'Removendo…' : 'Remover'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingId(null)}
                  className="rounded-lg px-2 py-1 text-xs font-medium text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
                >
                  Cancelar
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingId(item.id)}
                aria-label={`Remover conquista de ${item.name}`}
                className="shrink-0 rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-danger-600 dark:hover:bg-surface-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </li>
        ))}
      </ul>
      <Link
        to="/jornada"
        className="mt-4 inline-block text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
      >
        Ver a jornada completa →
      </Link>
    </Card>
  );
}
